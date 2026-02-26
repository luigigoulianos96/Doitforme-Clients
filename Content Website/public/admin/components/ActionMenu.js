import React, { useEffect, useRef, useState } from 'react';

const menuWrapStyle = {
  position: 'relative',
  display: 'inline-block'
};

const triggerStyle = {
  border: '1px solid color-mix(in srgb, var(--greyDark) 36%, transparent)',
  borderRadius: '999px',
  background: 'color-mix(in srgb, var(--gloom) 64%, transparent)',
  color: 'var(--text)',
  padding: '0.62rem 1rem',
  font: 'inherit',
  fontSize: '1.34rem',
  cursor: 'pointer'
};

const panelStyle = {
  position: 'absolute',
  right: 0,
  top: 'calc(100% + 0.35rem)',
  minWidth: '12rem',
  border: '1px solid color-mix(in srgb, var(--greyDark) 36%, transparent)',
  borderRadius: '0.8rem',
  background: 'color-mix(in srgb, var(--gloomDark) 92%, transparent)',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 10px 30px color-mix(in srgb, var(--black) 45%, transparent)',
  padding: '0.35rem',
  zIndex: 30
};

const itemStyle = {
  width: '100%',
  border: '0',
  borderRadius: '0.6rem',
  background: 'transparent',
  color: 'var(--text)',
  textAlign: 'left',
  padding: '0.64rem 0.72rem',
  font: 'inherit',
  fontSize: '1.34rem',
  cursor: 'pointer'
};

const dangerItemStyle = {
  ...itemStyle,
  color: 'var(--danger)'
};

const h = React.createElement;

export default function ActionMenu({ label = 'More', actions = [] }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleDocClick = (event) => {
      if (!wrapRef.current || wrapRef.current.contains(event.target)) return;
      setOpen(false);
    };
    window.addEventListener('click', handleDocClick);
    return () => window.removeEventListener('click', handleDocClick);
  }, [open]);

  const visibleActions = actions.filter((action) => !action.hidden);
  if (visibleActions.length === 0) return null;

  return h(
    'div',
    { ref: wrapRef, style: menuWrapStyle },
    h(
      'button',
      { type: 'button', style: triggerStyle, onClick: () => setOpen((prev) => !prev) },
      label
    ),
    open
      ? h(
          'div',
          { style: panelStyle },
          visibleActions.map((action) =>
            h(
              'button',
              {
                key: action.key,
                type: 'button',
                disabled: action.disabled,
                style: action.type === 'danger' ? dangerItemStyle : itemStyle,
                onClick: () => {
                  setOpen(false);
                  action.onClick();
                }
              },
              action.label
            )
          )
        )
      : null
  );
}
