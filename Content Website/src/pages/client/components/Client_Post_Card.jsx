import React, { useState } from 'react';
import styled from 'styled-components';
import { Main_, Red_, Grey_Link, Textarea_ } from '/node_modules/monica-alexandria/dist/index.mjs';
import { relative_date_label, format_history_datetime } from '/src/utils/format/date_labels.jsx';
import { approval_status_label, detect_post_media_kind } from '/src/utils/post/post_helpers.jsx';
import { Client_Caption_Block } from '/src/pages/client/components/Client_Caption_Block.jsx';

const Card = styled.article`
  border: 0.1rem solid ${(p) => p.theme.high};
  border-radius: var(--normalRadius);
  background: ${(p) => p.theme.low};
  box-shadow: ${(p) => p.theme.out};
  overflow: hidden;
  display: grid;
`;

const Header = styled.div`
  padding: var(--normalPads);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  border-bottom: 0.1rem solid ${(p) => p.theme.high};
`;

const HeaderInfo = styled.div`
  display: grid;
  gap: 0.4rem;
`;

const MetaText = styled.p`
  margin: 0;
  color: ${(p) => p.theme.mid};
`;

const Status = styled.h6`
  margin: 0;
  padding: var(--smallPads);
  border-radius: var(--smallRadius);
  background: ${(p) => p.theme.mid};
  color: ${(p) => p.theme.color};
`;

const MediaWrap = styled.div`
  background: ${(p) => p.theme.background};
  border-bottom: 0.1rem solid ${(p) => p.theme.high};
`;

const MediaImage = styled.img`
  width: 100%;
  max-height: 64rem;
  object-fit: contain;
  display: block;
`;

const MediaVideo = styled.video`
  width: 100%;
  max-height: 64rem;
  object-fit: contain;
  display: block;
`;

const EmptyMedia = styled.div`
  min-height: 24rem;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 1rem;
  padding: var(--largePads);
`;

const Body = styled.div`
  padding: var(--normalPads);
  display: grid;
  gap: 1rem;
`;

const HistoryWrap = styled.div`
  display: grid;
  gap: 0.8rem;
  border: 0.1rem solid ${(p) => p.theme.high};
  border-radius: var(--smallRadius);
  padding: var(--smallPads);
  background: ${(p) => p.theme.background};
`;

const HistoryRow = styled.article`
  display: grid;
  gap: 0.3rem;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SmallText = styled.p`
  margin: 0;
  color: ${(p) => p.theme.mid};
`;

const NoteTitle = styled.h6`
  margin: 0;
  color: ${(p) => p.theme.flare};
`;

const MediaRendererByKind = {
  image: ({ post, fallback }) => <MediaImage src={post.image_url} alt={post.title || fallback} loading="lazy" />,
  video: ({ post }) => <MediaVideo src={post.image_url} controls playsInline preload="metadata" />,
  empty: ({ post, fallback }) => (
    <EmptyMedia>
      <h6>ΠΡΟΕΠΙΣΚΟΠΗΣΗ ΑΝΑΡΤΗΣΗΣ</h6>
      <p>{post.title || fallback}</p>
    </EmptyMedia>
  )
};

// Renders one post card with notes history and approval actions.
// Backend integration: call update endpoint first, then append notes history entry.
export const Client_Post_Card = ({ post, index, pending, historyEntries, onUpdateReview, onAppendHistory }) => {
  const [notes, setNotes] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const fallback = `Ανάρτηση ${index + 1}`;
  const mediaKind = post.image_url ? detect_post_media_kind(post) : 'empty';
  const RenderMedia = MediaRendererByKind[mediaKind];
  const trimmedNotes = notes.trim();
  const noteMissing = trimmedNotes.length === 0;

  const handle_save_notes = async () => {
    if (noteMissing) {
      return;
    }

    const isSaved = await onUpdateReview(post.id, { client_notes: trimmedNotes }, 'Οι σημειώσεις αποθηκεύτηκαν.');

    if (isSaved) {
      onAppendHistory(post.id, trimmedNotes, 'Σημείωση');
      setNotes('');
    }
  };

  const handle_decision = async (nextStatus) => {
    const successMessageMap = {
      approved: 'Η ανάρτηση εγκρίθηκε.',
      disapproved: 'Η ανάρτηση απορρίφθηκε.'
    };

    const historyActionMap = {
      approved: 'Έγκριση',
      disapproved: 'Απόρριψη'
    };

    const historyText = trimmedNotes || 'Χωρίς σημείωση.';
    const isSaved = await onUpdateReview(post.id, { approval_status: nextStatus, client_notes: trimmedNotes }, successMessageMap[nextStatus]);

    if (isSaved) {
      onAppendHistory(post.id, historyText, historyActionMap[nextStatus]);
      setNotes('');
    }
  };

  return (
    <Card>
      <Header>
        <HeaderInfo>
          <h6>{post.username || 'gymway.official'}</h6>
          <MetaText>{relative_date_label(post.created_at)} πριν</MetaText>
        </HeaderInfo>
        <Status>{approval_status_label(post.approval_status)}</Status>
      </Header>

      <MediaWrap>
        <RenderMedia post={post} fallback={fallback} />
      </MediaWrap>

      <Body>
        <Client_Caption_Block username={post.username} caption={post.caption} />

        <NoteTitle>Σημειώσεις πελάτη</NoteTitle>
        <Textarea_
          value={notes}
          rows={4}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Γράψε σχόλιο για αυτή την ανάρτηση..."
        />

        <ActionRow>
          <Main_ text={pending ? 'Αποθήκευση...' : 'Αποθήκευση σημείωσης'} onClick={handle_save_notes} disabled={pending || noteMissing} />
          <Main_ text="Έγκριση" onClick={() => handle_decision('approved')} disabled={pending} />
          <Red_ text="Απόρριψη" onClick={() => handle_decision('disapproved')} disabled={pending} />
          <Grey_Link text={showHistory ? 'Κλείσιμο ιστορικού' : 'Ιστορικό σημειώσεων'} onClick={() => setShowHistory(!showHistory)} />
        </ActionRow>

        {showHistory && (
          <HistoryWrap>
            {(historyEntries || []).map((entry) => (
              <HistoryRow key={entry.id}>
                <h6>{format_history_datetime(entry.createdAt)} • {entry.action}</h6>
                <SmallText>{entry.text}</SmallText>
              </HistoryRow>
            ))}
          </HistoryWrap>
        )}

        <SmallText>Η σημείωση είναι προαιρετική για έγκριση ή απόρριψη.</SmallText>
      </Body>
    </Card>
  );
};
