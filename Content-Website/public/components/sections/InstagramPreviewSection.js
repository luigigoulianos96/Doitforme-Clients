import React from 'react';
import {
  Feed,
  State,
  PreviewSection,
  PreviewSectionTitle,
  UnifiedGridWrap,
  StoryLine
} from '../../core/styles/App.styles.js';
import { isVideoPost } from '../../utils/appHelpers.js';

function InstagramPreviewSection({
  status,
  previewMode,
  clientMeta,
  instagramPreview,
  savingId,
  updateReview,
  notesHistoryByPost,
  appendNoteHistory,
  PostCard,
  copy
}) {
  const isSocialPreview = previewMode === 'instagram' || previewMode === 'linkedin';
  const isLinkedInPreview = previewMode === 'linkedin';
  const storyItems = instagramPreview?.storyItems || [];
  const [selectedStoryIndex, setSelectedStoryIndex] = React.useState(0);
  const [viewerStoryIndex, setViewerStoryIndex] = React.useState(-1);
  const [storyProgress, setStoryProgress] = React.useState(0);
  const selectedStorySafeIndex = storyItems.length > 0 ? Math.min(selectedStoryIndex, storyItems.length - 1) : -1;
  const isViewerOpen = viewerStoryIndex >= 0 && viewerStoryIndex < storyItems.length;
  const activeStoryIndex = isViewerOpen ? viewerStoryIndex : selectedStorySafeIndex;
  const storyReviewItem = React.useMemo(() => {
    if (storyItems.length === 0) return null;

    const firstItem = storyItems[0];
    const storyPostIds = storyItems.flatMap((item) => item.postIds || []).filter(Boolean);
    const storyPosts = storyItems.map((item) => item.post).filter(Boolean);
    const approvalStatuses = storyPosts.map((storyPost) => storyPost.approval_status || 'pending');
    const hasDisapproved = approvalStatuses.includes('disapproved');
    const hasPending = approvalStatuses.includes('pending');
    const reviewStatus = hasDisapproved ? 'disapproved' : (hasPending ? 'pending' : 'approved');
    const firstNotesPost = storyPosts.find((storyPost) => `${storyPost.client_notes || ''}`.trim().length > 0);
    const firstFeedbackImagePost = storyPosts.find((storyPost) => storyPost.client_feedback_image_path || storyPost.client_feedback_image_url);
    const firstFeedbackAudioPost = storyPosts.find((storyPost) => storyPost.client_feedback_audio_path || storyPost.client_feedback_audio_url);
    const storyHistoryKey = 'instagram-stories-section';
    const reviewPostId = storyPostIds.length > 0 ? storyPostIds.join('-') : `story-group-${firstItem.post?.id || 'section'}`;

    return {
      key: storyHistoryKey,
      historyKey: storyHistoryKey,
      savingKey: storyPostIds.length > 0 ? `group-${storyPostIds.join('-')}` : `${firstItem.savingKey || ''}`,
      postIds: storyPostIds,
      post: {
        ...(firstItem.post || {}),
        id: reviewPostId,
        approval_status: reviewStatus,
        client_notes: firstNotesPost?.client_notes || '',
        client_feedback_image_url: firstFeedbackImagePost?.client_feedback_image_url || '',
        client_feedback_image_path: firstFeedbackImagePost?.client_feedback_image_path || '',
        client_feedback_audio_url: firstFeedbackAudioPost?.client_feedback_audio_url || '',
        client_feedback_audio_path: firstFeedbackAudioPost?.client_feedback_audio_path || ''
      }
    };
  }, [storyItems]);
  const activeViewerItem = isViewerOpen ? storyItems[viewerStoryIndex] : null;
  const activeViewerPost = activeViewerItem?.post || null;
  const viewerIsVideo = activeViewerPost ? isVideoPost(activeViewerPost) : false;

  React.useEffect(() => {
    if (storyItems.length === 0) {
      setSelectedStoryIndex(0);
      setViewerStoryIndex(-1);
      setStoryProgress(0);
      return;
    }

    setSelectedStoryIndex((prev) => Math.min(prev, storyItems.length - 1));
    setViewerStoryIndex((prev) => (prev < 0 ? prev : Math.min(prev, storyItems.length - 1)));
  }, [storyItems.length]);

  React.useEffect(() => {
    if (!isViewerOpen) {
      setStoryProgress(0);
      return undefined;
    }

    const durationMs = 5000;
    const startedAt = Date.now();
    setStoryProgress(0);

    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.min(elapsed / durationMs, 1);
      setStoryProgress(nextProgress);

      if (nextProgress >= 1) {
        window.clearInterval(timer);
        setViewerStoryIndex((prev) => (prev + 1 < storyItems.length ? prev + 1 : -1));
      }
    }, 80);

    return () => window.clearInterval(timer);
  }, [isViewerOpen, viewerStoryIndex, storyItems.length]);

  if (status.loading || status.error || !isSocialPreview) {
    return React.createElement(React.Fragment, null);
  }

  const gridPreviewFrameStyle = {
    width: 'min(420px, 100%)',
    margin: '0 auto'
  };

  const storiesPreviewFrameStyle = {
    width: 'min(430px, 100%)',
    margin: '0 auto'
  };

  const storyBubbleRowStyle = {
    display: 'flex',
    gap: '0.8rem',
    overflowX: 'auto',
    paddingBottom: '0.2rem'
  };

  const storyViewerShellStyle = {
    position: 'relative',
    width: '100%',
    aspectRatio: '9 / 16',
    borderRadius: '1.8rem',
    overflow: 'hidden',
    background: 'var(--black)',
    boxShadow: '0 16px 40px color-mix(in srgb, var(--black) 28%, transparent)'
  };

  const storyViewerTopStyle = {
    position: 'absolute',
    inset: '0 0 auto 0',
    padding: '0.8rem 0.8rem 0',
    zIndex: 2
  };

  const storyProgressRowStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${Math.max(storyItems.length, 1)}, minmax(0, 1fr))`,
    gap: '0.25rem'
  };

  const storyHeaderBarStyle = {
    marginTop: '0.55rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    color: 'var(--white)'
  };

  const storyNavButtonStyle = {
    border: '1px solid color-mix(in srgb, var(--greyDark) 18%, transparent)',
    borderRadius: '999px',
    background: 'color-mix(in srgb, var(--dark) 72%, transparent)',
    color: 'var(--white)',
    font: 'inherit',
    fontSize: '1.2rem',
    padding: '0.45rem 0.8rem',
    cursor: 'pointer'
  };

  function openStoryViewer(index) {
    if (viewerStoryIndex === index) {
      setViewerStoryIndex(-1);
      return;
    }
    setSelectedStoryIndex(index);
    setViewerStoryIndex(index);
  }

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      Feed,
      { $mode: previewMode },
      instagramPreview.feedItems.length === 0
        ? React.createElement(
            State,
            null,
            isLinkedInPreview
              ? copy.socialEmptyLinkedIn
              : copy.socialEmptyInstagram
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
              previewMode,
              clientName: clientMeta?.name || '',
              copy
            })
          )
    ),
    !isLinkedInPreview && instagramPreview.gridPost?.image_url
      ? React.createElement(
          PreviewSection,
          null,
          React.createElement(PreviewSectionTitle, null, copy.gridPreviewTitle),
          React.createElement(
            'div',
            { style: gridPreviewFrameStyle },
            React.createElement(
              UnifiedGridWrap,
              null,
              React.createElement('img', {
                src: instagramPreview.gridPost.image_url,
                alt: 'Instagram 9-grid preview',
                loading: 'lazy'
              })
            )
          ),
          React.createElement(StoryLine, null, instagramPreview.gridCaption)
        )
      : null,
    !isLinkedInPreview && storyItems.length > 0
      ? React.createElement(
          PreviewSection,
          null,
          React.createElement(PreviewSectionTitle, null, copy.storiesPreviewTitle),
          React.createElement(
            React.Fragment,
            null,
            React.createElement(
              'div',
              { style: storyBubbleRowStyle },
              storyItems.map((item, idx) =>
                React.createElement(
                  'button',
                  {
                    key: `story-bubble-${item.key}`,
                    type: 'button',
                    onClick: () => openStoryViewer(idx),
                    style: {
                      border: 0,
                      background: 'transparent',
                      padding: 0,
                      cursor: 'pointer',
                      display: 'grid',
                      justifyItems: 'center',
                      gap: '0.35rem',
                      color: 'var(--dark)',
                      minWidth: '74px'
                    }
                  },
                  React.createElement(
                    'span',
                    {
                      style: {
                        width: '74px',
                        height: '74px',
                        padding: '3px',
                        borderRadius: '999px',
                        background: activeStoryIndex === idx
                          ? 'linear-gradient(135deg, var(--focus), var(--mainLight), var(--error))'
                          : 'linear-gradient(135deg, color-mix(in srgb, var(--focus) 60%, transparent), color-mix(in srgb, var(--mainLight) 45%, transparent), color-mix(in srgb, var(--error) 55%, transparent))',
                        boxShadow: activeStoryIndex === idx
                          ? '0 0 0 2px color-mix(in srgb, var(--focus) 18%, transparent)'
                          : 'none'
                      }
                    },
                    React.createElement(
                      'span',
                      {
                        style: {
                          display: 'block',
                          width: '100%',
                          height: '100%',
                          borderRadius: '999px',
                          overflow: 'hidden',
                          border: '2px solid var(--white)',
                          background: 'color-mix(in srgb, var(--gloom) 20%, var(--white))'
                        }
                      },
                      item.post?.image_url
                        ? React.createElement(
                            isVideoPost(item.post) ? 'video' : 'img',
                            isVideoPost(item.post)
                              ? {
                                  src: item.post.image_url,
                                  muted: true,
                                  playsInline: true,
                                  preload: 'metadata',
                                  style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
                                }
                              : {
                                  src: item.post.image_url,
                                  alt: `Story ${idx + 1}`,
                                  loading: 'lazy',
                                  style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
                                }
                          )
                        : null
                    )
                  )
                )
              )
            ),
            isViewerOpen && activeViewerPost
              ? React.createElement(
                  'div',
                  { style: { ...storiesPreviewFrameStyle, marginTop: '0.8rem' } },
                  React.createElement(
                    'div',
                    { style: storyViewerShellStyle },
                    React.createElement(
                      'div',
                      { style: storyViewerTopStyle },
                      React.createElement(
                        'div',
                        { style: storyProgressRowStyle },
                        storyItems.map((item, idx) =>
                          React.createElement('span', {
                            key: `story-progress-${item.key}`,
                            style: {
                              height: '3px',
                              borderRadius: '999px',
                              background:
                                idx < viewerStoryIndex
                                  ? 'var(--white)'
                                  : idx === viewerStoryIndex
                                    ? `linear-gradient(90deg, var(--white) ${storyProgress * 100}%, color-mix(in srgb, var(--white) 30%, transparent) ${storyProgress * 100}%)`
                                    : 'color-mix(in srgb, var(--white) 30%, transparent)'
                            }
                          })
                        )
                      ),
                      React.createElement(
                        'div',
                        { style: storyHeaderBarStyle },
                        React.createElement('span', {
                          style: {
                            width: '34px',
                            height: '34px',
                            borderRadius: '999px',
                            background: 'conic-gradient(from 120deg, var(--focus), var(--mainLight), var(--error), var(--focus))',
                            border: '2px solid color-mix(in srgb, var(--white) 75%, transparent)'
                          }
                        }),
                        React.createElement(
                          'strong',
                          { style: { fontSize: '1.2rem', fontWeight: 700 } },
                          clientMeta?.name || 'Instagram Story'
                        ),
                        React.createElement(
                          'span',
                          {
                            style: {
                              fontSize: '1rem',
                              padding: '0.18rem 0.45rem',
                              borderRadius: '999px',
                              background: 'color-mix(in srgb, var(--white) 16%, transparent)'
                            }
                          },
                          `${viewerStoryIndex + 1}/${storyItems.length}`
                        )
                      )
                    ),
                    activeViewerPost.image_url
                      ? React.createElement(
                          viewerIsVideo ? 'video' : 'img',
                          viewerIsVideo
                            ? {
                                src: activeViewerPost.image_url,
                                muted: true,
                                autoPlay: true,
                                playsInline: true,
                                preload: 'metadata',
                                style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
                              }
                            : {
                                src: activeViewerPost.image_url,
                                alt: `Instagram Story ${viewerStoryIndex + 1}`,
                                loading: 'lazy',
                                style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
                              }
                        )
                      : React.createElement(
                          'div',
                          {
                            style: {
                              width: '100%',
                              height: '100%',
                              display: 'grid',
                              placeItems: 'center',
                              color: 'var(--white)'
                            }
                          },
                          copy.noMedia
                        )
                  ),
                  React.createElement(
                    'div',
                    {
                      style: {
                        marginTop: '0.65rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '0.45rem'
                      }
                    },
                    React.createElement(
                      'button',
                      {
                        type: 'button',
                        onClick: () => setViewerStoryIndex((prev) => (prev > 0 ? prev - 1 : prev)),
                        disabled: viewerStoryIndex <= 0,
                        style: {
                          ...storyNavButtonStyle,
                          opacity: viewerStoryIndex <= 0 ? 0.55 : 1,
                          cursor: viewerStoryIndex <= 0 ? 'default' : 'pointer'
                        }
                      },
                      copy.previous
                    ),
                    React.createElement(
                      'button',
                      {
                        type: 'button',
                        onClick: () => setViewerStoryIndex(-1),
                        style: storyNavButtonStyle
                      },
                      copy.close
                    ),
                    React.createElement(
                      'button',
                      {
                        type: 'button',
                        onClick: () => setViewerStoryIndex((prev) => (prev + 1 < storyItems.length ? prev + 1 : -1)),
                        style: storyNavButtonStyle
                      },
                      viewerStoryIndex + 1 < storyItems.length ? copy.next : copy.finish
                    )
                  )
                )
              : null,
            storyReviewItem
              ? React.createElement(
                  'div',
                  { style: { ...storiesPreviewFrameStyle, marginTop: '1rem' } },
                  React.createElement(PostCard, {
                    key: `story-review-${storyReviewItem.key}`,
                    post: storyReviewItem.post,
                    postIds: storyReviewItem.postIds,
                    instagramKind: 'story',
                    index: 0,
                    pending: savingId === storyReviewItem.savingKey,
                    onUpdateReview: updateReview,
                    historyEntries: notesHistoryByPost[storyReviewItem.historyKey] || [],
                    onAppendHistory: (postKey, text, action) => appendNoteHistory(storyReviewItem.historyKey, text, action),
                    previewMode,
                    clientName: clientMeta?.name || '',
                    reviewOnly: true,
                    copy
                  })
                )
              : null
          )
        )
      : null
  );
}

export { InstagramPreviewSection };
