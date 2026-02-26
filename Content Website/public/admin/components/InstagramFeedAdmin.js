import React from 'react';
import CollapsiblePanel from './CollapsiblePanel.js';

const formStyle = {
  marginTop: '1.2rem',
  display: 'grid',
  gap: '1rem',
  fontSize: '1.42rem',
  lineHeight: 1.45
};

const sectionStyle = {
  border: '1px solid color-mix(in srgb, var(--greyDark) 30%, transparent)',
  borderRadius: '0.95rem',
  background: 'color-mix(in srgb, var(--gloom) 46%, transparent)',
  padding: '0.85rem',
  display: 'grid',
  gap: '0.75rem'
};

const sectionTitleStyle = {
  margin: 0,
  fontFamily: "'Syne', sans-serif",
  fontSize: '3rem'
};

const sectionTitleRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.6rem'
};

const dropzoneStyle = (active, locked) => ({
  border: `1px dashed ${active ? 'var(--focus)' : 'color-mix(in srgb, var(--greyDark) 48%, transparent)'}`,
  borderRadius: '0.85rem',
  padding: '0.9rem',
  background: 'color-mix(in srgb, var(--gloomDark) 66%, transparent)',
  opacity: locked ? 0.75 : 1,
  display: 'grid',
  gap: '0.55rem'
});

const buttonStyle = {
  border: '1px solid color-mix(in srgb, var(--greyDark) 36%, transparent)',
  borderRadius: '999px',
  background: 'color-mix(in srgb, var(--gloom) 64%, transparent)',
  color: 'var(--text)',
  padding: '0.58rem 0.95rem',
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

const dangerButtonStyle = {
  ...buttonStyle,
  border: '1px solid color-mix(in srgb, var(--error) 45%, transparent)',
  color: 'var(--danger)'
};

const mediaGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '0.7rem'
};

const mediaTileStyle = {
  position: 'relative',
  border: '1px solid color-mix(in srgb, var(--greyDark) 30%, transparent)',
  borderRadius: '0.75rem',
  background: 'color-mix(in srgb, var(--gloom) 48%, transparent)',
  padding: '0.6rem',
  display: 'grid',
  gap: '0.5rem'
};

const tileRemoveButtonStyle = {
  position: 'absolute',
  top: '0.45rem',
  right: '0.45rem',
  width: '2.1rem',
  height: '2.1rem',
  borderRadius: '999px',
  border: '1px solid color-mix(in srgb, var(--error) 45%, transparent)',
  background: 'color-mix(in srgb, var(--error) 22%, var(--gloomDark))',
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
  border: '1px solid color-mix(in srgb, var(--greyDark) 34%, transparent)',
  background: 'color-mix(in srgb, var(--gloomDark) 72%, transparent)'
});

const captionStyle = {
  width: '100%',
  border: '1px solid color-mix(in srgb, var(--greyDark) 36%, transparent)',
  borderRadius: '0.75rem',
  background: 'color-mix(in srgb, var(--gloom) 92%, transparent)',
  color: 'var(--text)',
  fontFamily: 'inherit',
  fontSize: '1.4rem',
  padding: '1rem',
  minHeight: '14rem',
  resize: 'vertical'
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
    appendInstagramGridFiles,
    clearInstagramGrid,
    appendInstagramStories,
    removeInstagramStoryItem,
    onSubmit
  } = props;

  return h(
    'form',
    { onSubmit, style: formStyle },
    h(
      'section',
      { style: sectionStyle },
      h('h2', { style: sectionTitleStyle }, 'Primary workflow'),
      h(
        'div',
        {
          style: dropzoneStyle(dragActive, orderLocked),
          onDragOver: (event) => {
            event.preventDefault();
            if (!orderLocked) setDragActive(true);
          },
          onDragLeave: () => setDragActive(false),
          onDrop: (event) => {
            event.preventDefault();
            setDragActive(false);
            appendFiles(event.dataTransfer.files);
          }
        },
        h('strong', null, '1) Upload Feed Media'),
        h('span', null, 'Ρίξε media για Feed εδώ (single post)'),
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
              appendFiles(event.target.files || []);
              event.target.value = '';
            }
          })
        ),
        h('small', { style: { color: 'var(--muted)', fontSize: '1.24rem' } }, orderLocked ? 'Η σειρά είναι κλειδωμένη. Ξεκλείδωσε για αλλαγές.' : 'Μπορείς να προσθέτεις αρχεία με πολλαπλά drop.')
      ),
      h(
        'div',
        {
          style: dropzoneStyle(dragActive, orderLocked),
          onDragOver: (event) => {
            event.preventDefault();
            if (!orderLocked) setDragActive(true);
          },
          onDragLeave: () => setDragActive(false),
          onDrop: (event) => {
            event.preventDefault();
            setDragActive(false);
            appendCarouselFiles(event.dataTransfer.files);
          }
        },
        h('strong', null, '2) Create Carousel Post'),
        h('span', null, 'Ρίξε πολλαπλές εικόνες/βίντεο για 1 carousel post'),
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
              appendCarouselFiles(event.target.files || []);
              event.target.value = '';
            }
          })
        ),
        h('small', { style: { color: 'var(--muted)', fontSize: '1.24rem' } }, 'Κάθε upload εδώ δημιουργεί ένα νέο carousel post.')
      )
    ),
    h(
      CollapsiblePanel,
      { title: 'Feed order & carousel (Advanced)' },
      h(
        'section',
        { style: sectionStyle },
        h(
          'div',
          { style: sectionTitleRowStyle },
          h('h2', { style: sectionTitleStyle }, 'Feed order'),
          h('button', { type: 'button', style: dangerButtonStyle, onClick: clearMedia, disabled: orderLocked }, 'Καθαρισμός single')
        ),
        feedPreviewItems.length === 0
          ? h('small', { style: { color: 'var(--muted)', fontSize: '1.24rem' } }, 'Δεν υπάρχουν feed posts ακόμα.')
          : h(
              'div',
              { style: mediaGridStyle },
              feedPreviewItems.map((feedItem, index) =>
                h(
                  'div',
                  {
                    key: feedItem.id,
                    style: mediaTileStyle,
                    draggable: !orderLocked,
                    onDragStart: () => setDraggedId(feedItem.id),
                    onDragEnd: () => setDraggedId(null),
                    onDragOver: (event) => event.preventDefault(),
                    onDrop: () => handleTileDrop(feedItem.id)
                  },
                  h('small', { style: { color: 'var(--muted)', fontSize: '1.24rem' } }, `Post ${index + 1} • ${feedItem.kind === 'carousel' ? 'Carousel' : 'Single'}`),
                  !orderLocked
                    ? h(
                        'button',
                        {
                          type: 'button',
                          style: tileRemoveButtonStyle,
                          title: 'Διαγραφή',
                          onClick: () => (feedItem.kind === 'single' ? removeMedia(feedItem.item.id) : removeCarouselPost(feedItem.carouselPost.id))
                        },
                        '×'
                      )
                    : null,
                  feedItem.kind === 'single'
                    ? h(MediaPreview, { item: feedItem.item })
                    : h(MediaPreview, { item: feedItem.carouselPost.items[0] }),
                  h('small', { style: { color: 'var(--muted)', fontSize: '1.24rem' } }, feedItem.label)
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
          h('h2', { style: sectionTitleStyle }, 'Carousel slides order'),
          h('button', { type: 'button', style: dangerButtonStyle, onClick: clearCarouselUploads, disabled: orderLocked }, 'Καθαρισμός carousel')
        ),
        carouselPosts.length === 0
          ? h('small', { style: { color: 'var(--muted)', fontSize: '1.24rem' } }, 'Δεν υπάρχουν carousel posts ακόμα.')
          : h(
              'div',
              { style: { display: 'grid', gap: '0.9rem' } },
              carouselPosts.map((carouselPost, carouselIndex) =>
                h(
                  'article',
                  { key: carouselPost.id, style: sectionStyle },
                  h('strong', null, `Carousel Post ${carouselIndex + 1}`),
                  h('small', { style: { color: 'var(--muted)', fontSize: '1.24rem' } }, 'Drag-and-drop για σειρά καρτών μέσα στο carousel.'),
                  h(
                    'div',
                    { style: mediaGridStyle },
                    carouselPost.items.map((item, slideIndex) =>
                      h(
                        'div',
                        {
                          key: item.id,
                          style: mediaTileStyle,
                          draggable: !orderLocked,
                          onDragStart: () => setDraggedCarouselSlideId(`${carouselPost.id}::${item.id}`),
                          onDragEnd: () => setDraggedCarouselSlideId(''),
                          onDragOver: (event) => event.preventDefault(),
                          onDrop: () => handleCarouselSlideDrop(carouselPost.id, item.id)
                        },
                        h('small', { style: { color: 'var(--muted)', fontSize: '1.24rem' } }, `Slide ${slideIndex + 1}`),
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
                        h('small', { style: { color: 'var(--muted)', fontSize: '1.24rem' } }, item.file.name)
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
        h('h2', { style: sectionTitleStyle }, '3) Captions'),
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
        h('small', { style: { color: 'var(--muted)', fontSize: '1.24rem' } }, `Αντιστοιχισμένες λεζάντες feed: ${mappedCaptions}/${plannedFeedPostCount}`),
        h(
          'div',
          { style: { display: 'flex', flexWrap: 'wrap', gap: '0.55rem' } },
          !orderLocked
            ? h('button', { type: 'button', style: primaryButtonStyle, onClick: () => setOrderLocked(true) }, 'Κλείδωμα σειράς')
            : h('button', { type: 'button', style: buttonStyle, onClick: () => setOrderLocked(false) }, 'Ξεκλείδωμα'),
          h('button', { type: 'submit', style: primaryButtonStyle, disabled: busy }, busy ? 'Φόρτωση' : 'Ανέβασμα')
        )
      )
    ),
    h(
      CollapsiblePanel,
      { title: 'Grid 9 & stories (Advanced)' },
      h(
        'section',
        { style: sectionStyle },
        h('h2', { style: sectionTitleStyle }, 'Ενιαία 9άδα PNG'),
        h(
          'div',
          {
            style: dropzoneStyle(dragActive, false),
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
          h('strong', null, 'Ρίξε 1 αρχείο PNG για την ενιαία 9άδα'),
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
              { style: mediaGridStyle },
              instagramGridItems.map((item) =>
                h(
                  'div',
                  { key: item.id, style: mediaTileStyle },
                  h(MediaPreview, { item, ratio: '1 / 1' }),
                  h('small', { style: { color: 'var(--muted)', fontSize: '1.24rem' } }, item.file.name),
                  h('button', { type: 'button', style: dangerButtonStyle, onClick: clearInstagramGrid }, 'Αφαίρεση')
                )
              )
            )
          : null
      ),
      h(
        'section',
        { style: sectionStyle },
        h('h2', { style: sectionTitleStyle }, 'Stories αρχεία'),
        h(
          'div',
          {
            style: dropzoneStyle(dragActive, false),
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
          h('strong', null, 'Ρίξε εικόνες/βίντεο για Stories (9:16)'),
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
              { style: mediaGridStyle },
              instagramStoryItems.map((item) =>
                h(
                  'div',
                  { key: item.id, style: mediaTileStyle },
                  h(MediaPreview, { item, ratio: '9 / 16' }),
                  h('small', { style: { color: 'var(--muted)', fontSize: '1.24rem' } }, item.file.name),
                  h('button', { type: 'button', style: dangerButtonStyle, onClick: () => removeInstagramStoryItem(item.id) }, 'Αφαίρεση')
                )
              )
            )
          : null
      )
    )
  );
}
