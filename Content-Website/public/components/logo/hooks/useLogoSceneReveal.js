import React from 'react';

function useLogoSceneReveal(options = {}) {
  const {
    disabled = false,
    rootMargin = '0px 0px -12% 0px',
    threshold = 0.18
  } = options;
  const ref = React.useRef(null);
  const [isVisible, setIsVisible] = React.useState(disabled);

  React.useEffect(() => {
    if (disabled) {
      setIsVisible(true);
      return undefined;
    }

    const node = ref.current;
    if (!node || typeof IntersectionObserver !== 'function') {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { root: null, rootMargin, threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [disabled, rootMargin, threshold]);

  return {
    ref,
    isVisible
  };
}

export { useLogoSceneReveal };
