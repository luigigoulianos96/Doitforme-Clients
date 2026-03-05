import { useEffect, useMemo, useState } from 'react';
import {
  createIdea,
  deleteIdea,
  fetchClientBySlug,
  fetchIdeasByClient,
  getIdeasClient,
  hasMissingIdeasTableError,
  normalizeIdeaRow,
  updateIdea
} from '../services/ideasService.js';
import { linksToText, parseLinksText } from '../utils/ideaHelpers.js';

function createEmptyFormState() {
  return {
    title: '',
    analysis: '',
    requirements: '',
    linksText: '',
    status: 'published'
  };
}

function useIdeasAdminData(clientSlug) {
  const [client, setClient] = useState(null);
  const [session, setSession] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [form, setForm] = useState(createEmptyFormState);
  const [status, setStatus] = useState('');
  const [configError, setConfigError] = useState('');
  const [busy, setBusy] = useState(false);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const supabaseClient = getIdeasClient();
    if (!supabaseClient) {
      setConfigError('Ρύθμισε πρώτα το /public/config.js με SUPABASE_URL και SUPABASE_ANON_KEY.');
      return;
    }

    setClient(supabaseClient);
    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
    });

    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!client || !session || !clientSlug) return;
    loadSelectedClient();
  }, [client, session, clientSlug]);

  useEffect(() => {
    if (!client || !session || !selectedClient?.id) return;
    loadIdeas();
  }, [client, session, selectedClient?.id]);

  async function loadSelectedClient() {
    const { data, error } = await fetchClientBySlug(client, clientSlug);
    if (error) {
      setSelectedClient(null);
      setStatus(`Client not found για slug "${clientSlug}".`);
      return;
    }
    setSelectedClient(data);
  }

  async function loadIdeas() {
    const { data, error } = await fetchIdeasByClient(client, selectedClient.id, { onlyPublished: false });
    if (error) {
      if (hasMissingIdeasTableError(error)) {
        setStatus('Λείπει ο πίνακας content_ideas. Τρέξε το νέο schema SQL στο Supabase.');
        return;
      }
      setStatus(`Σφάλμα φόρτωσης ideas: ${error.message}`);
      return;
    }

    setIdeas((data || []).map(normalizeIdeaRow));
  }

  async function signIn(email, password) {
    if (!client) return;
    setBusy(true);
    setStatus('Γίνεται σύνδεση...');

    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus(`Σφάλμα σύνδεσης: ${error.message}`);
      setBusy(false);
      return;
    }

    setStatus('Συνδέθηκες επιτυχώς.');
    setBusy(false);
  }

  async function signOut() {
    if (!client) return;
    const { error } = await client.auth.signOut();
    setStatus(error ? `Σφάλμα αποσύνδεσης: ${error.message}` : 'Έγινε αποσύνδεση.');
    setSession(null);
    setSelectedClient(null);
    setIdeas([]);
  }

  async function addIdea() {
    if (!client || !selectedClient?.id) return;
    if (!form.title.trim()) {
      setStatus('Συμπλήρωσε τίτλο ιδέας.');
      return;
    }
    setBusy(true);
    setStatus('Αποθήκευση νέας ιδέας...');

    const payload = {
      client_id: selectedClient.id,
      title: form.title.trim(),
      analysis: form.analysis.trim(),
      requirements: form.requirements.trim(),
      inspiration_links: parseLinksText(form.linksText),
      status: form.status === 'draft' ? 'draft' : 'published',
      approval_status: 'pending',
      client_notes: ''
    };

    const { data, error } = await createIdea(client, payload);
    if (error) {
      setStatus(`Σφάλμα δημιουργίας ιδέας: ${error.message}`);
      setBusy(false);
      return;
    }

    setIdeas((prev) => [normalizeIdeaRow(data), ...prev]);
    setForm(createEmptyFormState());
    setStatus('Η ιδέα αποθηκεύτηκε.');
    setBusy(false);
  }

  async function saveIdeaEdits(ideaId, draft) {
    if (!client || !ideaId) return;
    setSavingId(ideaId);
    setStatus('Αποθήκευση αλλαγών...');

    const payload = {
      title: `${draft?.title || ''}`.trim(),
      analysis: `${draft?.analysis || ''}`.trim(),
      requirements: `${draft?.requirements || ''}`.trim(),
      inspiration_links: parseLinksText(draft?.linksText || ''),
      status: `${draft?.status || 'published'}`.trim() === 'draft' ? 'draft' : 'published'
    };

    const { data, error } = await updateIdea(client, ideaId, payload);
    if (error) {
      setStatus(`Σφάλμα αποθήκευσης: ${error.message}`);
      setSavingId(null);
      return;
    }

    setIdeas((prev) => prev.map((idea) => (idea.id === ideaId ? normalizeIdeaRow(data) : idea)));
    setStatus('Οι αλλαγές αποθηκεύτηκαν.');
    setSavingId(null);
  }

  async function removeIdea(ideaId) {
    if (!client || !ideaId) return;
    const confirmDelete = window.confirm('Να διαγραφεί οριστικά η ιδέα;');
    if (!confirmDelete) return;

    setSavingId(ideaId);
    const { error } = await deleteIdea(client, ideaId);
    if (error) {
      setStatus(`Σφάλμα διαγραφής: ${error.message}`);
      setSavingId(null);
      return;
    }

    setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));
    setStatus('Η ιδέα διαγράφηκε.');
    setSavingId(null);
  }

  async function removeAllIdeas() {
    if (!client || !selectedClient?.id) return;
    if (ideas.length === 0) return;

    const confirmed = window.confirm(`Να διαγραφούν οριστικά όλα τα ${ideas.length} ideas; Αυτή η ενέργεια δεν αναιρείται.`);
    if (!confirmed) return;

    setBusy(true);
    setStatus('Γίνεται οριστική διαγραφή όλων των ideas...');

    const { error } = await client
      .from('content_ideas')
      .delete()
      .eq('client_id', selectedClient.id);

    if (error) {
      setStatus(`Σφάλμα διαγραφής: ${error.message}`);
      setBusy(false);
      return;
    }

    setIdeas([]);
    setStatus('Όλα τα ideas διαγράφηκαν οριστικά.');
    setBusy(false);
  }

  const previewLink = useMemo(() => {
    if (!selectedClient?.slug) return '';
    return `${window.location.origin}/ideas-review.html?client=${encodeURIComponent(selectedClient.slug)}`;
  }, [selectedClient?.slug]);

  const editableIdeas = useMemo(
    () => ideas.map((idea) => ({ ...idea, linksText: linksToText(idea.inspiration_links) })),
    [ideas]
  );

  return {
    client,
    session,
    selectedClient,
    ideas: editableIdeas,
    form,
    setForm,
    status,
    configError,
    busy,
    savingId,
    previewLink,
    signIn,
    signOut,
    addIdea,
    saveIdeaEdits,
    removeIdea,
    removeAllIdeas
  };
}

export { useIdeasAdminData };
