import React from 'react';
import CollapsiblePanel from './CollapsiblePanel.js';

const formStyle = {
  marginTop: '1.35rem',
  display: 'grid',
  gap: '1.25rem',
  fontSize: '1.45rem',
  lineHeight: 1.5
};

const sectionStyle = {
  border: '1px solid color-mix(in srgb, var(--greyDark) 18%, transparent)',
  borderRadius: '1.05rem',
  background: 'color-mix(in srgb, var(--gloom) 40%, transparent)',
  padding: '1.05rem',
  display: 'grid',
  gap: '0.9rem'
};

const sectionTitleStyle = {
  margin: 0,
  fontFamily: "'Syne', sans-serif",
  fontSize: '2.1rem',
  lineHeight: 1.05,
  letterSpacing: '0.01em'
};

const sectionTitleRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
  marginBottom: '0.1rem'
};

const actionRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.7rem',
  alignItems: 'center'
};

const uploadHeadingStyle = {
  fontSize: '1.48rem',
  lineHeight: 1.3
};

const uploadSubLabelStyle = {
  fontSize: '1.2rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'color-mix(in srgb, var(--muted) 72%, var(--text))'
};

const sortSectionIntroStyle = {
  display: 'grid',
  gap: '0.35rem',
  padding: '0.8rem 0.9rem',
  borderRadius: '0.85rem',
  border: '1px solid color-mix(in srgb, var(--accent) 14%, transparent)',
  background: 'linear-gradient(180deg, color-mix(in srgb, var(--accent) 6%, var(--gloomDark)), color-mix(in srgb, var(--gloomDark) 28%, transparent))'
};

const sortSectionKickerStyle = {
  fontSize: '1.1rem',
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'color-mix(in srgb, var(--accent) 74%, var(--text))'
};

const sortHintStyle = {
  color: 'color-mix(in srgb, var(--muted) 78%, var(--text))',
  fontSize: '1.22rem',
  lineHeight: 1.45
};

const sortSectionFlashStyle = {
  borderColor: 'color-mix(in srgb, var(--success) 24%, transparent)',
  background: 'linear-gradient(180deg, color-mix(in srgb, var(--success) 4%, var(--gloom)), color-mix(in srgb, var(--gloom) 34%, transparent))',
  boxShadow: '0 0 0 1px color-mix(in srgb, var(--success) 10%, transparent)'
};

const sortArrivalBannerStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  width: 'fit-content',
  padding: '0.32rem 0.65rem',
  borderRadius: '999px',
  border: '1px solid color-mix(in srgb, var(--success) 26%, transparent)',
  background: 'color-mix(in srgb, var(--success) 16%, var(--gloomDark))',
  color: 'var(--ok)',
  fontSize: '1.08rem',
  fontWeight: 800,
  letterSpacing: '0.03em'
};

const dragHandleCueStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.45rem',
  width: 'fit-content',
  padding: '0.22rem 0.5rem',
  borderRadius: '999px',
  border: '1px solid color-mix(in srgb, var(--greyDark) 14%, transparent)',
  background: 'color-mix(in srgb, var(--gloomDark) 34%, transparent)',
  color: 'color-mix(in srgb, var(--muted) 70%, var(--text))',
  fontSize: '1.08rem',
  fontWeight: 700,
  letterSpacing: '0.03em'
};

const groupedStorySectionStyle = (tone) => ({
  ...sectionStyle,
  gap: '1rem',
  border: `1px solid color-mix(in srgb, ${tone} 16%, transparent)`,
  background: `linear-gradient(180deg, color-mix(in srgb, ${tone} 5%, var(--gloom)), color-mix(in srgb, var(--gloom) 34%, transparent))`
});

const groupedSectionHeadStyle = {
  display: 'grid',
  gap: '0.3rem'
};

const groupedSectionKickerStyle = (tone) => ({
  fontSize: '1.08rem',
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: `color-mix(in srgb, ${tone} 74%, var(--text))`
});

const groupedSectionHintStyle = {
  color: 'color-mix(in srgb, var(--muted) 80%, var(--text))',
  fontSize: '1.18rem',
  lineHeight: 1.45
};

const groupedActionSectionStyle = {
  ...sectionStyle,
  gap: '0.8rem',
  padding: '1rem 1.05rem',
  border: '1px solid color-mix(in srgb, var(--success) 14%, transparent)',
  background: 'linear-gradient(180deg, color-mix(in srgb, var(--success) 5%, var(--gloom)), color-mix(in srgb, var(--gloomDark) 24%, transparent))'
};

const ctaShelfStyle = {
  display: 'grid',
  gap: '0.7rem',
  padding: '0.9rem',
  borderRadius: '0.95rem',
  border: '1px solid color-mix(in srgb, var(--success) 18%, transparent)',
  background: 'linear-gradient(180deg, color-mix(in srgb, var(--success) 8%, var(--gloomDark)), color-mix(in srgb, var(--gloomDark) 22%, transparent))'
};

const ctaActionRowStyle = {
  ...actionRowStyle,
  justifyContent: 'space-between'
};

const shortcutHintStyle = {
  color: 'color-mix(in srgb, var(--muted) 76%, var(--text))',
  fontSize: '1.18rem',
  lineHeight: 1.45
};

const dropzoneStyle = (active, locked) => ({
  border: `1px solid ${active ? 'color-mix(in srgb, var(--focus) 38%, transparent)' : 'color-mix(in srgb, var(--greyDark) 18%, transparent)'}`,
  borderRadius: '0.95rem',
  padding: '1rem',
  background: active
    ? 'color-mix(in srgb, var(--focus) 8%, var(--gloomDark))'
    : 'color-mix(in srgb, var(--gloomDark) 44%, transparent)',
  opacity: locked ? 0.75 : 1,
  display: 'grid',
  gap: '0.65rem',
  boxShadow: active ? '0 0 0 1px color-mix(in srgb, var(--focus) 10%, transparent)' : 'none'
});

const uploadZoneStyle = (tone, active, locked) => ({
  ...dropzoneStyle(active, locked),
  border: `1px solid ${active ? `color-mix(in srgb, ${tone} 38%, transparent)` : `color-mix(in srgb, ${tone} 20%, var(--greyDark))`}`,
  background: active
    ? `color-mix(in srgb, ${tone} 10%, var(--gloomDark))`
    : `linear-gradient(180deg, color-mix(in srgb, ${tone} 5%, var(--gloomDark)), color-mix(in srgb, var(--gloomDark) 42%, transparent))`,
  boxShadow: active ? `0 0 0 1px color-mix(in srgb, ${tone} 12%, transparent)` : 'none'
});

const buttonStyle = {
  border: '1px solid color-mix(in srgb, var(--greyDark) 36%, transparent)',
  borderRadius: '999px',
  background: 'color-mix(in srgb, var(--gloom) 64%, transparent)',
  color: 'var(--text)',
  padding: '0.62rem 1rem',
  fontFamily: 'inherit',
  fontSize: '1.42rem',
  cursor: 'pointer'
};

const primaryButtonStyle = {
  ...buttonStyle,
  border: '1px solid color-mix(in srgb, var(--success) 45%, transparent)',
  background: 'color-mix(in srgb, var(--success) 20%, var(--gloom))',
  color: 'var(--ok)',
  fontWeight: 700
};

const ctaButtonStyle = {
  ...primaryButtonStyle,
  padding: '0.78rem 1.2rem',
  fontSize: '1.46rem',
  letterSpacing: '0.01em',
  boxShadow: '0 10px 24px color-mix(in srgb, var(--success) 12%, transparent)'
};

const dangerButtonStyle = {
  ...buttonStyle,
  border: '1px solid color-mix(in srgb, var(--error) 45%, transparent)',
  color: 'var(--danger)'
};

const mediaGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '0.85rem'
};

const compactPreviewGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 14rem))',
  gap: '0.75rem',
  alignItems: 'start'
};

const mediaTileStyle = {
  position: 'relative',
  border: '1px solid color-mix(in srgb, var(--greyDark) 14%, transparent)',
  borderRadius: '0.75rem',
  background: 'color-mix(in srgb, var(--dark) 58%, transparent)',
  padding: '0.7rem',
  display: 'grid',
  gap: '0.6rem',
  transition: 'transform 260ms ease, background 260ms ease, border-color 260ms ease, box-shadow 260ms ease, opacity 260ms ease'
};

const compactPreviewTileStyle = {
  ...mediaTileStyle,
  padding: '0.5rem',
  gap: '0.45rem'
};

const mediaTileFlashStyle = {
  borderColor: 'color-mix(in srgb, var(--success) 52%, transparent)',
  background: 'color-mix(in srgb, var(--success) 14%, var(--dark))',
  boxShadow: '0 0 0 2px color-mix(in srgb, var(--success) 20%, transparent), 0 18px 34px color-mix(in srgb, var(--success) 16%, transparent)',
  transform: 'translateY(-6px) scale(1.02)'
};

const newTileBadgeStyle = {
  position: 'absolute',
  top: '-0.6rem',
  left: '0.7rem',
  zIndex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '2.1rem',
  padding: '0.24rem 0.65rem',
  borderRadius: '999px',
  border: '1px solid color-mix(in srgb, var(--success) 40%, transparent)',
  background: 'color-mix(in srgb, var(--success) 24%, var(--gloomDark))',
  color: 'var(--ok)',
  fontSize: '1.08rem',
  fontWeight: 800,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  pointerEvents: 'none'
};

const tileRemoveButtonStyle = {
  position: 'absolute',
  top: '0.45rem',
  right: '0.45rem',
  width: '2.1rem',
  height: '2.1rem',
  borderRadius: '999px',
  border: '1px solid color-mix(in srgb, var(--error) 28%, transparent)',
  background: 'color-mix(in srgb, var(--error) 14%, var(--gloomDark))',
  color: 'var(--danger)',
  fontFamily: 'inherit',
  fontWeight: 700,
  lineHeight: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: 0
};

const thumbFrameStyle = (ratio = '4 / 5') => ({
  aspectRatio: ratio,
  borderRadius: '0.65rem',
  overflow: 'hidden',
  border: '1px solid color-mix(in srgb, var(--greyDark) 12%, transparent)',
  background: 'color-mix(in srgb, var(--gloomDark) 54%, transparent)'
});

const captionStyle = {
  width: '100%',
  border: '1px solid color-mix(in srgb, var(--greyDark) 36%, transparent)',
  borderRadius: '0.75rem',
  background: 'color-mix(in srgb, var(--gloom) 92%, transparent)',
  color: 'var(--text)',
  fontFamily: 'inherit',
  fontSize: '1.42rem',
  lineHeight: 1.55,
  padding: '1rem 1.05rem',
  minHeight: '15rem',
  resize: 'vertical'
};

const helperTextStyle = {
  color: 'color-mix(in srgb, var(--muted) 84%, var(--text))',
  fontSize: '1.24rem',
  lineHeight: 1.55
};

const feedArrivalNoticeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  width: 'fit-content',
  padding: '0.45rem 0.75rem',
  borderRadius: '999px',
  border: '1px solid color-mix(in srgb, var(--success) 28%, transparent)',
  background: 'color-mix(in srgb, var(--success) 16%, var(--gloomDark))',
  color: 'var(--ok)',
  fontSize: '1.18rem',
  fontWeight: 700,
  lineHeight: 1.35
};

const h = React.createElement;

function MediaPreview({ item, ratio = '4 / 5' }) {
  return h(
    'div',
    { style: thumbFrameStyle(ratio) },
    item.kind === 'video'
      ? h('video', { src: item.previewUrl, muted: true, playsInline: true, preload: 'metadata', style: { width: '100%', height: '100%', objectFit: 'cover' } })
      : h('img', { src: item.previewUrl, alt: item.file.name, loading: 'lazy', style: { width: '100%', height: '100%', objectFit: 'cover' } })
  );
}

export default function InstagramFeedAdmin(props) {
  const {
    platformName = 'Instagram',
    showStoriesTools = true,
    busy,
    dragActive,
    orderLocked,
    carouselPosts,
    feedPreviewItems,
    captionsText,
    mappedCaptions,
    plannedFeedPostCount,
    instagramGridItems,
    instagramStoryItems,
    setDragActive,
    setDraggedId,
    setCaptionsText,
    setOrderLocked,
    appendFiles,
    appendCarouselFiles,
    removeCarouselPost,
    removeCarouselMedia,
    handleTileDrop,
    handleCarouselSlideDrop,
    setDraggedCarouselSlideId,
    removeMedia,
    clearMedia,
    clearCarouselUploads,
    hasDraftSingleUploads,
    hasDraftCarouselUploads,
    requiresLockedFeedOrder,
    hasPendingFeedChanges,
    appendInstagramGridFiles,
    clearInstagramGrid,
    appendInstagramStories,
    removeInstagramStoryItem,
    onSubmitFeed,
    onSubmitStories
  } = props;

  const [flashingFeedIds, setFlashingFeedIds] = React.useState([]);
  const [feedArrivalNotice, setFeedArrivalNotice] = React.useState('');
  const didInitFeedFlashRef = React.useRef(false);
  const prevFeedIdsRef = React.useRef([]);
  const feedArrivalNoticeTimeoutRef = React.useRef(null);

  function showFeedArrivalNotice(message) {
    if (feedArrivalNoticeTimeoutRef.current) {
      window.clearTimeout(feedArrivalNoticeTimeoutRef.current);
    }

    setFeedArrivalNotice(message);
    feedArrivalNoticeTimeoutRef.current = window.setTimeout(() => {
      setFeedArrivalNotice('');
      feedArrivalNoticeTimeoutRef.current = null;
    }, 1800);
  }

  function handleAppendFilesWithNotice(files) {
    appendFiles(files);
    if ((files?.length || 0) > 0) {
      showFeedArrivalNotice('Το upload προστέθηκε στη Σειρά Feed');
    }
  }

  function handleAppendCarouselFilesWithNotice(files) {
    appendCarouselFiles(files);
    if ((files?.length || 0) > 0) {
      showFeedArrivalNotice('Το carousel προστέθηκε στη Σειρά Feed');
    }
  }

  React.useEffect(() => {
    const nextIds = feedPreviewItems.map((item) => item.id);

    if (!didInitFeedFlashRef.current) {
      didInitFeedFlashRef.current = true;
      prevFeedIdsRef.current = nextIds;
      return undefined;
    }

    const addedIds = nextIds.filter((id) => !prevFeedIdsRef.current.includes(id));
    prevFeedIdsRef.current = nextIds;

    if (addedIds.length === 0) return undefined;

    setFlashingFeedIds((current) => Array.from(new Set([...current, ...addedIds])));

    const timeoutId = window.setTimeout(() => {
      setFlashingFeedIds((current) => current.filter((id) => !addedIds.includes(id)));
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [feedPreviewItems]);

  React.useEffect(
    () => () => {
      if (feedArrivalNoticeTimeoutRef.current) {
        window.clearTimeout(feedArrivalNoticeTimeoutRef.current);
      }
    },
    []
  );

  return h(
    'form',
    { onSubmit: (event) => event.preventDefault(), style: formStyle },
    h(
      CollapsiblePanel,
      { title: 'Αναρτήσεις Feed' },
      h(
        'section',
        { style: sectionStyle },
        h(
          'div',
          {
            style: uploadZoneStyle('var(--ok)', dragActive, orderLocked),
            onDragOver: (event) => {
              event.preventDefault();
              if (!orderLocked) setDragActive(true);
            },
            onDragLeave: () => setDragActive(false),
            onDrop: (event) => {
              event.preventDefault();
              setDragActive(false);
              handleAppendFilesWithNotice(event.dataTransfer.files);
            }
          },
          h(
            'strong',
            { style: uploadHeadingStyle },
            `Ανέβασμα ${platformName} feed post`
          ),
          h('span', null, 'Αρχεία εικόνας ή βίντεο'),
          h(
            'label',
            { style: buttonStyle },
            'Επιλογή',
            h('input', {
              type: 'file',
              accept: 'image/*,video/*',
              multiple: true,
              disabled: orderLocked,
              style: { display: 'none' },
              onChange: (event) => {
                handleAppendFilesWithNotice(event.target.files || []);
                event.target.value = '';
              }
            })
          ),
          h('small', { style: helperTextStyle }, orderLocked ? 'Η σειρά του feed είναι κλειδωμένη. Ξεκλείδωσε για αλλαγές.' : 'Μπορείς να προσθέτεις πολλά μεμονωμένα αρχεία με drag-and-drop.')
        ),
        h(
          'div',
          {
            style: uploadZoneStyle('var(--accent)', dragActive, orderLocked),
            onDragOver: (event) => {
              event.preventDefault();
              if (!orderLocked) setDragActive(true);
            },
            onDragLeave: () => setDragActive(false),
            onDrop: (event) => {
              event.preventDefault();
              setDragActive(false);
              handleAppendCarouselFilesWithNotice(event.dataTransfer.files);
            }
          },
          h(
            'strong',
            { style: uploadHeadingStyle },
            'Ανέβασμα carousel'
          ),
          h('span', null, 'Πολλά αρχεία για ένα carousel post'),
          h(
            'label',
            { style: buttonStyle },
            'Carousel',
            h('input', {
              type: 'file',
              accept: 'image/*,video/*',
              multiple: true,
              disabled: orderLocked,
              style: { display: 'none' },
              onChange: (event) => {
                handleAppendCarouselFilesWithNotice(event.target.files || []);
                event.target.value = '';
              }
            })
          ),
          h('small', { style: helperTextStyle }, 'Κάθε προσθήκη εδώ δημιουργεί ένα νέο carousel post.')
        ),
        feedArrivalNotice
          ? h('div', { style: feedArrivalNoticeStyle }, feedArrivalNotice)
          : null
      ),
      h(
        CollapsiblePanel,
        { title: 'Σειρά Feed' },
        h(
          'section',
          { style: flashingFeedIds.length > 0 ? { ...sectionStyle, ...sortSectionFlashStyle } : sectionStyle },
          h(
            'div',
            { style: sortSectionIntroStyle },
            h('span', { style: sortSectionKickerStyle }, 'Βήμα ταξινόμησης'),
            h('small', { style: sortHintStyle }, 'Σύρε τις κάρτες για να ορίσεις τη σειρά εμφάνισης των feed posts πριν το ανέβασμα.')
          ),
          flashingFeedIds.length > 0
            ? h('div', { style: sortArrivalBannerStyle }, 'Νέο upload', 'προστέθηκε στη σειρά feed')
            : null,
          h(
            'div',
            { style: sectionTitleRowStyle },
            h('h2', { style: sectionTitleStyle }, 'Σειρά feed'),
            hasDraftSingleUploads
              ? h('button', { type: 'button', style: dangerButtonStyle, onClick: clearMedia, disabled: orderLocked }, 'Καθαρισμός single')
              : null
          ),
          feedPreviewItems.length === 0
            ? h('small', { style: helperTextStyle }, 'Δεν υπάρχουν ακόμα feed posts για ταξινόμηση.')
            : h(
                'div',
                { style: mediaGridStyle },
                feedPreviewItems.map((feedItem, index) =>
                  h(
                    'div',
                    {
                      key: feedItem.id,
                      style: {
                        ...mediaTileStyle,
                        ...(!orderLocked ? { cursor: 'grab' } : { cursor: 'default' }),
                        ...(flashingFeedIds.includes(feedItem.id) ? mediaTileFlashStyle : null)
                      },
                      draggable: !orderLocked,
                      onDragStart: () => setDraggedId(feedItem.id),
                      onDragEnd: () => setDraggedId(null),
                      onDragOver: (event) => event.preventDefault(),
                      onDrop: () => handleTileDrop(feedItem.id)
                    },
                    flashingFeedIds.includes(feedItem.id)
                      ? h('span', { style: newTileBadgeStyle, 'aria-hidden': 'true' }, 'Νέο')
                      : null,
                    h('small', { style: helperTextStyle }, `Post ${index + 1} • ${feedItem.kind === 'carousel' ? 'Carousel' : 'Single post'}`),
                    h(
                      'span',
                      { style: dragHandleCueStyle, 'aria-hidden': 'true' },
                      '⋮⋮',
                      'Σύρε για ταξινόμηση'
                    ),
                    !orderLocked && feedItem.removable
                      ? h(
                          'button',
                          {
                            type: 'button',
                            style: tileRemoveButtonStyle,
                            title: 'Διαγραφή',
                            onClick: () => (feedItem.kind === 'single' ? removeMedia(feedItem.removeId) : removeCarouselPost(feedItem.removeId))
                          },
                          '×'
                        )
                      : null,
                    h(MediaPreview, { item: feedItem.previewMedia }),
                    h('small', { style: helperTextStyle }, feedItem.label)
                  )
                )
              )
        ),
        h(
          'section',
          { style: sectionStyle },
          h(
            'div',
            { style: sectionTitleRowStyle },
            h('h2', { style: sectionTitleStyle }, 'Σειρά slides carousel'),
            hasDraftCarouselUploads
              ? h('button', { type: 'button', style: dangerButtonStyle, onClick: clearCarouselUploads, disabled: orderLocked }, 'Καθαρισμός carousel')
              : null
          ),
          carouselPosts.length === 0
            ? h('small', { style: helperTextStyle }, 'Δεν υπάρχουν ακόμα carousel posts.')
            : h(
                'div',
                { style: { display: 'grid', gap: '0.9rem' } },
                carouselPosts.map((carouselPost, carouselIndex) =>
                  h(
                    'article',
                    { key: carouselPost.id, style: sectionStyle },
                    h('strong', null, `Carousel post ${carouselIndex + 1}`),
                    h('small', { style: helperTextStyle }, 'Χρησιμοποίησε drag-and-drop για να ορίσεις τη σειρά των slides μέσα στο carousel.'),
                    h(
                      'div',
                      { style: mediaGridStyle },
                      carouselPost.items.map((item, slideIndex) =>
                        h(
                          'div',
                          {
                            key: item.id,
                            style: { ...mediaTileStyle, cursor: !orderLocked ? 'grab' : 'default' },
                            draggable: !orderLocked,
                            onDragStart: () => setDraggedCarouselSlideId(`${carouselPost.id}::${item.id}`),
                            onDragEnd: () => setDraggedCarouselSlideId(''),
                            onDragOver: (event) => event.preventDefault(),
                            onDrop: () => handleCarouselSlideDrop(carouselPost.id, item.id)
                          },
                          h('small', { style: helperTextStyle }, `Slide ${slideIndex + 1}`),
                          !orderLocked
                            ? h(
                                'button',
                                {
                                  type: 'button',
                                  style: tileRemoveButtonStyle,
                                  title: 'Διαγραφή slide',
                                  onClick: () => removeCarouselMedia(carouselPost.id, item.id)
                                },
                                '×'
                              )
                            : null,
                          h(MediaPreview, { item }),
                          h('small', { style: helperTextStyle }, item.file.name)
                        )
                      )
                    )
                  )
                )
              )
        ),
        h(
          'section',
          { style: sectionStyle },
          h('h2', { style: sectionTitleStyle }, 'Λεζάντες'),
          h(
            'label',
            null,
            h('textarea', {
              rows: 8,
              value: captionsText,
              onChange: (event) => setCaptionsText(event.target.value),
              placeholder: 'Post 1: Πρώτη λεζάντα\n\nPost 2: Δεύτερη λεζάντα\n\nPost 3: Τρίτη λεζάντα',
              style: captionStyle
            })
          ),
          h('small', { style: helperTextStyle }, `Αντιστοιχισμένες λεζάντες feed posts: ${mappedCaptions}/${plannedFeedPostCount}`),
          h(
            'div',
            { style: actionRowStyle },
            requiresLockedFeedOrder && !orderLocked
              ? h('button', { type: 'button', style: primaryButtonStyle, onClick: () => setOrderLocked(true) }, 'Κλείδωμα σειράς')
              : requiresLockedFeedOrder
                ? h('button', { type: 'button', style: buttonStyle, onClick: () => setOrderLocked(false) }, 'Ξεκλείδωμα')
                : null,
            hasPendingFeedChanges
              ? h(
                  'button',
                  {
                    type: 'button',
                    style: primaryButtonStyle,
                    disabled: busy,
                    onClick: onSubmitFeed
                  },
                  busy ? 'Φόρτωση' : 'Ανέβασμα'
                )
              : null
          )
        )
      )
    ),
    showStoriesTools
      ? h(
          CollapsiblePanel,
          { title: 'Stories & 9άδα' },
          h(
            'section',
            { style: groupedStorySectionStyle('var(--warning, #f4d35e)') },
            h(
              'div',
              { style: groupedSectionHeadStyle },
              h('span', { style: groupedSectionKickerStyle('var(--warning, #f4d35e)') }, 'Upload 9άδας'),
              h('h2', { style: sectionTitleStyle }, 'Ενιαία 9άδα PNG'),
              h('small', { style: groupedSectionHintStyle }, 'Ξεχωριστή περιοχή μόνο για το ενιαίο PNG της 9άδας.')
            ),
            h(
              'div',
              {
                style: uploadZoneStyle('var(--warning, #f4d35e)', dragActive, false),
                onDragOver: (event) => {
                  event.preventDefault();
                  setDragActive(true);
                },
                onDragLeave: () => setDragActive(false),
                onDrop: (event) => {
                  event.preventDefault();
                  setDragActive(false);
                  appendInstagramGridFiles(event.dataTransfer.files);
                }
              },
              h(
                'strong',
                { style: uploadHeadingStyle },
                'Ρίξε 1 PNG για την ενιαία 9άδα'
              ),
              h('span', { style: uploadSubLabelStyle }, 'Μονό αρχείο'),
              h(
                'label',
                { style: buttonStyle },
                'PNG',
                h('input', {
                  type: 'file',
                  accept: '.png,image/png',
                  style: { display: 'none' },
                  onChange: (event) => {
                    appendInstagramGridFiles(event.target.files || []);
                    event.target.value = '';
                  }
                })
              )
            ),
            instagramGridItems.length > 0
              ? h(
                  'div',
                  { style: compactPreviewGridStyle },
                  instagramGridItems.map((item) =>
                    h(
                      'div',
                      { key: item.id, style: compactPreviewTileStyle },
                      h(MediaPreview, { item, ratio: '1 / 1' }),
                      h('small', { style: helperTextStyle }, item.file.name),
                      h('button', { type: 'button', style: dangerButtonStyle, onClick: clearInstagramGrid }, 'Αφαίρεση')
                    )
                  )
                )
              : null
          ),
          h(
            'section',
            { style: groupedStorySectionStyle('var(--focus)') },
            h(
              'div',
              { style: groupedSectionHeadStyle },
              h('span', { style: groupedSectionKickerStyle('var(--focus)') }, 'Uploads stories'),
              h('h2', { style: sectionTitleStyle }, 'Stories αρχεία'),
              h('small', { style: groupedSectionHintStyle }, 'Ξεχωριστή περιοχή για stories σε κατακόρυφο format.')
            ),
            h(
              'div',
              {
                style: uploadZoneStyle('var(--focus)', dragActive, false),
                onDragOver: (event) => {
                  event.preventDefault();
                  setDragActive(true);
                },
                onDragLeave: () => setDragActive(false),
                onDrop: (event) => {
                  event.preventDefault();
                  setDragActive(false);
                  appendInstagramStories(event.dataTransfer.files);
                }
              },
              h(
                'strong',
                { style: uploadHeadingStyle },
                'Ρίξε εικόνες/βίντεο για Stories (9:16)'
              ),
              h('span', { style: uploadSubLabelStyle }, 'Σετ stories'),
              h(
                'label',
                { style: buttonStyle },
                'Stories',
                h('input', {
                  type: 'file',
                  accept: 'image/*,video/*',
                  multiple: true,
                  style: { display: 'none' },
                  onChange: (event) => {
                    appendInstagramStories(event.target.files || []);
                    event.target.value = '';
                  }
                })
              )
            ),
            instagramStoryItems.length > 0
              ? h(
                  'div',
                  { style: compactPreviewGridStyle },
                  instagramStoryItems.map((item) =>
                    h(
                      'div',
                      { key: item.id, style: compactPreviewTileStyle },
                      h(MediaPreview, { item, ratio: '9 / 16' }),
                      h('small', { style: helperTextStyle }, item.file.name),
                      h('button', { type: 'button', style: dangerButtonStyle, onClick: () => removeInstagramStoryItem(item.id) }, 'Αφαίρεση')
                    )
                  )
                )
              : null
          ),
          instagramGridItems.length > 0 || instagramStoryItems.length > 0
            ? h(
                'section',
                { style: groupedActionSectionStyle },
                h(
                  'div',
                  { style: ctaActionRowStyle },
                  h(
                    'button',
                    {
                      type: 'button',
                      style: ctaButtonStyle,
                      disabled: busy,
                      onClick: onSubmitStories
                    },
                    busy ? 'Φόρτωση' : 'Ανέβασμα'
                  )
                )
              )
            : null
        )
      : null
  );
}
