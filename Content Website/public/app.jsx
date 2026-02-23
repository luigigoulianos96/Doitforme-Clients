import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import styled, { createGlobalStyle, css, keyframes } from 'styled-components';
import { P, Textarea_ } from 'monica-alexandria';

const NOTES_HISTORY_KEY = 'gymway_notes_history_v1';
let supabaseClientCache = null;
let supabaseClientCacheKey = '';

const cardIn = keyframes`
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const cardFlip = keyframes`
  0% { transform: rotateY(0deg) scale(1); }
  50% { transform: rotateY(68deg) scale(0.992); }
  100% { transform: rotateY(0deg) scale(1); }
`;

const AppStyle = createGlobalStyle`
  :root {
    --panel: color-mix(in srgb, var(--dark) 78%, transparent);
    --panel-border: color-mix(in srgb, var(--greyDark) 38%, transparent);
    --muted: var(--greyDark);
    --accent: var(--focus);
    --ok: var(--success);
    --danger: var(--error);
    --shadow: 0 24px 70px color-mix(in srgb, var(--black) 40%, transparent);
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    min-height: 100vh;
    font-family: 'Sora', sans-serif;
    color: var(--white);
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

const OrbLeft = styled.div`
  position: absolute;
  border-radius: 999px;
  opacity: 0.36;
  width: 250px;
  height: 250px;
  left: -65px;
  top: -95px;
  background: radial-gradient(circle, color-mix(in srgb, var(--focus) 62%, transparent) 0%, transparent 70%);
`;

const OrbRight = styled.div`
  position: absolute;
  border-radius: 999px;
  opacity: 0.36;
  width: 300px;
  height: 300px;
  right: -75px;
  bottom: -165px;
  background: radial-gradient(circle, color-mix(in srgb, var(--mainLight) 66%, transparent) 0%, transparent 67%);
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

const Stats = styled.div`
  margin-top: 1.8rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
`;

const StatCard = styled.article`
  border: 1px solid color-mix(in srgb, var(--greyDark) 32%, transparent);
  border-radius: 16px;
  background: color-mix(in srgb, var(--gloom) 72%, transparent);
  padding: 0.82rem 0.92rem;
`;

const StatLabel = styled.h6`
  margin: 0;

  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const StatValue = styled.strong`
  margin-top: 0.35rem;
  display: block;
  font-family: 'Syne', sans-serif;
  font-size: 1.26rem;
`;

const State = styled.p`
  margin-top: 14px;
  color: ${(p) => (p.$error ? 'var(--danger)' : 'var(--muted)')};
`;

const Feed = styled.section`
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  perspective: 1200px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Post = styled.article`
  position: relative;
  border-radius: 18px;
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--white) 95%, transparent);
  overflow: hidden;
  box-shadow: 0 14px 30px color-mix(in srgb, var(--black) 36%, transparent);
  opacity: 0;
  transform: translateY(20px) scale(0.99);
  animation: ${cardIn} 550ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: ${(p) => p.$delay || '0ms'};
  ${(p) => p.$loading && css`animation: ${cardFlip} 1200ms cubic-bezier(0.22, 0.61, 0.36, 1);`}
`;

const PostHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.95rem 1rem 0.85rem;
  background: color-mix(in srgb, var(--white) 96%, transparent);

  strong {
    display: block;
    font-size: 20px;
    line-height: 1.2;
    color: var(--dark);
  }

  p {
    margin: 0.12rem 0 0;
    font-size: 16px;
    color: color-mix(in srgb, var(--dark) 70%, var(--greyDark));
    line-height: 1.2;
  }
`;

const Avatar = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--greyDark) 42%, transparent);
  background: conic-gradient(from 120deg, var(--focus), var(--mainLight), var(--error), var(--focus));
`;

const Menu = styled.span`
  margin-left: auto;
  color: color-mix(in srgb, var(--dark) 70%, var(--greyDark));
  font-size: 18px;
`;

const OrderBadge = styled.span`
  display: inline-flex;
  align-items: center;
  margin-left: 0.45rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--greyDark) 32%, transparent);
  background: color-mix(in srgb, var(--gloom) 10%, var(--white));
  color: color-mix(in srgb, var(--dark) 76%, var(--greyDark));
  font-size: 13px;
  font-weight: 600;
`;

const Media = styled.div`
  aspect-ratio: 1 / 1;
  border-top: 1px solid color-mix(in srgb, var(--greyDark) 16%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--greyDark) 16%, transparent);
  background: color-mix(in srgb, var(--white) 98%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0;

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }

  video { background: var(--black); }
`;

const MediaTag = styled.div`
  font-family: 'Syne', sans-serif;
  letter-spacing: 0.11em;
  font-size: 0.72rem;
  color: var(--accent);
`;

const MediaFilename = styled.div`
  margin-top: 0.6rem;
  color: var(--light);
  font-size: 1rem;
  opacity: 0.95;
  overflow-wrap: anywhere;
`;

const LikesLine = styled.div`
  padding: 0.72rem 0.95rem 0.15rem;
  color: var(--dark);
  font-size: 16px;
  font-weight: 600;
`;

const PostBody = styled.div`
  padding: 0 0.95rem 0.75rem;
  border-bottom: 1px solid color-mix(in srgb, var(--greyDark) 14%, transparent);
`;

const CaptionWrap = styled.div`
  display: grid;
  gap: 0.25rem;
  margin-top: 0.28rem;
`;

const Caption = styled.p`
  margin: 0.3rem 0 0;
  color: color-mix(in srgb, var(--dark) 88%, var(--greyDark));
  font-size: 15px;
  line-height: 1.45;
  min-height: calc(1.45em * 3);
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${(p) => (p.$expanded ? 'unset' : '3')};
  white-space: pre-wrap;

  strong { color: var(--dark); }
`;

const CaptionToggleRow = styled.div`
  min-height: 22px;
  display: flex;
  align-items: center;
`;

const ReviewSection = styled.div`
  margin-top: 0;
  padding: 0.75rem 0.95rem 0.95rem;
  background: color-mix(in srgb, var(--gloom) 12%, var(--white));
`;

const ReviewBox = styled.div`
  display: grid;
  gap: 0.55rem;
`;

const ReviewHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;

  span {
    font-size: 15px;
    font-weight: 600;
    color: color-mix(in srgb, var(--dark) 80%, var(--greyDark));
  }
`;

const InlineAction = styled.button`
  border: 0;
  background: transparent;
  color: color-mix(in srgb, var(--dark) 70%, var(--greyDark));
  text-decoration: underline;
  font: inherit;
  font-size: 14px;
  cursor: pointer;
  padding: 0;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NotesHistory = styled.div`
  border: 1px solid color-mix(in srgb, var(--greyDark) 24%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--white) 96%, transparent);
  max-height: 150px;
  overflow: auto;
  padding: 0.4rem;
  display: grid;
  gap: 0.35rem;
`;

const NoteItem = styled.article`
  border: 1px solid color-mix(in srgb, var(--greyDark) 20%, transparent);
  border-radius: 8px;
  padding: 0.35rem 0.45rem;
  background: color-mix(in srgb, var(--gloom) 8%, var(--white));

  small {
    color: color-mix(in srgb, var(--dark) 65%, var(--greyDark));
    font-size: 13px;
  }
`;

const NoteText = styled.p`
  margin: 0.25rem 0 0;
  color: var(--dark);
  font-size: 16px;
  line-height: 1.42;
  white-space: pre-wrap;
`;

const DecisionRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 0.45rem;
`;

const DecisionNotice = styled.p`
  margin: 0;
  border: 1px solid color-mix(in srgb, var(--greyDark) 28%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--white) 97%, transparent);
  color: color-mix(in srgb, var(--dark) 82%, var(--greyDark));
  padding: 0.45rem 0.62rem;
  font-size: 14px;
`;

const DecisionButton = styled.button`
  flex: 1;
  border: 1px solid color-mix(in srgb, var(--greyDark) 30%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--white) 97%, transparent);
  color: color-mix(in srgb, var(--dark) 80%, var(--greyDark));
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  padding: 0.46rem 0.72rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${(p) => p.$type === 'approve' && `
    border-color: color-mix(in srgb, var(--success) 38%, transparent);
    color: var(--success);
  `}

  ${(p) => p.$type === 'decline' && `
    border-color: color-mix(in srgb, var(--error) 40%, transparent);
    color: var(--error);
  `}
`;

const SaveRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const SaveNoteButton = styled.button`
  border: 1px solid color-mix(in srgb, var(--greyDark) 28%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--white) 98%, transparent);
  color: color-mix(in srgb, var(--dark) 80%, var(--greyDark));
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  padding: 0.35rem 0.62rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NoteCollapsed = styled.button`
  width: 100%;
  border: 1px dashed color-mix(in srgb, var(--greyDark) 40%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--white) 96%, transparent);
  color: color-mix(in srgb, var(--dark) 78%, var(--greyDark));
  padding: 0.65rem 0.75rem;
  text-align: left;
  font: inherit;
  font-size: 16px;
  cursor: pointer;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--dark) 58%, transparent);
  backdrop-filter: blur(1.2px);
  pointer-events: none;
`;

const LoadingBadge = styled.span`
  border: 1px solid color-mix(in srgb, var(--greyDark) 36%, transparent);
  border-radius: 999px;
  padding: 0.28rem 0.7rem;
  font-size: 0.74rem;
  color: var(--white);
  background: color-mix(in srgb, var(--gloom) 86%, transparent);
`;

function createSupabaseClient() {
  const config = window.APP_CONFIG || {};
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY || config.SUPABASE_URL.includes('PASTE_')) {
    return null;
  }
  const cacheKey = `${config.SUPABASE_URL}::${config.SUPABASE_ANON_KEY}`;
  if (supabaseClientCache && supabaseClientCacheKey === cacheKey) {
    return supabaseClientCache;
  }
  supabaseClientCache = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  supabaseClientCacheKey = cacheKey;
  return supabaseClientCache;
}

function getClientSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('client') || '';
}

function isVideoPost(post) {
  const value = `${post?.image_url || ''} ${post?.title || ''}`.toLowerCase();
  return ['.mp4', '.mov', '.webm', '.m4v'].some((ext) => value.includes(ext));
}

function postOrderLabel(post, index) {
  const order = Number(post?.sort_order) || (index + 1);
  return `${order}η`;
}

function formatHistoryDateTime(iso) {
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return '-';
  return value.toLocaleString('el-GR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function readNotesHistory(storageKey) {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeNotesHistory(storageKey, value) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // Best effort only.
  }
}

function CaptionBlock({ username, caption }) {
  const [expanded, setExpanded] = useState(false);
  const finalCaption = (caption || 'Η λεζάντα εκκρεμεί...').trim();
  const shouldCollapse = finalCaption.length > 120;

  return (
    <CaptionWrap>
      <Caption $expanded={expanded}>
        <strong>{username || 'gymway.official'}</strong> {finalCaption}
      </Caption>
      <CaptionToggleRow>
        {shouldCollapse && (
          <InlineAction type="button" onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? 'Δείτε λιγότερα' : 'Δείτε περισσότερα'}
          </InlineAction>
        )}
      </CaptionToggleRow>
    </CaptionWrap>
  );
}

function PostCard({ post, index, onUpdateReview, pending, historyEntries, onAppendHistory }) {
  const fallback = `Ανάρτηση ${index + 1}`;
  const isVideo = isVideoPost(post);
  const [notes, setNotes] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [notesOpen, setNotesOpen] = useState(true);
  const [decisionLocked, setDecisionLocked] = useState(post.approval_status !== 'pending');
  const [decisionNotice, setDecisionNotice] = useState('');

  const trimmedNotes = notes.trim();
  const noteMissing = trimmedNotes.length === 0;

  useEffect(() => {
    setDecisionLocked(post.approval_status !== 'pending');
  }, [post.approval_status]);

  useEffect(() => {
    if (!decisionNotice) return;
    const timer = window.setTimeout(() => setDecisionNotice(''), 2200);
    return () => window.clearTimeout(timer);
  }, [decisionNotice]);

  async function handleSaveNotes() {
    if (noteMissing) return;
    const ok = await onUpdateReview(post.id, { client_notes: trimmedNotes }, 'Οι σημειώσεις αποθηκεύτηκαν.');
    if (!ok) return;
    onAppendHistory(post.id, trimmedNotes, 'Σημείωση');
    setNotes('');
    setNotesOpen(false);
  }

  async function handleDecision(nextStatus) {
    const clientNotesValue = nextStatus === 'approved' ? '' : trimmedNotes;
    const ok = await onUpdateReview(
      post.id,
      { approval_status: nextStatus, client_notes: clientNotesValue },
      nextStatus === 'approved' ? 'Η ανάρτηση εγκρίθηκε.' : 'Η ανάρτηση απορρίφθηκε.'
    );
    if (!ok) return;
    onAppendHistory(
      post.id,
      trimmedNotes || 'Χωρίς σημείωση.',
      nextStatus === 'approved' ? 'Έγκριση' : 'Απόρριψη'
    );
    setNotes('');
    setDecisionLocked(true);
    setDecisionNotice(nextStatus === 'approved' ? 'Εγκρίνατε τη δημοσίευση.' : 'Απορρίψατε τη δημοσίευση.');
  }

  return (
    <Post $loading={pending} $delay={`${Math.min(index * 45, 550)}ms`}>
      <PostHeader>
        <Avatar />
        <div>
          <strong>
            {post.username || 'gymway.official'}
            <OrderBadge>{postOrderLabel(post, index)}</OrderBadge>
          </strong>
        </div>
        <Menu>...</Menu>
      </PostHeader>

      <Media role="img" aria-label="Προεπισκόπηση ανάρτησης Instagram">
        {post.image_url && !isVideo ? (
          <img src={post.image_url} alt={post.title || fallback} loading="lazy" />
        ) : post.image_url && isVideo ? (
          <video src={post.image_url} controls playsInline preload="metadata" />
        ) : (
          <>
            <MediaTag>ΠΡΟΕΠΙΣΚΟΠΗΣΗ ΑΝΑΡΤΗΣΗΣ</MediaTag>
            <MediaFilename>{post.title || fallback}</MediaFilename>
          </>
        )}
      </Media>

      <LikesLine>9,311 likes</LikesLine>

      <PostBody>
        <CaptionBlock username={post.username} caption={post.caption} />
      </PostBody>

      <ReviewSection>
        <ReviewBox>
          <ReviewHead>
            <span>Σημειώσεις πελάτη</span>
            <InlineAction type="button" onClick={() => setShowHistory((prev) => !prev)} disabled={(historyEntries || []).length === 0}>
              Ιστορικό σημειώσεων
            </InlineAction>
          </ReviewHead>
          {showHistory && (historyEntries || []).length > 0 && (
            <NotesHistory>
              {(historyEntries || []).map((entry) => (
                <NoteItem key={entry.id}>
                  <small>{formatHistoryDateTime(entry.createdAt)} • {entry.action}</small>
                  <NoteText>{entry.text}</NoteText>
                </NoteItem>
              ))}
            </NotesHistory>
          )}
          {notesOpen ? (
            <>
              <Textarea_
                id={`notes-${post.id}`}
                rows="3"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Γράψε σχόλιο για αυτή την ανάρτηση..."
              />
              <SaveRow>
                <SaveNoteButton type="button" onClick={handleSaveNotes} disabled={pending || noteMissing}>
                  ⌾ Αποθήκευση
                </SaveNoteButton>
              </SaveRow>
            </>
          ) : (
            <>
              <NoteCollapsed type="button" onClick={() => setNotesOpen(true)}>
                + Προσθήκη νέας σημείωσης
              </NoteCollapsed>
            </>
          )}
          <DecisionRow>
            {!decisionLocked && (
              <DecisionButton type="button" $type="approve" onClick={() => handleDecision('approved')} disabled={pending}>
                ✓ Έγκριση
              </DecisionButton>
            )}
            {!decisionLocked && (
              <DecisionButton type="button" $type="decline" onClick={() => handleDecision('disapproved')} disabled={pending}>
                ✕ Απόρριψη
              </DecisionButton>
            )}
            {decisionLocked && (
              <DecisionButton type="button" onClick={() => setDecisionLocked(false)} disabled={pending}>
                Αλλαγή Απόφασης
              </DecisionButton>
            )}
          </DecisionRow>
          {decisionNotice && <DecisionNotice>{decisionNotice}</DecisionNotice>}
        </ReviewBox>
      </ReviewSection>
      {pending && (
        <LoadingOverlay>
          <LoadingBadge>Αποθήκευση...</LoadingBadge>
        </LoadingOverlay>
      )}
    </Post>
  );
}

function App() {
  const [posts, setPosts] = useState([]);
  const [clientMeta, setClientMeta] = useState(null);
  const [clientSlug] = useState(getClientSlugFromUrl());
  const [status, setStatus] = useState({ loading: true, error: '', message: '' });
  const [savingId, setSavingId] = useState(null);
  const [notesHistoryByPost, setNotesHistoryByPost] = useState({});
  const notesStorageKey = `${NOTES_HISTORY_KEY}_${clientSlug || 'default'}`;

  useEffect(() => {
    setNotesHistoryByPost(readNotesHistory(notesStorageKey));
  }, [notesStorageKey]);

  useEffect(() => {
    const client = createSupabaseClient();
    if (!client) {
      setStatus({ loading: false, error: 'Ρύθμισε τα Supabase keys στο /public/config.js', message: '' });
      return;
    }

    if (!clientSlug) {
      setStatus({ loading: false, error: 'Λείπει client link. Χρησιμοποίησε το preview link από το portal.', message: '' });
      return;
    }

    client
      .from('clients')
      .select('id,name,slug')
      .eq('slug', clientSlug)
      .single()
      .then(({ data: clientData, error: clientError }) => {
        if (clientError) {
          setStatus({ loading: false, error: 'Το client link δεν είναι έγκυρο.', message: '' });
          return;
        }

        setClientMeta(clientData);

        client
          .from('posts')
          .select('id,title,caption,image_url,created_at,username,status,sort_order,approval_status,client_notes,client_id')
          .eq('status', 'published')
          .eq('client_id', clientData.id)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (error) {
              setStatus({ loading: false, error: error.message, message: '' });
              return;
            }
            setPosts(data || []);
            setStatus({ loading: false, error: '', message: '' });
          });
      });
  }, [clientSlug]);

  async function updateReview(postId, changes, successMessage) {
    const client = createSupabaseClient();
    if (!client) return;
    setSavingId(postId);
    setStatus((prev) => ({ ...prev, message: '' }));

    const { data, error } = await client
      .from('posts')
      .update(changes)
      .eq('id', postId)
      .select('id,approval_status,client_notes')
      .single();

    if (error) {
      setStatus((prev) => ({ ...prev, message: `Σφάλμα ενημέρωσης: ${error.message}` }));
      setSavingId(null);
      return false;
    }

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              approval_status: data.approval_status,
              client_notes: data.client_notes
            }
          : post
      )
    );
    setStatus((prev) => ({ ...prev, message: successMessage }));
    setSavingId(null);
    return true;
  }

  function appendNoteHistory(postId, text, action) {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text,
      action,
      createdAt: new Date().toISOString()
    };

    setNotesHistoryByPost((prev) => {
      const next = {
        ...prev,
        [postId]: [entry, ...(prev[postId] || [])]
      };
      writeNotesHistory(notesStorageKey, next);
      return next;
    });
  }

  const approvedCount = useMemo(
    () => posts.filter((post) => post.approval_status === 'approved').length,
    [posts]
  );
  const disapprovedCount = useMemo(
    () => posts.filter((post) => post.approval_status === 'disapproved').length,
    [posts]
  );
  const needsReviewCount = useMemo(
    () => posts.filter((post) => (post.client_notes || '').trim().length > 0).length,
    [posts]
  );

  return (
    <>
      <AppStyle />
      <Page>
        <Hero>
          <OrbLeft />
          <OrbRight />

          <Title>Gym Way Ροή Εγκρίσεων</Title>
          {clientMeta && <Subtitle>Client: {clientMeta.name}</Subtitle>}
          <Subtitle>
            Αυτή η σελίδα προορίζεται μόνο για τον πελάτη.
            Χρησιμοποιείται για σημειώσεις και εγκρίσεις αναρτήσεων.
          </Subtitle>

          <Stats>
            <StatCard>
              <StatLabel>Εγκεκριμένα</StatLabel>
              <StatValue>{approvedCount}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Απορριφθέντα</StatLabel>
              <StatValue>{disapprovedCount}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Χρειάζονται έλεγχο</StatLabel>
              <StatValue>{needsReviewCount}</StatValue>
            </StatCard>
          </Stats>
        </Hero>

        {status.loading && <State>Φόρτωση προεπισκόπησης...</State>}
        {status.error && <State $error>Σφάλμα: {status.error}</State>}
        {status.message && <State>{status.message}</State>}

        {!status.loading && !status.error && (
          <Feed>
            {posts.length === 0 ? (
              <State>Δεν υπάρχουν δημοσιευμένες αναρτήσεις ακόμα. Μπες στη Διαχείριση για ανέβασμα.</State>
            ) : (
              posts.map((post, idx) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={idx}
                  pending={savingId === post.id}
                  onUpdateReview={updateReview}
                  historyEntries={notesHistoryByPost[post.id] || []}
                  onAppendHistory={appendNoteHistory}
                />
              ))
            )}
          </Feed>
        )}
      </Page>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
