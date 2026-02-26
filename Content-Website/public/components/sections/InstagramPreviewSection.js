import React from 'react';
import {
  Feed,
  State,
  PreviewSection,
  PreviewSectionTitle,
  UnifiedGridWrap,
  StoryLine
} from '../../core/styles/App.styles.js';

function InstagramPreviewSection({
  status,
  previewMode,
  instagramPreview,
  savingId,
  updateReview,
  notesHistoryByPost,
  appendNoteHistory,
  PostCard
}) {
  if (status.loading || status.error || previewMode !== 'instagram') {
    return React.createElement(React.Fragment, null);
  }

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      Feed,
      { $mode: 'instagram' },
      instagramPreview.feedItems.length === 0
        ? React.createElement(
            State,
            null,
            'Δεν υπάρχουν δημοσιευμένα Instagram posts ακόμα. Μπες στη Διαχείριση για ανέβασμα.'
          )
        : instagramPreview.feedItems.map((item, idx) =>
            React.createElement(PostCard, {
              key: item.key,
              post: item.post,
              postIds: item.postIds,
              carouselSlides: item.slides || [],
              instagramKind: item.kind,
              index: idx,
              pending: savingId === item.savingKey,
              onUpdateReview: updateReview,
              historyEntries: notesHistoryByPost[item.historyKey] || [],
              onAppendHistory: (postKey, text, action) => appendNoteHistory(item.historyKey, text, action),
              previewMode
            })
          )
    ),
    instagramPreview.gridPost?.image_url
      ? React.createElement(
          PreviewSection,
          null,
          React.createElement(PreviewSectionTitle, null, '9άδα Grid Preview (3x3)'),
          React.createElement(
            UnifiedGridWrap,
            null,
            React.createElement('img', {
              src: instagramPreview.gridPost.image_url,
              alt: 'Instagram 9-grid preview',
              loading: 'lazy'
            })
          ),
          React.createElement(StoryLine, null, instagramPreview.gridCaption)
        )
      : null,
    React.createElement(
      PreviewSection,
      null,
      React.createElement(PreviewSectionTitle, null, 'Instagram Stories Preview (9:16)'),
      instagramPreview.storyItems.length === 0
        ? React.createElement(State, null, 'Δεν υπάρχουν stories ακόμα.')
        : React.createElement(
            Feed,
            { $mode: 'article' },
            instagramPreview.storyItems.map((item, idx) =>
              React.createElement(PostCard, {
                key: item.key,
                post: item.post,
                postIds: item.postIds,
                instagramKind: item.kind,
                index: idx,
                pending: savingId === item.savingKey,
                onUpdateReview: updateReview,
                historyEntries: notesHistoryByPost[item.historyKey] || [],
                onAppendHistory: (postKey, text, action) => appendNoteHistory(item.historyKey, text, action),
                previewMode
              })
            )
          )
    )
  );
}

export { InstagramPreviewSection };
