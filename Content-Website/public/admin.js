import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import styled, { createGlobalStyle } from 'styled-components';
import { uploadFile as uploadStorageFile, deleteFile as deleteStorageFile, getPublicUrl as getStoragePublicUrl } from './services/storageService.js';
import InstagramFeedAdmin from './admin/components/InstagramFeedAdmin.js';
import ArticleTabPanel from './admin/components/ArticleTabPanel.js';
import LogoKitTabPanel from './admin/components/LogoKitTabPanel.js';
import useAdminInstagramComposer from './admin/hooks/useAdminInstagramComposer.js';
import useArticleAdmin from './admin/hooks/useArticleAdmin.js';
import useLogoKitAdmin from './admin/hooks/useLogoKitAdmin.js';
import InstagramPostCardUX from './admin/components/InstagramPostCardUX.js';
import ActionMenu from './admin/components/ActionMenu.js';
import CollapsiblePanel from './admin/components/CollapsiblePanel.js';

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

const WorkflowActionGroup = styled.section`
  margin-top: 0.35rem;
  display: grid;
  gap: 0.6rem;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 18%, transparent);
  background: linear-gradient(180deg, color-mix(in srgb, var(--gloomDark) 34%, transparent), color-mix(in srgb, var(--gloom) 20%, transparent));
`;

const WorkflowActionMeta = styled.small`
  color: var(--muted);
  font-size: 1.2rem;
  line-height: 1.45;
`;

const WorkflowActionRow = styled(Actions)`
  align-items: center;
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
  color: ${(p) => {
    if (p.$error || p.$tone === 'error') return 'var(--danger)';
    if (p.$tone === 'success') return 'var(--ok)';
    if (p.$tone === 'warning') return 'color-mix(in srgb, #f4d35e 88%, var(--text))';
    return 'var(--muted)';
  }};
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

const PostsGrid = styled.div`
  margin-top: 0.7rem;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.7rem;

  @media (max-width: 1380px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 1120px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const PostGridItem = styled.div`
  min-width: 0;
  ${(p) => p.$expanded && 'grid-column: 1 / -1;'}
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
  height: 100%;
  ${(p) => p.$compact && 'flex-direction: column; gap: 0.7rem; padding: 0.75rem;'}

  & + & {
    margin-top: 0.7rem;
  }
`;

const RowMain = styled.div`
  flex: 1;
  min-width: 0;
  width: 100%;
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

  strong {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-height: 1.3;
  }
`;

const RowSummaryButton = styled.button`
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
`;

const RowSummaryHint = styled.span`
  display: block;
  margin-top: 0.22rem;
  color: var(--muted);
  font-size: 1.2rem;
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

const AttachmentGrid = styled.div`
  margin-top: 0.45rem;
  display: grid;
  gap: 0.7rem;
`;

const AttachmentCard = styled.div`
  display: grid;
  gap: 0.45rem;
  padding: 0.7rem;
  border-radius: 0.9rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 24%, transparent);
  background: color-mix(in srgb, var(--gloomDark) 48%, transparent);
`;

const AttachmentThumb = styled.a`
  display: block;
  width: min(18rem, 100%);
  aspect-ratio: 16 / 10;
  border-radius: 0.8rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--greyDark) 28%, transparent);
  background: color-mix(in srgb, var(--gloom) 70%, transparent);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const AttachmentLink = styled.a`
  width: fit-content;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--accent);
`;

const AttachmentAudio = styled.audio`
  width: min(30rem, 100%);
  max-width: 100%;
`;

const RowActions = styled.div`
  display: grid;
  gap: 0.65rem;
  min-width: 19rem;
  ${(p) => p.$compact && 'width: 100%; min-width: 0; justify-items: end;'}
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

function createStorageAdapter() {
  return {
    async upload(path, file) {
      try {
        const savedPath = await uploadStorageFile({ file, path });
        return { data: { path: savedPath }, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    getPublicUrl(path) {
      return { data: { publicUrl: getStoragePublicUrl(path) } };
    },
    async remove(paths) {
      try {
        for (let i = 0; i < (paths || []).length; i += 1) {
          await deleteStorageFile({ path: paths[i] });
        }
        return { data: paths || [], error: null };
      } catch (error) {
        return { data: null, error };
      }
    }
  };
}

function getClientSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('client') || '';
}

function getInitialAdminTabFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const requestedTab = params.get('tab');
  if (requestedTab === 'article' || requestedTab === 'logo') return requestedTab;
  return 'instagram';
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
  if (state === 'awaiting') return 'Αναμονή';
  return 'Χρειάζεται αλλαγές';
}

const POSTS_SELECT_WITH_FEEDBACK_ATTACHMENTS = 'id,title,caption,image_url,image_path,status,sort_order,created_at,approval_status,client_notes,client_feedback_image_url,client_feedback_image_path,client_feedback_audio_url,client_feedback_audio_path,client_id';
const POSTS_SELECT_WITH_FEEDBACK_IMAGE = 'id,title,caption,image_url,image_path,status,sort_order,created_at,approval_status,client_notes,client_feedback_image_url,client_feedback_image_path,client_id';
const POSTS_SELECT_WITH_FEEDBACK_AUDIO = 'id,title,caption,image_url,image_path,status,sort_order,created_at,approval_status,client_notes,client_feedback_audio_url,client_feedback_audio_path,client_id';
const POSTS_SELECT_BASE = 'id,title,caption,image_url,image_path,status,sort_order,created_at,approval_status,client_notes,client_id';

function hasMissingColumnError(error, columns) {
  const message = `${error?.message || ''}`.toLowerCase();
  return columns.some((column) => message.includes(`${column}`.toLowerCase()));
}

function resolveFeedbackAttachmentUrl(url, path) {
  const directUrl = `${url || ''}`.trim();
  if (directUrl) return directUrl;

  const storagePath = `${path || ''}`.trim();
  if (!storagePath) return '';

  try {
    return getStoragePublicUrl(storagePath);
  } catch {
    return '';
  }
}

function queryClientPosts(client, clientId, selectClause) {
  return client
    .from('posts')
    .select(selectClause)
    .eq('client_id', clientId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
}

const CONTENT_TABS = {
  instagram: 'FB & IG',
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
  if (value.startsWith('GRID9::')) {
    return { kind: 'grid', groupId: '', slideOrder: 0, fileName: value.replace('GRID9::', '').trim() };
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

function isExistingFeedOrderEntry(item) {
  return item?.kind === 'existing-single' || item?.kind === 'existing-carousel';
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

function inferStatusTone(message) {
  const value = `${message || ''}`.trim().toLowerCase();
  if (!value) return 'neutral';

  if (value.includes('σφάλμα') || value.includes('απέτυχε') || value.includes('not found')) {
    return 'error';
  }

  if (
    value.startsWith('βήμα ') ||
    value.includes('ρύθμισε') ||
    value.includes('συμπλήρωσε') ||
    value.includes('επίλεξε') ||
    value.includes('ξεκλείδωσε') ||
    value.includes('δεν υπάρχει') ||
    value.includes('δεν υπάρχουν') ||
    value.includes('ενεργοποιείται')
  ) {
    return 'warning';
  }

  return 'success';
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
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [posts, setPosts] = useState([]);
  const [copyState, setCopyState] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSlug] = useState(getClientSlugFromUrl());
  const [captionDrafts, setCaptionDrafts] = useState({});
  const [replacementFiles, setReplacementFiles] = useState({});
  const [replacementPreviews, setReplacementPreviews] = useState({});
  const [activeTab, setActiveTab] = useState(getInitialAdminTabFromUrl);
  const [expandedPostId, setExpandedPostId] = useState('');

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
    setExpandedPostId('');
  }, [activeTab, selectedClient?.id]);

  useEffect(() => {
    return () => {
      Object.values(replacementPreviews).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [replacementPreviews]);

  const instagram = useAdminInstagramComposer({
    client,
    session,
    selectedClient,
    posts,
    setBusy,
    setStatus,
    loadPosts,
    validateSelectedClientScope,
    createStorageAdapter,
    createMediaItems,
    slugFilename,
    makeTypedTitle,
    parseCaptions,
    parsePostType,
    instagramEntryMeta,
    stripPostTypePrefix,
    isVideoPost,
    isExistingFeedOrderEntry,
    isInstagramGridFile
  });

  const article = useArticleAdmin({
    client,
    session,
    selectedClient,
    posts,
    setBusy,
    setStatus,
    loadPosts,
    validateSelectedClientScope,
    createStorageAdapter,
    slugFilename,
    makeTypedTitle
  });

  const logo = useLogoKitAdmin({
    client,
    session,
    selectedClient,
    setBusy,
    setStatus,
    loadPosts,
    validateSelectedClientScope,
    createStorageAdapter,
    slugFilename,
    fileExtension,
    isLogoVisualFile,
    isLogoFontFile,
    normalizeHexColor,
    createMediaItems
  });

  useEffect(() => {
    if (!client || !session || !selectedClient) return;
    loadPosts();
    logo.loadLogoKits();
  }, [client, session, selectedClient]);

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
      logo.clearLogoKits();
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

    let supportsFeedbackAudio = true;
    let { data, error } = await queryClientPosts(client, selectedClient.id, POSTS_SELECT_WITH_FEEDBACK_ATTACHMENTS);

    if (error && hasMissingColumnError(error, ['client_feedback_audio_url', 'client_feedback_audio_path'])) {
      supportsFeedbackAudio = false;
      ({ data, error } = await queryClientPosts(client, selectedClient.id, POSTS_SELECT_WITH_FEEDBACK_IMAGE));
    }

    if (error && hasMissingColumnError(error, ['client_feedback_image_url', 'client_feedback_image_path'])) {
      const fallbackSelect = supportsFeedbackAudio ? POSTS_SELECT_WITH_FEEDBACK_AUDIO : POSTS_SELECT_BASE;
      ({ data, error } = await queryClientPosts(client, selectedClient.id, fallbackSelect));
    }

    if (error) {
      setStatus(`Σφάλμα φόρτωσης: ${error.message}`);
      return;
    }

    setPosts(data || []);
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
    logo.clearLogoKits();
    setStatus(error ? `Σφάλμα αποσύνδεσης: ${error.message}` : 'Έγινε αποσύνδεση.');
    window.location.href = './portal.html';
  }

  function createPreviewUrl(contentType = 'instagram') {
    if (!selectedClient) return '';
    return `${window.location.origin}/index.html?client=${encodeURIComponent(selectedClient.slug)}&mode=${contentType}`;
  }

  function openClientPreviewTab(contentType = activeTab) {
    if (!selectedClient) return;
    window.open(createPreviewUrl(contentType), '_blank', 'noopener,noreferrer');
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

    const storage = createStorageAdapter();
    const selectedFile = replacementFiles[post.id];
    const nextCaption = captionDrafts[post.id] ?? post.caption;
    let nextImageUrl = post.image_url;
    let nextImagePath = post.image_path;
    let nextTitle = post.title;

    if (selectedFile) {
      const nextFileName = `${Date.now()}-${slugFilename(selectedFile.name)}`;
      const nextPath = `${session.user.id}/${nextFileName}`;
      const { error: uploadError } = await storage.upload(nextPath, selectedFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        setStatus(`Σφάλμα upload (${selectedFile.name}): ${uploadError.message}`);
        setBusy(false);
        return;
      }

      const { data: publicData } = storage.getPublicUrl(nextPath);
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
      await storage.remove([post.image_path]);
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

    const storage = createStorageAdapter();

    if (post.image_path) {
      const { error: storageError } = await storage.remove([post.image_path]);
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

  async function deleteAllPostsPermanently() {
    if (activeTab === 'logo') {
      await logo.deleteAllLogoKitsPermanently();
      return;
    }

    const targetPosts = posts.filter((post) => parsePostType(post) === activeTab);
    if (!client || targetPosts.length === 0) return;
    const confirmed = window.confirm(`Να διαγραφούν ΟΛΑ τα ${targetPosts.length} στοιχεία του tab "${CONTENT_TABS[activeTab]}"; Αυτή η ενέργεια δεν αναιρείται.`);
    if (!confirmed) return;

    setBusy(true);
    setStatus(`Γίνεται οριστική διαγραφή για "${CONTENT_TABS[activeTab]}"...`);

    const storage = createStorageAdapter();
    const paths = targetPosts.map((post) => post.image_path).filter(Boolean);

    if (paths.length > 0) {
      const { error: storageError } = await storage.remove(paths);
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

  const scopedPosts = useMemo(
    () => posts.filter((post) => parsePostType(post) === activeTab),
    [posts, activeTab]
  );
  const scopedReviewItems = useMemo(
    () => (activeTab === 'logo' ? logo.logoKits : scopedPosts),
    [activeTab, logo.logoKits, scopedPosts]
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
            <ActionButton type="button" onClick={() => window.open('./portal.html', '_blank', 'noopener,noreferrer')}>Portal</ActionButton>
            <ActionButton type="button" onClick={handleSignOut}>Αποσύνδεση</ActionButton>
          </HeroTop>
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
            <InstagramFeedAdmin
              busy={busy}
              {...instagram}
            />
          )}

          {activeTab === 'article' && (
            <ArticleTabPanel
              article={{
                busy,
                ...article
              }}
              ui={{
                Form,
                Step,
                StepTitle,
                State,
                Actions,
                ActionButton,
                CaptionInput,
                FilePicker,
                FilePickerButton,
                FileInput,
                ArticleDraftPreview
              }}
            />
          )}

          {activeTab === 'logo' && (
            <LogoKitTabPanel
              logo={{
                busy,
                dragActive,
                setDragActive,
                ...logo
              }}
              ui={{
                Form,
                Step,
                StepTitle,
                InlineInput,
                CaptionInput,
                Dropzone,
                DropText,
                FilePicker,
                FilePickerButton,
                FileInput,
                MediaGrid,
                MediaTile,
                MediaThumb,
                MediaName,
                Actions,
                ActionButton,
                MutedSmall,
                ColorChip,
                ColorSwatch
              }}
            />
          )}

          <WorkflowActionGroup>
            <WorkflowActionMeta>
              {activeTab === 'instagram'
                ? 'Τελικές ενέργειες για preview και άμεσο share του τρέχοντος tab.'
                : 'Τελικές ενέργειες για preview και share του τρέχοντος tab.'}
            </WorkflowActionMeta>
            <WorkflowActionRow>
              <ActionButton type="button" disabled={!hasPublishedPosts} onClick={() => openClientPreviewTab(activeTab)}>
                {activeTab === 'instagram' ? 'Προεπισκόπηση' : 'Preview'}
              </ActionButton>
              <ActionButton type="button" disabled={!hasPublishedPosts} onClick={() => copyClientShareLink(activeTab)}>
                {activeTab === 'instagram' ? '⧉ Αντιγραφή συνδέσμου' : 'Link'}
              </ActionButton>
            </WorkflowActionRow>
          </WorkflowActionGroup>

          {status && <State $tone={inferStatusTone(status)}>{status}</State>}
          {!hasPublishedPosts && <State $tone="warning">Η προεπισκόπηση για το tab "{CONTENT_TABS[activeTab]}" ενεργοποιείται μετά το πρώτο upload.</State>}
          {copyState && <State $tone={inferStatusTone(copyState)}>{copyState}</State>}
        </Hero>

        <List>
          <ListHeader>
            <ListTitle>{activeTab === 'instagram' ? 'Όλο το περιεχόμενο' : `${CONTENT_TABS[activeTab]}: Όλα τα στοιχεία`}</ListTitle>
            <ActionButton type="button" $type="danger" onClick={deleteAllPostsPermanently} disabled={busy || scopedReviewItems.length === 0}>
              {activeTab === 'instagram' ? 'Οριστική διαγραφή' : 'Διαγραφή'}
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
            logo.logoKits.map((kit) => (
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
                  <ActionMenu
                    label="More"
                    actions={[
                      {
                        key: `delete-kit-${kit.id}`,
                        label: 'Διαγραφή',
                        type: 'danger',
                        disabled: busy,
                        onClick: () => logo.deleteLogoKitPermanently(kit)
                      }
                    ]}
                  />
                </RowActions>
              </Row>
            ))
          ) : scopedPosts.length === 0 ? (
            <State>Δεν υπάρχουν στοιχεία ακόμα στο "{CONTENT_TABS[activeTab]}".</State>
          ) : (
            <PostsGrid>
            {scopedPosts.map((post) => {
              const instagramMeta = activeTab === 'instagram' ? instagramEntryMeta(post) : null;
              const isInstagramStory = instagramMeta?.kind === 'story';
              const isExpanded = expandedPostId === post.id;
              const feedbackImageUrl = resolveFeedbackAttachmentUrl(post.client_feedback_image_url, post.client_feedback_image_path);
              const feedbackAudioUrl = resolveFeedbackAttachmentUrl(post.client_feedback_audio_url, post.client_feedback_audio_path);
              const hasFeedbackAttachment = Boolean(feedbackImageUrl || feedbackAudioUrl);
              if (activeTab === 'instagram') {
                const mediaPreview = replacementFiles[post.id] && isVideoFile(replacementFiles[post.id]) ? (
                  <video
                    src={replacementPreviews[post.id]}
                    muted
                    playsInline
                    preload="metadata"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : replacementFiles[post.id] ? (
                  <img
                    src={replacementPreviews[post.id]}
                    alt={replacementFiles[post.id].name}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : isVideoPost(post) ? (
                  <video
                    src={replacementPreviews[post.id] || post.image_url}
                    muted
                    playsInline
                    preload="metadata"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (replacementPreviews[post.id] || post.image_url) ? (
                  <img
                    src={replacementPreviews[post.id] || post.image_url}
                    alt={post.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <MutedSmall>Χωρίς εικόνα</MutedSmall>
                );

                return (
                  <PostGridItem key={post.id} $expanded={isExpanded}>
                    <InstagramPostCardUX
                      post={post}
                      instagramMeta={instagramMeta}
                      isInstagramStory={isInstagramStory}
                      expanded={isExpanded}
                      onToggle={() => setExpandedPostId((prev) => (prev === post.id ? '' : post.id))}
                      busy={busy}
                      mediaPreview={mediaPreview}
                      title={instagramMeta?.fileName || stripPostTypePrefix(post.title)}
                      createdAtText={formatDate(post.created_at)}
                      reviewLabel={postReviewLabel(postReviewStatus(post))}
                      reviewState={postReviewStatus(post)}
                      publishStatus={post.status}
                      approvalStatus={post.approval_status}
                      captionValue={captionDrafts[post.id] ?? post.caption}
                      onCaptionChange={(value) => handleCaptionDraft(post.id, value)}
                      onReplaceMedia={(file) => handleReplacementSelect(post, file)}
                      onSaveEdits={() => savePostEdits(post)}
                      onDelete={() => deletePostPermanently(post)}
                      clientNotes={post.client_notes}
                      clientFeedbackImageUrl={feedbackImageUrl}
                      clientFeedbackAudioUrl={feedbackAudioUrl}
                    />
                  </PostGridItem>
                );
              }

              return (
              <PostGridItem key={post.id} $expanded={isExpanded}>
              <Row $compact={!isExpanded}>
                <RowMain>
                  <RowSummaryButton type="button" onClick={() => setExpandedPostId((prev) => (prev === post.id ? '' : post.id))}>
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
                        <RowSummaryHint>{isExpanded ? 'Πάτησε για απόκρυψη λεπτομερειών' : 'Πάτησε για προβολή λεπτομερειών'}</RowSummaryHint>
                      </RowHeadText>
                    </RowHead>
                  </RowSummaryButton>

                  {isExpanded ? (
                    <>
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

                      <Actions style={{ margin: '0.75rem 0' }}>
                        <ActionButton type="button" $type="primary" disabled={busy} onClick={() => savePostEdits(post)}>
                          Αποθήκευση
                        </ActionButton>
                        <ActionMenu
                          label="More"
                          actions={[
                            {
                              key: `delete-${post.id}`,
                              label: 'Διαγραφή',
                              type: 'danger',
                              disabled: busy,
                              onClick: () => deletePostPermanently(post)
                            }
                          ]}
                        />
                      </Actions>

                      <CollapsiblePanel title="Advanced">
                        <EditActions>
                          <MediaUploadLabel htmlFor={`replace-${post.id}`}>
                            {activeTab === 'article' ? 'Αντικατάσταση εικόνας' : 'Αντικατάσταση'}
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
                        </EditActions>

                        <EditLabel>Client feedback attachments</EditLabel>
                        {hasFeedbackAttachment ? (
                          <AttachmentGrid>
                            {feedbackImageUrl ? (
                              <AttachmentCard>
                                <MutedSmall>Screenshot</MutedSmall>
                                <AttachmentThumb href={feedbackImageUrl} target="_blank" rel="noreferrer">
                                  <img src={feedbackImageUrl} alt={`Client feedback screenshot για ${stripPostTypePrefix(post.title) || 'post'}`} loading="lazy" />
                                </AttachmentThumb>
                                <AttachmentLink href={feedbackImageUrl} target="_blank" rel="noreferrer">
                                  Άνοιγμα εικόνας
                                </AttachmentLink>
                              </AttachmentCard>
                            ) : null}
                            {feedbackAudioUrl ? (
                              <AttachmentCard>
                                <MutedSmall>Audio</MutedSmall>
                                <AttachmentAudio controls preload="none" src={feedbackAudioUrl}>
                                  Ο browser δεν υποστηρίζει audio playback.
                                </AttachmentAudio>
                                <AttachmentLink href={feedbackAudioUrl} target="_blank" rel="noreferrer">
                                  Άνοιγμα ή λήψη ήχου
                                </AttachmentLink>
                              </AttachmentCard>
                            ) : null}
                          </AttachmentGrid>
                        ) : (
                          <RowText>Δεν υπάρχει client attachment.</RowText>
                        )}

                        {activeTab === 'article' ? (
                          <>
                            <EditLabel>Ιστορικό</EditLabel>
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
                                <ActionButton type="button" $type="primary" disabled={busy} onClick={() => applyClientArticleEdits(post)}>
                                  Εφαρμογή κειμένου πελάτη
                                </ActionButton>
                              </Actions>
                            )}
                          </>
                        ) : (
                          <RowText><strong>Σημειώσεις πελάτη:</strong> {(post.client_notes || '').trim() || 'Δεν υπάρχουν σημειώσεις ακόμα.'}</RowText>
                        )}
                      </CollapsiblePanel>
                    </>
                  ) : null}
                </RowMain>
                <RowActions $compact={!isExpanded}>
                  <ReviewPill $state={postReviewStatus(post)}>
                    {postReviewLabel(postReviewStatus(post))}
                  </ReviewPill>
                </RowActions>
              </Row>
              </PostGridItem>
            );
            })}
            </PostsGrid>
          )}
        </List>
      </Page>
    </>
  );
}

createRoot(document.getElementById('root')).render(<AdminApp />);
