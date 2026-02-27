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
  lineHeight: 1.45,
  cursor: 'pointer',
  transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease'
};

const headerStyle = {
  display: 'grid',
  gridTemplateColumns: '112px auto',
  gap: '0.75rem',
  alignItems: 'start',
  justifyContent: 'space-between'
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

const secondaryButtonStyle = {
  border: '1px solid color-mix(in srgb, var(--focus) 32%, transparent)',
  borderRadius: '999px',
  background: 'color-mix(in srgb, var(--focus) 10%, var(--gloom))',
  color: 'var(--text)',
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

const summaryButtonStyle = {
  width: '100%',
  padding: 0,
  border: 0,
  background: 'transparent',
  color: 'inherit',
  textAlign: 'left',
  cursor: 'pointer'
};

const summaryTopStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '0.75rem'
};

const summaryLabelStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '999px',
  padding: '0.35rem 0.8rem',
  fontSize: '1.18rem',
  fontWeight: 700,
  border: '2px solid color-mix(in srgb, var(--greyDark) 38%, transparent)',
  color: 'var(--muted)',
  background: 'color-mix(in srgb, var(--gloomDark) 58%, transparent)'
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
  expanded,
  onToggle,
  busy,
  mediaPreview,
  title,
  createdAtText,
  reviewLabel,
  reviewState,
  publishStatus,
  approvalStatus,
  captionValue,
  onCaptionChange,
  onReplaceMedia,
  onSaveEdits,
  onDelete,
  clientNotes,
  clientFeedbackImageUrl,
  clientFeedbackAudioUrl
}) {
  const [hovered, setHovered] = React.useState(false);
  const [showClientFeedback, setShowClientFeedback] = React.useState(false);
  const hasClientFeedbackAttachment = Boolean(clientFeedbackImageUrl || clientFeedbackAudioUrl);
  const hasClientNotes = Boolean(`${clientNotes || ''}`.trim());
  const hasClientFeedback = hasClientFeedbackAttachment || hasClientNotes;
  const reviewBadgeStyle = {
    ...summaryLabelStyle,
    ...(reviewState === 'approved'
      ? {
          border: '2px solid color-mix(in srgb, var(--success) 55%, transparent)',
          color: 'var(--ok)',
          background: 'color-mix(in srgb, var(--success) 16%, var(--gloom))'
        }
      : reviewState === 'rejected'
        ? {
            border: '2px solid color-mix(in srgb, var(--error) 56%, transparent)',
            color: 'var(--error)',
            background: 'color-mix(in srgb, var(--error) 14%, var(--gloom))'
          }
        : reviewState === 'changes'
          ? {
              border: '2px solid color-mix(in srgb, var(--warning) 58%, transparent)',
              color: 'var(--warning)',
              background: 'color-mix(in srgb, var(--warning) 18%, var(--gloom))'
            }
          : {})
  };
  const cardInteractiveStyle = hovered
    ? {
        transform: 'translateY(-3px)',
        border: '1px solid color-mix(in srgb, var(--focus) 42%, transparent)',
        boxShadow: '0 16px 34px color-mix(in srgb, var(--black) 26%, transparent)',
        background: 'color-mix(in srgb, var(--gloom) 60%, transparent)'
      }
    : null;

  const expandedContent = expanded
    ? h(
        React.Fragment,
        null,
        h(
          'div',
          { style: primaryActionsStyle },
          hasClientFeedback
            ? h(
                'button',
                {
                  type: 'button',
                  style: secondaryButtonStyle,
                  disabled: busy,
                  onClick: () => setShowClientFeedback((prev) => !prev)
                },
                showClientFeedback ? 'Κλείσιμο παρατηρήσεων πελάτη' : 'Παρατηρήσεις πελάτη'
              )
            : null,
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
        showClientFeedback && hasClientFeedback
          ? h(
              'div',
              {
                style: {
                  display: 'grid',
                  gap: '0.7rem',
                  padding: '0.8rem',
                  borderRadius: '0.9rem',
                  border: '1px solid color-mix(in srgb, var(--greyDark) 24%, transparent)',
                  background: 'color-mix(in srgb, var(--gloomDark) 42%, transparent)'
                }
              },
              hasClientFeedbackAttachment
                ? h(
                    'div',
                    { style: { display: 'grid', gap: '0.7rem' } },
                    clientFeedbackImageUrl
                      ? h(
                          'div',
                          {
                            style: {
                              display: 'grid',
                              gap: '0.45rem',
                              padding: '0.7rem',
                              borderRadius: '0.9rem',
                              border: '1px solid color-mix(in srgb, var(--greyDark) 24%, transparent)',
                              background: 'color-mix(in srgb, var(--gloomDark) 48%, transparent)'
                            }
                          },
                          h('small', { style: { color: 'var(--muted)', fontSize: '1.2rem' } }, 'Screenshot'),
                          h(
                            'a',
                            {
                              href: clientFeedbackImageUrl,
                              target: '_blank',
                              rel: 'noreferrer',
                              style: {
                                display: 'block',
                                width: 'min(18rem, 100%)',
                                aspectRatio: '16 / 10',
                                borderRadius: '0.8rem',
                                overflow: 'hidden',
                                border: '1px solid color-mix(in srgb, var(--greyDark) 28%, transparent)',
                                background: 'color-mix(in srgb, var(--gloom) 70%, transparent)'
                              }
                            },
                            h('img', {
                              src: clientFeedbackImageUrl,
                              alt: `Client feedback screenshot για ${title || 'post'}`,
                              loading: 'lazy',
                              style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
                            })
                          ),
                          h(
                            'a',
                            {
                              href: clientFeedbackImageUrl,
                              target: '_blank',
                              rel: 'noreferrer',
                              style: { width: 'fit-content', color: 'var(--focus)', fontSize: '1.28rem', fontWeight: 700 }
                            },
                            'Άνοιγμα εικόνας'
                          )
                        )
                      : null,
                    clientFeedbackAudioUrl
                      ? h(
                          'div',
                          {
                            style: {
                              display: 'grid',
                              gap: '0.45rem',
                              padding: '0.7rem',
                              borderRadius: '0.9rem',
                              border: '1px solid color-mix(in srgb, var(--greyDark) 24%, transparent)',
                              background: 'color-mix(in srgb, var(--gloomDark) 48%, transparent)'
                            }
                          },
                          h('small', { style: { color: 'var(--muted)', fontSize: '1.2rem' } }, 'Audio'),
                          h('audio', {
                            controls: true,
                            preload: 'none',
                            src: clientFeedbackAudioUrl,
                            style: { width: 'min(30rem, 100%)', maxWidth: '100%' }
                          }),
                          h(
                            'a',
                            {
                              href: clientFeedbackAudioUrl,
                              target: '_blank',
                              rel: 'noreferrer',
                              style: { width: 'fit-content', color: 'var(--focus)', fontSize: '1.28rem', fontWeight: 700 }
                            },
                            'Άνοιγμα ή λήψη ήχου'
                          )
                        )
                      : null
                  )
                : null,
              hasClientNotes
                ? h(
                    'div',
                    { style: { color: 'var(--muted)' } },
                    h('strong', null, 'Σημειώσεις πελάτη:'),
                    ' ',
                    `${clientNotes || ''}`.trim()
                  )
                : null
            )
          : null,
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
          )
        )
      )
    : null;

  return h(
    'article',
    {
      style: {
        ...cardStyle,
        ...(cardInteractiveStyle || {})
      },
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false)
    },
    h(
      'button',
      { type: 'button', style: summaryButtonStyle, onClick: onToggle },
      h(
        'div',
        { style: summaryTopStyle },
        h(
          'div',
          { style: headerStyle },
          h('div', { style: thumbStyle }, mediaPreview),
          h('span', { style: reviewBadgeStyle }, reviewLabel)
        )
      )
    ),
    expandedContent
  );
}
