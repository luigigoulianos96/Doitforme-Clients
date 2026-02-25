import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import styled, { createGlobalStyle } from 'styled-components';

const AppStyle = createGlobalStyle`
  :root {
    --text: var(--white);
    --muted: var(--greyDark);
    --panel-border: color-mix(in srgb, var(--greyDark) 38%, transparent);
    --accent: var(--focus);
    --danger: var(--error);
    --ok: var(--success);
    --shadow: 0 24px 70px color-mix(in srgb, var(--black) 40%, transparent);
  }

  * { box-sizing: border-box; }

  img { width: 100%; }

  body {
    margin: 0;
    min-height: 100vh;
    font-family: 'Sora', sans-serif;
    color: var(--text);
    background:
      radial-gradient(circle at 12% 18%, color-mix(in srgb, var(--main) 46%, transparent) 0%, transparent 40%),
      radial-gradient(circle at 86% 10%, color-mix(in srgb, var(--focus) 42%, transparent) 0%, transparent 32%),
      linear-gradient(150deg, var(--black) 0%, var(--dark) 55%, var(--gloomDark) 100%);
    background-repeat: no-repeat;
    background-size: cover;
    background-attachment: fixed;
  }

  a { color: var(--accent); }

  .noise {
    position: fixed;
    inset: 0;
    pointer-events: none;
    opacity: 0.15;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 100 100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.21'/%3E%3C/svg%3E");
  }
`;

const Page = styled.main`
  width: min(1180px, 92vw);
  margin: 0 auto;
  padding: 40px 0 64px;
`;

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  border-radius: 30px;
  border: 1px solid var(--panel-border);
  background: linear-gradient(135deg, color-mix(in srgb, var(--dark) 86%, transparent), color-mix(in srgb, var(--gloom) 68%, transparent));
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow);
  padding: clamp(1.4rem, 4vw, 3rem);
`;

const HeroTop = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 0.7rem;
`;

const TabRow = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
`;

const TabButton = styled.button`
  border: 1px solid color-mix(in srgb, var(--greyDark) 34%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--gloomDark) 60%, transparent);
  color: var(--text);
  font: inherit;
  font-size: 1.3rem;
  font-weight: 700;
  padding: 0.62rem 1rem;
  cursor: pointer;
  ${(p) => p.$active && `
    border-color: color-mix(in srgb, var(--success) 44%, transparent);
    color: var(--ok);
    background: color-mix(in srgb, var(--success) 12%, var(--gloomDark));
  `}
`;

const Eyebrow = styled.p`
  margin: 0;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--accent);
`;

const Title = styled.h1`
  margin: 10px 0 12px;
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.9rem, 5.2vw, 3.6rem);
  line-height: 0.95;
`;

const Subtitle = styled.p`
  margin: 0;
  max-width: 72ch;
  color: var(--muted);
`;

const Form = styled.form`
  margin-top: 1.2rem;
  display: grid;
  gap: 1rem;

  label {
    display: grid;
    gap: 0.34rem;
    font-size: 1.35rem;
    color: var(--muted);
  }

  input,
  textarea {
    border: 1px solid color-mix(in srgb, var(--greyDark) 36%, transparent);
    border-radius: 12px;
    background: color-mix(in srgb, var(--gloom) 92%, transparent);
    color: var(--text);
    font: inherit;
    padding: 1rem 1.1rem;
  }
`;

const Step = styled.section`
  border: 1px solid color-mix(in srgb, var(--greyDark) 28%, transparent);
  border-radius: 14px;
  background: color-mix(in srgb, var(--gloom) 46%, transparent);
  padding: 0.82rem;
`;

const StepTitle = styled.h2`
  margin: 0 0 0.64rem;
  font-family: 'Syne', sans-serif;
  font-size: 2rem;
`;

const CaptionInput = styled.textarea`
  width: 100%;
  border: 1px solid color-mix(in srgb, var(--greyDark) 36%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--gloom) 92%, transparent);
  color: var(--text);
  font: inherit;
  padding: 1rem 1.1rem;
  min-height: 14rem;
  resize: vertical;

  &::placeholder {
    opacity: 1;
    transition: opacity 0.18s ease;
  }

  &:focus::placeholder {
    opacity: 0;
  }
`;

const Dropzone = styled.div`
  border: 1px dashed color-mix(in srgb, var(--greyDark) 48%, transparent);
  border-radius: 12px;
  padding: 1rem;
  display: grid;
  justify-items: start;
  gap: 0.5rem;
  background: color-mix(in srgb, var(--gloomDark) 66%, transparent);
  ${(p) => p.$active && 'border-color: var(--accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--focus) 22%, transparent);'}
  ${(p) => p.$locked && 'opacity: 0.75;'}
`;

const DropText = styled.p`
  margin: 0;
  font-weight: 700;
  font-size: 1.7rem;
`;

const FilePicker = styled.label`
  position: relative;
  overflow: hidden;
`;

const FilePickerButton = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--greyDark) 36%, transparent);
  background: color-mix(in srgb, var(--gloom) 64%, transparent);
  color: var(--text);
  padding: 0.62rem 1rem;
  font-size: 1.35rem;
  cursor: pointer;
`;

const FileInput = styled.input`
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
`;

const InlineInput = styled.input`
  width: min(26rem, 100%);
  border: 1px solid color-mix(in srgb, var(--greyDark) 36%, transparent);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--gloom) 86%, transparent);
  color: var(--text);
  font: inherit;
  font-size: 1.45rem;
  line-height: 1.25;
  padding: 0.75rem 0.9rem;
`;

const MutedSmall = styled.small`
  color: var(--muted);
  font-size: 1.25rem;
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.7rem;
`;


const SlideBuilderGrid = styled.div`
  display: grid;
  gap: 0.9rem;
`;

const SlideBuilderCard = styled.article`
  border: 1px solid color-mix(in srgb, var(--greyDark) 30%, transparent);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--gloom) 55%, transparent);
  padding: 0.8rem;
  display: grid;
  gap: 0.75rem;
`;

const SlideBuilderHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
`;

const SlideBuilderRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 0.75rem;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const SlideCanvasPreview = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 0.9rem;
  border: 1px dashed color-mix(in srgb, var(--greyDark) 34%, transparent);
  background:
    radial-gradient(circle at 12% 18%, color-mix(in srgb, var(--focus) 18%, transparent) 0%, transparent 42%),
    linear-gradient(150deg, color-mix(in srgb, var(--gloom) 74%, transparent), color-mix(in srgb, var(--dark) 86%, transparent));
  position: relative;
  overflow: hidden;
`;

const SlideCanvasElement = styled.div`
  position: absolute;
  left: ${(p) => `${p.$x || 0}%`};
  top: ${(p) => `${p.$y || 0}%`};
  width: ${(p) => `${p.$w || 30}%`};
  height: ${(p) => `${p.$h || 22}%`};
  border-radius: 0.75rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 28%, transparent);
  background: ${(p) => (p.$type === 'text' ? 'color-mix(in srgb, var(--gloomDark) 78%, transparent)' : 'color-mix(in srgb, var(--dark) 90%, transparent)')};
  display: grid;
  place-items: center;
  padding: 0.5rem;
  cursor: grab;
  overflow: hidden;

  &:active {
    cursor: grabbing;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
`;

const SlideCanvasText = styled.p`
  margin: 0;
  width: 100%;
  height: 100%;
  color: var(--text);
  font-size: 1.2rem;
  line-height: 1.35;
  overflow: hidden;
  white-space: pre-wrap;
`;

const SlideElementList = styled.div`
  display: grid;
  gap: 0.55rem;
`;

const SlideElementCard = styled.div`
  border: 1px solid color-mix(in srgb, var(--greyDark) 26%, transparent);
  border-radius: 0.8rem;
  background: color-mix(in srgb, var(--gloomDark) 50%, transparent);
  padding: 0.6rem;
  display: grid;
  gap: 0.5rem;
`;

const ElementMeta = styled.p`
  margin: 0;
  font-size: 1.2rem;
  color: var(--muted);
`;

const MediaTile = styled.article`
  border: 1px solid color-mix(in srgb, var(--greyDark) 28%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--dark) 76%, transparent);
  padding: 0.55rem;
  display: grid;
  gap: 0.42rem;
  cursor: ${(p) => (p.$draggable ? 'grab' : 'default')};

  &:active {
    cursor: ${(p) => (p.$draggable ? 'grabbing' : 'default')};
  }
`;

const MediaIndex = styled.span`
  font-size: 1.15rem;
  color: var(--muted);
`;

const MediaThumb = styled.div`
  width: 100%;
  aspect-ratio: ${(p) => p.$ratio || '1 / 1'};
  border-radius: 10px;
  overflow: hidden;
  background: var(--black);

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
`;

const ArticleDraftPreview = styled.div`
  width: min(24rem, 100%);
  aspect-ratio: 16 / 10;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--greyDark) 32%, transparent);
  background: color-mix(in srgb, var(--gloomDark) 64%, transparent);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const MediaName = styled.p`
  margin: 0;
  color: var(--muted);
  font-size: 1.2rem;
  line-height: 1.35;
  overflow-wrap: anywhere;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

const ColorChip = styled.button`
  border: 1px solid color-mix(in srgb, var(--greyDark) 36%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--gloom) 64%, transparent);
  color: var(--text);
  font: inherit;
  font-size: 1.2rem;
  padding: 0.45rem 0.8rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
`;

const ColorSwatch = styled.span`
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--greyDark) 46%, transparent);
  background: ${(p) => p.$color || 'transparent'};
`;

const ActionButton = styled.button`
  border: 1px solid color-mix(in srgb, var(--greyDark) 36%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--gloom) 64%, transparent);
  color: var(--text);
  font: inherit;
  font-size: 1.35rem;
  font-weight: 600;
  padding: 0.65rem 1.1rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  ${(p) => p.$type === 'primary' && `
    border-color: color-mix(in srgb, var(--success) 38%, transparent);
    color: var(--ok);
    background: color-mix(in srgb, var(--success) 16%, var(--gloom));
  `}

  ${(p) => p.$type === 'danger' && `
    border-color: color-mix(in srgb, var(--error) 42%, transparent);
    color: var(--danger);
    background: color-mix(in srgb, var(--error) 12%, var(--gloom));
  `}
`;

const State = styled.p`
  margin-top: 14px;
  color: ${(p) => (p.$error ? 'var(--danger)' : 'var(--muted)')};
`;

const CaptionSource = styled.p`
  color: var(--muted);
  font-size: 1.3rem;
`;

const List = styled.section`
  margin-top: 20px;
  border-radius: 20px;
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--dark) 66%, transparent);
  box-shadow: var(--shadow);
  padding: 1rem;
`;

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
`;

const ListTitle = styled.h2`
  margin: 0;
  font-family: 'Syne', sans-serif;
  font-size: 2.2rem;
`;

const Overview = styled.div`
  margin-top: 0.85rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
`;

const OverviewCard = styled.article`
  position: relative;
  border-radius: 12px;
  padding: 0.62rem 0.72rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 30%, transparent);
  background: color-mix(in srgb, var(--gloom) 72%, transparent);
  ${(p) => p.$type === 'changes' && 'border-color: color-mix(in srgb, var(--error) 45%, transparent); background: color-mix(in srgb, var(--error) 26%, var(--dark));'}
  ${(p) => p.$type === 'ready' && 'border-color: color-mix(in srgb, var(--success) 45%, transparent); background: color-mix(in srgb, var(--success) 24%, var(--dark));'}
`;

const OverviewLabel = styled.span`
  display: block;
  color: var(--muted);
  font-size: 1.1rem;
  letter-spacing: 0.04em;
`;

const OverviewValue = styled.strong`
  display: block;
  margin-top: 0.25rem;
  font-size: 2rem;
  font-family: 'Syne', sans-serif;
`;

const Row = styled.article`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 24%, transparent);
  border-radius: 14px;
  background: color-mix(in srgb, var(--gloom) 62%, transparent);
  margin-top: 0.7rem;
`;

const RowMain = styled.div`
  flex: 1;
  min-width: 0;
`;

const RowHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.9rem;
`;

const RowThumb = styled.div`
  width: 5.4rem;
  height: 5.4rem;
  border-radius: 0.8rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--greyDark) 32%, transparent);
  background: color-mix(in srgb, var(--gloomDark) 70%, transparent);

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const RowHeadText = styled.div`
  min-width: 0;
`;

const EditLabel = styled.span`
  display: block;
  margin-top: 0.8rem;
  color: var(--muted);
  font-size: 1.2rem;
`;

const InlineCaption = styled.textarea`
  margin-top: 0.35rem;
  width: 100%;
  min-height: ${(p) => (p.$large ? '18rem' : '7.2rem')};
  border: 1px solid color-mix(in srgb, var(--greyDark) 35%, transparent);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--gloomDark) 56%, transparent);
  color: var(--text);
  font: inherit;
  font-size: 1.45rem;
  line-height: 1.4;
  padding: 0.9rem 1rem;
  resize: vertical;
`;

const EditActions = styled.div`
  margin-top: 0.65rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
`;

const MediaUploadLabel = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--greyDark) 36%, transparent);
  background: color-mix(in srgb, var(--gloom) 64%, transparent);
  color: var(--text);
  padding: 0.6rem 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const RowText = styled.p`
  margin: 0.3rem 0;
  font-size: 1.6rem;
  line-height: 1.45;
`;

const ChangeHistoryWrap = styled.div`
  margin-top: 0.5rem;
  display: grid;
  gap: 0.45rem;
`;

const ChangeLine = styled.p`
  margin: 0;
  font-size: 1.35rem;
  line-height: 1.45;
  color: color-mix(in srgb, var(--text) 88%, var(--muted));
  padding: 0.5rem 0.65rem;
  border-radius: 0.8rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 24%, transparent);
  background: color-mix(in srgb, var(--gloomDark) 54%, transparent);
`;

const RowActions = styled.div`
  display: grid;
  gap: 0.65rem;
  min-width: 19rem;
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 1.05rem;
  padding: 0.35rem 0.9rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 38%, transparent);
  color: var(--muted);
  ${(p) => p.$ok && 'border-color: color-mix(in srgb, var(--success) 50%, transparent); color: var(--ok);'}
  ${(p) => p.$danger && 'border-color: color-mix(in srgb, var(--error) 50%, transparent); color: var(--danger);'}
`;

const ReviewPill = styled(Pill)`
  font-size: 1.25rem;
  padding: 0.45rem 1rem;
  font-weight: 700;
  border-width: 2px;
  ${(p) => p.$state === 'approved' && 'border-color: color-mix(in srgb, var(--success) 55%, transparent); color: var(--ok); background: color-mix(in srgb, var(--success) 16%, var(--gloom));'}
  ${(p) => p.$state === 'rejected' && 'border-color: color-mix(in srgb, var(--error) 56%, transparent); color: var(--danger); background: color-mix(in srgb, var(--error) 14%, var(--gloom));'}
  ${(p) => p.$state === 'changes' && 'border-color: color-mix(in srgb, var(--warning) 58%, transparent); color: var(--warning); background: color-mix(in srgb, var(--warning) 18%, var(--gloom));'}
`;

function createSupabaseClient() {
  const config = window.APP_CONFIG || {};
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY || config.SUPABASE_URL.includes('PASTE_')) {
    return null;
  }
  return createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
}

function getClientSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('client') || '';
}

function slugFilename(name) {
  return name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
}

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

function reviewState(post) {
  const hasNotes = (post.client_notes || '').trim().length > 0;
  if (post.approval_status === 'approved' && !hasNotes) return 'ready';
  if (post.approval_status === 'disapproved' || hasNotes) return 'changes';
  return 'awaiting';
}

function postReviewStatus(post) {
  const hasNotes = (post.client_notes || '').trim().length > 0;
  if (post.approval_status === 'disapproved') return 'rejected';
  if (post.approval_status === 'approved') return 'approved';
  if (hasNotes) return 'changes';
  return 'awaiting';
}

function postReviewLabel(state) {
  if (state === 'approved') return 'Εγκρίθηκε';
  if (state === 'rejected') return 'Απορρίφθηκε';
  if (state === 'awaiting') return 'Σε αναμονή για έγκριση';
  return 'Χρειάζεται αλλαγές';
}

const CONTENT_TABS = {
  instagram: 'Instagram Feed',
  article: 'Άρθρα',
  logo: 'Logo Kit'
};

const CONTENT_PREFIX = {
  instagram: '[IG]',
  article: '[ARTICLE]',
  logo: '[LOGO]'
};

function parsePostType(post) {
  const value = `${post?.title || ''}`.trim();
  if (value.startsWith(CONTENT_PREFIX.article)) return 'article';
  if (value.startsWith(CONTENT_PREFIX.logo)) return 'logo';
  return 'instagram';
}

function stripPostTypePrefix(title) {
  const value = `${title || ''}`.trim();
  return value
    .replace(CONTENT_PREFIX.instagram, '')
    .replace(CONTENT_PREFIX.article, '')
    .replace(CONTENT_PREFIX.logo, '')
    .trim();
}

function makeTypedTitle(type, rawTitle) {
  const cleanTitle = `${rawTitle || ''}`.trim();
  const prefix = CONTENT_PREFIX[type] || CONTENT_PREFIX.instagram;
  return `${prefix} ${cleanTitle}`;
}

function instagramEntryMeta(post) {
  const value = stripPostTypePrefix(post?.title || '');
  if (value.startsWith('STORY::')) {
    return { kind: 'story', groupId: '', slideOrder: 0, fileName: value.replace('STORY::', '').trim() };
  }
  if (value.startsWith('CAROUSEL::')) {
    const parts = value.split('::');
    const groupId = `${parts[1] || ''}`.trim();
    const slideOrder = Number(parts[2] || 0);
    const fileName = `${parts.slice(3).join('::') || ''}`.trim();
    return { kind: 'carousel', groupId, slideOrder, fileName };
  }
  if (value.startsWith('SINGLE::')) {
    return { kind: 'single', groupId: '', slideOrder: 1, fileName: value.replace('SINGLE::', '').trim() };
  }
  return { kind: 'single', groupId: '', slideOrder: 1, fileName: value };
}

function isInstagramGridFile(file) {
  const ext = fileExtension(file?.name);
  return ext === '.png';
}

function logoEntryKind(post) {
  const value = stripPostTypePrefix(post?.title || '');
  if (value.startsWith('FONT::')) return 'font';
  if (value.startsWith('COLOR::')) return 'color';
  if (value.startsWith('STORY::')) return 'story';
  if (value.startsWith('VISUAL::')) return 'visual';
  return 'visual';
}

function logoEntryLabel(post) {
  const value = stripPostTypePrefix(post?.title || '');
  return value
    .replace('FONT::', '')
    .replace('COLOR::', '')
    .replace('STORY::', '')
    .replace('VISUAL::', '')
    .trim();
}

function parseParagraphs(text) {
  return `${text || ''}`
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildArticleChanges(baseText, clientText) {
  const beforeParagraphs = parseParagraphs(baseText);
  const afterParagraphs = parseParagraphs(clientText);
  const removed = beforeParagraphs
    .filter((paragraph) => !afterParagraphs.includes(paragraph))
    .map((paragraph) => ({ type: 'removed', paragraph }));
  const added = afterParagraphs
    .filter((paragraph) => !beforeParagraphs.includes(paragraph))
    .map((paragraph) => ({ type: 'added', paragraph }));
  return [...removed, ...added];
}

function isVideoFile(file) {
  return file?.type?.startsWith('video/');
}

function fileExtension(fileName) {
  const value = `${fileName || ''}`.toLowerCase().trim();
  const parts = value.split('.');
  return parts.length > 1 ? `.${parts.pop()}` : '';
}

function isLogoVisualFile(file) {
  const ext = fileExtension(file?.name);
  const type = `${file?.type || ''}`.toLowerCase();
  return type.startsWith('image/') || ext === '.svg' || ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.webp';
}

function isLogoFontFile(file) {
  const ext = fileExtension(file?.name);
  return ext === '.otf' || ext === '.ttf';
}

function normalizeHexColor(value) {
  const raw = `${value || ''}`.trim().toUpperCase();
  const withHash = raw.startsWith('#') ? raw : `#${raw}`;
  const valid = /^#([0-9A-F]{6}|[0-9A-F]{3})$/.test(withHash);
  return valid ? withHash : '';
}

function isVideoPost(post) {
  const value = `${post?.image_url || ''} ${post?.title || ''}`.toLowerCase();
  return ['.mp4', '.mov', '.webm', '.m4v'].some((ext) => value.includes(ext));
}

function parseCaptions(text) {
  const cleaned = (text || '').trim();
  if (!cleaned) return [];

  const byPost = [];
  const regex = /Post\s*(\d+)\s*:\s*([\s\S]*?)(?=(?:\n\s*Post\s*\d+\s*:)|$)/gi;
  let match = regex.exec(cleaned);

  while (match) {
    const index = Number(match[1]) - 1;
    if (index >= 0) byPost[index] = match[2].trim();
    match = regex.exec(cleaned);
  }

  if (byPost.some(Boolean)) return byPost;

  return cleaned
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createMediaItems(files) {
  return files.map((file) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    kind: isVideoFile(file) ? 'video' : 'image'
  }));
}

function AdminApp() {
  const [client, setClient] = useState(null);
  const [configError, setConfigError] = useState('');
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mediaItems, setMediaItems] = useState([]);
  const [carouselMediaItems, setCarouselMediaItems] = useState([]);
  const [instagramGridItems, setInstagramGridItems] = useState([]);
  const [instagramStoryItems, setInstagramStoryItems] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [orderLocked, setOrderLocked] = useState(false);
  const [captionsText, setCaptionsText] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [posts, setPosts] = useState([]);
  const [logoKits, setLogoKits] = useState([]);
  const [copyState, setCopyState] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSlug] = useState(getClientSlugFromUrl());
  const [captionDrafts, setCaptionDrafts] = useState({});
  const [replacementFiles, setReplacementFiles] = useState({});
  const [replacementPreviews, setReplacementPreviews] = useState({});
  const [activeTab, setActiveTab] = useState('instagram');
  const [articleDrafts, setArticleDrafts] = useState([
    { id: `${Date.now()}-article-1`, title: '', body: '', imageFile: null, imagePreview: '' }
  ]);
  const [logoBrandName, setLogoBrandName] = useState('');
  const [logoAgencyName, setLogoAgencyName] = useState('Doitforme');
  const [logoTagline, setLogoTagline] = useState('');
  const [logoShortDescription, setLogoShortDescription] = useState('');
  const [logoConceptLabel, setLogoConceptLabel] = useState('Concept 1');
  const [logoInspirationItems, setLogoInspirationItems] = useState([]);
  const [logoInspirationResultItems, setLogoInspirationResultItems] = useState([]);
  const [logoMainLogoItems, setLogoMainLogoItems] = useState([]);
  const [logoSecondaryLogoItems, setLogoSecondaryLogoItems] = useState([]);
  const [logoLogomarkItems, setLogoLogomarkItems] = useState([]);
  const [logoVariationItems, setLogoVariationItems] = useState([]);
  const [logoMascotPrimaryItems, setLogoMascotPrimaryItems] = useState([]);
  const [logoMascotPoseItems, setLogoMascotPoseItems] = useState([]);
  const [logoPatternItems, setLogoPatternItems] = useState([]);
  const [logoMockupItems, setLogoMockupItems] = useState([]);
  const [logoStickerItems, setLogoStickerItems] = useState([]);
  const [logoPrimaryFontItems, setLogoPrimaryFontItems] = useState([]);
  const [logoSecondaryFontItems, setLogoSecondaryFontItems] = useState([]);
  const [logoExtraFontItems, setLogoExtraFontItems] = useState([]);
  const [logoPrimaryColorInputs, setLogoPrimaryColorInputs] = useState(['']);
  const [logoSecondaryColorInputs, setLogoSecondaryColorInputs] = useState(['']);

  useEffect(() => {
    const supabaseClient = createSupabaseClient();
    if (!supabaseClient) {
      setConfigError('Ρύθμισε πρώτα το /public/config.js με SUPABASE_URL και SUPABASE_ANON_KEY.');
      return;
    }

    setClient(supabaseClient);

    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
    });

    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!client || !session || !clientSlug) return;
    loadSelectedClient();
  }, [client, session, clientSlug]);

  useEffect(() => {
    if (!client || !session || !selectedClient) return;
    loadPosts();
    loadLogoKits();
  }, [client, session, selectedClient]);

  useEffect(() => {
    return () => {
      Object.values(replacementPreviews).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [replacementPreviews]);

  useEffect(() => {
    return () => {
      articleDrafts.forEach((draft) => {
        if (draft.imagePreview) URL.revokeObjectURL(draft.imagePreview);
      });
      [
        carouselMediaItems,
        instagramGridItems,
        instagramStoryItems,
        logoInspirationItems,
        logoInspirationResultItems,
        logoMainLogoItems,
        logoSecondaryLogoItems,
        logoLogomarkItems,
        logoVariationItems,
        logoMascotPrimaryItems,
        logoMascotPoseItems,
        logoPatternItems,
        logoMockupItems,
        logoStickerItems,
        logoPrimaryFontItems,
        logoSecondaryFontItems,
        logoExtraFontItems
      ].forEach((collection) => {
        collection.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      });
    };
  }, [
    articleDrafts,
    carouselMediaItems,
    instagramGridItems,
    instagramStoryItems,
    logoInspirationItems,
    logoInspirationResultItems,
    logoMainLogoItems,
    logoSecondaryLogoItems,
    logoLogomarkItems,
    logoVariationItems,
    logoMascotPrimaryItems,
    logoMascotPoseItems,
    logoPatternItems,
    logoMockupItems,
    logoStickerItems,
    logoPrimaryFontItems,
    logoSecondaryFontItems,
    logoExtraFontItems
  ]);

  async function loadSelectedClient() {
    const { data, error } = await client
      .from('clients')
      .select('id,name,slug')
      .eq('slug', clientSlug)
      .single();

    if (error) {
      setStatus(`Client not found για slug "${clientSlug}".`);
      return;
    }

    setSelectedClient(data);
  }

  async function validateSelectedClientScope() {
    // Backend integration note:
    // Before any write request, validate that selected client_id still exists in clients table.
    if (!client || !session || !selectedClient?.id) return { ok: false, value: null };

    const { data, error } = await client
      .from('clients')
      .select('id,name,slug')
      .eq('id', selectedClient.id)
      .maybeSingle();

    if (error || !data) {
      setSelectedClient(null);
      setPosts([]);
      setLogoKits([]);
      setStatus('Ο επιλεγμένος client δεν υπάρχει πλέον. Πήγαινε Portal και άνοιξε ξανά τον admin.');
      return { ok: false, value: null };
    }

    if (data.slug !== selectedClient.slug || data.name !== selectedClient.name) {
      setSelectedClient(data);
    }

    return { ok: true, value: data };
  }

  async function loadPosts() {
    if (!selectedClient) return;

    const { data, error } = await client
      .from('posts')
      .select('id,title,caption,image_url,image_path,status,sort_order,created_at,approval_status,client_notes,client_id')
      .eq('client_id', selectedClient.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      setStatus(`Σφάλμα φόρτωσης: ${error.message}`);
      return;
    }

    setPosts(data || []);
  }

  async function loadLogoKits() {
    if (!selectedClient) return;
    const { data, error } = await client
      .from('logo_kits')
      .select('id,title,status,approval_status,client_notes,version,created_at,client_id')
      .eq('client_id', selectedClient.id)
      .order('version', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      setStatus(`Σφάλμα φόρτωσης logo kits: ${error.message}`);
      return;
    }

    setLogoKits(data || []);
  }

  function appendFiles(files) {
    if (orderLocked) {
      setStatus('Ξεκλείδωσε πρώτα τη σειρά αν θέλεις να προσθέσεις ή να αλλάξεις αρχεία.');
      return;
    }

    const validFiles = Array.from(files || []).filter((file) =>
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFiles.length === 0) {
      setStatus('Ρίξε μόνο αρχεία εικόνας/βίντεο.');
      return;
    }

    const nextItems = createMediaItems(validFiles);
    setMediaItems((prev) => [...prev, ...nextItems]);
    setStatus(`Προστέθηκαν ${validFiles.length} αρχεία.`);
  }

  function appendInstagramGridFiles(files) {
    const validFiles = Array.from(files || []).filter((file) => isInstagramGridFile(file));
    if (validFiles.length === 0) {
      setStatus('Η ενιαία 9άδα δέχεται μόνο 1 αρχείο .png.');
      return;
    }
    const nextItems = createMediaItems([validFiles[0]]).map((item) => ({ ...item, kind: 'image' }));
    setInstagramGridItems((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return nextItems;
    });
    setStatus('Φορτώθηκε το PNG για την ενιαία 9άδα.');
  }

  function appendCarouselFiles(files) {
    const validFiles = Array.from(files || []).filter((file) =>
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    if (validFiles.length === 0) {
      setStatus('Το carousel δέχεται εικόνες ή βίντεο.');
      return;
    }
    const nextItems = createMediaItems(validFiles);
    setCarouselMediaItems((prev) => [...prev, ...nextItems]);
    setStatus(`Προστέθηκαν ${nextItems.length} αρχεία στο carousel.`);
  }

  function removeCarouselMedia(itemId) {
    setCarouselMediaItems((prev) => {
      const found = prev.find((item) => item.id === itemId);
      if (found?.previewUrl) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((item) => item.id !== itemId);
    });
  }

  function appendInstagramStories(files) {
    const validFiles = Array.from(files || []).filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'));
    if (validFiles.length === 0) {
      setStatus('Τα stories δέχονται μόνο εικόνες ή βίντεο.');
      return;
    }
    const nextItems = createMediaItems(validFiles);
    setInstagramStoryItems((prev) => [...prev, ...nextItems]);
    setStatus(`Προστέθηκαν ${nextItems.length} stories draft.`);
  }

  function removeInstagramStoryItem(itemId) {
    setInstagramStoryItems((prev) => {
      const selected = prev.find((item) => item.id === itemId);
      if (selected?.previewUrl) URL.revokeObjectURL(selected.previewUrl);
      return prev.filter((item) => item.id !== itemId);
    });
  }

  function reorderItems(fromIndex, toIndex) {
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    setMediaItems((prev) => {
      const copy = [...prev];
      const [picked] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, picked);
      return copy;
    });
  }

  function handleTileDrop(targetId) {
    if (orderLocked || !draggedId) return;
    const fromIndex = mediaItems.findIndex((item) => item.id === draggedId);
    const toIndex = mediaItems.findIndex((item) => item.id === targetId);
    reorderItems(fromIndex, toIndex);
    setDraggedId(null);
  }

  function removeMedia(id) {
    if (orderLocked) return;
    setMediaItems((prev) => {
      const found = prev.find((item) => item.id === id);
      if (found) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }

  function clearMedia() {
    if (orderLocked) return;
    mediaItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setMediaItems([]);
    setStatus('Η λίστα αρχείων καθαρίστηκε.');
  }

  function addArticleDraft() {
    setArticleDrafts((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title: '', body: '', imageFile: null, imagePreview: '' }
    ]);
  }

  function updateArticleDraftField(draftId, field, value) {
    setArticleDrafts((prev) =>
      prev.map((draft) => (draft.id === draftId ? { ...draft, [field]: value } : draft))
    );
  }

  function setArticleDraftFile(draftId, file) {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setArticleDrafts((prev) =>
      prev.map((draft) => {
        if (draft.id !== draftId) return draft;
        if (draft.imagePreview) URL.revokeObjectURL(draft.imagePreview);
        return { ...draft, imageFile: file, imagePreview: previewUrl };
      })
    );
  }

  function removeArticleDraft(draftId) {
    setArticleDrafts((prev) => {
      const selected = prev.find((draft) => draft.id === draftId);
      if (selected?.imagePreview) URL.revokeObjectURL(selected.imagePreview);
      const next = prev.filter((draft) => draft.id !== draftId);
      if (next.length > 0) return next;
      return [{ id: `${Date.now()}-article-base`, title: '', body: '', imageFile: null, imagePreview: '' }];
    });
  }

  async function publishArticles() {
    if (!client || !session || !selectedClient) return;
    const clientScope = await validateSelectedClientScope();
    if (!clientScope.ok) return;

    const readyDrafts = articleDrafts
      .map((draft) => ({ ...draft, title: draft.title.trim(), body: draft.body.trim() }))
      .filter((draft) => draft.title.length > 0 && draft.body.length > 0);

    if (readyDrafts.length === 0) {
      setStatus('Συμπλήρωσε τίτλο και κείμενο σε τουλάχιστον 1 άρθρο πριν τη δημοσίευση.');
      return;
    }

    setBusy(true);
    setStatus('Γίνεται ανέβασμα άρθρων...');
    const bucket = (window.APP_CONFIG && window.APP_CONFIG.STORAGE_BUCKET) || 'post-photos';
    const highestSortOrder = posts.reduce((max, post) => Math.max(max, post.sort_order || 0), 0);

    for (let i = 0; i < readyDrafts.length; i += 1) {
      const draft = readyDrafts[i];
      let imagePath = '';
      let imageUrl = '';

      if (draft.imageFile) {
        const fileName = `${Date.now()}-article-${i}-${slugFilename(draft.imageFile.name)}`;
        const path = `${session.user.id}/${fileName}`;
        const { error: uploadError } = await client.storage
          .from(bucket)
          .upload(path, draft.imageFile, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          setStatus(`Σφάλμα upload άρθρου (${draft.title}): ${uploadError.message}`);
          setBusy(false);
          return;
        }

        const { data: publicData } = client.storage.from(bucket).getPublicUrl(path);
        imagePath = path;
        imageUrl = publicData.publicUrl;
      }

      const payload = {
        title: makeTypedTitle('article', draft.title),
        caption: draft.body,
        image_url: imageUrl,
        image_path: imagePath,
        client_id: clientScope.value.id,
        status: 'published',
        approval_status: 'pending',
        client_notes: '',
        username: 'content.writer',
        like_count: 0,
        sort_order: highestSortOrder + i + 1
      };

      const { error: insertError } = await client.from('posts').insert(payload);
      if (insertError) {
        setStatus(`Σφάλμα βάσης άρθρου (${draft.title}): ${insertError.message}`);
        setBusy(false);
        return;
      }
    }

    articleDrafts.forEach((draft) => {
      if (draft.imagePreview) URL.revokeObjectURL(draft.imagePreview);
    });
    setArticleDrafts([{ id: `${Date.now()}-article-reset`, title: '', body: '', imageFile: null, imagePreview: '' }]);
    setStatus(`Ολοκληρώθηκε. Δημοσιεύτηκαν ${readyDrafts.length} άρθρα.`);
    await loadPosts();
    setBusy(false);
  }

  function isPngOrSvgFile(file) {
    const ext = fileExtension(file?.name);
    return ext === '.png' || ext === '.svg' || ext === '.jpg' || ext === '.jpeg';
  }

  function buildUploadItems(files) {
    return createMediaItems(files).map((item) => ({ ...item, kind: 'image' }));
  }

  function appendSingleImage(setter, files, errorMessage) {
    const validFiles = Array.from(files || []).filter((file) => isPngOrSvgFile(file));
    if (validFiles.length === 0) {
      setStatus(errorMessage);
      return;
    }
    const first = validFiles[0];
    const nextItems = buildUploadItems([first]);
    setter((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return nextItems;
    });
  }

  function appendMultiImages(setter, files, validator, errorMessage) {
    const validFiles = Array.from(files || []).filter((file) => validator(file));
    if (validFiles.length === 0) {
      setStatus(errorMessage);
      return;
    }
    const nextItems = buildUploadItems(validFiles);
    setter((prev) => [...prev, ...nextItems]);
  }

  function removeUploadItem(setter, itemId) {
    setter((prev) => {
      const selected = prev.find((item) => item.id === itemId);
      if (selected?.previewUrl) URL.revokeObjectURL(selected.previewUrl);
      return prev.filter((item) => item.id !== itemId);
    });
  }

  function appendSingleFont(setter, files) {
    const validFiles = Array.from(files || []).filter((file) => isLogoFontFile(file));
    if (validFiles.length === 0) {
      setStatus('Για fonts επίλεξε μόνο .otf ή .ttf.');
      return;
    }
    const nextItems = createMediaItems([validFiles[0]]).map((item) => ({ ...item, kind: 'font' }));
    setter((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return nextItems;
    });
  }

  function appendExtraFonts(files) {
    const validFiles = Array.from(files || []).filter((file) => isLogoFontFile(file));
    if (validFiles.length === 0) {
      setStatus('Για extra fonts επίλεξε μόνο .otf ή .ttf.');
      return;
    }
    const nextItems = createMediaItems(validFiles).map((item) => ({ ...item, kind: 'font' }));
    setLogoExtraFontItems((prev) => [...prev, ...nextItems]);
  }

  function updatePrimaryColorInput(index, value) {
    setLogoPrimaryColorInputs((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function updateSecondaryColorInput(index, value) {
    setLogoSecondaryColorInputs((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function addPrimaryColorInput() {
    setLogoPrimaryColorInputs((prev) => [...prev, '']);
  }

  function addSecondaryColorInput() {
    setLogoSecondaryColorInputs((prev) => [...prev, '']);
  }

  function removePrimaryColorInput(index) {
    setLogoPrimaryColorInputs((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      if (next.length > 0) return next;
      return [''];
    });
  }

  function removeSecondaryColorInput(index) {
    setLogoSecondaryColorInputs((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      if (next.length > 0) return next;
      return [''];
    });
  }

  function clearLogoDraft() {
    [
      logoInspirationItems,
      logoInspirationResultItems,
      logoMainLogoItems,
      logoSecondaryLogoItems,
      logoLogomarkItems,
      logoVariationItems,
      logoMascotPrimaryItems,
      logoMascotPoseItems,
      logoPatternItems,
      logoMockupItems,
      logoStickerItems,
      logoPrimaryFontItems,
      logoSecondaryFontItems,
      logoExtraFontItems
    ].forEach((collection) => {
      collection.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    });
    setLogoBrandName('');
    setLogoAgencyName('Doitforme');
    setLogoTagline('');
    setLogoShortDescription('');
    setLogoConceptLabel('Concept 1');
    setLogoInspirationItems([]);
    setLogoInspirationResultItems([]);
    setLogoMainLogoItems([]);
    setLogoSecondaryLogoItems([]);
    setLogoLogomarkItems([]);
    setLogoVariationItems([]);
    setLogoMascotPrimaryItems([]);
    setLogoMascotPoseItems([]);
    setLogoPatternItems([]);
    setLogoMockupItems([]);
    setLogoStickerItems([]);
    setLogoPrimaryFontItems([]);
    setLogoSecondaryFontItems([]);
    setLogoExtraFontItems([]);
    setLogoPrimaryColorInputs(['']);
    setLogoSecondaryColorInputs(['']);
    setStatus('Καθαρίστηκε το logo kit draft.');
  }

  async function publishLogoKit() {
    if (!client || !session || !selectedClient) return;
    const clientScope = await validateSelectedClientScope();
    if (!clientScope.ok) return;
    const hasMainLogo = logoMainLogoItems.length > 0;
    if (!hasMainLogo) {
      setStatus('Ανέβασε τουλάχιστον Main Logo πριν το Generate Presentation.');
      return;
    }

    setBusy(true);
    setStatus('Γίνεται ανέβασμα logo kit...');
    const bucket = (window.APP_CONFIG && window.APP_CONFIG.STORAGE_BUCKET) || 'post-photos';
    const nextVersion = (logoKits[0]?.version || 0) + 1;
    const { data: insertedKit, error: insertKitError } = await client
      .from('logo_kits')
      .insert({
        client_id: clientScope.value.id,
        title: `${(logoBrandName || '').trim() || 'Logo Kit'} v${nextVersion}`,
        status: 'published',
        approval_status: 'pending',
        client_notes: '',
        version: nextVersion
      })
      .select('id')
      .single();

    if (insertKitError || !insertedKit?.id) {
      setStatus(`Σφάλμα δημιουργίας logo kit: ${insertKitError?.message || 'Άγνωστο σφάλμα'}`);
      setBusy(false);
      return;
    }

    let sortOffset = 0;

    const uploadVisualGroup = async (items, prefix, label) => {
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const fileName = `${Date.now()}-${prefix.toLowerCase()}-${i}-${slugFilename(item.file.name)}`;
        const path = `${session.user.id}/${fileName}`;
        const { error: uploadError } = await client.storage
          .from(bucket)
          .upload(path, item.file, { cacheControl: '3600', upsert: false });
        if (uploadError) {
          setStatus(`Σφάλμα upload ${label} (${item.file.name}): ${uploadError.message}`);
          return { ok: false };
        }
        const { data: publicData } = client.storage.from(bucket).getPublicUrl(path);
        const { error: insertError } = await client.from('logo_assets').insert({
          logo_kit_id: insertedKit.id,
          asset_type: 'visual',
          file_name: `${prefix}::${item.file.name}`,
          file_ext: fileExtension(item.file.name),
          file_url: publicData.publicUrl,
          file_path: path,
          sort_order: sortOffset
        });
        sortOffset += 1;
        if (insertError) {
          setStatus(`Σφάλμα βάσης ${label} (${item.file.name}): ${insertError.message}`);
          return { ok: false };
        }
      }
      return { ok: true };
    };

    const uploadFontGroup = async (items, prefix) => {
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const fileName = `${Date.now()}-${prefix.toLowerCase()}-${i}-${slugFilename(item.file.name)}`;
        const path = `${session.user.id}/${fileName}`;
        const { error: uploadError } = await client.storage
          .from(bucket)
          .upload(path, item.file, { cacheControl: '3600', upsert: false });
        if (uploadError) {
          setStatus(`Σφάλμα upload font (${item.file.name}): ${uploadError.message}`);
          return { ok: false };
        }
        const { data: publicData } = client.storage.from(bucket).getPublicUrl(path);
        const { error: insertError } = await client.from('logo_assets').insert({
          logo_kit_id: insertedKit.id,
          asset_type: 'font',
          file_name: `${prefix}::${item.file.name}`,
          file_ext: fileExtension(item.file.name),
          file_url: publicData.publicUrl,
          file_path: path,
          sort_order: sortOffset
        });
        sortOffset += 1;
        if (insertError) {
          setStatus(`Σφάλμα βάσης font (${item.file.name}): ${insertError.message}`);
          return { ok: false };
        }
      }
      return { ok: true };
    };

    const uploadGroups = [
      { items: logoInspirationItems, prefix: 'INSPIRATION', label: 'inspiration image' },
      { items: logoInspirationResultItems, prefix: 'INSPIRATION_RESULT', label: 'inspiration result image' },
      { items: logoMainLogoItems, prefix: 'MAIN_LOGO', label: 'main logo' },
      { items: logoSecondaryLogoItems, prefix: 'SECONDARY_LOGO', label: 'secondary logo' },
      { items: logoLogomarkItems, prefix: 'LOGOMARK', label: 'logomark' },
      { items: logoVariationItems, prefix: 'LOGO_VARIATION', label: 'logo variation' },
      { items: logoMascotPrimaryItems, prefix: 'MASCOT_PRIMARY', label: 'mascot primary' },
      { items: logoMascotPoseItems, prefix: 'MASCOT_POSE', label: 'mascot pose' },
      { items: logoPatternItems, prefix: 'PATTERN', label: 'pattern' },
      { items: logoMockupItems, prefix: 'MOCKUP', label: 'mockup' },
      { items: logoStickerItems, prefix: 'STICKER', label: 'sticker' }
    ];

    for (let i = 0; i < uploadGroups.length; i += 1) {
      const result = await uploadVisualGroup(uploadGroups[i].items, uploadGroups[i].prefix, uploadGroups[i].label);
      if (!result.ok) {
        setBusy(false);
        return;
      }
    }

    const primaryFontResult = await uploadFontGroup(logoPrimaryFontItems, 'FONT_PRIMARY');
    if (!primaryFontResult.ok) {
      setBusy(false);
      return;
    }
    const secondaryFontResult = await uploadFontGroup(logoSecondaryFontItems, 'FONT_SECONDARY');
    if (!secondaryFontResult.ok) {
      setBusy(false);
      return;
    }
    const extraFontResult = await uploadFontGroup(logoExtraFontItems, 'FONT_EXTRA');
    if (!extraFontResult.ok) {
      setBusy(false);
      return;
    }

    const primaryColors = logoPrimaryColorInputs.map((value) => normalizeHexColor(value)).filter(Boolean);
    const secondaryColors = logoSecondaryColorInputs.map((value) => normalizeHexColor(value)).filter(Boolean);

    for (let i = 0; i < primaryColors.length; i += 1) {
      const color = primaryColors[i];
      const { error: insertError } = await client.from('logo_colors').insert({
        logo_kit_id: insertedKit.id,
        hex_color: color,
        sort_order: i
      });
      if (insertError) {
        setStatus(`Σφάλμα βάσης color (${color}): ${insertError.message}`);
        setBusy(false);
        return;
      }
    }

    for (let i = 0; i < secondaryColors.length; i += 1) {
      const color = secondaryColors[i];
      const { error: insertError } = await client.from('logo_colors').insert({
        logo_kit_id: insertedKit.id,
        hex_color: color,
        sort_order: 1000 + i
      });
      if (insertError) {
        setStatus(`Σφάλμα βάσης secondary color (${color}): ${insertError.message}`);
        setBusy(false);
        return;
      }
    }

    const metaPayload = {
      type: 'logo_presentation_meta_v1',
      brandName: (logoBrandName || '').trim(),
      agencyName: (logoAgencyName || '').trim(),
      tagline: (logoTagline || '').trim(),
      shortDescription: (logoShortDescription || '').trim(),
      conceptLabel: (logoConceptLabel || '').trim() || 'Concept 1'
    };
    const { error: metaError } = await client.from('logo_story_steps').insert({
      logo_kit_id: insertedKit.id,
      step_order: 1,
      step_text: JSON.stringify(metaPayload)
    });
    if (metaError) {
      setStatus(`Σφάλμα βάσης metadata: ${metaError.message}`);
      setBusy(false);
      return;
    }

    [
      logoInspirationItems,
      logoInspirationResultItems,
      logoMainLogoItems,
      logoSecondaryLogoItems,
      logoLogomarkItems,
      logoVariationItems,
      logoMascotPrimaryItems,
      logoMascotPoseItems,
      logoPatternItems,
      logoMockupItems,
      logoStickerItems,
      logoPrimaryFontItems,
      logoSecondaryFontItems,
      logoExtraFontItems
    ].forEach((collection) => {
      collection.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    });
    setLogoBrandName('');
    setLogoAgencyName('Doitforme');
    setLogoTagline('');
    setLogoShortDescription('');
    setLogoConceptLabel('Concept 1');
    setLogoInspirationItems([]);
    setLogoInspirationResultItems([]);
    setLogoMainLogoItems([]);
    setLogoSecondaryLogoItems([]);
    setLogoLogomarkItems([]);
    setLogoVariationItems([]);
    setLogoMascotPrimaryItems([]);
    setLogoMascotPoseItems([]);
    setLogoPatternItems([]);
    setLogoMockupItems([]);
    setLogoStickerItems([]);
    setLogoPrimaryFontItems([]);
    setLogoSecondaryFontItems([]);
    setLogoExtraFontItems([]);
    setLogoPrimaryColorInputs(['']);
    setLogoSecondaryColorInputs(['']);
    setStatus('Ολοκληρώθηκε. Το logo kit δημοσιεύτηκε με fixed presentation template.');
    await loadPosts();
    await loadLogoKits();
    setBusy(false);
    return;
  }

  async function handleSignIn(event) {
    event.preventDefault();
    if (!client) return;

    setBusy(true);
    setStatus('Γίνεται σύνδεση...');

    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus(`Σφάλμα σύνδεσης: ${error.message}`);
      setBusy(false);
      return;
    }

    setStatus('Συνδέθηκες επιτυχώς.');
    setBusy(false);
  }

  async function handleSignOut() {
    if (!client) return;
    const { error } = await client.auth.signOut();
    setSession(null);
    setSelectedClient(null);
    setPosts([]);
    setLogoKits([]);
    setStatus(error ? `Σφάλμα αποσύνδεσης: ${error.message}` : 'Έγινε αποσύνδεση.');
    window.location.href = './portal.html';
  }

  async function handleUpload(event) {
    event.preventDefault();
    if (!client || !session || !selectedClient) return;
    const clientScope = await validateSelectedClientScope();
    if (!clientScope.ok) return;

    const totalUploads = mediaItems.length + carouselMediaItems.length + instagramStoryItems.length + instagramGridItems.length;
    if (totalUploads === 0) {
      setStatus('Βήμα 1: Ανέβασε τουλάχιστον ένα feed post, carousel, story ή png 9άδας.');
      return;
    }

    if (mediaItems.length > 0 && !orderLocked) {
      setStatus('Βήμα 2: Κλείδωσε την τελική σειρά αναρτήσεων πριν το ανέβασμα.');
      return;
    }

    const captions = parseCaptions(captionsText);
    const highestSortOrder = posts.reduce((max, post) => Math.max(max, post.sort_order || 0), 0);
    const nextSortOrderStart = highestSortOrder + 1;
    setBusy(true);
    setStatus('Γίνεται ανέβασμα και δημιουργία αναρτήσεων...');

    const bucket = (window.APP_CONFIG && window.APP_CONFIG.STORAGE_BUCKET) || 'post-photos';

    const dynamicUsername = (selectedClient?.slug || selectedClient?.name || '').trim();
    let sortOrderCursor = nextSortOrderStart;
    for (let i = 0; i < mediaItems.length; i += 1) {
      const item = mediaItems[i];
      const file = item.file;
      const fileName = `${Date.now()}-${i}-${slugFilename(file.name)}`;
      const path = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await client.storage
        .from(bucket)
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        setStatus(`Σφάλμα upload (${file.name}): ${uploadError.message}`);
        setBusy(false);
        return;
      }

      const { data: publicData } = client.storage.from(bucket).getPublicUrl(path);

      const payload = {
        title: makeTypedTitle('instagram', `SINGLE::${file.name}`),
        image_url: publicData.publicUrl,
        image_path: path,
        caption: captions[i] || `Post ${sortOrderCursor}: Η λεζάντα εκκρεμεί.`,
        client_id: clientScope.value.id,
        status: 'published',
        approval_status: 'pending',
        client_notes: '',
        username: dynamicUsername,
        like_count: 160 + i * 20,
        sort_order: sortOrderCursor
      };

      const { error: insertError } = await client.from('posts').insert(payload);
      if (insertError) {
        setStatus(`Σφάλμα βάσης (${file.name}): ${insertError.message}`);
        setBusy(false);
        return;
      }
      sortOrderCursor += 1;
    }

    if (carouselMediaItems.length > 0) {
      const carouselGroupId = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      for (let i = 0; i < carouselMediaItems.length; i += 1) {
        const item = carouselMediaItems[i];
        const file = item.file;
        const fileName = `${Date.now()}-carousel-${i}-${slugFilename(file.name)}`;
        const path = `${session.user.id}/${fileName}`;

        const { error: uploadError } = await client.storage
          .from(bucket)
          .upload(path, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          setStatus(`Σφάλμα upload (${file.name}): ${uploadError.message}`);
          setBusy(false);
          return;
        }

        const { data: publicData } = client.storage.from(bucket).getPublicUrl(path);

        const payload = {
          title: makeTypedTitle('instagram', `CAROUSEL::${carouselGroupId}::${i + 1}::${file.name}`),
          image_url: publicData.publicUrl,
          image_path: path,
          caption: captions[mediaItems.length] || `Carousel ${sortOrderCursor}: Η λεζάντα εκκρεμεί.`,
          client_id: clientScope.value.id,
          status: 'published',
          approval_status: 'pending',
          client_notes: '',
          username: dynamicUsername,
          like_count: 160,
          sort_order: sortOrderCursor
        };

        const { error: insertError } = await client.from('posts').insert(payload);
        if (insertError) {
          setStatus(`Σφάλμα βάσης (${file.name}): ${insertError.message}`);
          setBusy(false);
          return;
        }
      }
      sortOrderCursor += 1;
    }

    for (let i = 0; i < instagramStoryItems.length; i += 1) {
      const storyItem = instagramStoryItems[i];
      const file = storyItem.file;
      const fileName = `${Date.now()}-story-${i}-${slugFilename(file.name)}`;
      const path = `${session.user.id}/${fileName}`;
      const { error: uploadError } = await client.storage
        .from(bucket)
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        setStatus(`Σφάλμα upload story (${file.name}): ${uploadError.message}`);
        setBusy(false);
        return;
      }

      const { data: publicData } = client.storage.from(bucket).getPublicUrl(path);
      const payload = {
        title: makeTypedTitle('instagram', `STORY::${file.name}`),
        image_url: publicData.publicUrl,
        image_path: path,
        caption: '',
        client_id: clientScope.value.id,
        status: 'published',
        approval_status: 'pending',
        client_notes: '',
        username: dynamicUsername,
        like_count: 0,
        sort_order: sortOrderCursor + i
      };
      const { error: insertError } = await client.from('posts').insert(payload);
      if (insertError) {
        setStatus(`Σφάλμα βάσης story (${file.name}): ${insertError.message}`);
        setBusy(false);
        return;
      }
    }

    if (instagramGridItems.length > 0) {
      const gridItem = instagramGridItems[0];
      const file = gridItem.file;
      const fileName = `${Date.now()}-grid9-${slugFilename(file.name)}`;
      const path = `${session.user.id}/${fileName}`;
      const { error: uploadError } = await client.storage
        .from(bucket)
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (uploadError) {
        setStatus(`Σφάλμα upload 9άδας (${file.name}): ${uploadError.message}`);
        setBusy(false);
        return;
      }
      const { data: publicData } = client.storage.from(bucket).getPublicUrl(path);
      const payload = {
        title: makeTypedTitle('instagram', `GRID9::${file.name}`),
        image_url: publicData.publicUrl,
        image_path: path,
        caption: 'Έτσι θα διαμορφωθεί το Instagram feed σας μετά τη δημοσίευση όλων των posts.',
        client_id: clientScope.value.id,
        status: 'published',
        approval_status: 'pending',
        client_notes: '',
        username: dynamicUsername,
        like_count: 0,
        sort_order: sortOrderCursor + instagramStoryItems.length + 1
      };
      const { error: insertError } = await client.from('posts').insert(payload);
      if (insertError) {
        setStatus(`Σφάλμα βάσης 9άδας (${file.name}): ${insertError.message}`);
        setBusy(false);
        return;
      }
    }

    mediaItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    carouselMediaItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    instagramStoryItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    instagramGridItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setMediaItems([]);
    setCarouselMediaItems([]);
    setInstagramStoryItems([]);
    setInstagramGridItems([]);
    setOrderLocked(false);
    setCaptionsText('');
    setStatus(`Ολοκληρώθηκε. Ανέβηκαν ${mediaItems.length} single, ${carouselMediaItems.length} carousel slides, ${instagramStoryItems.length} stories.`);
    await loadPosts();
    setBusy(false);
  }

  function createPreviewUrl(contentType = 'instagram') {
    if (!selectedClient) return '';
    return `${window.location.origin}/public/index.html?client=${encodeURIComponent(selectedClient.slug)}&mode=${contentType}`;
  }

  function openClientPreviewTab(contentType = activeTab) {
    if (!selectedClient) return;
    window.open(`./index.html?client=${encodeURIComponent(selectedClient.slug)}&mode=${contentType}`, '_blank', 'noopener,noreferrer');
  }

  async function copyClientShareLink(contentType = activeTab) {
    if (!selectedClient) return;
    const shareUrl = createPreviewUrl(contentType);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState(`Το share link για "${CONTENT_TABS[contentType]}" αντιγράφηκε.`);
    } catch (_error) {
      setCopyState('Δεν έγινε αντιγραφή του share link.');
    }
  }

  function handleCaptionDraft(postId, value) {
    setCaptionDrafts((prev) => ({ ...prev, [postId]: value }));
  }

  function handleReplacementSelect(post, file) {
    if (!file) return;
    const nextPreviewUrl = URL.createObjectURL(file);

    setReplacementPreviews((prev) => {
      const oldPreviewUrl = prev[post.id];
      if (oldPreviewUrl) URL.revokeObjectURL(oldPreviewUrl);
      return { ...prev, [post.id]: nextPreviewUrl };
    });
    setReplacementFiles((prev) => ({ ...prev, [post.id]: file }));
    setStatus(`Επιλέχθηκε νέο αρχείο για το "${stripPostTypePrefix(post.title)}". Πάτησε αποθήκευση αλλαγών.`);
  }

  async function savePostEdits(post) {
    if (!client || !session) return;
    setBusy(true);
    setStatus(`Αποθήκευση αλλαγών για "${stripPostTypePrefix(post.title)}"...`);

    const bucket = (window.APP_CONFIG && window.APP_CONFIG.STORAGE_BUCKET) || 'post-photos';
    const selectedFile = replacementFiles[post.id];
    const nextCaption = captionDrafts[post.id] ?? post.caption;
    let nextImageUrl = post.image_url;
    let nextImagePath = post.image_path;
    let nextTitle = post.title;

    if (selectedFile) {
      const nextFileName = `${Date.now()}-${slugFilename(selectedFile.name)}`;
      const nextPath = `${session.user.id}/${nextFileName}`;
      const { error: uploadError } = await client.storage
        .from(bucket)
        .upload(nextPath, selectedFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        setStatus(`Σφάλμα upload (${selectedFile.name}): ${uploadError.message}`);
        setBusy(false);
        return;
      }

      const { data: publicData } = client.storage.from(bucket).getPublicUrl(nextPath);
      nextImageUrl = publicData.publicUrl;
      nextImagePath = nextPath;
      nextTitle = makeTypedTitle(parsePostType(post), selectedFile.name);
    }

    const { error: updateError } = await client
      .from('posts')
      .update({
        caption: nextCaption,
        title: nextTitle,
        image_url: nextImageUrl,
        image_path: nextImagePath
      })
      .eq('id', post.id);

    if (updateError) {
      setStatus(`Σφάλμα αποθήκευσης: ${updateError.message}`);
      setBusy(false);
      return;
    }

    if (selectedFile && post.image_path && post.image_path !== nextImagePath) {
      await client.storage.from(bucket).remove([post.image_path]);
    }

    setCaptionDrafts((prev) => {
      const next = { ...prev };
      delete next[post.id];
      return next;
    });
    setReplacementFiles((prev) => {
      const next = { ...prev };
      delete next[post.id];
      return next;
    });
    setReplacementPreviews((prev) => {
      const oldPreviewUrl = prev[post.id];
      if (oldPreviewUrl) URL.revokeObjectURL(oldPreviewUrl);
      const next = { ...prev };
      delete next[post.id];
      return next;
    });

    setStatus(`Οι αλλαγές για "${stripPostTypePrefix(nextTitle)}" αποθηκεύτηκαν.`);
    await loadPosts();
    setBusy(false);
  }

  async function deletePostPermanently(post) {
    if (!client) return;
    const confirmed = window.confirm(`Να διαγραφεί οριστικά το "${stripPostTypePrefix(post.title)}"; Αυτή η ενέργεια δεν αναιρείται.`);
    if (!confirmed) return;

    setBusy(true);
    setStatus(`Διαγραφή ${stripPostTypePrefix(post.title)}...`);

    const bucket = (window.APP_CONFIG && window.APP_CONFIG.STORAGE_BUCKET) || 'post-photos';

    if (post.image_path) {
      const { error: storageError } = await client.storage.from(bucket).remove([post.image_path]);
      if (storageError) {
        setStatus(`Σφάλμα διαγραφής storage: ${storageError.message}`);
        setBusy(false);
        return;
      }
    }

    const { error: deleteError } = await client.from('posts').delete().eq('id', post.id);
    if (deleteError) {
      setStatus(`Σφάλμα διαγραφής βάσης: ${deleteError.message}`);
      setBusy(false);
      return;
    }

    setStatus(`Το "${stripPostTypePrefix(post.title)}" διαγράφηκε οριστικά.`);
    await loadPosts();
    setBusy(false);
  }

  async function applyClientArticleEdits(post) {
    if (!client) return;
    const clientText = `${post.client_notes || ''}`.trim();
    if (!clientText) {
      setStatus('Δεν υπάρχει αποθηκευμένη αλλαγή πελάτη για εφαρμογή.');
      return;
    }

    setBusy(true);
    setStatus(`Εφαρμογή αλλαγών πελάτη για "${stripPostTypePrefix(post.title)}"...`);

    const { error: updateError } = await client
      .from('posts')
      .update({
        caption: clientText,
        client_notes: '',
        approval_status: 'approved'
      })
      .eq('id', post.id);

    if (updateError) {
      setStatus(`Σφάλμα εφαρμογής αλλαγών: ${updateError.message}`);
      setBusy(false);
      return;
    }

    setStatus(`Το άρθρο "${stripPostTypePrefix(post.title)}" ενημερώθηκε με το κείμενο πελάτη.`);
    await loadPosts();
    setBusy(false);
  }

  async function copyClientArticleText(post) {
    const clientText = `${post.client_notes || ''}`.trim();
    if (!clientText) {
      setStatus('Δεν υπάρχει κείμενο πελάτη για αντιγραφή.');
      return;
    }

    try {
      await navigator.clipboard.writeText(clientText);
      setStatus(`Αντιγράφηκε το κείμενο πελάτη για "${stripPostTypePrefix(post.title)}".`);
    } catch (_error) {
      setStatus('Η αντιγραφή απέτυχε.');
    }
  }

  async function deleteLogoKitPermanently(logoKit) {
    if (!client || !logoKit) return;
    const confirmed = window.confirm(`Να διαγραφεί οριστικά το "${logoKit.title}";`);
    if (!confirmed) return;

    setBusy(true);
    setStatus(`Διαγραφή ${logoKit.title}...`);
    const bucket = (window.APP_CONFIG && window.APP_CONFIG.STORAGE_BUCKET) || 'post-photos';

    const { data: assets, error: assetsError } = await client
      .from('logo_assets')
      .select('id,file_path')
      .eq('logo_kit_id', logoKit.id);

    if (assetsError) {
      setStatus(`Σφάλμα φόρτωσης assets: ${assetsError.message}`);
      setBusy(false);
      return;
    }

    const paths = (assets || []).map((asset) => asset.file_path).filter(Boolean);
    if (paths.length > 0) {
      const { error: storageError } = await client.storage.from(bucket).remove(paths);
      if (storageError) {
        setStatus(`Σφάλμα διαγραφής storage: ${storageError.message}`);
        setBusy(false);
        return;
      }
    }

    const { error: deleteKitError } = await client.from('logo_kits').delete().eq('id', logoKit.id);
    if (deleteKitError) {
      setStatus(`Σφάλμα διαγραφής logo kit: ${deleteKitError.message}`);
      setBusy(false);
      return;
    }

    setStatus(`Το "${logoKit.title}" διαγράφηκε οριστικά.`);
    await loadLogoKits();
    setBusy(false);
  }

  async function deleteAllPostsPermanently() {
    if (activeTab === 'logo') {
      if (!client || logoKits.length === 0) return;
      const confirmedLogoDelete = window.confirm(`Να διαγραφούν ΟΛΑ τα ${logoKits.length} logo kits; Αυτή η ενέργεια δεν αναιρείται.`);
      if (!confirmedLogoDelete) return;

      setBusy(true);
      setStatus('Γίνεται οριστική διαγραφή όλων των logo kits...');
      const bucket = (window.APP_CONFIG && window.APP_CONFIG.STORAGE_BUCKET) || 'post-photos';

      const kitIds = logoKits.map((kit) => kit.id);
      const { data: assets, error: assetsError } = await client
        .from('logo_assets')
        .select('file_path')
        .in('logo_kit_id', kitIds);

      if (assetsError) {
        setStatus(`Σφάλμα φόρτωσης logo assets: ${assetsError.message}`);
        setBusy(false);
        return;
      }

      const paths = (assets || []).map((asset) => asset.file_path).filter(Boolean);
      if (paths.length > 0) {
        const { error: storageError } = await client.storage.from(bucket).remove(paths);
        if (storageError) {
          setStatus(`Σφάλμα διαγραφής storage: ${storageError.message}`);
          setBusy(false);
          return;
        }
      }

      const { error: deleteKitsError } = await client.from('logo_kits').delete().eq('client_id', selectedClient.id);
      if (deleteKitsError) {
        setStatus(`Σφάλμα διαγραφής logo kits: ${deleteKitsError.message}`);
        setBusy(false);
        return;
      }

      setStatus('Όλα τα logo kits διαγράφηκαν οριστικά.');
      await loadLogoKits();
      setBusy(false);
      return;
    }

    const targetPosts = posts.filter((post) => parsePostType(post) === activeTab);
    if (!client || targetPosts.length === 0) return;
    const confirmed = window.confirm(`Να διαγραφούν ΟΛΑ τα ${targetPosts.length} στοιχεία του tab "${CONTENT_TABS[activeTab]}"; Αυτή η ενέργεια δεν αναιρείται.`);
    if (!confirmed) return;

    setBusy(true);
    setStatus(`Γίνεται οριστική διαγραφή για "${CONTENT_TABS[activeTab]}"...`);

    const bucket = (window.APP_CONFIG && window.APP_CONFIG.STORAGE_BUCKET) || 'post-photos';
    const paths = targetPosts.map((post) => post.image_path).filter(Boolean);

    if (paths.length > 0) {
      const { error: storageError } = await client.storage.from(bucket).remove(paths);
      if (storageError) {
        setStatus(`Σφάλμα διαγραφής storage: ${storageError.message}`);
        setBusy(false);
        return;
      }
    }

    const ids = targetPosts.map((post) => post.id);
    const { error: deleteError } = await client.from('posts').delete().in('id', ids);
    if (deleteError) {
      setStatus(`Σφάλμα διαγραφής βάσης: ${deleteError.message}`);
      setBusy(false);
      return;
    }

    setStatus(`Η ενότητα "${CONTENT_TABS[activeTab]}" διαγράφηκε οριστικά.`);
    await loadPosts();
    setBusy(false);
  }

  const parsedCaptions = useMemo(() => parseCaptions(captionsText), [captionsText]);
  const mappedCaptions = useMemo(
    () => mediaItems.reduce((sum, _item, index) => sum + (parsedCaptions[index] ? 1 : 0), 0),
    [mediaItems, parsedCaptions]
  );
  const scopedPosts = useMemo(
    () => posts.filter((post) => parsePostType(post) === activeTab),
    [posts, activeTab]
  );
  const scopedReviewItems = useMemo(
    () => (activeTab === 'logo' ? logoKits : scopedPosts),
    [activeTab, logoKits, scopedPosts]
  );
  const approvalOverview = useMemo(
    () =>
      scopedReviewItems.reduce(
        (acc, post) => {
          const state = reviewState(post);
          if (state === 'ready') acc.ready += 1;
          if (state === 'changes') acc.changes += 1;
          if (state === 'awaiting') acc.awaiting += 1;
          if (post.approval_status === 'approved') acc.approved += 1;
          if (post.approval_status === 'disapproved') acc.disapproved += 1;
          return acc;
        },
        { ready: 0, changes: 0, awaiting: 0, approved: 0, disapproved: 0 }
      ),
    [scopedReviewItems]
  );
  const hasPublishedPosts = scopedReviewItems.length > 0;
  const hasClientSlug = clientSlug.length > 0;

  if (configError) {
    return (
      <>
        <AppStyle />
        <Page>
          <Hero>
            <State $error>{configError}</State>
          </Hero>
        </Page>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <AppStyle />
        <Page>
          <Hero>
            <Eyebrow>AUTH REQUIRED</Eyebrow>
            <Title>Σύνδεση μέσω Portal</Title>
            <Subtitle>Η πρόσβαση στο admin γίνεται μόνο από το Portal: Login -> Portal -> Επιλογή Client -> Admin.</Subtitle>
            <Actions>
              <ActionButton type="button" $type="primary" onClick={() => { window.location.href = './portal.html'; }}>
                Μετάβαση στο Portal Login
              </ActionButton>
            </Actions>
          </Hero>
        </Page>
      </>
    );
  }

  if (!hasClientSlug) {
    return (
      <>
        <AppStyle />
        <Page>
          <Hero>
            <Eyebrow>ΠΙΝΑΚΑΣ ΔΙΑΧΕΙΡΙΣΗΣ</Eyebrow>
            <Title>Λείπει client scope</Title>
            <Subtitle>Άνοιξε τον admin από το portal για να φορτώσει συγκεκριμένο client feed.</Subtitle>
            <Actions>
              <ActionButton type="button" onClick={() => window.open('./portal.html', '_blank', 'noopener,noreferrer')}>
                Μετάβαση στο Portal
              </ActionButton>
            </Actions>
          </Hero>
        </Page>
      </>
    );
  }

  return (
    <>
      <AppStyle />
      <Page>
        <Hero>
          <HeroTop>
            <ActionButton type="button" onClick={() => window.open('./portal.html', '_blank', 'noopener,noreferrer')}>📋 Portal</ActionButton>
            <ActionButton type="button" onClick={handleSignOut}>⇢ Αποσύνδεση</ActionButton>
          </HeroTop>
          <Eyebrow>ΠΙΝΑΚΑΣ ΔΙΑΧΕΙΡΙΣΗΣ</Eyebrow>
          <Title>Ανέβασμα Περιεχομένου: {selectedClient?.name || 'Client'}</Title>
          <Subtitle>Instagram, Άρθρα και Logo Kit για τον ίδιο client, με ξεχωριστό preview link ανά tab.</Subtitle>
          <TabRow>
            {Object.keys(CONTENT_TABS).map((tabKey) => (
              <TabButton key={tabKey} type="button" $active={activeTab === tabKey} onClick={() => setActiveTab(tabKey)}>
                {CONTENT_TABS[tabKey]}
              </TabButton>
            ))}
          </TabRow>

          {activeTab === 'instagram' && (
            <Form onSubmit={handleUpload}>
              <Step>
                <StepTitle>Βήμα 1. Σύρε και άφησε όλα τα αρχεία πολυμέσων</StepTitle>
                <Dropzone
                  $active={dragActive}
                  $locked={orderLocked}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (!orderLocked) setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                    appendFiles(event.dataTransfer.files);
                  }}
                >
                  <DropText>Ρίξε media για Feed εδώ (single post)</DropText>
                  <FilePicker>
                    <FilePickerButton>＋ Επιλογή αρχείων</FilePickerButton>
                    <FileInput
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      disabled={orderLocked}
                      onChange={(event) => {
                        appendFiles(event.target.files || []);
                        event.target.value = '';
                      }}
                    />
                  </FilePicker>
                  <MutedSmall>{orderLocked ? 'Η σειρά είναι κλειδωμένη. Ξεκλείδωσε για αλλαγές.' : 'Μπορείς να προσθέτεις αρχεία με πολλαπλά drop.'}</MutedSmall>
                </Dropzone>
              </Step>

              <Step>
                <StepTitle>Βήμα 1.5. Add carousel post</StepTitle>
                <Dropzone
                  $active={dragActive}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                    appendCarouselFiles(event.dataTransfer.files);
                  }}
                >
                  <DropText>Ρίξε πολλαπλές εικόνες/βίντεο για 1 carousel post</DropText>
                  <FilePicker>
                    <FilePickerButton>＋ Add carousel post</FilePickerButton>
                    <FileInput
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={(event) => {
                        appendCarouselFiles(event.target.files || []);
                        event.target.value = '';
                      }}
                    />
                  </FilePicker>
                </Dropzone>
                {carouselMediaItems.length > 0 && (
                  <MediaGrid>
                    {carouselMediaItems.map((item, index) => (
                      <MediaTile key={item.id}>
                        <MediaIndex>Carousel slide {index + 1}</MediaIndex>
                        <MediaThumb $ratio="4 / 5">
                          {item.kind === 'video' ? (
                            <video src={item.previewUrl} muted playsInline preload="metadata" />
                          ) : (
                            <img src={item.previewUrl} alt={item.file.name} loading="lazy" />
                          )}
                        </MediaThumb>
                        <MediaName>{item.file.name}</MediaName>
                        <ActionButton type="button" $type="danger" onClick={() => removeCarouselMedia(item.id)}>
                          ✕ Αφαίρεση
                        </ActionButton>
                      </MediaTile>
                    ))}
                  </MediaGrid>
                )}
              </Step>

              <Step>
                <StepTitle>Βήμα 2. Ορισμός σειράς αναρτήσεων και κλείδωμα τελικής θέσης</StepTitle>
                {mediaItems.length === 0 ? (
                  <State>Δεν υπάρχουν αρχεία ακόμα.</State>
                ) : (
                  <>
                    <MediaGrid>
                      {mediaItems.map((item, index) => (
                        <MediaTile
                          key={item.id}
                          $draggable={!orderLocked}
                          draggable={!orderLocked}
                          onDragStart={() => setDraggedId(item.id)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => handleTileDrop(item.id)}
                        >
                          <MediaIndex>Ανάρτηση {index + 1}</MediaIndex>
                          <MediaThumb $ratio="4 / 5">
                            {item.kind === 'video' ? (
                              <video src={item.previewUrl} muted playsInline preload="metadata" />
                            ) : (
                              <img src={item.previewUrl} alt={item.file.name} loading="lazy" />
                            )}
                          </MediaThumb>
                          <MediaName>{item.file.name}</MediaName>
                          {!orderLocked && (
                            <ActionButton type="button" $type="danger" onClick={() => removeMedia(item.id)}>
                              ✕ Αφαίρεση
                            </ActionButton>
                          )}
                        </MediaTile>
                      ))}
                    </MediaGrid>

                    <Actions>
                      {!orderLocked ? (
                        <ActionButton type="button" $type="primary" onClick={() => setOrderLocked(true)}>
                          ✓ Κλείδωμα τελικής σειράς
                        </ActionButton>
                      ) : (
                        <ActionButton type="button" onClick={() => setOrderLocked(false)}>
                          ↺ Ξεκλείδωμα σειράς
                        </ActionButton>
                      )}
                      <ActionButton type="button" $type="danger" onClick={clearMedia} disabled={orderLocked}>
                        🗑 Καθαρισμός αρχείων
                      </ActionButton>
                    </Actions>
                  </>
                )}
              </Step>

              <Step>
                <StepTitle>Βήμα 3. Επικόλληση όλων των λεζαντών σε ένα κείμενο</StepTitle>
                <label>
                  Πεδίο λεζαντών
                  <CaptionInput
                    rows="8"
                    value={captionsText}
                    onChange={(event) => setCaptionsText(event.target.value)}
                    placeholder={'Post 1: Πρώτη λεζάντα\n\nPost 2: Δεύτερη λεζάντα\n\nPost 3: Τρίτη λεζάντα'}
                  />
                </label>
                <State>Αντιστοιχισμένες λεζάντες: {mappedCaptions}/{mediaItems.length}</State>
              </Step>

              <Step>
                <StepTitle>Βήμα 4. Ενιαία 9άδα PNG</StepTitle>
                <Dropzone
                  $active={dragActive}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                    appendInstagramGridFiles(event.dataTransfer.files);
                  }}
                >
                  <DropText>Ρίξε 1 αρχείο PNG για την ενιαία 9άδα</DropText>
                  <FilePicker>
                    <FilePickerButton>＋ Επιλογή PNG</FilePickerButton>
                    <FileInput
                      type="file"
                      accept=".png,image/png"
                      onChange={(event) => {
                        appendInstagramGridFiles(event.target.files || []);
                        event.target.value = '';
                      }}
                    />
                  </FilePicker>
                </Dropzone>
                {instagramGridItems.length > 0 && (
                  <MediaGrid>
                    {instagramGridItems.map((item) => (
                      <MediaTile key={item.id}>
                        <MediaThumb $ratio="1 / 1"><img src={item.previewUrl} alt={item.file.name} loading="lazy" /></MediaThumb>
                        <MediaName>{item.file.name}</MediaName>
                        <ActionButton type="button" $type="danger" onClick={() => setInstagramGridItems((prev) => {
                          prev.forEach((gridItem) => URL.revokeObjectURL(gridItem.previewUrl));
                          return [];
                        })}>
                          ✕ Αφαίρεση
                        </ActionButton>
                      </MediaTile>
                    ))}
                  </MediaGrid>
                )}
              </Step>

              <Step>
                <StepTitle>Βήμα 5. Stories αρχεία (extra input)</StepTitle>
                <Dropzone
                  $active={dragActive}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                    appendInstagramStories(event.dataTransfer.files);
                  }}
                >
                  <DropText>Ρίξε εικόνες/βίντεο για Stories (9:16)</DropText>
                  <FilePicker>
                    <FilePickerButton>＋ Επιλογή stories</FilePickerButton>
                    <FileInput
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={(event) => {
                        appendInstagramStories(event.target.files || []);
                        event.target.value = '';
                      }}
                    />
                  </FilePicker>
                </Dropzone>
                {instagramStoryItems.length > 0 && (
                  <MediaGrid>
                    {instagramStoryItems.map((item) => (
                      <MediaTile key={item.id}>
                        <MediaThumb $ratio="9 / 16">
                          {item.kind === 'video' ? (
                            <video src={item.previewUrl} muted playsInline preload="metadata" />
                          ) : (
                            <img src={item.previewUrl} alt={item.file.name} loading="lazy" />
                          )}
                        </MediaThumb>
                        <MediaName>{item.file.name}</MediaName>
                        <ActionButton type="button" $type="danger" onClick={() => removeInstagramStoryItem(item.id)}>
                          ✕ Αφαίρεση
                        </ActionButton>
                      </MediaTile>
                    ))}
                  </MediaGrid>
                )}
              </Step>

              <Actions>
                <ActionButton type="submit" $type="primary" disabled={busy}>
                  {busy ? '⏳ Γίνεται ανέβασμα...' : '⬆ Ανέβασμα + Δημοσίευση τελικής σειράς'}
                </ActionButton>
              </Actions>
            </Form>
          )}

          {activeTab === 'article' && (
            <Form onSubmit={(event) => event.preventDefault()}>
              {articleDrafts.map((draft, index) => (
                <Step key={draft.id}>
                  <StepTitle>Άρθρο {index + 1}</StepTitle>
                  <label>
                    Τίτλος άρθρου
                    <CaptionInput
                      rows="2"
                      value={draft.title}
                      onChange={(event) => updateArticleDraftField(draft.id, 'title', event.target.value)}
                      placeholder="Γράψε τίτλο άρθρου"
                    />
                  </label>
                  <label>
                    Κείμενο άρθρου
                    <CaptionInput
                      rows="8"
                      value={draft.body}
                      onChange={(event) => updateArticleDraftField(draft.id, 'body', event.target.value)}
                      placeholder="Γράψε το κείμενο που θα εγκρίνει ο πελάτης"
                    />
                  </label>
                  <FilePicker>
                    <FilePickerButton>＋ Εικόνα άρθρου</FilePickerButton>
                    <FileInput
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        setArticleDraftFile(draft.id, (event.target.files || [])[0]);
                        event.target.value = '';
                      }}
                    />
                  </FilePicker>
                  {draft.imagePreview && (
                    <ArticleDraftPreview>
                      <img src={draft.imagePreview} alt={draft.title || 'Προεπισκόπηση άρθρου'} loading="lazy" />
                    </ArticleDraftPreview>
                  )}
                  <Actions>
                    <ActionButton type="button" $type="danger" onClick={() => removeArticleDraft(draft.id)}>
                      ✕ Αφαίρεση άρθρου
                    </ActionButton>
                  </Actions>
                </Step>
              ))}
              <Actions>
                <ActionButton type="button" onClick={addArticleDraft}>
                  ＋ Νέο άρθρο
                </ActionButton>
                <ActionButton type="button" $type="primary" disabled={busy} onClick={publishArticles}>
                  ⬆ Δημοσίευση άρθρων
                </ActionButton>
              </Actions>
            </Form>
          )}

          {activeTab === 'logo' && (
            <Form onSubmit={(event) => event.preventDefault()}>
              <Step>
                <StepTitle>Presentation Info</StepTitle>
                <label>
                  Brand Name
                  <InlineInput
                    value={logoBrandName}
                    onChange={(event) => setLogoBrandName(event.target.value)}
                    placeholder="Luko pops"
                  />
                </label>
                <label>
                  Agency Name
                  <InlineInput
                    value={logoAgencyName}
                    onChange={(event) => setLogoAgencyName(event.target.value)}
                    placeholder="Doitforme"
                  />
                </label>
                <label>
                  Tagline
                  <InlineInput
                    value={logoTagline}
                    onChange={(event) => setLogoTagline(event.target.value)}
                    placeholder="Pop into happiness"
                  />
                </label>
                <label>
                  Concept Label (footer)
                  <InlineInput
                    value={logoConceptLabel}
                    onChange={(event) => setLogoConceptLabel(event.target.value)}
                    placeholder="Concept 1"
                  />
                </label>
                <label>
                  Short Brand Description (για Symbol/Mascot slide)
                  <CaptionInput
                    rows="4"
                    value={logoShortDescription}
                    onChange={(event) => setLogoShortDescription(event.target.value)}
                    placeholder="Σύντομη περιγραφή έμπνευσης και κατεύθυνσης brand..."
                  />
                </label>
              </Step>

              <Step>
                <StepTitle>Inspiration (Nature -> Result)</StepTitle>
                <Dropzone
                  $active={dragActive}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                    appendSingleImage(setLogoInspirationItems, event.dataTransfer.files, 'Επίλεξε εικόνα inspiration.');
                  }}
                >
                  <DropText>Inspiration image (.jpg/.jpeg/.png/.svg)</DropText>
                  <FilePicker>
                    <FilePickerButton>＋ Inspiration image</FilePickerButton>
                    <FileInput
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        appendSingleImage(setLogoInspirationItems, event.target.files || [], 'Επίλεξε εικόνα inspiration.');
                        event.target.value = '';
                      }}
                    />
                  </FilePicker>
                </Dropzone>
                {logoInspirationItems.length > 0 && (
                  <MediaGrid>
                    {logoInspirationItems.map((item) => (
                      <MediaTile key={item.id}>
                        <MediaThumb><img src={item.previewUrl} alt={item.file.name} loading="lazy" /></MediaThumb>
                        <MediaName>{item.file.name}</MediaName>
                        <ActionButton type="button" $type="danger" onClick={() => removeUploadItem(setLogoInspirationItems, item.id)}>✕ Αφαίρεση</ActionButton>
                      </MediaTile>
                    ))}
                  </MediaGrid>
                )}
                <Dropzone
                  $active={dragActive}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                    appendSingleImage(setLogoInspirationResultItems, event.dataTransfer.files, 'Επίλεξε image τελικού αποτελέσματος.');
                  }}
                >
                  <DropText>Result image (.png/.svg/.jpg/.jpeg)</DropText>
                  <FilePicker>
                    <FilePickerButton>＋ Result image</FilePickerButton>
                    <FileInput
                      type="file"
                      accept=".png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg"
                      onChange={(event) => {
                        appendSingleImage(setLogoInspirationResultItems, event.target.files || [], 'Επίλεξε image τελικού αποτελέσματος.');
                        event.target.value = '';
                      }}
                    />
                  </FilePicker>
                </Dropzone>
                {logoInspirationResultItems.length > 0 && (
                  <Actions>
                    {logoInspirationResultItems.map((item) => (
                      <ActionButton key={item.id} type="button" onClick={() => removeUploadItem(setLogoInspirationResultItems, item.id)}>
                        ✕ {item.file.name}
                      </ActionButton>
                    ))}
                  </Actions>
                )}
              </Step>

              <Step>
                <StepTitle>Logo Upload</StepTitle>
                <MutedSmall>Main Logo / Secondary / Logomark / Variations</MutedSmall>
                <Actions>
                  <FilePicker>
                    <FilePickerButton>Main Logo (.png/.svg/.jpg/.jpeg)</FilePickerButton>
                    <FileInput type="file" accept=".png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg" onChange={(event) => { appendSingleImage(setLogoMainLogoItems, event.target.files || [], 'Main Logo δέχεται μόνο .png/.svg/.jpg/.jpeg'); event.target.value = ''; }} />
                  </FilePicker>
                  <FilePicker>
                    <FilePickerButton>Secondary Logo (.png/.svg/.jpg/.jpeg)</FilePickerButton>
                    <FileInput type="file" accept=".png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg" onChange={(event) => { appendSingleImage(setLogoSecondaryLogoItems, event.target.files || [], 'Secondary Logo δέχεται μόνο .png/.svg/.jpg/.jpeg'); event.target.value = ''; }} />
                  </FilePicker>
                  <FilePicker>
                    <FilePickerButton>Logomark (.png/.svg/.jpg/.jpeg)</FilePickerButton>
                    <FileInput type="file" accept=".png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg" onChange={(event) => { appendSingleImage(setLogoLogomarkItems, event.target.files || [], 'Logomark δέχεται μόνο .png/.svg/.jpg/.jpeg'); event.target.value = ''; }} />
                  </FilePicker>
                  <FilePicker>
                    <FilePickerButton>Logo Variations (multiple)</FilePickerButton>
                    <FileInput type="file" accept=".png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg" multiple onChange={(event) => { appendMultiImages(setLogoVariationItems, event.target.files || [], isPngOrSvgFile, 'Logo Variations δέχονται μόνο .png/.svg/.jpg/.jpeg'); event.target.value = ''; }} />
                  </FilePicker>
                </Actions>
                <MediaGrid>
                  {logoMainLogoItems.map((item) => (
                    <MediaTile key={item.id}><MediaThumb><img src={item.previewUrl} alt={item.file.name} loading="lazy" /></MediaThumb><MediaName>Main: {item.file.name}</MediaName><ActionButton type="button" $type="danger" onClick={() => removeUploadItem(setLogoMainLogoItems, item.id)}>✕</ActionButton></MediaTile>
                  ))}
                  {logoSecondaryLogoItems.map((item) => (
                    <MediaTile key={item.id}><MediaThumb><img src={item.previewUrl} alt={item.file.name} loading="lazy" /></MediaThumb><MediaName>Secondary: {item.file.name}</MediaName><ActionButton type="button" $type="danger" onClick={() => removeUploadItem(setLogoSecondaryLogoItems, item.id)}>✕</ActionButton></MediaTile>
                  ))}
                  {logoLogomarkItems.map((item) => (
                    <MediaTile key={item.id}><MediaThumb><img src={item.previewUrl} alt={item.file.name} loading="lazy" /></MediaThumb><MediaName>Logomark: {item.file.name}</MediaName><ActionButton type="button" $type="danger" onClick={() => removeUploadItem(setLogoLogomarkItems, item.id)}>✕</ActionButton></MediaTile>
                  ))}
                  {logoVariationItems.map((item) => (
                    <MediaTile key={item.id}><MediaThumb><img src={item.previewUrl} alt={item.file.name} loading="lazy" /></MediaThumb><MediaName>Variation: {item.file.name}</MediaName><ActionButton type="button" $type="danger" onClick={() => removeUploadItem(setLogoVariationItems, item.id)}>✕</ActionButton></MediaTile>
                  ))}
                </MediaGrid>
              </Step>

              <Step>
                <StepTitle>Mascot Upload (Optional)</StepTitle>
                <Actions>
                  <FilePicker>
                    <FilePickerButton>Primary mascot (.png/.svg/.jpg/.jpeg)</FilePickerButton>
                    <FileInput type="file" accept=".png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg" onChange={(event) => { appendSingleImage(setLogoMascotPrimaryItems, event.target.files || [], 'Mascot primary δέχεται μόνο .png/.svg/.jpg/.jpeg'); event.target.value = ''; }} />
                  </FilePicker>
                  <FilePicker>
                    <FilePickerButton>Additional mascot poses</FilePickerButton>
                    <FileInput type="file" accept=".png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg" multiple onChange={(event) => { appendMultiImages(setLogoMascotPoseItems, event.target.files || [], isPngOrSvgFile, 'Mascot poses δέχονται μόνο .png/.svg/.jpg/.jpeg'); event.target.value = ''; }} />
                  </FilePicker>
                </Actions>
                <MediaGrid>
                  {logoMascotPrimaryItems.map((item) => (
                    <MediaTile key={item.id}><MediaThumb><img src={item.previewUrl} alt={item.file.name} loading="lazy" /></MediaThumb><MediaName>Mascot: {item.file.name}</MediaName><ActionButton type="button" $type="danger" onClick={() => removeUploadItem(setLogoMascotPrimaryItems, item.id)}>✕</ActionButton></MediaTile>
                  ))}
                  {logoMascotPoseItems.map((item) => (
                    <MediaTile key={item.id}><MediaThumb><img src={item.previewUrl} alt={item.file.name} loading="lazy" /></MediaThumb><MediaName>Pose: {item.file.name}</MediaName><ActionButton type="button" $type="danger" onClick={() => removeUploadItem(setLogoMascotPoseItems, item.id)}>✕</ActionButton></MediaTile>
                  ))}
                </MediaGrid>
              </Step>

              <Step>
                <StepTitle>Typography Upload</StepTitle>
                <Actions>
                  <FilePicker>
                    <FilePickerButton>Primary Font (.ttf/.otf)</FilePickerButton>
                    <FileInput type="file" accept=".otf,.ttf" onChange={(event) => { appendSingleFont(setLogoPrimaryFontItems, event.target.files || []); event.target.value = ''; }} />
                  </FilePicker>
                  <FilePicker>
                    <FilePickerButton>Secondary Font (.ttf/.otf)</FilePickerButton>
                    <FileInput type="file" accept=".otf,.ttf" onChange={(event) => { appendSingleFont(setLogoSecondaryFontItems, event.target.files || []); event.target.value = ''; }} />
                  </FilePicker>
                  <FilePicker>
                    <FilePickerButton>Extra Fonts (multiple)</FilePickerButton>
                    <FileInput type="file" accept=".otf,.ttf" multiple onChange={(event) => { appendExtraFonts(event.target.files || []); event.target.value = ''; }} />
                  </FilePicker>
                </Actions>
                <Actions>
                  {logoPrimaryFontItems.map((item) => <ActionButton key={item.id} type="button" onClick={() => removeUploadItem(setLogoPrimaryFontItems, item.id)}>✕ Primary: {item.file.name}</ActionButton>)}
                  {logoSecondaryFontItems.map((item) => <ActionButton key={item.id} type="button" onClick={() => removeUploadItem(setLogoSecondaryFontItems, item.id)}>✕ Secondary: {item.file.name}</ActionButton>)}
                  {logoExtraFontItems.map((item) => <ActionButton key={item.id} type="button" onClick={() => removeUploadItem(setLogoExtraFontItems, item.id)}>✕ Extra: {item.file.name}</ActionButton>)}
                </Actions>
              </Step>

              <Step>
                <StepTitle>Color Palette (HEX)</StepTitle>
                <MutedSmall>Primary colors</MutedSmall>
                <Actions>
                  {logoPrimaryColorInputs.map((value, index) => {
                    const normalized = normalizeHexColor(value);
                    return (
                      <ColorChip key={`primary-input-${index}`} as="div">
                        <ColorSwatch $color={normalized || 'transparent'} />
                        <InlineInput value={value} onChange={(event) => updatePrimaryColorInput(index, event.target.value)} placeholder={`Primary ${index + 1}`} />
                        <ActionButton type="button" $type="danger" onClick={() => removePrimaryColorInput(index)}>✕</ActionButton>
                      </ColorChip>
                    );
                  })}
                </Actions>
                <Actions>
                  <ActionButton type="button" onClick={addPrimaryColorInput}>＋ Νέο χρώμα</ActionButton>
                </Actions>
                <MutedSmall>Secondary colors</MutedSmall>
                <Actions>
                  {logoSecondaryColorInputs.map((value, index) => {
                    const normalized = normalizeHexColor(value);
                    return (
                      <ColorChip key={`secondary-input-${index}`} as="div">
                        <ColorSwatch $color={normalized || 'transparent'} />
                        <InlineInput value={value} onChange={(event) => updateSecondaryColorInput(index, event.target.value)} placeholder={`Secondary ${index + 1}`} />
                        <ActionButton type="button" $type="danger" onClick={() => removeSecondaryColorInput(index)}>✕</ActionButton>
                      </ColorChip>
                    );
                  })}
                </Actions>
                <Actions>
                  <ActionButton type="button" onClick={addSecondaryColorInput}>＋ Νέο χρώμα</ActionButton>
                </Actions>
              </Step>

              <Step>
                <StepTitle>Mockups / Applications</StepTitle>
                <Actions>
                  <FilePicker>
                    <FilePickerButton>Pattern files</FilePickerButton>
                    <FileInput type="file" accept="image/*" multiple onChange={(event) => { appendMultiImages(setLogoPatternItems, event.target.files || [], isLogoVisualFile, 'Pattern δέχεται μόνο εικόνες.'); event.target.value = ''; }} />
                  </FilePicker>
                  <FilePicker>
                    <FilePickerButton>Mockups</FilePickerButton>
                    <FileInput type="file" accept="image/*" multiple onChange={(event) => { appendMultiImages(setLogoMockupItems, event.target.files || [], isLogoVisualFile, 'Mockups δέχονται μόνο εικόνες.'); event.target.value = ''; }} />
                  </FilePicker>
                  <FilePicker>
                    <FilePickerButton>Stickers</FilePickerButton>
                    <FileInput type="file" accept="image/*" multiple onChange={(event) => { appendMultiImages(setLogoStickerItems, event.target.files || [], isLogoVisualFile, 'Stickers δέχονται μόνο εικόνες.'); event.target.value = ''; }} />
                  </FilePicker>
                </Actions>
                <MediaGrid>
                  {logoPatternItems.map((item) => (<MediaTile key={item.id}><MediaThumb><img src={item.previewUrl} alt={item.file.name} loading="lazy" /></MediaThumb><MediaName>Pattern: {item.file.name}</MediaName><ActionButton type="button" $type="danger" onClick={() => removeUploadItem(setLogoPatternItems, item.id)}>✕</ActionButton></MediaTile>))}
                  {logoMockupItems.map((item) => (<MediaTile key={item.id}><MediaThumb><img src={item.previewUrl} alt={item.file.name} loading="lazy" /></MediaThumb><MediaName>Mockup: {item.file.name}</MediaName><ActionButton type="button" $type="danger" onClick={() => removeUploadItem(setLogoMockupItems, item.id)}>✕</ActionButton></MediaTile>))}
                  {logoStickerItems.map((item) => (<MediaTile key={item.id}><MediaThumb><img src={item.previewUrl} alt={item.file.name} loading="lazy" /></MediaThumb><MediaName>Sticker: {item.file.name}</MediaName><ActionButton type="button" $type="danger" onClick={() => removeUploadItem(setLogoStickerItems, item.id)}>✕</ActionButton></MediaTile>))}
                </MediaGrid>
              </Step>

              <Actions>
                <ActionButton type="button" $type="danger" onClick={clearLogoDraft}>
                  🗑 Καθαρισμός logo draft
                </ActionButton>
                <ActionButton type="button" $type="primary" disabled={busy} onClick={publishLogoKit}>
                  ⬆ Generate Presentation
                </ActionButton>
              </Actions>
            </Form>
          )}

          <Actions>
            <ActionButton type="button" disabled={!hasPublishedPosts} onClick={() => openClientPreviewTab(activeTab)}>
              👁 Άνοιγμα προεπισκόπησης πελάτη
            </ActionButton>
            <ActionButton type="button" disabled={!hasPublishedPosts} onClick={() => copyClientShareLink(activeTab)}>
              ⧉ Αντιγραφή share link
            </ActionButton>
          </Actions>

          {status && <State>{status}</State>}
          {!hasPublishedPosts && <State>Η προεπισκόπηση για το tab "{CONTENT_TABS[activeTab]}" ενεργοποιείται μετά το πρώτο upload.</State>}
          {copyState && <State>{copyState}</State>}
        </Hero>

        <List>
          <ListHeader>
            <ListTitle>{CONTENT_TABS[activeTab]}: Όλα τα στοιχεία</ListTitle>
            <ActionButton type="button" $type="danger" onClick={deleteAllPostsPermanently} disabled={busy || scopedReviewItems.length === 0}>
              🗑 Οριστική διαγραφή tab
            </ActionButton>
          </ListHeader>

          <Overview>
            <OverviewCard $type="changes">
              <OverviewLabel>Χρειάζονται αλλαγές</OverviewLabel>
              <OverviewValue>{approvalOverview.changes}</OverviewValue>
            </OverviewCard>
            <OverviewCard $type="ready">
              <OverviewLabel>Έτοιμα για δημοσίευση</OverviewLabel>
              <OverviewValue>{approvalOverview.ready}</OverviewValue>
            </OverviewCard>
            <OverviewCard>
              <OverviewLabel>Αναμονή ελέγχου</OverviewLabel>
              <OverviewValue>{approvalOverview.awaiting}</OverviewValue>
            </OverviewCard>
          </Overview>

          {activeTab === 'logo' && scopedReviewItems.length === 0 ? (
            <State>Δεν υπάρχουν logo kits ακόμα.</State>
          ) : activeTab === 'logo' ? (
            logoKits.map((kit) => (
              <Row key={kit.id}>
                <RowMain>
                  <RowHead>
                    <RowThumb>
                      <MutedSmall>LOGO KIT</MutedSmall>
                    </RowThumb>
                    <RowHeadText>
                      <strong>{kit.title || `Logo Kit v${kit.version}`}</strong>
                      <MutedSmall>{formatDate(kit.created_at)}</MutedSmall>
                    </RowHeadText>
                  </RowHead>
                  <RowText><strong>Version:</strong> v{kit.version || 1}</RowText>
                  <RowText><strong>Σημειώσεις πελάτη:</strong> {(kit.client_notes || '').trim() || 'Δεν υπάρχουν σημειώσεις ακόμα.'}</RowText>
                </RowMain>
                <RowActions>
                  <ReviewPill $state={postReviewStatus(kit)}>
                    {postReviewLabel(postReviewStatus(kit))}
                  </ReviewPill>
                  <ActionButton type="button" $type="danger" onClick={() => deleteLogoKitPermanently(kit)} disabled={busy}>
                    ✕ Οριστική διαγραφή
                  </ActionButton>
                </RowActions>
              </Row>
            ))
          ) : scopedPosts.length === 0 ? (
            <State>Δεν υπάρχουν στοιχεία ακόμα στο "{CONTENT_TABS[activeTab]}".</State>
          ) : (
            scopedPosts.map((post) => {
              const instagramMeta = activeTab === 'instagram' ? instagramEntryMeta(post) : null;
              const isInstagramStory = instagramMeta?.kind === 'story';
              return (
              <Row key={post.id}>
                <RowMain>
                  <RowHead>
                    <RowThumb>
                      {activeTab === 'logo' && logoEntryKind(post) === 'font' ? (
                        <MutedSmall>FONT</MutedSmall>
                      ) : activeTab === 'logo' && logoEntryKind(post) === 'color' ? (
                        <MutedSmall>COLOR</MutedSmall>
                      ) : activeTab === 'logo' && logoEntryKind(post) === 'story' ? (
                        <MutedSmall>STORY</MutedSmall>
                      ) : replacementFiles[post.id] && isVideoFile(replacementFiles[post.id]) ? (
                        <video src={replacementPreviews[post.id]} muted playsInline preload="metadata" />
                      ) : replacementFiles[post.id] ? (
                        <img src={replacementPreviews[post.id]} alt={replacementFiles[post.id].name} loading="lazy" />
                      ) : isVideoPost(post) ? (
                        <video src={replacementPreviews[post.id] || post.image_url} muted playsInline preload="metadata" />
                      ) : (replacementPreviews[post.id] || post.image_url) ? (
                        <img src={replacementPreviews[post.id] || post.image_url} alt={post.title} loading="lazy" />
                      ) : (
                        <MutedSmall>Χωρίς εικόνα</MutedSmall>
                      )}
                    </RowThumb>
                    <RowHeadText>
                      <strong>{activeTab === 'logo' ? logoEntryLabel(post) : (activeTab === 'instagram' ? (instagramMeta?.fileName || stripPostTypePrefix(post.title)) : stripPostTypePrefix(post.title))}</strong>
                      <MutedSmall>{formatDate(post.created_at)}</MutedSmall>
                    </RowHeadText>
                  </RowHead>

                  {!isInstagramStory && (
                    <>
                      <EditLabel>{activeTab === 'article' ? 'Κείμενο άρθρου' : 'Λεζάντα'}</EditLabel>
                      <InlineCaption
                        $large={activeTab === 'article'}
                        rows={activeTab === 'article' ? '14' : '3'}
                        value={captionDrafts[post.id] ?? post.caption}
                        onChange={(event) => handleCaptionDraft(post.id, event.target.value)}
                      />
                    </>
                  )}
                  {isInstagramStory && (
                    <RowText><strong>Story:</strong> Η προεπισκόπηση story δεν εμφανίζει λεζάντα.</RowText>
                  )}

                  <EditActions>
                    <MediaUploadLabel htmlFor={`replace-${post.id}`}>
                      ↻ Αντικατάσταση media
                    </MediaUploadLabel>
                    <HiddenFileInput
                      id={`replace-${post.id}`}
                      type="file"
                      accept="image/*,video/*"
                      onChange={(event) => {
                        const file = (event.target.files || [])[0];
                        handleReplacementSelect(post, file);
                        event.target.value = '';
                      }}
                    />
                    <ActionButton type="button" $type="primary" disabled={busy} onClick={() => savePostEdits(post)}>
                      💾 Αποθήκευση αλλαγών
                    </ActionButton>
                  </EditActions>

                  {activeTab === 'article' ? (
                    <>
                      <EditLabel>Ιστορικό αλλαγών πελάτη</EditLabel>
                      {(post.client_notes || '').trim().length > 0 ? (
                        <ChangeHistoryWrap>
                          {buildArticleChanges(post.caption, post.client_notes).length === 0 ? (
                            <ChangeLine>Δεν υπάρχουν διαφορές παραγράφων.</ChangeLine>
                          ) : (
                            buildArticleChanges(post.caption, post.client_notes).map((change, changeIndex) => (
                              <ChangeLine key={`${post.id}-${change.type}-${changeIndex}`}>
                                {change.type === 'added' ? 'Added: ' : 'Removed: '}
                                {change.paragraph}
                              </ChangeLine>
                            ))
                          )}
                        </ChangeHistoryWrap>
                      ) : (
                        <RowText>Δεν υπάρχουν αλλαγές πελάτη ακόμα.</RowText>
                      )}
                      {(post.client_notes || '').trim().length > 0 && (
                        <Actions>
                          <ActionButton type="button" onClick={() => copyClientArticleText(post)}>
                            ⧉ Copy Άρθρου πελάτη
                          </ActionButton>
                          <ActionButton type="button" $type="primary" disabled={busy} onClick={() => applyClientArticleEdits(post)}>
                            ✓ Εφαρμογή κειμένου πελάτη και δημοσίευση
                          </ActionButton>
                        </Actions>
                      )}
                    </>
                  ) : (
                    <RowText><strong>Σημειώσεις πελάτη:</strong> {(post.client_notes || '').trim() || 'Δεν υπάρχουν σημειώσεις ακόμα.'}</RowText>
                  )}
                </RowMain>
                <RowActions>
                  <ReviewPill $state={postReviewStatus(post)}>
                    {postReviewLabel(postReviewStatus(post))}
                  </ReviewPill>
                  <ActionButton type="button" $type="danger" onClick={() => deletePostPermanently(post)} disabled={busy}>
                    ✕ Οριστική διαγραφή
                  </ActionButton>
                </RowActions>
              </Row>
            );
            })
          )}
        </List>
      </Page>
    </>
  );
}

createRoot(document.getElementById('root')).render(<AdminApp />);
