import React from 'react';
import { hasRichTextContent, normalizeRichTextHtml } from '../utils/richText.js';

const h = React.createElement;

function RichTextEditor({
  value,
  onChange,
  placeholder = '',
  minHeight = '12rem',
  style = {},
  onFocus,
  onBlur
}) {
  const surfaceRef = React.useRef(null);

  React.useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const nextHtml = normalizeRichTextHtml(value);
    if (surface.innerHTML !== nextHtml) {
      surface.innerHTML = nextHtml;
    }
  }, [value]);

  function syncValue() {
    const surface = surfaceRef.current;
    if (!surface) return;
    const nextHtml = normalizeRichTextHtml(surface.innerHTML);
    if (surface.innerHTML !== nextHtml) {
      surface.innerHTML = nextHtml;
    }
    onChange(nextHtml);
  }

  function handleBlur(event) {
    syncValue();
    if (onBlur) {
      onBlur(event);
    }
  }

  const wrapperStyle = {
    position: 'relative'
  };

  const surfaceStyle = {
    width: '100%',
    minHeight,
    border: '1px solid color-mix(in srgb, var(--greyDark) 30%, transparent)',
    borderRadius: '0.9rem',
    background: 'color-mix(in srgb, var(--white) 98%, transparent)',
    color: 'color-mix(in srgb, var(--dark) 90%, var(--greyDark))',
    font: 'inherit',
    fontSize: '1.6rem',
    lineHeight: 1.55,
    padding: '0.9rem',
    overflow: 'auto',
    outline: 'none',
    ...style
  };

  return h(
    'div',
    { style: wrapperStyle },
    !hasRichTextContent(value) && placeholder
      ? h(
          'span',
          {
            style: {
              position: 'absolute',
              top: '0.9rem',
              left: '0.9rem',
              right: '0.9rem',
              color: 'color-mix(in srgb, var(--greyDark) 70%, var(--white))',
              fontSize: '1.5rem',
              lineHeight: 1.5,
              pointerEvents: 'none'
            }
          },
          placeholder
        )
      : null,
    h('div', {
      ref: surfaceRef,
      contentEditable: true,
      suppressContentEditableWarning: true,
      role: 'textbox',
      'aria-multiline': 'true',
      style: surfaceStyle,
      onInput: syncValue,
      onPaste: () => window.setTimeout(syncValue, 0),
      onFocus,
      onBlur: handleBlur
    })
  );
}

function RichTextPreview({
  value,
  emptyLabel = '',
  style = {}
}) {
  const html = normalizeRichTextHtml(value);
  const hasContent = hasRichTextContent(html);

  return h(
    'div',
    {
      style: {
        border: '1px solid color-mix(in srgb, var(--greyDark) 18%, transparent)',
        borderRadius: '0.9rem',
        background: 'color-mix(in srgb, var(--white) 96%, transparent)',
        padding: '0.9rem',
        fontSize: '1.45rem',
        lineHeight: 1.6,
        color: 'color-mix(in srgb, var(--dark) 88%, var(--greyDark))',
        ...style
      }
    },
    hasContent
      ? h('div', { dangerouslySetInnerHTML: { __html: html } })
      : (emptyLabel || '')
  );
}

export default RichTextEditor;
export { RichTextPreview };
