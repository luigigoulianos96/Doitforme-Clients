import React from 'react';

function useLogoParallax(options = {}) {
  const {
    strength = 18,
    disabled = false
  } = options;
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (disabled) {
      const node = ref.current;
      if (node) node.style.setProperty('--logo-parallax-offset', '0px');
      return undefined;
    }

    let frameId = 0;

    function update() {
      frameId = 0;
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const elementCenter = rect.top + (rect.height / 2);
      const normalized = (elementCenter - (viewportHeight / 2)) / viewportHeight;
      const nextOffset = Math.max(-1, Math.min(1, normalized)) * strength * -1;
      node.style.setProperty('--logo-parallax-offset', `${nextOffset}px`);
    }

    function scheduleUpdate() {
      if (frameId) return;
      frameId = window.requestAnimationFrame(update);
    }

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [disabled, strength]);

  return {
    ref
  };
}

export { useLogoParallax };
