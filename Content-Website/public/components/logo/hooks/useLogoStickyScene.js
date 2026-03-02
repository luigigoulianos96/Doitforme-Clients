import React from 'react';

function useLogoStickyScene(options = {}) {
  const {
    disabled = false,
    desktopQuery = '(min-width: 981px)'
  } = options;
  const ref = React.useRef(null);
  const [state, setState] = React.useState({
    enabled: false,
    progress: 0,
    isActive: false
  });

  React.useEffect(() => {
    if (disabled || typeof window === 'undefined') {
      setState({ enabled: false, progress: 0, isActive: false });
      return undefined;
    }

    const media = window.matchMedia?.(desktopQuery);
    if (!media?.matches) {
      setState({ enabled: false, progress: 0, isActive: false });
      return undefined;
    }

    let frameId = 0;

    function update() {
      frameId = 0;
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const totalScrollable = Math.max(rect.height - viewportHeight, 1);
      const rawProgress = (viewportHeight - rect.top) / (viewportHeight + totalScrollable);
      const progress = Math.max(0, Math.min(1, rawProgress));
      const isActive = rect.top <= 0 && rect.bottom >= viewportHeight;

      setState((current) => {
        if (
          current.enabled === true &&
          current.isActive === isActive &&
          Math.abs(current.progress - progress) < 0.01
        ) {
          return current;
        }
        return {
          enabled: true,
          progress,
          isActive
        };
      });
    }

    function schedule() {
      if (frameId) return;
      frameId = window.requestAnimationFrame(update);
    }

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [disabled, desktopQuery]);

  return {
    ref,
    ...state
  };
}

export { useLogoStickyScene };
