import React from 'react';

const panelStyle = {
  border: '1px solid color-mix(in srgb, var(--greyDark) 32%, transparent)',
  borderRadius: '0.9rem',
  background: 'color-mix(in srgb, var(--gloom) 40%, transparent)',
  overflow: 'hidden'
};

const summaryStyle = {
  cursor: 'pointer',
  padding: '0.86rem 1.05rem',
  fontWeight: 700,
  fontSize: '1.42rem',
  listStyle: 'none'
};

const bodyStyle = {
  borderTop: '1px solid color-mix(in srgb, var(--greyDark) 22%, transparent)',
  padding: '0.85rem'
};

const h = React.createElement;

export default function CollapsiblePanel({ title, defaultOpen = false, children }) {
  return h(
    'details',
    { style: panelStyle, open: defaultOpen },
    h('summary', { style: summaryStyle }, title),
    h('div', { style: bodyStyle }, children)
  );
}
