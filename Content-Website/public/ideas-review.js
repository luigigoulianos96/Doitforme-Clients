import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import styled from 'styled-components';
import {
  AppStyle,
  Page,
  Hero,
  OrbLeft,
  OrbRight,
  Title,
  Subtitle,
  Stats,
  StatCard,
  StatLabel,
  StatValue,
  State
} from './core/styles/App.styles.js';
import { useIdeasReviewData } from './ideas/hooks/useIdeasReviewData.js';
import { normalizeIdeaLink } from './ideas/utils/ideaHelpers.js';
import { useNotesHistory } from './hooks/useNotesHistory.js';
import { PostCard } from './components/cards/PostCard.js';

const IdeasGrid = styled.section`
  margin-top: 24px;
  display: grid;
  gap: 16px;
`;

const IdeaShell = styled.article`
  border-radius: 20px;
  border: 1px solid color-mix(in srgb, var(--greyDark) 30%, transparent);
  background: color-mix(in srgb, var(--white) 96%, transparent);
  overflow: hidden;
  box-shadow: 0 14px 30px color-mix(in srgb, var(--black) 36%, transparent);
`;

const IdeaTop = styled.div`
  padding: 1rem;
  display: grid;
  gap: 0.65rem;
  border-bottom: 1px solid color-mix(in srgb, var(--greyDark) 18%, transparent);
`;

const IdeaMeta = styled.p`
  margin: 0;
  color: color-mix(in srgb, var(--dark) 65%, var(--greyDark));
  font-size: 1.25rem;
`;

const IdeaTitle = styled.h2`
  margin: 0;
  color: var(--dark);
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.7rem, 3.1vw, 2.5rem);
  line-height: 1.12;
`;

const IdeaBody = styled.div`
  padding: 0 1rem 0.95rem;
  display: grid;
  gap: 0.55rem;
`;

const IdeaLabel = styled.strong`
  color: color-mix(in srgb, var(--dark) 82%, var(--greyDark));
  font-size: 1.35rem;
`;

const IdeaText = styled.p`
  margin: 0;
  color: color-mix(in srgb, var(--dark) 90%, var(--greyDark));
  font-size: 1.5rem;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const LinksWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
`;

const LinkChip = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--focus) 36%, transparent);
  color: var(--accent);
  text-decoration: none;
  padding: 0.3rem 0.7rem;
  font-size: 1.32rem;
  font-weight: 700;
`;

function getClientSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('client') || '';
}

function reviewState(idea) {
  const hasNotes = `${idea?.client_notes || ''}`.trim().length > 0;
  if (idea?.approval_status === 'approved' && !hasNotes) return 'ready';
  if (idea?.approval_status === 'disapproved' || hasNotes) return 'changes';
  return 'awaiting';
}

function safeIdeaHref(value) {
  const normalized = normalizeIdeaLink(value || '');
  if (!normalized) return '';
  return normalized;
}

function buildIdeaPostViewModel(idea, selectedClientName) {
  return {
    id: idea.id,
    title: `[IG] IDEA::${idea.title || 'Ιδέα'}`,
    caption: idea.analysis || '',
    image_url: '',
    created_at: idea.created_at,
    username: selectedClientName || 'Client',
    approval_status: idea.approval_status || 'pending',
    client_notes: idea.client_notes || '',
    client_feedback_image_url: idea.client_feedback_image_url || '',
    client_feedback_image_path: idea.client_feedback_image_path || '',
    client_feedback_audio_url: idea.client_feedback_audio_url || '',
    client_feedback_audio_path: idea.client_feedback_audio_path || ''
  };
}

function IdeasReviewApp() {
  const [clientSlug] = useState(getClientSlugFromUrl);
  const { selectedClient, ideas, status, savingId, updateIdeaReview } = useIdeasReviewData(clientSlug);
  const { notesHistoryByPost, appendNoteHistory } = useNotesHistory(clientSlug, 'ideas');

  const stats = useMemo(
    () =>
      ideas.reduce(
        (acc, idea) => {
          const state = reviewState(idea);
          if (state === 'ready') acc.ready += 1;
          if (state === 'changes') acc.changes += 1;
          if (state === 'awaiting') acc.awaiting += 1;
          return acc;
        },
        { ready: 0, changes: 0, awaiting: 0 }
      ),
    [ideas]
  );

  return (
    <>
      <AppStyle />
      <div className="noise" />
      <Page>
        <Hero>
          <OrbLeft />
          <OrbRight />
          <Title>{selectedClient?.name ? `${selectedClient.name} Ροή Εγκρίσεων Ideas` : 'Ροή Εγκρίσεων Ideas'}</Title>
          <Subtitle>Το approval block παρακάτω είναι το ίδιο component/interaction με τα άλλα previews.</Subtitle>
          <Stats>
            <StatCard>
              <StatLabel>Χρειάζονται αλλαγές</StatLabel>
              <StatValue>{stats.changes}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Έτοιμα</StatLabel>
              <StatValue>{stats.ready}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Αναμονή</StatLabel>
              <StatValue>{stats.awaiting}</StatValue>
            </StatCard>
          </Stats>
          {status.error && <State $error>{status.error}</State>}
          {status.message && <State>{status.message}</State>}
        </Hero>

        <IdeasGrid>
          {ideas.map((idea, index) => {
            const post = buildIdeaPostViewModel(idea, selectedClient?.name || '');
            return (
              <IdeaShell key={idea.id}>
                <IdeaTop>
                  <IdeaMeta>{new Date(idea.created_at || Date.now()).toLocaleString()}</IdeaMeta>
                  <IdeaTitle>{idea.title || 'Ιδέα'}</IdeaTitle>
                </IdeaTop>
                <IdeaBody>
                  <IdeaLabel>Ανάλυση ιδέας</IdeaLabel>
                  <IdeaText>{idea.analysis || 'Δεν έχει προστεθεί ανάλυση.'}</IdeaText>

                  <IdeaLabel>Links έμπνευσης</IdeaLabel>
                  {(idea.inspiration_links || []).length > 0 ? (
                    <LinksWrap>
                      {(idea.inspiration_links || []).map((link, linkIndex) => {
                        const href = safeIdeaHref(link?.url || '');
                        if (!href) return null;
                        return (
                          <LinkChip
                            key={`${idea.id}-link-${linkIndex}`}
                            href={href}
                            rel="noreferrer"
                            onClick={(event) => {
                              event.preventDefault();
                              window.location.assign(href);
                            }}
                          >
                            {link.platform || 'Link'}
                          </LinkChip>
                        );
                      })}
                    </LinksWrap>
                  ) : (
                    <IdeaText>Δεν υπάρχουν links έμπνευσης.</IdeaText>
                  )}

                  <IdeaLabel>Τι χρειαζόμαστε από εσένα</IdeaLabel>
                  <IdeaText>{idea.requirements || 'Δεν έχουν προστεθεί requirements.'}</IdeaText>
                </IdeaBody>

                <PostCard
                  post={post}
                  index={index}
                  onUpdateReview={updateIdeaReview}
                  pending={`${savingId}` === `${idea.id}`}
                  historyEntries={notesHistoryByPost[idea.id] || []}
                  onAppendHistory={appendNoteHistory}
                  clientName={selectedClient?.name || ''}
                  previewMode="instagram"
                  reviewOnly
                />
              </IdeaShell>
            );
          })}
        </IdeasGrid>

        {!status.loading && !status.error && ideas.length === 0 && (
          <Hero>
            <Subtitle>Δεν υπάρχουν δημοσιευμένες ideas ακόμα για αυτόν τον client.</Subtitle>
          </Hero>
        )}
      </Page>
    </>
  );
}

createRoot(document.getElementById('root')).render(<IdeasReviewApp />);
