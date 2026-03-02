import React from 'react';
import { useLogoSceneReveal } from './hooks/useLogoSceneReveal.js';
import { createSceneMotionStyle } from './logoMotionHelpers.js';

const h = React.createElement;

function LogoCaseStudyScene({
  as = 'section',
  children,
  style,
  className = '',
  disabled = false,
  reduceMotion = false,
  variant = 'section',
  delayMs = 0
}) {
  const isDisabled = disabled || reduceMotion;
  const { ref, isVisible } = useLogoSceneReveal({ disabled: isDisabled });
  const baseStyle = {
    ...createSceneMotionStyle({
      isVisible,
      disabled: isDisabled,
      variant,
      delayMs
    }),
    ...style
  };

  return h(
    as,
    { ref, style: baseStyle, className },
    children
  );
}

export { LogoCaseStudyScene };
