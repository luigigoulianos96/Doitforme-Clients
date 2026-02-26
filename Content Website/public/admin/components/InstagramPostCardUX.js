import React from 'react';
import ActionMenu from './ActionMenu.js';
import CollapsiblePanel from './CollapsiblePanel.js';

const cardStyle = {
  border: '1px solid color-mix(in srgb, var(--greyDark) 30%, transparent)',
  borderRadius: '1rem',
  background: 'color-mix(in srgb, var(--gloom) 52%, transparent)',
  padding: '0.95rem',
  display: 'grid',
  gap: '0.8rem',
  fontSize: '1.42rem',
  lineHeight: 1.45
};

const headerStyle = {
  display: 'grid',
  gridTemplateColumns: '112px minmax(0, 1fr)',
  gap: '0.75rem',
  alignItems: 'start'
};

const thumbStyle = {
  border: '1px solid color-mix(in srgb, var(--greyDark) 35%, transparent)',
  borderRadius: '0.85rem',
  overflow: 'hidden',
  aspectRatio: '4 / 5',
  background: 'color-mix(in srgb, var(--gloomDark) 72%, transparent)',
  display: 'grid',
  alignItems: 'center'
};

const statusRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.4rem'
};

const chipStyle = {
  border: '1px solid color-mix(in srgb, var(--greyDark) 36%, transparent)',
  borderRadius: '999px',
  padding: '0.22rem 0.55rem',
  fontSize: '1.3rem',
  color: 'var(--muted)'
};

const primaryActionsStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.55rem',
  alignItems: 'center'
};

const primaryButtonStyle = {
  border: '1px solid color-mix(in srgb, var(--success) 45%, transparent)',
  borderRadius: '999px',
  background: 'color-mix(in srgb, var(--success) 20%, var(--gloom))',
  color: 'var(--ok)',
  padding: '0.6rem 0.9rem',
  font: 'inherit',
  fontWeight: 700,
  cursor: 'pointer'
};

const replaceLabelStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '999px',
  border: '1px solid color-mix(in srgb, var(--greyDark) 36%, transparent)',
  background: 'color-mix(in srgb, var(--gloom) 64%, transparent)',
  color: 'var(--text)',
  padding: '0.58rem 0.9rem',
  fontSize: '1.38rem',
  cursor: 'pointer'
};

const hiddenInputStyle = {
  display: 'none'
};

const captionStyle = {
  border: '1px solid color-mix(in srgb, var(--greyDark) 34%, transparent)',
  borderRadius: '0.75rem',
  background: 'color-mix(in srgb, var(--gloomDark) 66%, transparent)',
  padding: '0.7rem',
  color: 'var(--muted)',
  fontSize: '1.34rem'
};

const editorStyle = {
  width: '100%',
  border: '1px solid color-mix(in srgb, var(--greyDark) 36%, transparent)',
  borderRadius: '0.75rem',
  background: 'color-mix(in srgb, var(--gloomDark) 70%, transparent)',
  color: 'var(--text)',
  padding: '0.75rem',
  font: 'inherit',
  fontSize: '1.38rem',
  resize: 'vertical'
};

const h = React.createElement;

export default function InstagramPostCardUX({
  post,
  instagramMeta,
  isInstagramStory,
  busy,
  mediaPreview,
  title,
  createdAtText,
  reviewLabel,
  publishStatus,
  approvalStatus,
  captionValue,
  onCaptionChange,
  onReplaceMedia,
  onSaveEdits,
  onDelete,
  clientNotes
}) {
  const captionExcerpt = (captionValue || '').trim()
    ? `${captionValue.slice(0, 160)}${captionValue.length > 160 ? '...' : ''}`
    : 'Χωρίς λεζάντα';

  return h(
    'article',
    { style: cardStyle },
    h(
      'div',
      { style: headerStyle },
      h('div', { style: thumbStyle }, mediaPreview),
      h(
        'div',
        null,
        h('strong', { style: { fontSize: '1.56rem' } }, title),
        h('div', { style: { color: 'var(--muted)', marginTop: '0.2rem', fontSize: '1.28rem' } }, createdAtText),
        h(
          'div',
          { style: { ...statusRowStyle, marginTop: '0.55rem' } },
          h('span', { style: chipStyle }, `Review: ${reviewLabel}`),
          h('span', { style: chipStyle }, `Publish: ${publishStatus || 'unknown'}`),
          h('span', { style: chipStyle }, `Approval: ${approvalStatus || 'pending'}`),
          h('span', { style: chipStyle }, `Type: ${instagramMeta?.kind || 'feed'}`)
        )
      )
    ),
    !isInstagramStory
      ? h('div', { style: captionStyle }, h('strong', null, 'Caption excerpt:'), ' ', captionExcerpt)
      : h('div', { style: captionStyle }, h('strong', null, 'Story:'), ' Η προεπισκόπηση story δεν εμφανίζει λεζάντα.'),
    h(
      'div',
      { style: primaryActionsStyle },
      h(
        'button',
        { type: 'button', style: primaryButtonStyle, disabled: busy, onClick: onSaveEdits },
        'Αποθήκευση'
      ),
      h(ActionMenu, {
        label: 'More',
        actions: [
          {
            key: 'delete',
            label: 'Διαγραφή',
            type: 'danger',
            disabled: busy,
            onClick: onDelete
          }
        ]
      })
    ),
    h(
      CollapsiblePanel,
      { title: 'Advanced editing & actions' },
      !isInstagramStory
        ? h(
            'label',
            null,
            'Λεζάντα',
            h('textarea', {
              rows: 3,
              value: captionValue,
              onChange: (event) => onCaptionChange(event.target.value),
              style: editorStyle
            })
          )
        : null,
      h(
        'div',
        { style: { display: 'flex', flexWrap: 'wrap', gap: '0.55rem', marginTop: '0.7rem' } },
        h('label', { htmlFor: `replace-${post.id}`, style: replaceLabelStyle }, 'Αντικατάσταση'),
        h('input', {
          id: `replace-${post.id}`,
          type: 'file',
          accept: 'image/*,video/*',
          style: hiddenInputStyle,
          onChange: (event) => {
            const file = (event.target.files || [])[0];
            onReplaceMedia(file);
            event.target.value = '';
          }
        })
      ),
      h(
        'div',
        { style: { marginTop: '0.7rem', color: 'var(--muted)' } },
        h('strong', null, 'Σημειώσεις πελάτη:'),
        ' ',
        (clientNotes || '').trim() || 'Δεν υπάρχουν σημειώσεις ακόμα.'
      )
    )
  );
}
