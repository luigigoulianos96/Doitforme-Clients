import React, { useEffect, useMemo } from 'react';
import { PresentationShell } from '../../core/styles/App.styles.js';
import { parseLogoAssetCategory } from '../../utils/appHelpers.js';
import { LogoCaseStudyRenderer } from './LogoCaseStudyRenderer.js';
import { LogoReviewPanel } from './LogoReviewPanel.js';
import { buildLogoPreviewModel } from './logoPreviewModel.js';

const h = React.createElement;

function LogoKitPresentation({
  logoKit,
  logoKitIndex,
  logoKitCount,
  supportsLogoFeedbackImages,
  supportsLogoFeedbackAudio,
  assets,
  colors,
  storySteps,
  clientName,
  clientSlug,
  pending,
  historyEntries,
  onAppendHistory,
  onUpdateLogoKitReview,
  copy
}) {
  const model = useMemo(
    () => buildLogoPreviewModel({ logoKit, assets, colors, storySteps, clientName, parseLogoAssetCategory }),
    [logoKit, assets, colors, storySteps, clientName]
  );

  useEffect(() => {
    const previousStyle = document.getElementById('logo-kit-fonts-style');
    if (previousStyle) previousStyle.remove();
    if ((model.fontFamilies || []).length === 0) return;
    const style = document.createElement('style');
    style.id = 'logo-kit-fonts-style';
    style.textContent = model.fontFamilies
      .map((fontDef) => `@font-face { font-family: '${fontDef.family}'; src: url('${fontDef.url}'); font-display: swap; }`)
      .join('\n');
    document.head.appendChild(style);
    return () => style.remove();
  }, [model.fontFamilies]);

  return h(
    PresentationShell,
    null,
    h(LogoCaseStudyRenderer, { model, logoKitIndex, logoKitCount, clientSlug }),
    logoKit
      ? h(LogoReviewPanel, {
          logoKit,
          pending,
          supportsFeedbackImages: supportsLogoFeedbackImages,
          supportsFeedbackAudio: supportsLogoFeedbackAudio,
          historyEntries,
          onAppendHistory,
          onUpdateLogoKitReview,
          copy
        })
      : null
  );
}

export { LogoKitPresentation };
