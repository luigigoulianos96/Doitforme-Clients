// Calculates client dashboard counts for approvals and review queue.
// Backend integration: pass raw posts array after Supabase select resolves.
export const build_client_counts = (posts) => {
  const approvedCount = posts.filter((post) => post.approval_status === 'approved').length;
  const disapprovedCount = posts.filter((post) => post.approval_status === 'disapproved').length;
  const needsReviewCount = posts.filter((post) => `${post.client_notes || ''}`.trim().length > 0).length;

  return {
    approvedCount,
    disapprovedCount,
    needsReviewCount
  };
};
