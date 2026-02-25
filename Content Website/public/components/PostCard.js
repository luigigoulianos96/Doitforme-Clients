import React, { useEffect, useState } from 'react';
import { Textarea_ } from 'monica-alexandria';
import {
  BlogPost,
  BlogContent,
  BlogTopRow,
  BlogThumb,
  BlogTopMeta,
  BlogMeta,
  BlogTitle,
  ReviewSection,
  ArticleEditWrap,
  ArticleEditTextarea,
  ReviewHead,
  InlineAction,
  NotesHistory,
  NoteItem,
  NoteText,
  SaveRow,
  SaveNoteButton,
  DecisionRow,
  DecisionNotice,
  DecisionButton,
  LoadingOverlay,
  LoadingBadge,
  Post,
  PostHeader,
  Avatar,
  Menu,
  OrderBadge,
  Media,
  MediaTag,
  MediaFilename,
  LikesLine,
  CarouselControls,
  CarouselControlButton,
  CarouselDots,
  CarouselDot,
  PostBody,
  ReviewBox,
  NoteCollapsed
} from '../core/styles/App.styles.js';
import { formatHistoryDateTime } from '../hooks/useNotesHistory.js';
import { stripPostTypePrefix, isVideoPost, postOrderLabel } from '../utils/appHelpers.js';
import { CaptionBlock } from './CaptionBlock.js';

function PostCard({
  post,
  index,
  onUpdateReview,
  pending,
  historyEntries,
  onAppendHistory,
  previewMode,
  instagramKind = 'single',
  carouselSlides = [],
  postIds = []
}) {
  const fallback = previewMode === 'article' ? `Άρθρο ${index + 1}` : `Ανάρτηση ${index + 1}`;
  const [notes, setNotes] = useState('');
  const [articleText, setArticleText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [notesOpen, setNotesOpen] = useState(true);
  const [decisionLocked, setDecisionLocked] = useState(post.approval_status !== 'pending');
  const [decisionNotice, setDecisionNotice] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);

  const isInstagramStory = previewMode === 'instagram' && instagramKind === 'story';
  const isInstagramCarousel = previewMode === 'instagram' && instagramKind === 'carousel';
  const targetPostIds = postIds.length > 0 ? postIds : [post.id];
  const activeSlides = isInstagramCarousel
    ? (carouselSlides.length > 0 ? carouselSlides : [post])
    : [post];
  const activeSlide = activeSlides[carouselIndex] || activeSlides[0] || post;
  const isVideo = isVideoPost(activeSlide);

  const trimmedNotes = notes.trim();
  const noteMissing = trimmedNotes.length === 0;

  useEffect(() => {
    setDecisionLocked(post.approval_status !== 'pending');
  }, [post.approval_status]);

  useEffect(() => {
    setCarouselIndex(0);
  }, [post.id]);

  useEffect(() => {
    if (!decisionNotice) return;
    const timer = window.setTimeout(() => setDecisionNotice(''), 2200);
    return () => window.clearTimeout(timer);
  }, [decisionNotice]);

  useEffect(() => {
    const nextText = `${post.client_notes || post.caption || ''}`.trim();
    setArticleText(nextText);
  }, [post.client_notes, post.caption]);

  async function handleSaveNotes() {
    if (noteMissing) return;
    const ok = await onUpdateReview(targetPostIds, { client_notes: trimmedNotes }, 'Οι σημειώσεις αποθηκεύτηκαν.');
    if (!ok) return;
    onAppendHistory(post.id, trimmedNotes, 'Σημείωση');
    setNotes('');
    setNotesOpen(false);
  }

  async function handleDecision(nextStatus) {
    const articleValue = articleText.trim();
    const clientNotesValue = previewMode === 'article' ? articleValue : (nextStatus === 'approved' ? '' : trimmedNotes);
    const successLabel = previewMode === 'article'
      ? (nextStatus === 'approved' ? 'Το άρθρο εγκρίθηκε.' : 'Το άρθρο απορρίφθηκε.')
      : (nextStatus === 'approved' ? 'Η ανάρτηση εγκρίθηκε.' : 'Η ανάρτηση απορρίφθηκε.');

    const ok = await onUpdateReview(
      targetPostIds,
      { approval_status: nextStatus, client_notes: clientNotesValue },
      successLabel
    );
    if (!ok) return;
    onAppendHistory(
      post.id,
      previewMode === 'article' ? (articleValue || 'Χωρίς αλλαγή κειμένου.') : (trimmedNotes || 'Χωρίς σημείωση.'),
      nextStatus === 'approved' ? 'Έγκριση' : 'Απόρριψη'
    );
    setNotes('');
    setDecisionLocked(true);
    setDecisionNotice(
      previewMode === 'article'
        ? (nextStatus === 'approved' ? 'Εγκρίνατε το άρθρο.' : 'Απορρίψατε το άρθρο.')
        : (nextStatus === 'approved' ? 'Εγκρίνατε τη δημοσίευση.' : 'Απορρίψατε τη δημοσίευση.')
    );
  }

  async function handleArticleSave() {
    const nextText = articleText.trim();
    if (!nextText) return;
    const previousText = `${post.client_notes || post.caption || ''}`.trim();
    const ok = await onUpdateReview(
      post.id,
      { client_notes: nextText, approval_status: 'pending' },
      'Οι αλλαγές άρθρου αποθηκεύτηκαν και στάλθηκαν στον admin.'
    );
    if (!ok) return;
    onAppendHistory(post.id, { beforeText: previousText, afterText: nextText }, 'Αλλαγή άρθρου');
  }

  if (previewMode === 'article') {
    return (
      <BlogPost $loading={pending} $delay={`${Math.min(index * 45, 550)}ms`}>
        <BlogContent>
          <BlogTopRow>
            {post.image_url && (
              <BlogThumb>
                <img src={post.image_url} alt={stripPostTypePrefix(post.title) || fallback} loading="lazy" />
              </BlogThumb>
            )}
            <BlogTopMeta>
              <BlogMeta>
                {formatHistoryDateTime(post.created_at)}{post.username ? ` • ${post.username}` : ''}
              </BlogMeta>
              <BlogTitle>{stripPostTypePrefix(post.title) || fallback}</BlogTitle>
            </BlogTopMeta>
          </BlogTopRow>

          <ReviewSection>
            <ArticleEditWrap>
              <ReviewHead>
                <span>Επεξεργασία άρθρου πελάτη</span>
                <InlineAction type="button" onClick={() => setShowHistory((prev) => !prev)} disabled={(historyEntries || []).length === 0}>
                  Ιστορικό αλλαγών
                </InlineAction>
              </ReviewHead>
              {showHistory && (historyEntries || []).length > 0 && (
                <NotesHistory>
                  {(historyEntries || []).map((entry) => (
                    <NoteItem key={entry.id}>
                      <small>{formatHistoryDateTime(entry.createdAt)} • {entry.action}</small>
                      {(entry.changes || []).length > 0 ? (
                        (entry.changes || []).map((change, changeIndex) => (
                          <NoteText key={`${entry.id}-${change.type}-${changeIndex}`}>
                            {change.type === 'added' ? 'Added: ' : 'Removed: '}
                            {change.paragraph}
                          </NoteText>
                        ))
                      ) : (
                        <NoteText>{entry.text}</NoteText>
                      )}
                    </NoteItem>
                  ))}
                </NotesHistory>
              )}
              <ArticleEditTextarea
                rows="16"
                value={articleText}
                onChange={(event) => setArticleText(event.target.value)}
                placeholder="Επεξεργάσου το άρθρο και αποθήκευσε..."
              />
              <SaveRow>
                <SaveNoteButton type="button" onClick={handleArticleSave} disabled={pending || articleText.trim().length === 0}>
                  ⌾ Αποθήκευση αλλαγής άρθρου
                </SaveNoteButton>
              </SaveRow>
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
            </ArticleEditWrap>
          </ReviewSection>
        </BlogContent>
        {pending && (
          <LoadingOverlay>
            <LoadingBadge>Αποθήκευση...</LoadingBadge>
          </LoadingOverlay>
        )}
      </BlogPost>
    );
  }

  return (
    <Post $loading={pending} $delay={`${Math.min(index * 45, 550)}ms`}>
      <PostHeader>
        <Avatar />
        <div>
          <strong>
            {post.username || ''}
            <OrderBadge>{postOrderLabel(post, index)}</OrderBadge>
          </strong>
        </div>
        <Menu>...</Menu>
      </PostHeader>

      <Media role="img" aria-label="Προεπισκόπηση ανάρτησης Instagram" $ratio={isInstagramStory ? '9 / 16' : '4 / 5'}>
        {activeSlide.image_url && !isVideo ? (
          <img src={activeSlide.image_url} alt={stripPostTypePrefix(activeSlide.title) || fallback} loading="lazy" />
        ) : activeSlide.image_url && isVideo ? (
          <video src={activeSlide.image_url} controls playsInline preload="metadata" />
        ) : (
          <>
            <MediaTag>{previewMode === 'article' ? 'ΠΡΟΕΠΙΣΚΟΠΗΣΗ ΑΡΘΡΟΥ' : 'ΠΡΟΕΠΙΣΚΟΠΗΣΗ ΑΝΑΡΤΗΣΗΣ'}</MediaTag>
            <MediaFilename>{stripPostTypePrefix(activeSlide.title) || fallback}</MediaFilename>
          </>
        )}
        {isInstagramCarousel && activeSlides.length > 1 && (
          <CarouselControls>
            <CarouselControlButton
              type="button"
              onClick={() => setCarouselIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)}
            >
              ←
            </CarouselControlButton>
            <CarouselDots>
              {activeSlides.map((_, dotIndex) => (
                <CarouselDot key={`${post.id}-dot-${dotIndex}`} $active={dotIndex === carouselIndex} />
              ))}
            </CarouselDots>
            <CarouselControlButton
              type="button"
              onClick={() => setCarouselIndex((prev) => (prev + 1) % activeSlides.length)}
            >
              →
            </CarouselControlButton>
          </CarouselControls>
        )}
      </Media>

      {!isInstagramStory && <LikesLine>{previewMode === 'article' ? 'Article Preview' : '9,311 likes'}</LikesLine>}

      {!isInstagramStory && (
        <PostBody>
          <CaptionBlock username={post.username} caption={post.caption} />
        </PostBody>
      )}

      {previewMode === 'instagram' && (
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
      )}
      {pending && (
        <LoadingOverlay>
          <LoadingBadge>Αποθήκευση...</LoadingBadge>
        </LoadingOverlay>
      )}
    </Post>
  );
}

export { PostCard };
