import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import styled, { createGlobalStyle } from 'styled-components';
import ActionMenu from './admin/components/ActionMenu.js';
import CollapsiblePanel from './admin/components/CollapsiblePanel.js';
import { useIdeasAdminData } from './ideas/hooks/useIdeasAdminData.js';
import { normalizeIdeaLink } from './ideas/utils/ideaHelpers.js';
import { getPublicUrl } from './services/storageService.js';

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

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  flex-shrink: 0;
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
`;

const Step = styled.section`
  border: 1px solid color-mix(in srgb, var(--greyDark) 28%, transparent);
  border-radius: 14px;
  background: color-mix(in srgb, var(--gloom) 46%, transparent);
  padding: 0.82rem;
  display: grid;
  gap: 0.95rem;
`;

const StepTitle = styled.h2`
  margin: 0 0 0.64rem;
  font-family: 'Syne', sans-serif;
  font-size: 2rem;
`;

const InlineInput = styled.input`
  width: 100%;
  border: 1px solid color-mix(in srgb, var(--greyDark) 36%, transparent);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--gloom) 86%, transparent);
  color: var(--text);
  font: inherit;
  font-size: 1.45rem;
  line-height: 1.25;
  padding: 0.75rem 0.9rem;
`;

const CaptionInput = styled.textarea`
  width: 100%;
  border: 1px solid color-mix(in srgb, var(--greyDark) 36%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--gloom) 92%, transparent);
  color: var(--text);
  font: inherit;
  padding: 1rem 1.1rem;
  min-height: 12rem;
  resize: vertical;
`;

const LinkComposerRow = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: center;
`;

const LinkList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const LinkChip = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--focus) 36%, transparent);
  color: var(--accent);
  text-decoration: none;
  padding: 0.34rem 0.74rem;
  font-size: 1.25rem;
  font-weight: 700;
`;

const RemoveChipButton = styled.button`
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

const WorkflowActionGroup = styled.section`
  margin-top: 1rem;
  display: grid;
  gap: 0.6rem;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 18%, transparent);
  background: linear-gradient(180deg, color-mix(in srgb, var(--gloomDark) 34%, transparent), color-mix(in srgb, var(--gloom) 20%, transparent));
`;

const WorkflowActionMeta = styled.small`
  color: var(--muted);
  font-size: 1.2rem;
  line-height: 1.45;
`;

const WorkflowActionRow = styled(Actions)`
  align-items: center;
`;

const State = styled.p`
  margin-top: 14px;
  color: ${(p) => {
    if (p.$error || p.$tone === 'error') return 'var(--danger)';
    if (p.$tone === 'success') return 'var(--ok)';
    if (p.$tone === 'warning') return 'color-mix(in srgb, #f4d35e 88%, var(--text))';
    return 'var(--muted)';
  }};
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
  height: 100%;
  ${(p) => p.$compact && 'flex-direction: column; gap: 0.7rem; padding: 0.75rem;'}

  & + & {
    margin-top: 0.7rem;
  }
`;

const RowMain = styled.div`
  flex: 1;
  min-width: 0;
  width: 100%;
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
  display: grid;
  place-items: center;
  color: var(--muted);
  font-weight: 700;
`;

const RowHeadText = styled.div`
  min-width: 0;
  display: grid;
  gap: 0.24rem;

  strong {
    display: block;
    font-size: 1.5rem;
  }
`;

const RowSummaryButton = styled.button`
  width: 100%;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  padding: 0;
`;

const RowSummaryHint = styled.small`
  color: var(--muted);
`;

const RowText = styled.p`
  margin: 0.4rem 0 0;
  color: var(--muted);
  white-space: pre-wrap;
`;

const HistoryWrap = styled.div`
  margin-top: 0.7rem;
  display: grid;
  gap: 0.55rem;
`;

const HistoryItem = styled.div`
  border: 1px solid color-mix(in srgb, var(--greyDark) 24%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--gloomDark) 38%, transparent);
  padding: 0.55rem 0.68rem;
  display: grid;
  gap: 0.35rem;
`;

const HistoryMeta = styled.small`
  color: var(--muted);
`;

const HistoryText = styled.p`
  margin: 0;
  color: var(--text);
  white-space: pre-wrap;
`;

const AttachmentGrid = styled.div`
  margin-top: 0.65rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.55rem;
`;

const AttachmentCard = styled.article`
  border: 1px solid color-mix(in srgb, var(--greyDark) 24%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--gloomDark) 38%, transparent);
  padding: 0.55rem 0.68rem;
  display: grid;
  gap: 0.4rem;
`;

const AttachmentThumb = styled.a`
  display: block;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--greyDark) 30%, transparent);

  img {
    display: block;
    width: 100%;
    height: 160px;
    object-fit: cover;
  }
`;

const AttachmentAudio = styled.audio`
  width: 100%;
`;

const AttachmentLink = styled.a`
  color: var(--accent);
  font-size: 1.2rem;
  font-weight: 700;
  text-decoration: none;
`;

const RowActions = styled.div`
  display: grid;
  gap: 0.65rem;
  min-width: 19rem;
  ${(p) => p.$compact && 'width: 100%; min-width: 0; justify-items: end;'}
`;

const EditFieldStack = styled.div`
  margin-top: 0.8rem;
  display: grid;
  gap: 0.95rem;
`;

const ReviewPill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 1.25rem;
  padding: 0.45rem 1rem;
  font-weight: 700;
  border: 2px solid color-mix(in srgb, var(--greyDark) 40%, transparent);
  color: var(--muted);
  ${(p) => p.$state === 'approved' && 'border-color: color-mix(in srgb, var(--success) 55%, transparent); color: var(--ok); background: color-mix(in srgb, var(--success) 16%, var(--gloom));'}
  ${(p) => p.$state === 'rejected' && 'border-color: color-mix(in srgb, var(--error) 56%, transparent); color: var(--danger); background: color-mix(in srgb, var(--error) 14%, var(--gloom));'}
  ${(p) => p.$state === 'changes' && 'border-color: color-mix(in srgb, var(--warning) 58%, transparent); color: var(--warning); background: color-mix(in srgb, var(--warning) 18%, var(--gloom));'}
`;

function getClientSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('client') || '';
}

function inferStatusTone(message) {
  const value = `${message || ''}`.trim().toLowerCase();
  if (!value) return 'neutral';
  if (value.includes('σφάλμα') || value.includes('not found')) return 'error';
  if (value.includes('λείπει') || value.includes('συμπλήρωσε')) return 'warning';
  return 'success';
}

function reviewState(item) {
  const hasNotes = `${item?.client_notes || ''}`.trim().length > 0;
  if (item?.approval_status === 'approved' && !hasNotes) return 'ready';
  if (item?.approval_status === 'disapproved' || hasNotes) return 'changes';
  return 'awaiting';
}

function postReviewStatus(item) {
  const hasNotes = `${item?.client_notes || ''}`.trim().length > 0;
  if (item?.approval_status === 'disapproved') return 'rejected';
  if (item?.approval_status === 'approved') return 'approved';
  if (hasNotes) return 'changes';
  return 'awaiting';
}

function postReviewLabel(state) {
  if (state === 'approved') return 'Εγκρίθηκε';
  if (state === 'rejected') return 'Απορρίφθηκε';
  if (state === 'awaiting') return 'Αναμονή';
  return 'Χρειάζεται αλλαγές';
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

function linksFromText(value) {
  return `${value || ''}`
    .split('\n')
    .map((item) => normalizeIdeaLink(item))
    .filter(Boolean);
}

function linksToText(value) {
  return (value || []).join('\n');
}

function resolveFeedbackAttachmentUrl(url, path) {
  const directUrl = `${url || ''}`.trim();
  if (directUrl) return directUrl;
  const storagePath = `${path || ''}`.trim();
  if (!storagePath) return '';
  try {
    return getPublicUrl(storagePath);
  } catch {
    return '';
  }
}

function IdeasAdminApp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [copyState, setCopyState] = useState('');
  const [expandedIdeaId, setExpandedIdeaId] = useState('');
  const [draftById, setDraftById] = useState({});
  const [newLinkInput, setNewLinkInput] = useState('');
  const [editLinkInputById, setEditLinkInputById] = useState({});
  const [clientSlug] = useState(getClientSlugFromUrl);
  const {
    session,
    selectedClient,
    ideas,
    form,
    setForm,
    status,
    configError,
    busy,
    savingId,
    previewLink,
    historyByIdeaId,
    signIn,
    signOut,
    addIdea,
    saveIdeaEdits,
    removeIdea,
    removeAllIdeas
  } = useIdeasAdminData(clientSlug);

  useEffect(() => {
    setDraftById((prev) => {
      const next = { ...prev };
      ideas.forEach((idea) => {
        next[idea.id] = next[idea.id] || {
          title: idea.title || '',
          analysis: idea.analysis || '',
          linksText: idea.linksText || '',
          requirements: idea.requirements || '',
          status: idea.status || 'published'
        };
      });
      return next;
    });
  }, [ideas]);

  function addFormLink() {
    const normalized = normalizeIdeaLink(newLinkInput);
    if (!normalized) return;
    const current = linksFromText(form.linksText);
    if (current.includes(normalized)) {
      setNewLinkInput('');
      return;
    }
    setForm((prev) => ({ ...prev, linksText: linksToText([...current, normalized]) }));
    setNewLinkInput('');
  }

  function removeFormLink(linkValue) {
    const current = linksFromText(form.linksText);
    setForm((prev) => ({ ...prev, linksText: linksToText(current.filter((item) => item !== linkValue)) }));
  }

  function addDraftLink(ideaId) {
    const normalized = normalizeIdeaLink(editLinkInputById[ideaId] || '');
    if (!normalized) return;
    setDraftById((prev) => {
      const target = prev[ideaId] || {};
      const current = linksFromText(target.linksText || '');
      if (current.includes(normalized)) {
        return prev;
      }
      return {
        ...prev,
        [ideaId]: { ...target, linksText: linksToText([...current, normalized]) }
      };
    });
    setEditLinkInputById((prev) => ({ ...prev, [ideaId]: '' }));
  }

  function removeDraftLink(ideaId, linkValue) {
    setDraftById((prev) => {
      const target = prev[ideaId] || {};
      const current = linksFromText(target.linksText || '');
      return {
        ...prev,
        [ideaId]: { ...target, linksText: linksToText(current.filter((item) => item !== linkValue)) }
      };
    });
  }

  const overview = useMemo(
    () =>
      ideas.reduce((acc, item) => {
        const state = reviewState(item);
        if (state === 'changes') acc.changes += 1;
        if (state === 'ready') acc.ready += 1;
        if (state === 'awaiting') acc.awaiting += 1;
        return acc;
      }, { changes: 0, ready: 0, awaiting: 0 }),
    [ideas]
  );

  async function copyPreviewLink() {
    if (!previewLink) return;
    try {
      await navigator.clipboard.writeText(previewLink);
      setCopyState('Το ideas preview link αντιγράφηκε.');
    } catch (_error) {
      setCopyState('Δεν έγινε αντιγραφή του link.');
    }
  }

  async function handleSaveIdea(ideaId) {
    const draft = draftById[ideaId];
    if (!draft) return;
    await saveIdeaEdits(ideaId, draft);
  }

  function openContentAdmin() {
    const targetSlug = selectedClient?.slug || clientSlug;
    if (!targetSlug) return;
    window.location.href = `./admin.html?client=${encodeURIComponent(targetSlug)}`;
  }

  if (configError) {
    return (
      <>
        <AppStyle />
        <Page>
          <Hero>
            <State $tone="error">{configError}</State>
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
            <Title>Ideas Admin</Title>
            <Subtitle>Η πρόσβαση γίνεται με το ίδιο auth flow όπως το Admin.</Subtitle>
            <Form onSubmit={(event) => event.preventDefault()}>
              <label>
                Email
                <InlineInput type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
              </label>
              <label>
                Κωδικός
                <InlineInput type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Κωδικός" />
              </label>
              <Actions>
                <ActionButton $type="primary" type="button" disabled={busy} onClick={() => signIn(email, password)}>
                  {busy ? 'Περίμενε...' : 'Σύνδεση'}
                </ActionButton>
                <ActionButton type="button" onClick={() => { window.location.href = './portal.html'; }}>
                  Portal
                </ActionButton>
              </Actions>
            </Form>
            {status && <State $tone={inferStatusTone(status)}>{status}</State>}
          </Hero>
        </Page>
      </>
    );
  }

  if (!clientSlug) {
    return (
      <>
        <AppStyle />
        <Page>
          <Hero>
            <Title>Λείπει client scope</Title>
            <Subtitle>Άνοιξε το Ideas Admin από το portal για να φορτώσει συγκεκριμένο client feed.</Subtitle>
            <Actions>
              <ActionButton type="button" onClick={() => { window.location.href = './portal.html'; }}>
                Portal
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
            <ActionButton type="button" onClick={() => { window.location.href = './portal.html'; }}>Portal</ActionButton>
            <ActionButton type="button" disabled={!selectedClient?.slug && !clientSlug} onClick={openContentAdmin}>
              Admin Content
            </ActionButton>
            <ActionButton type="button" onClick={signOut}>Αποσύνδεση</ActionButton>
          </HeroTop>
          <Title>Ideas Admin: {selectedClient?.name || 'Client'}</Title>
          <Subtitle>Ίδια λογική με FB & IG tab: compose, publish και review-ready ideas για τον ίδιο client.</Subtitle>

          <Form onSubmit={(event) => event.preventDefault()}>
            <CollapsiblePanel title="Ideas Composer">
              <Step>
                <StepTitle>Προσθήκη Ιδέας</StepTitle>
                <label>
                  Τίτλος ιδέας
                  <InlineInput
                    value={form.title}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Π.χ. Reel πριν/μετά με client case"
                  />
                </label>
                <label>
                  Ανάλυση ιδέας
                  <CaptionInput
                    value={form.analysis}
                    onChange={(event) => setForm((prev) => ({ ...prev, analysis: event.target.value }))}
                    placeholder="Περιέγραψε ξεκάθαρα το concept, το αποτέλεσμα και τον στόχο."
                  />
                </label>
                <label>
                  Προτεινόμενο link έμπνευσης
                  <LinkComposerRow>
                    <InlineInput
                      value={newLinkInput}
                      onChange={(event) => setNewLinkInput(event.target.value)}
                      placeholder="https://instagram.com/..."
                    />
                    <ActionButton $type="primary" type="button" onClick={addFormLink}>Προσθήκη</ActionButton>
                  </LinkComposerRow>
                  <LinkList>
                    {linksFromText(form.linksText).map((link) => (
                      <LinkChip key={link} href={link} target="_blank" rel="noreferrer">
                        {link}
                        <RemoveChipButton type="button" onClick={(event) => { event.preventDefault(); removeFormLink(link); }}>×</RemoveChipButton>
                      </LinkChip>
                    ))}
                  </LinkList>
                </label>
                <label>
                  Τι χρειαζόμαστε από τον πελάτη
                  <CaptionInput
                    value={form.requirements}
                    onChange={(event) => setForm((prev) => ({ ...prev, requirements: event.target.value }))}
                    placeholder="Υλικά, χρόνο, πρόσβαση, πρόσωπα, budget approval κλπ."
                  />
                </label>
                <Actions>
                  <ActionButton $type="primary" type="button" disabled={busy} onClick={addIdea}>
                    {busy ? 'Αποθήκευση...' : 'Αποθήκευση ιδέας'}
                  </ActionButton>
                </Actions>
              </Step>
            </CollapsiblePanel>
          </Form>

          <WorkflowActionGroup>
            <WorkflowActionMeta>Τελικές ενέργειες preview/share για το Ideas flow.</WorkflowActionMeta>
            <WorkflowActionRow>
              <ActionButton type="button" disabled={!previewLink} onClick={() => window.open(previewLink, '_blank', 'noopener,noreferrer')}>
                Προεπισκόπηση
              </ActionButton>
              <ActionButton type="button" disabled={!previewLink} onClick={copyPreviewLink}>
                ⧉ Αντιγραφή συνδέσμου
              </ActionButton>
            </WorkflowActionRow>
          </WorkflowActionGroup>

          {status && <State $tone={inferStatusTone(status)}>{status}</State>}
          {copyState && <State $tone={inferStatusTone(copyState)}>{copyState}</State>}
        </Hero>

        <List>
          <ListHeader>
            <ListTitle>Ideas: Όλα τα στοιχεία</ListTitle>
            <ActionButton
              type="button"
              $type="danger"
              onClick={removeAllIdeas}
              disabled={busy || ideas.length === 0}
            >
              Οριστική Διαγραφή
            </ActionButton>
          </ListHeader>
          <Overview>
            <OverviewCard $type="changes">
              <OverviewLabel>Χρειάζονται αλλαγές</OverviewLabel>
              <OverviewValue>{overview.changes}</OverviewValue>
            </OverviewCard>
            <OverviewCard $type="ready">
              <OverviewLabel>Έτοιμα</OverviewLabel>
              <OverviewValue>{overview.ready}</OverviewValue>
            </OverviewCard>
            <OverviewCard>
              <OverviewLabel>Αναμονή</OverviewLabel>
              <OverviewValue>{overview.awaiting}</OverviewValue>
            </OverviewCard>
          </Overview>

          {ideas.length === 0 ? (
            <State $tone="warning">Δεν υπάρχουν ideas ακόμα για αυτόν τον client.</State>
          ) : (
            ideas.map((idea) => {
              const isExpanded = expandedIdeaId === idea.id;
              const draft = draftById[idea.id] || {};
              const saving = `${savingId}` === `${idea.id}`;
              const review = postReviewStatus(idea);
              const historyEntries = historyByIdeaId[`${idea.id}`] || [];
              const feedbackImageUrl = resolveFeedbackAttachmentUrl(idea.client_feedback_image_url, idea.client_feedback_image_path);
              const feedbackAudioUrl = resolveFeedbackAttachmentUrl(idea.client_feedback_audio_url, idea.client_feedback_audio_path);
              const hasFeedbackAttachment = Boolean(feedbackImageUrl || feedbackAudioUrl);
              return (
                <Row key={idea.id} $compact={!isExpanded}>
                  <RowMain>
                    <RowSummaryButton type="button" onClick={() => setExpandedIdeaId((prev) => (prev === idea.id ? '' : idea.id))}>
                      <RowHead>
                        <RowThumb>IDEA</RowThumb>
                        <RowHeadText>
                          <strong>{idea.title || 'Χωρίς τίτλο'}</strong>
                          <small>{new Date(idea.created_at || Date.now()).toLocaleString()}</small>
                          <RowSummaryHint>{isExpanded ? 'Πάτησε για απόκρυψη λεπτομερειών' : 'Πάτησε για προβολή λεπτομερειών'}</RowSummaryHint>
                        </RowHeadText>
                      </RowHead>
                    </RowSummaryButton>

                    {isExpanded ? (
                      <EditFieldStack>
                        <label>
                          Τίτλος
                          <InlineInput value={draft.title || ''} onChange={(event) => setDraftById((prev) => ({ ...prev, [idea.id]: { ...draft, title: event.target.value } }))} />
                        </label>
                        <label>
                          Ανάλυση
                          <CaptionInput value={draft.analysis || ''} onChange={(event) => setDraftById((prev) => ({ ...prev, [idea.id]: { ...draft, analysis: event.target.value } }))} />
                        </label>
                        <label>
                          Link έμπνευσης
                          <LinkComposerRow>
                            <InlineInput
                              value={editLinkInputById[idea.id] || ''}
                              onChange={(event) => setEditLinkInputById((prev) => ({ ...prev, [idea.id]: event.target.value }))}
                              placeholder="https://tiktok.com/..."
                            />
                            <ActionButton $type="primary" type="button" onClick={() => addDraftLink(idea.id)}>Προσθήκη</ActionButton>
                          </LinkComposerRow>
                          <LinkList>
                            {linksFromText(draft.linksText || '').map((link) => (
                              <LinkChip key={`${idea.id}-${link}`} href={link} target="_blank" rel="noreferrer">
                                {link}
                                <RemoveChipButton
                                  type="button"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    removeDraftLink(idea.id, link);
                                  }}
                                >
                                  ×
                                </RemoveChipButton>
                              </LinkChip>
                            ))}
                          </LinkList>
                        </label>
                        <label>
                          Requirements από πελάτη
                          <CaptionInput value={draft.requirements || ''} onChange={(event) => setDraftById((prev) => ({ ...prev, [idea.id]: { ...draft, requirements: event.target.value } }))} />
                        </label>
                        <Actions>
                          <ActionButton type="button" $type="primary" disabled={saving} onClick={() => handleSaveIdea(idea.id)}>
                            {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
                          </ActionButton>
                          <ActionMenu
                            label="More"
                            actions={[
                              {
                                key: `delete-${idea.id}`,
                                label: 'Διαγραφή',
                                type: 'danger',
                                disabled: saving,
                                onClick: () => removeIdea(idea.id)
                              }
                            ]}
                          />
                        </Actions>
                        <RowText><strong>Τελευταία σημείωση πελάτη:</strong> {(idea.client_notes || '').trim() || 'Δεν υπάρχουν σημειώσεις ακόμα.'}</RowText>
                        <HistoryWrap>
                          <RowText><strong>Ιστορικό σημειώσεων:</strong></RowText>
                          {historyEntries.length === 0 ? (
                            <RowText>Δεν υπάρχουν προηγούμενες σημειώσεις στο ιστορικό.</RowText>
                          ) : (
                            historyEntries.map((entry) => (
                              <HistoryItem key={`${idea.id}-${entry.id}`}>
                                <HistoryMeta>{formatHistoryDateTime(entry.createdAt)} • {entry.action || 'Σημείωση'}</HistoryMeta>
                                {(entry.text || '').trim() ? (
                                  <HistoryText>{entry.text}</HistoryText>
                                ) : null}
                                {(entry.changes || []).map((change, changeIndex) => (
                                  <HistoryText key={`${entry.id}-change-${changeIndex}`}>
                                    {change?.type === 'removed' ? '−' : '+'} {change?.paragraph || ''}
                                  </HistoryText>
                                ))}
                              </HistoryItem>
                            ))
                          )}
                        </HistoryWrap>
                        <HistoryWrap>
                          <RowText><strong>Client feedback attachments:</strong></RowText>
                          {hasFeedbackAttachment ? (
                            <AttachmentGrid>
                              {feedbackImageUrl ? (
                                <AttachmentCard>
                                  <HistoryMeta>Screenshot</HistoryMeta>
                                  <AttachmentThumb href={feedbackImageUrl} target="_blank" rel="noreferrer">
                                    <img src={feedbackImageUrl} alt={`Client feedback screenshot για ${idea.title || 'idea'}`} loading="lazy" />
                                  </AttachmentThumb>
                                  <AttachmentLink href={feedbackImageUrl} target="_blank" rel="noreferrer">
                                    Άνοιγμα εικόνας
                                  </AttachmentLink>
                                </AttachmentCard>
                              ) : null}
                              {feedbackAudioUrl ? (
                                <AttachmentCard>
                                  <HistoryMeta>Audio</HistoryMeta>
                                  <AttachmentAudio controls preload="none" src={feedbackAudioUrl}>
                                    Ο browser δεν υποστηρίζει audio playback.
                                  </AttachmentAudio>
                                  <AttachmentLink href={feedbackAudioUrl} target="_blank" rel="noreferrer">
                                    Άνοιγμα ή λήψη ήχου
                                  </AttachmentLink>
                                </AttachmentCard>
                              ) : null}
                            </AttachmentGrid>
                          ) : (
                            <RowText>Δεν υπάρχει client attachment.</RowText>
                          )}
                        </HistoryWrap>
                      </EditFieldStack>
                    ) : null}
                  </RowMain>
                  <RowActions $compact={!isExpanded}>
                    <ReviewPill $state={review}>{postReviewLabel(review)}</ReviewPill>
                  </RowActions>
                </Row>
              );
            })
          )}
        </List>
      </Page>
    </>
  );
}

createRoot(document.getElementById('root')).render(<IdeasAdminApp />);
