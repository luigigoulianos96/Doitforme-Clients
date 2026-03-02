const LOGO_MOTION_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

const LOGO_MOTION_TOKENS = {
  easing: LOGO_MOTION_EASING,
  durationMs: {
    soft: 560,
    section: 760,
    hero: 920
  },
  distancePx: {
    soft: 14,
    section: 28,
    hero: 42
  },
  scaleFrom: {
    soft: 1,
    section: 0.992,
    hero: 0.985
  },
  delayMs: {
    hero: 0,
    meta: 70,
    body: 110,
    support: 150,
    closing: 90
  },
  parallaxPx: {
    hero: 14,
    closing: 10
  }
};

export { LOGO_MOTION_TOKENS };
