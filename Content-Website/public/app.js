import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useNotesHistory } from './hooks/useNotesHistory.js';
import { usePreviewData } from './hooks/usePreviewData.js';
import { usePreviewComputed } from './hooks/usePreviewComputed.js';
import {
  getClientSlugFromUrl,
  getPreviewModeFromUrl
} from './utils/appHelpers.js';
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
  const { notesHistoryByPost, appendNoteHistory } = useNotesHistory(clientSlug, previewMode);
  const {
    posts,
    logoKit,
    logoAssets,
    logoColors,
    logoStorySteps,
    clientMeta,
    status,
    savingId,
    updateReview,
    updateLogoKitReview
  } = usePreviewData(clientSlug, previewMode);

  const {
    filteredPosts,
    instagramPreview,
    approvedCount,
    disapprovedCount,
    needsReviewCount,
    pageTitle,
    pageSubtitle
  } = usePreviewComputed(posts, previewMode, logoKit, clientMeta);

  return (
    <AppPageLayout>
      <HeroStatsSection
        pageTitle={pageTitle}
        pageSubtitle={pageSubtitle}
        approvedCount={approvedCount}
        disapprovedCount={disapprovedCount}
        needsReviewCount={needsReviewCount}
      />

      <StatusMessagesSection status={status} />

      <ArticlePreviewSection
        status={status}
        previewMode={previewMode}
        filteredPosts={filteredPosts}
        savingId={savingId}
        updateReview={updateReview}
        notesHistoryByPost={notesHistoryByPost}
        appendNoteHistory={appendNoteHistory}
        PostCard={PostCard}
      />

      <InstagramPreviewSection
        status={status}
        previewMode={previewMode}
        instagramPreview={instagramPreview}
        savingId={savingId}
        updateReview={updateReview}
        notesHistoryByPost={notesHistoryByPost}
        appendNoteHistory={appendNoteHistory}
        PostCard={PostCard}
      />

      <LogoPreviewSection
        status={status}
        previewMode={previewMode}
        logoKit={logoKit}
        logoAssets={logoAssets}
        logoColors={logoColors}
        logoStorySteps={logoStorySteps}
        clientMeta={clientMeta}
        savingId={savingId}
        notesHistoryByPost={notesHistoryByPost}
        appendNoteHistory={appendNoteHistory}
        updateLogoKitReview={updateLogoKitReview}
        LogoKitPresentation={LogoKitPresentation}
      />
    </AppPageLayout>
  );
}

createRoot(document.getElementById('root')).render(<App />);
