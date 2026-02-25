import React from 'react';

function LogoPreviewSection({
  status,
  previewMode,
  logoKit,
  logoAssets,
  logoColors,
  logoStorySteps,
  clientMeta,
  savingId,
  notesHistoryByPost,
  appendNoteHistory,
  updateLogoKitReview,
  LogoKitPresentation
}) {
  return React.createElement(
    React.Fragment,
    null,
    !status.loading && !status.error && previewMode === 'logo'
      ? React.createElement(LogoKitPresentation, {
          logoKit,
          assets: logoAssets,
          colors: logoColors,
          storySteps: logoStorySteps,
          clientName: clientMeta?.name || 'Client',
          pending: savingId === `logo-${logoKit?.id}`,
          historyEntries: notesHistoryByPost[logoKit?.id] || [],
          onAppendHistory: appendNoteHistory,
          onUpdateLogoKitReview: updateLogoKitReview
        })
      : null
  );
}

export { LogoPreviewSection };
