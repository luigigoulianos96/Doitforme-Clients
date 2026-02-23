import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import styled, { createGlobalStyle } from 'styled-components';

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

  a { color: var(--accent); }

  .noise {
    position: fixed;
    inset: 0;
    pointer-events: none;
    opacity: 0.15;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 100 100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.21'/%3E%3C/svg%3E");
  }
`;

const Page = styled.main`
  width: min(1180px, 92vw);
  margin: 0 auto;
  padding: 40px 0 64px;
`;

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  border-radius: 30px;
  border: 1px solid var(--panel-border);
  background: linear-gradient(135deg, color-mix(in srgb, var(--dark) 86%, transparent), color-mix(in srgb, var(--gloom) 68%, transparent));
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow);
  padding: clamp(1.4rem, 4vw, 3rem);
`;

const HeroTop = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 0.7rem;
`;

const Eyebrow = styled.p`
  margin: 0;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--accent);
`;

const Title = styled.h1`
  margin: 10px 0 12px;
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.9rem, 5.2vw, 3.6rem);
  line-height: 0.95;
`;

const Subtitle = styled.p`
  margin: 0;
  max-width: 72ch;
  color: var(--muted);
`;

const Form = styled.form`
  margin-top: 1.2rem;
  display: grid;
  gap: 1rem;

  label {
    display: grid;
    gap: 0.34rem;
    font-size: 1.35rem;
    color: var(--muted);
  }

  input,
  textarea {
    border: 1px solid color-mix(in srgb, var(--greyDark) 36%, transparent);
    border-radius: 12px;
    background: color-mix(in srgb, var(--gloom) 92%, transparent);
    color: var(--text);
    font: inherit;
    padding: 1rem 1.1rem;
  }
`;

const Step = styled.section`
  border: 1px solid color-mix(in srgb, var(--greyDark) 28%, transparent);
  border-radius: 14px;
  background: color-mix(in srgb, var(--gloom) 46%, transparent);
  padding: 0.82rem;
`;

const StepTitle = styled.h2`
  margin: 0 0 0.64rem;
  font-family: 'Syne', sans-serif;
  font-size: 2rem;
`;

const CaptionInput = styled.textarea`
  width: 100%;
  border: 1px solid color-mix(in srgb, var(--greyDark) 36%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--gloom) 92%, transparent);
  color: var(--text);
  font: inherit;
  padding: 1rem 1.1rem;
  min-height: 14rem;
  resize: vertical;

  &::placeholder {
    opacity: 1;
    transition: opacity 0.18s ease;
  }

  &:focus::placeholder {
    opacity: 0;
  }
`;

const Dropzone = styled.div`
  border: 1px dashed color-mix(in srgb, var(--greyDark) 48%, transparent);
  border-radius: 12px;
  padding: 1rem;
  display: grid;
  justify-items: start;
  gap: 0.5rem;
  background: color-mix(in srgb, var(--gloomDark) 66%, transparent);
  ${(p) => p.$active && 'border-color: var(--accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--focus) 22%, transparent);'}
  ${(p) => p.$locked && 'opacity: 0.75;'}
`;

const DropText = styled.p`
  margin: 0;
  font-weight: 700;
  font-size: 1.7rem;
`;

const FilePicker = styled.label`
  position: relative;
  overflow: hidden;
`;

const FilePickerButton = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--greyDark) 36%, transparent);
  background: color-mix(in srgb, var(--gloom) 64%, transparent);
  color: var(--text);
  padding: 0.62rem 1rem;
  font-size: 1.35rem;
  cursor: pointer;
`;

const FileInput = styled.input`
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
`;

const MutedSmall = styled.small`
  color: var(--muted);
  font-size: 1.25rem;
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.7rem;
`;

const MediaTile = styled.article`
  border: 1px solid color-mix(in srgb, var(--greyDark) 28%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--dark) 76%, transparent);
  padding: 0.55rem;
  display: grid;
  gap: 0.42rem;
  cursor: ${(p) => (p.$draggable ? 'grab' : 'default')};

  &:active {
    cursor: ${(p) => (p.$draggable ? 'grabbing' : 'default')};
  }
`;

const MediaIndex = styled.span`
  font-size: 1.15rem;
  color: var(--muted);
`;

const MediaThumb = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  overflow: hidden;
  background: var(--black);

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const MediaName = styled.p`
  margin: 0;
  color: var(--muted);
  font-size: 1.2rem;
  line-height: 1.35;
  overflow-wrap: anywhere;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

const ActionButton = styled.button`
  border: 1px solid color-mix(in srgb, var(--greyDark) 36%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--gloom) 64%, transparent);
  color: var(--text);
  font: inherit;
  font-size: 1.35rem;
  font-weight: 600;
  padding: 0.65rem 1.1rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  ${(p) => p.$type === 'primary' && `
    border-color: color-mix(in srgb, var(--success) 38%, transparent);
    color: var(--ok);
    background: color-mix(in srgb, var(--success) 16%, var(--gloom));
  `}

  ${(p) => p.$type === 'danger' && `
    border-color: color-mix(in srgb, var(--error) 42%, transparent);
    color: var(--danger);
    background: color-mix(in srgb, var(--error) 12%, var(--gloom));
  `}
`;

const State = styled.p`
  margin-top: 14px;
  color: ${(p) => (p.$error ? 'var(--danger)' : 'var(--muted)')};
`;

const CaptionSource = styled.p`
  color: var(--muted);
  font-size: 1.3rem;
`;

const List = styled.section`
  margin-top: 20px;
  border-radius: 20px;
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--dark) 66%, transparent);
  box-shadow: var(--shadow);
  padding: 1rem;
`;

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
`;

const ListTitle = styled.h2`
  margin: 0;
  font-family: 'Syne', sans-serif;
  font-size: 2.2rem;
`;

const Overview = styled.div`
  margin-top: 0.85rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
`;

const OverviewCard = styled.article`
  position: relative;
  border-radius: 12px;
  padding: 0.62rem 0.72rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 30%, transparent);
  background: color-mix(in srgb, var(--gloom) 72%, transparent);
  ${(p) => p.$type === 'changes' && 'border-color: color-mix(in srgb, var(--error) 45%, transparent); background: color-mix(in srgb, var(--error) 26%, var(--dark));'}
  ${(p) => p.$type === 'ready' && 'border-color: color-mix(in srgb, var(--success) 45%, transparent); background: color-mix(in srgb, var(--success) 24%, var(--dark));'}
`;

const OverviewLabel = styled.span`
  display: block;
  color: var(--muted);
  font-size: 1.1rem;
  letter-spacing: 0.04em;
`;

const OverviewValue = styled.strong`
  display: block;
  margin-top: 0.25rem;
  font-size: 2rem;
  font-family: 'Syne', sans-serif;
`;

const Row = styled.article`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 24%, transparent);
  border-radius: 14px;
  background: color-mix(in srgb, var(--gloom) 62%, transparent);
  margin-top: 0.7rem;
`;

const RowMain = styled.div`
  flex: 1;
  min-width: 0;
`;

const RowHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.9rem;
`;

const RowThumb = styled.div`
  width: 5.4rem;
  height: 5.4rem;
  border-radius: 0.8rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--greyDark) 32%, transparent);
  background: color-mix(in srgb, var(--gloomDark) 70%, transparent);

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const RowHeadText = styled.div`
  min-width: 0;
`;

const EditLabel = styled.span`
  display: block;
  margin-top: 0.8rem;
  color: var(--muted);
  font-size: 1.2rem;
`;

const InlineCaption = styled.textarea`
  margin-top: 0.35rem;
  width: 100%;
  min-height: 7.2rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 35%, transparent);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--gloomDark) 56%, transparent);
  color: var(--text);
  font: inherit;
  font-size: 1.45rem;
  line-height: 1.4;
  padding: 0.9rem 1rem;
  resize: vertical;
`;

const EditActions = styled.div`
  margin-top: 0.65rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
`;

const MediaUploadLabel = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--greyDark) 36%, transparent);
  background: color-mix(in srgb, var(--gloom) 64%, transparent);
  color: var(--text);
  padding: 0.6rem 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const RowText = styled.p`
  margin: 0.3rem 0;
  font-size: 1.6rem;
  line-height: 1.45;
`;

const RowActions = styled.div`
  display: grid;
  gap: 0.65rem;
  min-width: 19rem;
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 1.05rem;
  padding: 0.35rem 0.9rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 38%, transparent);
  color: var(--muted);
  ${(p) => p.$ok && 'border-color: color-mix(in srgb, var(--success) 50%, transparent); color: var(--ok);'}
  ${(p) => p.$danger && 'border-color: color-mix(in srgb, var(--error) 50%, transparent); color: var(--danger);'}
`;

const ReviewPill = styled(Pill)`
  font-size: 1.25rem;
  padding: 0.45rem 1rem;
  font-weight: 700;
  border-width: 2px;
  ${(p) => p.$state === 'approved' && 'border-color: color-mix(in srgb, var(--success) 55%, transparent); color: var(--ok); background: color-mix(in srgb, var(--success) 16%, var(--gloom));'}
  ${(p) => p.$state === 'rejected' && 'border-color: color-mix(in srgb, var(--error) 56%, transparent); color: var(--danger); background: color-mix(in srgb, var(--error) 14%, var(--gloom));'}
  ${(p) => p.$state === 'changes' && 'border-color: color-mix(in srgb, var(--warning) 58%, transparent); color: var(--warning); background: color-mix(in srgb, var(--warning) 18%, var(--gloom));'}
`;

function createSupabaseClient() {
  const config = window.APP_CONFIG || {};
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY || config.SUPABASE_URL.includes('PASTE_')) {
    return null;
  }
  return createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
}

function getClientSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('client') || '';
}

function slugFilename(name) {
  return name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
}

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

function reviewState(post) {
  const hasNotes = (post.client_notes || '').trim().length > 0;
  if (post.approval_status === 'approved' && !hasNotes) return 'ready';
  if (post.approval_status === 'disapproved' || hasNotes) return 'changes';
  return 'awaiting';
}

function postReviewStatus(post) {
  const hasNotes = (post.client_notes || '').trim().length > 0;
  if (post.approval_status === 'disapproved') return 'rejected';
  if (post.approval_status === 'approved') return 'approved';
  if (hasNotes) return 'changes';
  return 'awaiting';
}

function postReviewLabel(state) {
  if (state === 'approved') return 'Εγκρίθηκε';
  if (state === 'rejected') return 'Απορρίφθηκε';
  if (state === 'awaiting') return 'Σε αναμονή για έγκριση';
  return 'Χρειάζεται αλλαγές';
}

function isVideoFile(file) {
  return file?.type?.startsWith('video/');
}

function isVideoPost(post) {
  const value = `${post?.image_url || ''} ${post?.title || ''}`.toLowerCase();
  return ['.mp4', '.mov', '.webm', '.m4v'].some((ext) => value.includes(ext));
}

function parseCaptions(text) {
  const cleaned = (text || '').trim();
  if (!cleaned) return [];

  const byPost = [];
  const regex = /Post\s*(\d+)\s*:\s*([\s\S]*?)(?=(?:\n\s*Post\s*\d+\s*:)|$)/gi;
  let match = regex.exec(cleaned);

  while (match) {
    const index = Number(match[1]) - 1;
    if (index >= 0) byPost[index] = match[2].trim();
    match = regex.exec(cleaned);
  }

  if (byPost.some(Boolean)) return byPost;

  return cleaned
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createMediaItems(files) {
  return files.map((file) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    kind: isVideoFile(file) ? 'video' : 'image'
  }));
}

function AdminApp() {
  const [client, setClient] = useState(null);
  const [configError, setConfigError] = useState('');
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mediaItems, setMediaItems] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [orderLocked, setOrderLocked] = useState(false);
  const [captionsText, setCaptionsText] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [posts, setPosts] = useState([]);
  const [copyState, setCopyState] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSlug] = useState(getClientSlugFromUrl());
  const [captionDrafts, setCaptionDrafts] = useState({});
  const [replacementFiles, setReplacementFiles] = useState({});
  const [replacementPreviews, setReplacementPreviews] = useState({});

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

  useEffect(() => {
    if (!client || !session || !clientSlug) return;
    loadSelectedClient();
  }, [client, session, clientSlug]);

  useEffect(() => {
    if (!client || !session || !selectedClient) return;
    loadPosts();
  }, [client, session, selectedClient]);

  useEffect(() => {
    return () => {
      Object.values(replacementPreviews).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [replacementPreviews]);

  async function loadSelectedClient() {
    const { data, error } = await client
      .from('clients')
      .select('id,name,slug')
      .eq('slug', clientSlug)
      .single();

    if (error) {
      setStatus(`Client not found για slug "${clientSlug}".`);
      return;
    }

    setSelectedClient(data);
  }

  async function loadPosts() {
    if (!selectedClient) return;

    const { data, error } = await client
      .from('posts')
      .select('id,title,caption,image_url,image_path,status,sort_order,created_at,approval_status,client_notes,client_id')
      .eq('client_id', selectedClient.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      setStatus(`Σφάλμα φόρτωσης: ${error.message}`);
      return;
    }

    setPosts(data || []);
  }

  function appendFiles(files) {
    if (orderLocked) {
      setStatus('Ξεκλείδωσε πρώτα τη σειρά αν θέλεις να προσθέσεις ή να αλλάξεις αρχεία.');
      return;
    }

    const validFiles = Array.from(files || []).filter((file) =>
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFiles.length === 0) {
      setStatus('Ρίξε μόνο αρχεία εικόνας/βίντεο.');
      return;
    }

    const nextItems = createMediaItems(validFiles);
    setMediaItems((prev) => [...prev, ...nextItems]);
    setStatus(`Προστέθηκαν ${validFiles.length} αρχεία.`);
  }

  function reorderItems(fromIndex, toIndex) {
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    setMediaItems((prev) => {
      const copy = [...prev];
      const [picked] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, picked);
      return copy;
    });
  }

  function handleTileDrop(targetId) {
    if (orderLocked || !draggedId) return;
    const fromIndex = mediaItems.findIndex((item) => item.id === draggedId);
    const toIndex = mediaItems.findIndex((item) => item.id === targetId);
    reorderItems(fromIndex, toIndex);
    setDraggedId(null);
  }

  function removeMedia(id) {
    if (orderLocked) return;
    setMediaItems((prev) => {
      const found = prev.find((item) => item.id === id);
      if (found) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }

  function clearMedia() {
    if (orderLocked) return;
    mediaItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setMediaItems([]);
    setStatus('Η λίστα αρχείων καθαρίστηκε.');
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
    setSelectedClient(null);
    setPosts([]);
    setStatus(error ? `Σφάλμα αποσύνδεσης: ${error.message}` : 'Έγινε αποσύνδεση.');
    window.location.href = './portal.html';
  }

  async function handleUpload(event) {
    event.preventDefault();
    if (!client || !session || !selectedClient) return;

    if (mediaItems.length === 0) {
      setStatus('Βήμα 1: Ρίξε πρώτα τουλάχιστον 1 αρχείο πολυμέσου.');
      return;
    }

    if (!orderLocked) {
      setStatus('Βήμα 2: Κλείδωσε την τελική σειρά αναρτήσεων πριν το ανέβασμα.');
      return;
    }

    const captions = parseCaptions(captionsText);
    const highestSortOrder = posts.reduce((max, post) => Math.max(max, post.sort_order || 0), 0);
    const nextSortOrderStart = highestSortOrder + 1;
    setBusy(true);
    setStatus('Γίνεται ανέβασμα και δημιουργία αναρτήσεων...');

    const bucket = (window.APP_CONFIG && window.APP_CONFIG.STORAGE_BUCKET) || 'post-photos';

    for (let i = 0; i < mediaItems.length; i += 1) {
      const item = mediaItems[i];
      const file = item.file;
      const fileName = `${Date.now()}-${i}-${slugFilename(file.name)}`;
      const path = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await client.storage
        .from(bucket)
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        setStatus(`Σφάλμα upload (${file.name}): ${uploadError.message}`);
        setBusy(false);
        return;
      }

      const { data: publicData } = client.storage.from(bucket).getPublicUrl(path);

      const payload = {
        title: file.name,
        image_url: publicData.publicUrl,
        image_path: path,
        caption: captions[i] || `Post ${nextSortOrderStart + i}: Η λεζάντα εκκρεμεί.`,
        client_id: selectedClient.id,
        status: 'published',
        approval_status: 'pending',
        client_notes: '',
        username: 'gymway.official',
        like_count: 160 + i * 20,
        sort_order: nextSortOrderStart + i
      };

      const { error: insertError } = await client.from('posts').insert(payload);
      if (insertError) {
        setStatus(`Σφάλμα βάσης (${file.name}): ${insertError.message}`);
        setBusy(false);
        return;
      }
    }

    mediaItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setMediaItems([]);
    setOrderLocked(false);
    setCaptionsText('');
    setStatus(`Ολοκληρώθηκε. Ανέβηκαν ${mediaItems.length} αναρτήσεις με τη κλειδωμένη σειρά.`);
    await loadPosts();
    setBusy(false);
  }

  function openClientPreviewTab() {
    if (!selectedClient) return;
    window.open(`./index.html?client=${encodeURIComponent(selectedClient.slug)}`, '_blank', 'noopener,noreferrer');
  }

  async function copyClientShareLink() {
    if (!selectedClient) return;
    const shareUrl = `${window.location.origin}/public/index.html?client=${encodeURIComponent(selectedClient.slug)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState('Το share link αντιγράφηκε.');
    } catch (_error) {
      setCopyState('Δεν έγινε αντιγραφή του share link.');
    }
  }

  function handleCaptionDraft(postId, value) {
    setCaptionDrafts((prev) => ({ ...prev, [postId]: value }));
  }

  function handleReplacementSelect(post, file) {
    if (!file) return;
    const nextPreviewUrl = URL.createObjectURL(file);

    setReplacementPreviews((prev) => {
      const oldPreviewUrl = prev[post.id];
      if (oldPreviewUrl) URL.revokeObjectURL(oldPreviewUrl);
      return { ...prev, [post.id]: nextPreviewUrl };
    });
    setReplacementFiles((prev) => ({ ...prev, [post.id]: file }));
    setStatus(`Επιλέχθηκε νέο αρχείο για το "${post.title}". Πάτησε αποθήκευση αλλαγών.`);
  }

  async function savePostEdits(post) {
    if (!client || !session) return;
    setBusy(true);
    setStatus(`Αποθήκευση αλλαγών για "${post.title}"...`);

    const bucket = (window.APP_CONFIG && window.APP_CONFIG.STORAGE_BUCKET) || 'post-photos';
    const selectedFile = replacementFiles[post.id];
    const nextCaption = captionDrafts[post.id] ?? post.caption;
    let nextImageUrl = post.image_url;
    let nextImagePath = post.image_path;
    let nextTitle = post.title;

    if (selectedFile) {
      const nextFileName = `${Date.now()}-${slugFilename(selectedFile.name)}`;
      const nextPath = `${session.user.id}/${nextFileName}`;
      const { error: uploadError } = await client.storage
        .from(bucket)
        .upload(nextPath, selectedFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        setStatus(`Σφάλμα upload (${selectedFile.name}): ${uploadError.message}`);
        setBusy(false);
        return;
      }

      const { data: publicData } = client.storage.from(bucket).getPublicUrl(nextPath);
      nextImageUrl = publicData.publicUrl;
      nextImagePath = nextPath;
      nextTitle = selectedFile.name;
    }

    const { error: updateError } = await client
      .from('posts')
      .update({
        caption: nextCaption,
        title: nextTitle,
        image_url: nextImageUrl,
        image_path: nextImagePath
      })
      .eq('id', post.id);

    if (updateError) {
      setStatus(`Σφάλμα αποθήκευσης: ${updateError.message}`);
      setBusy(false);
      return;
    }

    if (selectedFile && post.image_path && post.image_path !== nextImagePath) {
      await client.storage.from(bucket).remove([post.image_path]);
    }

    setCaptionDrafts((prev) => {
      const next = { ...prev };
      delete next[post.id];
      return next;
    });
    setReplacementFiles((prev) => {
      const next = { ...prev };
      delete next[post.id];
      return next;
    });
    setReplacementPreviews((prev) => {
      const oldPreviewUrl = prev[post.id];
      if (oldPreviewUrl) URL.revokeObjectURL(oldPreviewUrl);
      const next = { ...prev };
      delete next[post.id];
      return next;
    });

    setStatus(`Οι αλλαγές για "${nextTitle}" αποθηκεύτηκαν.`);
    await loadPosts();
    setBusy(false);
  }

  async function deletePostPermanently(post) {
    if (!client) return;
    const confirmed = window.confirm(`Να διαγραφεί οριστικά το "${post.title}"; Αυτή η ενέργεια δεν αναιρείται.`);
    if (!confirmed) return;

    setBusy(true);
    setStatus(`Διαγραφή ${post.title}...`);

    const bucket = (window.APP_CONFIG && window.APP_CONFIG.STORAGE_BUCKET) || 'post-photos';

    if (post.image_path) {
      const { error: storageError } = await client.storage.from(bucket).remove([post.image_path]);
      if (storageError) {
        setStatus(`Σφάλμα διαγραφής storage: ${storageError.message}`);
        setBusy(false);
        return;
      }
    }

    const { error: deleteError } = await client.from('posts').delete().eq('id', post.id);
    if (deleteError) {
      setStatus(`Σφάλμα διαγραφής βάσης: ${deleteError.message}`);
      setBusy(false);
      return;
    }

    setStatus(`Το "${post.title}" διαγράφηκε οριστικά.`);
    await loadPosts();
    setBusy(false);
  }

  async function deleteAllPostsPermanently() {
    if (!client || posts.length === 0) return;
    const confirmed = window.confirm(`Να διαγραφούν ΟΛΕΣ οι ${posts.length} αναρτήσεις οριστικά; Αυτή η ενέργεια δεν αναιρείται.`);
    if (!confirmed) return;

    setBusy(true);
    setStatus('Γίνεται οριστική διαγραφή όλων των αναρτήσεων...');

    const bucket = (window.APP_CONFIG && window.APP_CONFIG.STORAGE_BUCKET) || 'post-photos';
    const paths = posts.map((post) => post.image_path).filter(Boolean);

    if (paths.length > 0) {
      const { error: storageError } = await client.storage.from(bucket).remove(paths);
      if (storageError) {
        setStatus(`Σφάλμα διαγραφής storage: ${storageError.message}`);
        setBusy(false);
        return;
      }
    }

    const ids = posts.map((post) => post.id);
    const { error: deleteError } = await client.from('posts').delete().in('id', ids);
    if (deleteError) {
      setStatus(`Σφάλμα διαγραφής βάσης: ${deleteError.message}`);
      setBusy(false);
      return;
    }

    setStatus('Όλες οι αναρτήσεις διαγράφηκαν οριστικά.');
    await loadPosts();
    setBusy(false);
  }

  const parsedCaptions = useMemo(() => parseCaptions(captionsText), [captionsText]);
  const mappedCaptions = useMemo(
    () => mediaItems.reduce((sum, _item, index) => sum + (parsedCaptions[index] ? 1 : 0), 0),
    [mediaItems, parsedCaptions]
  );
  const approvalOverview = useMemo(
    () =>
      posts.reduce(
        (acc, post) => {
          const state = reviewState(post);
          if (state === 'ready') acc.ready += 1;
          if (state === 'changes') acc.changes += 1;
          if (state === 'awaiting') acc.awaiting += 1;
          if (post.approval_status === 'approved') acc.approved += 1;
          if (post.approval_status === 'disapproved') acc.disapproved += 1;
          return acc;
        },
        { ready: 0, changes: 0, awaiting: 0, approved: 0, disapproved: 0 }
      ),
    [posts]
  );
  const hasPublishedPosts = posts.length > 0;
  const hasClientSlug = clientSlug.length > 0;

  if (configError) {
    return (
      <>
        <AppStyle />
        <Page>
          <Hero>
            <State $error>{configError}</State>
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
            <Eyebrow>AUTH REQUIRED</Eyebrow>
            <Title>Σύνδεση μέσω Portal</Title>
            <Subtitle>Η πρόσβαση στο admin γίνεται μόνο από το Portal: Login -> Portal -> Επιλογή Client -> Admin.</Subtitle>
            <Actions>
              <ActionButton type="button" $type="primary" onClick={() => { window.location.href = './portal.html'; }}>
                Μετάβαση στο Portal Login
              </ActionButton>
            </Actions>
          </Hero>
        </Page>
      </>
    );
  }

  if (!hasClientSlug) {
    return (
      <>
        <AppStyle />
        <Page>
          <Hero>
            <Eyebrow>ΠΙΝΑΚΑΣ ΔΙΑΧΕΙΡΙΣΗΣ</Eyebrow>
            <Title>Λείπει client scope</Title>
            <Subtitle>Άνοιξε τον admin από το portal για να φορτώσει συγκεκριμένο client feed.</Subtitle>
            <Actions>
              <ActionButton type="button" onClick={() => window.open('./portal.html', '_blank', 'noopener,noreferrer')}>
                Μετάβαση στο Portal
              </ActionButton>
            </Actions>
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
          <HeroTop>
            <ActionButton type="button" onClick={() => window.open('./portal.html', '_blank', 'noopener,noreferrer')}>📋 Portal</ActionButton>
            <ActionButton type="button" onClick={handleSignOut}>⇢ Αποσύνδεση</ActionButton>
          </HeroTop>
          <Eyebrow>ΠΙΝΑΚΑΣ ΔΙΑΧΕΙΡΙΣΗΣ</Eyebrow>
          <Title>Ανέβασμα Περιεχομένου: {selectedClient?.name || 'Client'}</Title>
          <Subtitle>Ρίξε αρχεία, βάλε την τελική σειρά του προφίλ, κλείδωσέ τη και μετά κάνε επικόλληση όλων των λεζαντών σε ένα κείμενο.</Subtitle>

          <Form onSubmit={handleUpload}>
            <Step>
              <StepTitle>Βήμα 1. Σύρε και άφησε όλα τα αρχεία πολυμέσων</StepTitle>
              <Dropzone
                $active={dragActive}
                $locked={orderLocked}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (!orderLocked) setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragActive(false);
                  appendFiles(event.dataTransfer.files);
                }}
              >
                <DropText>Ρίξε εικόνες/βίντεο εδώ</DropText>
                <FilePicker>
                  <FilePickerButton>＋ Επιλογή αρχείων</FilePickerButton>
                  <FileInput
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    disabled={orderLocked}
                    onChange={(event) => {
                      appendFiles(event.target.files || []);
                      event.target.value = '';
                    }}
                  />
                </FilePicker>
                <MutedSmall>{orderLocked ? 'Η σειρά είναι κλειδωμένη. Ξεκλείδωσε για αλλαγές.' : 'Μπορείς να προσθέτεις αρχεία με πολλαπλά drop.'}</MutedSmall>
              </Dropzone>
            </Step>

            <Step>
              <StepTitle>Βήμα 2. Ορισμός σειράς αναρτήσεων και κλείδωμα τελικής θέσης</StepTitle>
              {mediaItems.length === 0 ? (
                <State>Δεν υπάρχουν αρχεία ακόμα.</State>
              ) : (
                <>
                  <MediaGrid>
                    {mediaItems.map((item, index) => (
                      <MediaTile
                        key={item.id}
                        $draggable={!orderLocked}
                        draggable={!orderLocked}
                        onDragStart={() => setDraggedId(item.id)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleTileDrop(item.id)}
                      >
                        <MediaIndex>Ανάρτηση {index + 1}</MediaIndex>
                        <MediaThumb>
                          {item.kind === 'video' ? (
                            <video src={item.previewUrl} muted playsInline preload="metadata" />
                          ) : (
                            <img src={item.previewUrl} alt={item.file.name} loading="lazy" />
                          )}
                        </MediaThumb>
                        <MediaName>{item.file.name}</MediaName>
                        {!orderLocked && (
                          <ActionButton type="button" $type="danger" onClick={() => removeMedia(item.id)}>
                            ✕ Αφαίρεση
                          </ActionButton>
                        )}
                      </MediaTile>
                    ))}
                  </MediaGrid>

                  <Actions>
                    {!orderLocked ? (
                      <ActionButton type="button" $type="primary" onClick={() => setOrderLocked(true)}>
                        ✓ Κλείδωμα τελικής σειράς
                      </ActionButton>
                    ) : (
                      <ActionButton type="button" onClick={() => setOrderLocked(false)}>
                        ↺ Ξεκλείδωμα σειράς
                      </ActionButton>
                    )}
                    <ActionButton type="button" $type="danger" onClick={clearMedia} disabled={orderLocked}>
                      🗑 Καθαρισμός αρχείων
                    </ActionButton>
                  </Actions>
                </>
              )}
            </Step>

            <Step>
              <StepTitle>Βήμα 3. Επικόλληση όλων των λεζαντών σε ένα κείμενο</StepTitle>
              <label>
                Πεδίο λεζαντών
                <CaptionInput
                  rows="8"
                  value={captionsText}
                  onChange={(event) => setCaptionsText(event.target.value)}
                  placeholder={'Post 1: Πρώτη λεζάντα\n\nPost 2: Δεύτερη λεζάντα\n\nPost 3: Τρίτη λεζάντα'}
                />
              </label>
              <State>Αντιστοιχισμένες λεζάντες: {mappedCaptions}/{mediaItems.length}</State>
            </Step>

            <Actions>
              <ActionButton type="submit" $type="primary" disabled={busy}>
                {busy ? '⏳ Γίνεται ανέβασμα...' : '⬆ Ανέβασμα + Δημοσίευση τελικής σειράς'}
              </ActionButton>
            <ActionButton type="button" disabled={!hasPublishedPosts} onClick={openClientPreviewTab}>
              👁 Άνοιγμα προεπισκόπησης πελάτη
            </ActionButton>
              <ActionButton type="button" disabled={!hasPublishedPosts} onClick={copyClientShareLink}>
                ⧉ Αντιγραφή share link
              </ActionButton>
            </Actions>
          </Form>

          {status && <State>{status}</State>}
          {!hasPublishedPosts && <State>Η προεπισκόπηση ενεργοποιείται μετά το πρώτο ολοκληρωμένο upload.</State>}
          {copyState && <State>{copyState}</State>}
        </Hero>

        <List>
          <ListHeader>
            <ListTitle>Όλες οι Αναρτήσεις</ListTitle>
            <ActionButton type="button" $type="danger" onClick={deleteAllPostsPermanently} disabled={busy || posts.length === 0}>
              🗑 Οριστική διαγραφή όλων
            </ActionButton>
          </ListHeader>

          <Overview>
            <OverviewCard $type="changes">
              <OverviewLabel>Χρειάζονται αλλαγές</OverviewLabel>
              <OverviewValue>{approvalOverview.changes}</OverviewValue>
            </OverviewCard>
            <OverviewCard $type="ready">
              <OverviewLabel>Έτοιμα για δημοσίευση</OverviewLabel>
              <OverviewValue>{approvalOverview.ready}</OverviewValue>
            </OverviewCard>
            <OverviewCard>
              <OverviewLabel>Αναμονή ελέγχου</OverviewLabel>
              <OverviewValue>{approvalOverview.awaiting}</OverviewValue>
            </OverviewCard>
          </Overview>

          {posts.length === 0 ? (
            <State>Δεν υπάρχουν αναρτήσεις ακόμα.</State>
          ) : (
            posts.map((post) => (
              <Row key={post.id}>
                <RowMain>
                  <RowHead>
                    <RowThumb>
                      {replacementFiles[post.id] && isVideoFile(replacementFiles[post.id]) ? (
                        <video src={replacementPreviews[post.id]} muted playsInline preload="metadata" />
                      ) : replacementFiles[post.id] ? (
                        <img src={replacementPreviews[post.id]} alt={replacementFiles[post.id].name} loading="lazy" />
                      ) : isVideoPost(post) ? (
                        <video src={replacementPreviews[post.id] || post.image_url} muted playsInline preload="metadata" />
                      ) : (
                        <img src={replacementPreviews[post.id] || post.image_url} alt={post.title} loading="lazy" />
                      )}
                    </RowThumb>
                    <RowHeadText>
                      <strong>{post.title}</strong>
                      <MutedSmall>{formatDate(post.created_at)}</MutedSmall>
                    </RowHeadText>
                  </RowHead>

                  <EditLabel>Λεζάντα</EditLabel>
                  <InlineCaption
                    rows="3"
                    value={captionDrafts[post.id] ?? post.caption}
                    onChange={(event) => handleCaptionDraft(post.id, event.target.value)}
                  />

                  <EditActions>
                    <MediaUploadLabel htmlFor={`replace-${post.id}`}>
                      ↻ Αντικατάσταση media
                    </MediaUploadLabel>
                    <HiddenFileInput
                      id={`replace-${post.id}`}
                      type="file"
                      accept="image/*,video/*"
                      onChange={(event) => {
                        const file = (event.target.files || [])[0];
                        handleReplacementSelect(post, file);
                        event.target.value = '';
                      }}
                    />
                    <ActionButton type="button" $type="primary" disabled={busy} onClick={() => savePostEdits(post)}>
                      💾 Αποθήκευση αλλαγών
                    </ActionButton>
                  </EditActions>

                  <RowText><strong>Σημειώσεις πελάτη:</strong> {(post.client_notes || '').trim() || 'Δεν υπάρχουν σημειώσεις ακόμα.'}</RowText>
                </RowMain>
                <RowActions>
                  <ReviewPill $state={postReviewStatus(post)}>
                    {postReviewLabel(postReviewStatus(post))}
                  </ReviewPill>
                  <ActionButton type="button" $type="danger" onClick={() => deletePostPermanently(post)} disabled={busy}>
                    ✕ Οριστική διαγραφή
                  </ActionButton>
                </RowActions>
              </Row>
            ))
          )}
        </List>
      </Page>
    </>
  );
}

createRoot(document.getElementById('root')).render(<AdminApp />);
