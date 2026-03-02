import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import styled, { createGlobalStyle } from 'styled-components';
import { deleteFile as deleteStorageFile } from './services/storageService.js';
import { enableReviewPushNotifications, isReviewPushSupported, syncReviewPushSubscription } from './services/webPushService.js';

const AppStyle = createGlobalStyle`
  :root {
    --text: var(--white);
    --muted: var(--greyDark);
    --panel-border: color-mix(in srgb, var(--greyDark) 38%, transparent);
    --accent: var(--focus);
    --danger: var(--error);
    --ok: var(--success);
    --shadow: 0 24px 70px color-mix(in srgb, var(--black) 40%, transparent);
  }

  * { box-sizing: border-box; }

  img { width: 100%; }

  body {
    margin: 0;
    min-height: 100vh;
    font-family: 'Sora', sans-serif;
    color: var(--text);
    background:
      radial-gradient(circle at 12% 18%, color-mix(in srgb, var(--main) 46%, transparent) 0%, transparent 40%),
      radial-gradient(circle at 86% 10%, color-mix(in srgb, var(--focus) 42%, transparent) 0%, transparent 32%),
      linear-gradient(150deg, var(--black) 0%, var(--dark) 55%, var(--gloomDark) 100%);
    background-repeat: no-repeat;
    background-size: cover;
    background-attachment: fixed;
  }
`;

const Page = styled.main`
  width: min(1180px, 92vw);
  margin: 0 auto;
  padding: 40px 0 64px;
  display: grid;
  gap: 1rem;
`;

const Hero = styled.section`
  border-radius: 22px;
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--dark) 76%, transparent);
  box-shadow: var(--shadow);
  padding: 1.2rem;
`;

const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  border: 1px solid color-mix(in srgb, var(--greyDark) 28%, transparent);
  border-radius: 14px;
  background: color-mix(in srgb, var(--gloom) 68%, transparent);
  padding: 0.9rem;
  display: grid;
  gap: 0.55rem;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
`;

const Button = styled.button`
  border: 1px solid color-mix(in srgb, var(--greyDark) 36%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--gloom) 64%, transparent);
  color: var(--text);
  font: inherit;
  font-size: 1.45rem;
  font-weight: 600;
  line-height: 1.2;
  padding: 0.72rem 1rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  ${(p) => p.$primary && `
    border-color: color-mix(in srgb, var(--success) 40%, transparent);
    color: var(--ok);
  `}

  ${(p) => p.$danger && `
    border-color: color-mix(in srgb, var(--error) 42%, transparent);
    color: var(--danger);
    background: color-mix(in srgb, var(--error) 12%, var(--gloom));
  `}
`;

const Input = styled.input`
  border: 1px solid color-mix(in srgb, var(--greyDark) 36%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--gloom) 92%, transparent);
  color: var(--text);
  font: inherit;
  font-size: 1.5rem;
  line-height: 1.25;
  padding: 0.9rem 1rem;
  min-height: 4.2rem;
  width: 100%;

  &::placeholder {
    color: color-mix(in srgb, var(--greyDark) 82%, transparent);
    opacity: 1;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
  flex-direction: ${(p) => (p.$stack ? 'column' : 'row')};
`;

const LoginForm = styled.form`
  margin-top: 1rem;
  display: grid;
  gap: 0.65rem;
  width: min(62rem, 100%);
`;

const Status = styled.p`
  margin: 0;
  color: ${(p) => (p.$error ? 'var(--danger)' : 'var(--muted)')};
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--error) 42%, transparent);
  background: color-mix(in srgb, var(--error) 12%, var(--gloom));
  color: var(--danger);
  padding: 0.2rem 0.6rem;
  font-size: 1.1rem;
  font-weight: 700;
`;

function createSupabaseClient() {
  const config = window.APP_CONFIG || {};
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY || config.SUPABASE_URL.includes('PASTE_')) {
    return null;
  }
  return createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
}

function createStorageAdapter() {
  return {
    async remove(paths) {
      try {
        for (let i = 0; i < (paths || []).length; i += 1) {
          await deleteStorageFile({ path: paths[i] });
        }
        return { data: paths || [], error: null };
      } catch (error) {
        return { data: null, error };
      }
    }
  };
}

function slugify(value) {
  const source = `${value || ''}`.toLowerCase().trim();
  const greekMap = {
    'α': 'a', 'β': 'v', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'i', 'θ': 'th',
    'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p',
    'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'y', 'φ': 'f', 'χ': 'ch', 'ψ': 'ps', 'ω': 'o'
  };
  const ascii = source
    .split('')
    .map((char) => greekMap[char] || char)
    .join('');

  return ascii
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function PortalApp() {
  const [client, setClient] = useState(null);
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('');
  const [configError, setConfigError] = useState('');
  const [busy, setBusy] = useState(false);
  const [webPushActive, setWebPushActive] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clients, setClients] = useState([]);
  const [posts, setPosts] = useState([]);
  const [clientNameInput, setClientNameInput] = useState('');
  const previousChangesByClientRef = useRef({});
  const notificationsReadyRef = useRef(false);

  useEffect(() => {
    const supabaseClient = createSupabaseClient();
    if (!supabaseClient) {
      setConfigError('Ρύθμισε πρώτα το /public/config.js με SUPABASE_URL και SUPABASE_ANON_KEY.');
      return;
    }

    setClient(supabaseClient);
    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
    });

    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadPortalData() {
    const { data: clientsData, error: clientsError } = await client
      .from('clients')
      .select('id,name,slug,created_at')
      .order('created_at', { ascending: false });

    if (clientsError) {
      setStatus(`Σφάλμα φόρτωσης clients: ${clientsError.message}`);
      return;
    }

    const { data: postsData, error: postsError } = await client
      .from('posts')
      .select('id,client_id,approval_status,client_notes,status')
      .eq('status', 'published');

    if (postsError) {
      setStatus(`Σφάλμα φόρτωσης posts: ${postsError.message}`);
      return;
    }

    setClients(clientsData || []);
    setPosts(postsData || []);
  }

  useEffect(() => {
    if (!client || !session) return;
    loadPortalData();
    const timer = window.setInterval(() => {
      loadPortalData();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [client, session]);

  useEffect(() => {
    if (!session) {
      setWebPushActive(false);
      return;
    }

    setWebPushActive(false);
    syncReviewPushSubscription(session.user?.id || '').then(({ subscription }) => {
      if (subscription) {
        setWebPushActive(true);
      }
    });
  }, [session]);

  async function enableDesktopNotifications() {
    if (!isReviewPushSupported()) {
      setStatus('Ο browser δεν υποστηρίζει web push notifications.');
      return;
    }

    try {
      const { alreadyActive } = await enableReviewPushNotifications(session?.user?.id || '');
      setWebPushActive(true);
      setStatus(alreadyActive
        ? 'Οι web push ειδοποιήσεις είναι ήδη ενεργές.'
        : 'Οι web push ειδοποιήσεις ενεργοποιήθηκαν.');
    } catch (error) {
      setStatus(error.message || 'Οι web push ειδοποιήσεις δεν ενεργοποιήθηκαν.');
    }
  }

  async function handleSignIn(event) {
    event.preventDefault();
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

  async function handleSignOut() {
    if (!client) return;
    const { error } = await client.auth.signOut();
    setSession(null);
    setClients([]);
    setPosts([]);
    previousChangesByClientRef.current = {};
    notificationsReadyRef.current = false;
    setStatus(error ? `Σφάλμα αποσύνδεσης: ${error.message}` : 'Έγινε αποσύνδεση.');
  }

  async function createClientFeed() {
    if (!session) {
      setStatus('Δεν υπάρχει ενεργό session. Κάνε login ξανά.');
      return;
    }

    if (!clientNameInput.trim()) {
      setStatus('Γράψε όνομα client.');
      return;
    }

    const baseSlug = slugify(clientNameInput) || `client-${Date.now()}`;
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-5)}`;

    setBusy(true);
    setStatus('Δημιουργία νέου client feed...');

    const { error } = await client.from('clients').insert({
      name: clientNameInput.trim(),
      slug: uniqueSlug
    });

    if (error) {
      setStatus(`Σφάλμα δημιουργίας client: ${error.message}`);
      setBusy(false);
      return;
    }

    setClientNameInput('');
    setStatus('Ο client δημιουργήθηκε.');
    await loadPortalData();
    setBusy(false);
  }

  async function deleteClientFeed(feedClient) {
    if (!client || !feedClient || !session) {
      setStatus('Δεν υπάρχει ενεργό session. Κάνε login ξανά.');
      return;
    }

    const confirmDelete = window.confirm(`Είσαι σίγουρος ότι θέλεις να διαγράψεις τον πελάτη "${feedClient.name}"; Θα διαγραφούν όλα τα δεδομένα και τα αρχεία του.`);
    if (!confirmDelete) return;

    setBusy(true);
    setStatus(`Διαγραφή client "${feedClient.name}" και όλων των δεδομένων...`);

    const storage = createStorageAdapter();
    const { data: clientPosts, error: postsFetchError } = await client
      .from('posts')
      .select('id,image_path')
      .eq('client_id', feedClient.id);

    if (postsFetchError) {
      setStatus(`Σφάλμα φόρτωσης posts προς διαγραφή: ${postsFetchError.message}`);
      setBusy(false);
      return;
    }

    const paths = (clientPosts || []).map((post) => post.image_path).filter(Boolean);

    if (paths.length > 0) {
      const { error: storageError } = await storage.remove(paths);
      if (storageError) {
        setStatus(`Σφάλμα διαγραφής storage: ${storageError.message}`);
        setBusy(false);
        return;
      }
    }

    const { error: deletePostsError } = await client.from('posts').delete().eq('client_id', feedClient.id);
    if (deletePostsError) {
      setStatus(`Σφάλμα διαγραφής posts: ${deletePostsError.message}`);
      setBusy(false);
      return;
    }

    const { error: deleteClientError } = await client.from('clients').delete().eq('id', feedClient.id);
    if (deleteClientError) {
      setStatus(`Σφάλμα διαγραφής client: ${deleteClientError.message}`);
      setBusy(false);
      return;
    }

    setStatus(`Ο client "${feedClient.name}" διαγράφηκε μαζί με όλα τα αρχεία και τα posts.`);
    await loadPortalData();
    setBusy(false);
  }

  const changesByClient = useMemo(() => {
    return posts.reduce((acc, post) => {
      const hasPendingNotes = post.approval_status === 'pending' && (post.client_notes || '').trim().length > 0;
      const hasChanges = post.approval_status === 'disapproved' || hasPendingNotes;
      const next = { ...acc };
      next[post.client_id] = (next[post.client_id] || 0) + (hasChanges ? 1 : 0);
      return next;
    }, {});
  }, [posts]);

  useEffect(() => {
    if (!session) return;

    const nextMap = { ...changesByClient };
    const previousMap = previousChangesByClientRef.current || {};

    if (!notificationsReadyRef.current) {
      previousChangesByClientRef.current = nextMap;
      notificationsReadyRef.current = true;
      return;
    }

    const hasSupport = typeof window !== 'undefined' && 'Notification' in window;
    const canNotify = hasSupport && window.Notification.permission === 'granted' && !webPushActive;

    if (canNotify) {
      clients.forEach((feedClient) => {
        const previousValue = previousMap[feedClient.id] || 0;
        const nextValue = nextMap[feedClient.id] || 0;
        const increase = nextValue - previousValue;
        if (increase <= 0) return;

        const body = increase === 1
          ? `Έχετε 1 νέα ειδοποίηση από τον πελάτη: ${feedClient.name}`
          : `Έχετε ${increase} νέες ειδοποιήσεις από τον πελάτη: ${feedClient.name}`;

        new window.Notification('Content Portal', {
          body
        });
      });
    }

    previousChangesByClientRef.current = nextMap;
  }, [session, clients, changesByClient, webPushActive]);

  if (configError) {
    return (
      <>
        <AppStyle />
        <Page>
          <Hero>
            <Status $error>{configError}</Status>
          </Hero>
        </Page>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <AppStyle />
        <Page>
          <Hero>
            <h1>Content Portal</h1>
            <p>Συνδέσου για να διαχειριστείς πολλαπλά client feeds.</p>
            <LoginForm onSubmit={handleSignIn}>
              <Row $stack>
                <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" required />
                <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Κωδικός" required />
              </Row>
              <Row>
                <Button $primary type="submit" disabled={busy}>{busy ? 'Περίμενε...' : 'Σύνδεση'}</Button>
              </Row>
            </LoginForm>
            {status && <Status>{status}</Status>}
          </Hero>
        </Page>
      </>
    );
  }

  return (
    <>
      <AppStyle />
      <Page>
        <Hero>
          <h1>Client Portal</h1>
          <p>Δημιούργησε νέο client feed ή διάλεξε client για scoped admin και preview.</p>
          <Row>
            <Input value={clientNameInput} onChange={(event) => setClientNameInput(event.target.value)} placeholder="Όνομα νέου client" />
            <Button $primary type="button" onClick={createClientFeed} disabled={busy}>Add client feed</Button>
            <Button type="button" onClick={enableDesktopNotifications}>Ενεργοποίηση ειδοποιήσεων</Button>
            <Button type="button" onClick={handleSignOut}>Αποσύνδεση</Button>
          </Row>
          {status && <Status>{status}</Status>}
        </Hero>

        <Grid>
          {clients.map((feedClient) => {
            const changes = changesByClient[feedClient.id] || 0;
            return (
              <Card key={feedClient.id}>
                <h3>{feedClient.name}</h3>
                <p>Slug: {feedClient.slug}</p>
                <p>
                  Αλλαγές προς review: <Badge>{changes}</Badge>
                </p>
                <Actions>
                  <Button $primary type="button" onClick={() => { window.location.href = `./admin.html?client=${encodeURIComponent(feedClient.slug)}`; }}>
                    Άνοιγμα Admin
                  </Button>
                  <Button $danger type="button" disabled={busy} onClick={() => deleteClientFeed(feedClient)}>
                    Διαγραφή Client
                  </Button>
                </Actions>
              </Card>
            );
          })}
        </Grid>
      </Page>
    </>
  );
}

createRoot(document.getElementById('root')).render(<PortalApp />);
