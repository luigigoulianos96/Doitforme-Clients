import { useMemo } from 'react';
import { parsePostType, parseInstagramPreviewMeta } from '../utils/appHelpers.js';

function usePreviewComputed(posts, previewMode, logoKit, clientMeta) {
  const isSocialPreview = previewMode === 'instagram' || previewMode === 'linkedin';
  const isEnglish = Boolean(clientMeta?.english_language);
  const filteredPosts = useMemo(
    () => posts.filter((post) => parsePostType(post) === previewMode),
    [posts, previewMode]
  );

  const instagramPreview = useMemo(() => {
    const defaultValue = {
      feedItems: [],
      storyItems: [],
      gridPost: null,
      gridCaption: isEnglish
        ? 'This is how your Instagram feed will look after all posts are published.'
        : 'Έτσι θα διαμορφωθεί το Instagram feed σας μετά τη δημοσίευση όλων των posts.'
    };

    if (!isSocialPreview) return defaultValue;

    const carouselGroups = {};
    const singlePosts = [];
    const storyPosts = [];
    const gridPosts = [];

    filteredPosts.forEach((post) => {
      const meta = parseInstagramPreviewMeta(post);

      if (meta.kind === 'story') {
        if (previewMode !== 'instagram') return;
        storyPosts.push({ post, meta });
        return;
      }

      if (meta.kind === 'grid9') {
        if (previewMode !== 'instagram') return;
        gridPosts.push({ post, meta });
        return;
      }

      if (meta.kind === 'carousel') {
        const groupKey = meta.groupId || `carousel-${post.id}`;
        if (!carouselGroups[groupKey]) carouselGroups[groupKey] = [];
        carouselGroups[groupKey].push({ post, meta });
        return;
      }

      singlePosts.push({ post, meta });
    });

    const singleFeedItems = singlePosts.map(({ post }) => ({
      key: `single-${post.id}`,
      kind: 'single',
      post: { ...post, id: `single-${post.id}` },
      postIds: [post.id],
      historyKey: `single-${post.id}`,
      savingKey: `${post.id}`,
      sortOrder: Number(post.sort_order) || 0,
      createdAt: post.created_at || ''
    }));

    const carouselFeedItems = Object.entries(carouselGroups).map(([groupKey, rows]) => {
      const sortedRows = [...rows].sort((a, b) => {
        const orderA = Number(a.meta.slideOrder) || 0;
        const orderB = Number(b.meta.slideOrder) || 0;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(a.post.created_at || 0).getTime() - new Date(b.post.created_at || 0).getTime();
      });

      const basePost = sortedRows[0]?.post || {};
      const allPosts = sortedRows.map((row) => row.post);
      const postIds = allPosts.map((row) => row.id);
      const approvalStatuses = allPosts.map((row) => row.approval_status || 'pending');
      const hasDisapproved = approvalStatuses.includes('disapproved');
      const hasPending = approvalStatuses.includes('pending');
      const nextApprovalStatus = hasDisapproved ? 'disapproved' : (hasPending ? 'pending' : 'approved');
      const firstNotes = allPosts.find((row) => `${row.client_notes || ''}`.trim().length > 0);
      const savingKey = `group-${postIds.join('-')}`;

      return {
        key: `carousel-${groupKey}`,
        kind: 'carousel',
        post: {
          ...basePost,
          id: `carousel-${groupKey}`,
          approval_status: nextApprovalStatus,
          client_notes: firstNotes ? firstNotes.client_notes : ''
        },
        postIds,
        slides: allPosts,
        historyKey: `carousel-${groupKey}`,
        savingKey,
        sortOrder: Number(basePost.sort_order) || 0,
        createdAt: basePost.created_at || ''
      };
    });

    const sortedFeedItems = [...singleFeedItems, ...carouselFeedItems].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    });

    const sortedStories = [...storyPosts]
      .sort((a, b) => {
        const orderA = Number(a.post.sort_order) || 0;
        const orderB = Number(b.post.sort_order) || 0;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(a.post.created_at || 0).getTime() - new Date(b.post.created_at || 0).getTime();
      })
      .map(({ post }) => ({
        key: `story-${post.id}`,
        kind: 'story',
        post: { ...post, id: `story-${post.id}` },
        postIds: [post.id],
        historyKey: `story-${post.id}`,
        savingKey: `${post.id}`
      }));

    const gridPost = gridPosts.length > 0 ? gridPosts[gridPosts.length - 1].post : null;
    const gridCaption = gridPost?.caption || defaultValue.gridCaption;

    return {
      feedItems: sortedFeedItems,
      storyItems: sortedStories,
      gridPost,
      gridCaption
    };
  }, [filteredPosts, previewMode, isSocialPreview, isEnglish]);

  const approvedCount = useMemo(
    () => (previewMode === 'logo'
      ? (logoKit?.approval_status === 'approved' ? 1 : 0)
      : filteredPosts.filter((post) => post.approval_status === 'approved').length),
    [filteredPosts, logoKit, previewMode]
  );

  const disapprovedCount = useMemo(
    () => (previewMode === 'logo'
      ? (logoKit?.approval_status === 'disapproved' ? 1 : 0)
      : filteredPosts.filter((post) => post.approval_status === 'disapproved').length),
    [filteredPosts, logoKit, previewMode]
  );

  const needsReviewCount = useMemo(
    () => (previewMode === 'logo'
      ? ((logoKit?.approval_status === 'pending' || `${logoKit?.client_notes || ''}`.trim().length > 0) ? 1 : 0)
      : filteredPosts.filter((post) => (post.client_notes || '').trim().length > 0).length),
    [filteredPosts, logoKit, previewMode]
  );

  const pageTitle = previewMode === 'article'
    ? (isEnglish
      ? `${clientMeta?.name ? `${clientMeta.name} Article Review Flow` : 'Article Review Flow'}`
      : `${clientMeta?.name ? `${clientMeta.name} Ροή Εγκρίσεων Άρθρων` : 'Ροή Εγκρίσεων Άρθρων'}`)
    : previewMode === 'logo'
      ? `${clientMeta?.name ? `${clientMeta.name} Logo Kit` : 'Logo Kit'}`
      : previewMode === 'linkedin'
        ? `${clientMeta?.name ? `${clientMeta.name} LinkedIn Review` : 'LinkedIn Review'}`
      : (isEnglish
        ? `${clientMeta?.name ? `${clientMeta.name} Review Flow` : 'Review Flow'}`
        : `${clientMeta?.name ? `${clientMeta.name} Ροή Εγκρίσεων` : 'Ροή Εγκρίσεων'}`);

  const pageSubtitle = previewMode === 'article'
    ? (isEnglish
      ? 'WordPress-style preview: the client edits, saves changes, and approves or rejects.'
      : 'WordPress-style preview: ο πελάτης κάνει edit, αποθηκεύει αλλαγές και δίνει έγκριση ή απόρριψη.')
    : previewMode === 'logo'
      ? (isEnglish
        ? 'Animated logo presentation with structured slides, client notes, and approval or rejection.'
        : 'Animated logo presentation με δομημένα slides, σχόλια πελάτη και έγκριση ή απόρριψη.')
      : previewMode === 'linkedin'
        ? (isEnglish
          ? 'LinkedIn-style preview for client notes, approvals, and social review in the same workflow.'
          : 'LinkedIn-style preview για client notes, approvals και social review στο ίδιο workflow.')
      : (isEnglish
        ? 'This page is intended only for the client. It is used for notes and post approvals.'
        : 'Αυτή η σελίδα προορίζεται μόνο για τον πελάτη. Χρησιμοποιείται για σημειώσεις και εγκρίσεις αναρτήσεων.');

  return {
    filteredPosts,
    instagramPreview,
    approvedCount,
    disapprovedCount,
    needsReviewCount,
    pageTitle,
    pageSubtitle
  };
}

export { usePreviewComputed };
