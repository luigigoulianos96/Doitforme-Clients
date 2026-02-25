import React, { useEffect, useState } from 'react';
import { Textarea_ } from 'monica-alexandria';
import {
  Post,
  BlogPost,
  BlogTopRow,
  BlogThumb,
  BlogTopMeta,
  BlogContent,
  BlogMeta,
  BlogTitle,
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
  CaptionWrap,
  Caption,
  CaptionToggleRow,
  ReviewSection,
  ReviewBox,
  ArticleEditWrap,
  ArticleEditTextarea,
  ReviewHead,
  InlineAction,
  NotesHistory,
  NoteItem,
  NoteText,
  DecisionRow,
  DecisionNotice,
  DecisionButton,
  SaveRow,
  SaveNoteButton,
  NoteCollapsed,
  LoadingOverlay,
  LoadingBadge } from
'../../core/styles/App.styles.js';
import { formatHistoryDateTime } from '../../hooks/useNotesHistory.js';
import { stripPostTypePrefix, isVideoPost, postOrderLabel } from '../../utils/appHelpers.js';

function CaptionBlock({ username, caption }) {
  const [expanded, setExpanded] = useState(false);
  const finalCaption = (caption || 'Η λεζάντα εκκρεμεί...').trim();
  const shouldCollapse = finalCaption.length > 120;

  return React.createElement(CaptionWrap, null, React.createElement(Caption, { $expanded:

    expanded }, React.createElement("strong", null,
  username || ''), " ", finalCaption), React.createElement(CaptionToggleRow, null,


  shouldCollapse && React.createElement(InlineAction, { type:
    "button", onClick: () => setExpanded((prev) => !prev) },
  expanded ? 'Δείτε λιγότερα' : 'Δείτε περισσότερα')
  ));




}


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
  const activeSlides = isInstagramCarousel ?
  carouselSlides.length > 0 ? carouselSlides : [post] :
  [post];
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
    const clientNotesValue = previewMode === 'article' ? articleValue : nextStatus === 'approved' ? '' : trimmedNotes;
    const successLabel = previewMode === 'article' ?
    nextStatus === 'approved' ? 'Το άρθρο εγκρίθηκε.' : 'Το άρθρο απορρίφθηκε.' :
    nextStatus === 'approved' ? 'Η ανάρτηση εγκρίθηκε.' : 'Η ανάρτηση απορρίφθηκε.';

    const ok = await onUpdateReview(
      targetPostIds,
      { approval_status: nextStatus, client_notes: clientNotesValue },
      successLabel
    );
    if (!ok) return;
    onAppendHistory(
      post.id,
      previewMode === 'article' ? articleValue || 'Χωρίς αλλαγή κειμένου.' : trimmedNotes || 'Χωρίς σημείωση.',
      nextStatus === 'approved' ? 'Έγκριση' : 'Απόρριψη'
    );
    setNotes('');
    setDecisionLocked(true);
    setDecisionNotice(
      previewMode === 'article' ?
      nextStatus === 'approved' ? 'Εγκρίνατε το άρθρο.' : 'Απορρίψατε το άρθρο.' :
      nextStatus === 'approved' ? 'Εγκρίνατε τη δημοσίευση.' : 'Απορρίψατε τη δημοσίευση.'
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
    return React.createElement(BlogPost, { $loading:
      pending, $delay: `${Math.min(index * 45, 550)}ms` }, React.createElement(BlogContent, null, React.createElement(BlogTopRow, null,


    post.image_url && React.createElement(BlogThumb, null, React.createElement("img", { src:

      post.image_url, alt: stripPostTypePrefix(post.title) || fallback, loading: "lazy" })),
    React.createElement(BlogTopMeta, null, React.createElement(BlogMeta, null,



    formatHistoryDateTime(post.created_at), post.username ? ` • ${post.username}` : ''), React.createElement(BlogTitle, null,

    stripPostTypePrefix(post.title) || fallback))), React.createElement(ReviewSection, null, React.createElement(ArticleEditWrap, null, React.createElement(ReviewHead, null, React.createElement("span", null, "Επεξεργασία άρθρου πελάτη"), React.createElement(InlineAction, { type:







      "button", onClick: () => setShowHistory((prev) => !prev), disabled: (historyEntries || []).length === 0 }, "Ιστορικό αλλαγών")),



    showHistory && (historyEntries || []).length > 0 && React.createElement(NotesHistory, null,

    (historyEntries || []).map((entry) => React.createElement(NoteItem, { key:
      entry.id }, React.createElement("small", null,
    formatHistoryDateTime(entry.createdAt), " • ", entry.action),
    (entry.changes || []).length > 0 ?
    (entry.changes || []).map((change, changeIndex) => React.createElement(NoteText, { key:
      `${entry.id}-${change.type}-${changeIndex}` },
    change.type === 'added' ? 'Added: ' : 'Removed: ',
    change.paragraph)

    ) : React.createElement(NoteText, null,

    entry.text))


    )),
    React.createElement(ArticleEditTextarea, { rows:


      "16", value:
      articleText, onChange:
      (event) => setArticleText(event.target.value), placeholder:
      "Επεξεργάσου το άρθρο και αποθήκευσε..." }), React.createElement(SaveRow, null, React.createElement(SaveNoteButton, { type:


      "button", onClick: handleArticleSave, disabled: pending || articleText.trim().length === 0 }, "⌾ Αποθήκευση αλλαγής άρθρου")), React.createElement(DecisionRow, null,




    !decisionLocked && React.createElement(DecisionButton, { type:
      "button", $type: "approve", onClick: () => handleDecision('approved'), disabled: pending }, "✓ Έγκριση"),



    !decisionLocked && React.createElement(DecisionButton, { type:
      "button", $type: "decline", onClick: () => handleDecision('disapproved'), disabled: pending }, "✕ Απόρριψη"),



    decisionLocked && React.createElement(DecisionButton, { type:
      "button", onClick: () => setDecisionLocked(false), disabled: pending }, "Αλλαγή Απόφασης")

    ),


    decisionNotice && React.createElement(DecisionNotice, null, decisionNotice)))),



    pending && React.createElement(LoadingOverlay, null, React.createElement(LoadingBadge, null, "Αποθήκευση..."))


    );



  }

  return React.createElement(Post, { $loading:
    pending, $delay: `${Math.min(index * 45, 550)}ms` }, React.createElement(PostHeader, null, React.createElement(Avatar, null), React.createElement("div", null, React.createElement("strong", null,




  post.username || '', React.createElement(OrderBadge, null,
  postOrderLabel(post, index)))), React.createElement(Menu, null, "...")), React.createElement(Media, { role:





    "img", ["aria-label"]: "Προεπισκόπηση ανάρτησης Instagram", $ratio: isInstagramStory ? '9 / 16' : '4 / 5' },
  activeSlide.image_url && !isVideo ? React.createElement("img", { src:
    activeSlide.image_url, alt: stripPostTypePrefix(activeSlide.title) || fallback, loading: "lazy" }) :
  activeSlide.image_url && isVideo ? React.createElement("video", { src:
    activeSlide.image_url, controls: true, playsInline: true, preload: "metadata" }) : React.createElement(React.Fragment, null, React.createElement(MediaTag, null,


  previewMode === 'article' ? 'ΠΡΟΕΠΙΣΚΟΠΗΣΗ ΑΡΘΡΟΥ' : 'ΠΡΟΕΠΙΣΚΟΠΗΣΗ ΑΝΑΡΤΗΣΗΣ'), React.createElement(MediaFilename, null,
  stripPostTypePrefix(activeSlide.title) || fallback)),


  isInstagramCarousel && activeSlides.length > 1 && React.createElement(CarouselControls, null, React.createElement(CarouselControlButton, { type:


    "button", onClick:
    () => setCarouselIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length) }, "←"), React.createElement(CarouselDots, null,




  activeSlides.map((_, dotIndex) => React.createElement(CarouselDot, { key:
    `${post.id}-dot-${dotIndex}`, $active: dotIndex === carouselIndex })
  )), React.createElement(CarouselControlButton, { type:


    "button", onClick:
    () => setCarouselIndex((prev) => (prev + 1) % activeSlides.length) }, "→"))



  ),



  !isInstagramStory && React.createElement(LikesLine, null, previewMode === 'article' ? 'Article Preview' : '9,311 likes'),

  !isInstagramStory && React.createElement(PostBody, null, React.createElement(CaptionBlock, { username:

    post.username, caption: post.caption })),



  previewMode === 'instagram' && React.createElement(ReviewSection, null, React.createElement(ReviewBox, null, React.createElement(ReviewHead, null, React.createElement("span", null, "Σημειώσεις πελάτη"), React.createElement(InlineAction, { type:




    "button", onClick: () => setShowHistory((prev) => !prev), disabled: (historyEntries || []).length === 0 }, "Ιστορικό σημειώσεων")),



  showHistory && (historyEntries || []).length > 0 && React.createElement(NotesHistory, null,

  (historyEntries || []).map((entry) => React.createElement(NoteItem, { key:
    entry.id }, React.createElement("small", null,
  formatHistoryDateTime(entry.createdAt), " • ", entry.action), React.createElement(NoteText, null,
  entry.text))

  )),


  notesOpen ? React.createElement(React.Fragment, null, React.createElement(Textarea_, { id:


    `notes-${post.id}`, rows:
    "3", value:
    notes, onChange:
    (event) => setNotes(event.target.value), placeholder:
    "Γράψε σχόλιο για αυτή την ανάρτηση..." }), React.createElement(SaveRow, null, React.createElement(SaveNoteButton, { type:


    "button", onClick: handleSaveNotes, disabled: pending || noteMissing }, "⌾ Αποθήκευση"))) : React.createElement(React.Fragment, null, React.createElement(NoteCollapsed, { type:






    "button", onClick: () => setNotesOpen(true) }, "+ Προσθήκη νέας σημείωσης")), React.createElement(DecisionRow, null,





  !decisionLocked && React.createElement(DecisionButton, { type:
    "button", $type: "approve", onClick: () => handleDecision('approved'), disabled: pending }, "✓ Έγκριση"),



  !decisionLocked && React.createElement(DecisionButton, { type:
    "button", $type: "decline", onClick: () => handleDecision('disapproved'), disabled: pending }, "✕ Απόρριψη"),



  decisionLocked && React.createElement(DecisionButton, { type:
    "button", onClick: () => setDecisionLocked(false), disabled: pending }, "Αλλαγή Απόφασης")),




  decisionNotice && React.createElement(DecisionNotice, null, decisionNotice))),



  pending && React.createElement(LoadingOverlay, null, React.createElement(LoadingBadge, null, "Αποθήκευση..."))


  );



}

export { PostCard };