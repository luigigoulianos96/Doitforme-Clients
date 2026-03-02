import React from 'react';

function LogoPreviewSection({
  status,
  previewMode,
  logoKit,
  logoKitIndex,
  logoKitCount,
  supportsLogoFeedbackImages,
  supportsLogoFeedbackAudio,
  logoAssets,
  logoColors,
  logoStorySteps,
  clientMeta,
  clientSlug,
  savingId,
  notesHistoryByPost,
  appendNoteHistory,
  updateLogoKitReview,
  LogoKitPresentation,
  copy
}) {
  return React.createElement(
    React.Fragment,
    null,
    !status.loading && !status.error && previewMode === 'logo'
      ? React.createElement(LogoKitPresentation, {
          logoKit,
          logoKitIndex,
          logoKitCount,
          supportsLogoFeedbackImages,
          supportsLogoFeedbackAudio,
          assets: logoAssets,
          colors: logoColors,
          storySteps: logoStorySteps,
          clientName: clientMeta?.name || 'Client',
          clientSlug,
          pending: savingId === `logo-${logoKit?.id}`,
          historyEntries: notesHistoryByPost[logoKit?.id] || [],
          onAppendHistory: appendNoteHistory,
          onUpdateLogoKitReview: updateLogoKitReview,
          copy
        })
      : null
  );
}

export { LogoPreviewSection };
