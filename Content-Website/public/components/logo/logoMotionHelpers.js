import { LOGO_MOTION_TOKENS } from './logoMotionTokens.js';

function resolveVariantToken(collection, variant, fallback) {
  return collection[variant] ?? collection[fallback];
}

function createSceneMotionStyle({
  isVisible,
  disabled = false,
  variant = 'section',
  delayMs = 0
}) {
  if (disabled) {
    return {
      opacity: 1,
      transform: 'translate3d(0, 0, 0) scale(1)',
      transition: 'none',
      willChange: 'auto'
    };
  }

  const duration = resolveVariantToken(LOGO_MOTION_TOKENS.durationMs, variant, 'section');
  const distance = resolveVariantToken(LOGO_MOTION_TOKENS.distancePx, variant, 'section');
  const scaleFrom = resolveVariantToken(LOGO_MOTION_TOKENS.scaleFrom, variant, 'section');

  return {
    opacity: isVisible ? 1 : 0.01,
    transform: isVisible
      ? 'translate3d(0, 0, 0) scale(1)'
      : `translate3d(0, ${distance}px, 0) scale(${scaleFrom})`,
    transition: [
      `opacity ${duration}ms ${LOGO_MOTION_TOKENS.easing}`,
      `transform ${duration}ms ${LOGO_MOTION_TOKENS.easing}`
    ].join(', '),
    transitionDelay: `${delayMs}ms`,
    willChange: isVisible ? 'auto' : 'opacity, transform'
  };
}

export { createSceneMotionStyle };
