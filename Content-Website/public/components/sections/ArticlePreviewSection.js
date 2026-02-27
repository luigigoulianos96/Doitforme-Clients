import React from 'react';
import { Feed, State } from '../../core/styles/App.styles.js';

function ArticlePreviewSection({
  status,
  previewMode,
  clientMeta,
  filteredPosts,
  savingId,
  updateReview,
  notesHistoryByPost,
  appendNoteHistory,
  PostCard
}) {
  return React.createElement(
    React.Fragment,
    null,
    !status.loading && !status.error && previewMode === 'article'
      ? React.createElement(
          Feed,
          { $mode: previewMode },
          filteredPosts.length === 0
            ? React.createElement(
                State,
                null,
                'Δεν υπάρχουν δημοσιευμένα στοιχεία ακόμα για αυτό το tab. Μπες στη Διαχείριση για ανέβασμα.'
              )
            : filteredPosts.map((post, idx) =>
                React.createElement(PostCard, {
                  key: post.id,
                  post,
                  index: idx,
                  pending: savingId === `${post.id}`,
                  onUpdateReview: updateReview,
                  historyEntries: notesHistoryByPost[post.id] || [],
                  onAppendHistory: appendNoteHistory,
                  previewMode,
                  clientName: clientMeta?.name || ''
                })
              )
        )
      : null
  );
}

export { ArticlePreviewSection };
