import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useNotesHistory } from './hooks/useNotesHistory.js';
import { usePreviewData } from './hooks/usePreviewData.js';
import { usePreviewComputed } from './hooks/usePreviewComputed.js';
import {
  getClientSlugFromUrl,
  getPreviewModeFromUrl,
  getLogoProposalNumberFromUrl
} from './utils/appHelpers.js';
import { getPreviewText } from './utils/previewText.js';
import { AppPageLayout } from './components/layout/AppPageLayout.js';
import { HeroStatsSection } from './components/sections/HeroStatsSection.js';
import { StatusMessagesSection } from './components/sections/StatusMessagesSection.js';
import { ArticlePreviewSection } from './components/sections/ArticlePreviewSection.js';
import { InstagramPreviewSection } from './components/sections/InstagramPreviewSection.js';
import { LogoPreviewSection } from './components/sections/LogoPreviewSection.js';
import { PostCard } from './components/cards/PostCard.js';
import { LogoKitPresentation } from './components/logo/LogoKitPresentation.js';

function App() {
  const [clientSlug] = useState(getClientSlugFromUrl());
  const [previewMode] = useState(getPreviewModeFromUrl());
  const [logoProposalNumber] = useState(getLogoProposalNumberFromUrl());
  const { notesHistoryByPost, appendNoteHistory } = useNotesHistory(clientSlug, previewMode);
  const {
    posts,
    logoKit,
    logoKitIndex,
    logoKitCount,
    logoAssets,
    logoColors,
    logoStorySteps,
    clientMeta,
    status,
    savingId,
    supportsLogoFeedbackImages,
    supportsLogoFeedbackAudio,
    updateReview,
    updateLogoKitReview
  } = usePreviewData(clientSlug, previewMode, logoProposalNumber);

  const {
    filteredPosts,
    instagramPreview,
    approvedCount,
    disapprovedCount,
    needsReviewCount,
    pageTitle,
    pageSubtitle
  } = usePreviewComputed(posts, previewMode, logoKit, clientMeta);
  const previewText = getPreviewText(Boolean(clientMeta?.english_language));

  return (
    <AppPageLayout>
      {previewMode !== 'logo' && (
        <HeroStatsSection
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
          approvedCount={approvedCount}
          disapprovedCount={disapprovedCount}
          needsReviewCount={needsReviewCount}
          copy={previewText}
        />
      )}

      <StatusMessagesSection status={status} copy={previewText} />

      <ArticlePreviewSection
        status={status}
        previewMode={previewMode}
        clientMeta={clientMeta}
        filteredPosts={filteredPosts}
        savingId={savingId}
        updateReview={updateReview}
        notesHistoryByPost={notesHistoryByPost}
        appendNoteHistory={appendNoteHistory}
        PostCard={PostCard}
        copy={previewText}
      />

      <InstagramPreviewSection
        status={status}
        previewMode={previewMode}
        clientMeta={clientMeta}
        instagramPreview={instagramPreview}
        savingId={savingId}
        updateReview={updateReview}
        notesHistoryByPost={notesHistoryByPost}
        appendNoteHistory={appendNoteHistory}
        PostCard={PostCard}
        copy={previewText}
      />

      <LogoPreviewSection
        status={status}
        previewMode={previewMode}
        logoKit={logoKit}
        logoKitIndex={logoKitIndex}
        logoKitCount={logoKitCount}
        supportsLogoFeedbackImages={supportsLogoFeedbackImages}
        supportsLogoFeedbackAudio={supportsLogoFeedbackAudio}
        logoAssets={logoAssets}
        logoColors={logoColors}
        logoStorySteps={logoStorySteps}
        clientMeta={clientMeta}
        clientSlug={clientSlug}
        savingId={savingId}
        notesHistoryByPost={notesHistoryByPost}
        appendNoteHistory={appendNoteHistory}
        updateLogoKitReview={updateLogoKitReview}
        LogoKitPresentation={LogoKitPresentation}
        copy={previewText}
      />
    </AppPageLayout>
  );
}

createRoot(document.getElementById('root')).render(<App />);
