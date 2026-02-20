// Maps one post row into an admin review state key.
// Backend integration: keep approval_status and client_notes fields included in admin query.
export const review_state_key = (post) => {
  const hasNotes = `${post.client_notes || ''}`.trim().length > 0;
  const stateByFlags = {
    ready: post.approval_status === 'approved' && hasNotes === false,
    changes: post.approval_status === 'disapproved' || hasNotes,
    awaiting: post.approval_status !== 'disapproved' && hasNotes === false
  };

  const state = Object.keys(stateByFlags).find((key) => stateByFlags[key]);
  return state || 'awaiting';
};

// Returns localized labels for each review state.
// Backend integration: state values come from review_state_key and remain frontend-only.
export const review_state_label = (state) => {
  const labels = {
    ready: 'Έτοιμο για δημοσίευση',
    changes: 'Χρειάζεται αλλαγές',
    awaiting: 'Αναμονή ελέγχου πελάτη'
  };

  return labels[state] || labels.awaiting;
};

// Builds admin overview counters for dashboard summary cards.
// Backend integration: run after loading posts list from backend.
export const build_approval_overview = (posts, reviewStateBuilder) => {
  return posts.reduce(
    (acc, post) => {
      const state = reviewStateBuilder(post);
      const next = { ...acc };
      next[state] += 1;
      next.approved += post.approval_status === 'approved' ? 1 : 0;
      next.disapproved += post.approval_status === 'disapproved' ? 1 : 0;
      return next;
    },
    { ready: 0, changes: 0, awaiting: 0, approved: 0, disapproved: 0 }
  );
};
