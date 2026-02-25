import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import styled, { createGlobalStyle, css, keyframes } from 'styled-components';
import { Textarea_ } from 'monica-alexandria';

const NOTES_HISTORY_KEY = 'gymway_notes_history_v1';
let supabaseClientCache = null;
let supabaseClientCacheKey = '';
const CONTENT_PREFIX = {
  instagram: '[IG]',
  article: '[ARTICLE]',
  logo: '[LOGO]'
};

const cardIn = keyframes`
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const cardFlip = keyframes`
  0% { transform: rotateY(0deg) scale(1); }
  50% { transform: rotateY(68deg) scale(0.992); }
  100% { transform: rotateY(0deg) scale(1); }
`;

const slideEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const imageFade = keyframes`
  from {
    opacity: 0.32;
    transform: scale(0.985);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const AppStyle = createGlobalStyle`
  :root {
    --panel: color-mix(in srgb, var(--dark) 78%, transparent);
    --panel-border: color-mix(in srgb, var(--greyDark) 38%, transparent);
    --muted: var(--greyDark);
    --accent: var(--focus);
    --ok: var(--success);
    --danger: var(--error);
    --shadow: 0 24px 70px color-mix(in srgb, var(--black) 40%, transparent);
  }

  * { box-sizing: border-box; }

  img { width: 100%; }

  body {
    margin: 0;
    min-height: 100vh;
    font-family: 'Sora', sans-serif;
    color: var(--white);
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

const OrbLeft = styled.div`
  position: absolute;
  border-radius: 999px;
  opacity: 0.36;
  width: 250px;
  height: 250px;
  left: -65px;
  top: -95px;
  background: radial-gradient(circle, color-mix(in srgb, var(--focus) 62%, transparent) 0%, transparent 70%);
`;

const OrbRight = styled.div`
  position: absolute;
  border-radius: 999px;
  opacity: 0.36;
  width: 300px;
  height: 300px;
  right: -75px;
  bottom: -165px;
  background: radial-gradient(circle, color-mix(in srgb, var(--mainLight) 66%, transparent) 0%, transparent 67%);
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

const Stats = styled.div`
  margin-top: 1.8rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
`;

const StatCard = styled.article`
  border: 1px solid color-mix(in srgb, var(--greyDark) 32%, transparent);
  border-radius: 16px;
  background: color-mix(in srgb, var(--gloom) 72%, transparent);
  padding: 0.82rem 0.92rem;
`;

const StatLabel = styled.h6`
  margin: 0;

  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const StatValue = styled.strong`
  margin-top: 0.35rem;
  display: block;
  font-family: 'Syne', sans-serif;
  font-size: 1.26rem;
`;

const State = styled.p`
  margin-top: 14px;
  color: ${(p) => (p.$error ? 'var(--danger)' : 'var(--muted)')};
`;

const Feed = styled.section`
  margin-top: 24px;
  display: grid;
  grid-template-columns: ${(p) => (p.$mode === 'article' ? '1fr' : 'repeat(3, minmax(0, 1fr))')};
  gap: 16px;
  perspective: 1200px;

  @media (max-width: 1024px) {
    grid-template-columns: ${(p) => (p.$mode === 'article' ? '1fr' : 'repeat(2, minmax(0, 1fr))')};
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Post = styled.article`
  position: relative;
  border-radius: 18px;
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--white) 95%, transparent);
  overflow: hidden;
  box-shadow: 0 14px 30px color-mix(in srgb, var(--black) 36%, transparent);
  opacity: 0;
  transform: translateY(20px) scale(0.99);
  animation: ${cardIn} 550ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: ${(p) => p.$delay || '0ms'};
  ${(p) => p.$loading && css`animation: ${cardFlip} 1200ms cubic-bezier(0.22, 0.61, 0.36, 1);`}
`;

const BlogPost = styled.article`
  position: relative;
  border-radius: 1.8rem;
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--white) 97%, transparent);
  overflow: hidden;
  box-shadow: 0 14px 30px color-mix(in srgb, var(--black) 36%, transparent);
  opacity: 0;
  transform: translateY(20px) scale(0.99);
  animation: ${cardIn} 550ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: ${(p) => p.$delay || '0ms'};
`;

const BlogTopRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
`;

const BlogThumb = styled.div`
  width: 18rem;
  height: 12rem;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--greyDark) 22%, transparent);
  background: color-mix(in srgb, var(--gloom) 10%, var(--white));

  @media (max-width: 720px) {
    width: 100%;
    max-width: 20rem;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: top left;
    display: block;
  }
`;

const BlogTopMeta = styled.div`
  min-width: 18rem;
  flex: 1;
  display: grid;
  gap: 0.5rem;
`;

const BlogContent = styled.div`
  padding: 1.6rem;
  display: grid;
  gap: 1rem;
`;

const BlogMeta = styled.p`
  margin: 0;
  color: color-mix(in srgb, var(--dark) 65%, var(--greyDark));
  font-size: 1.3rem;
`;

const BlogTitle = styled.h2`
  margin: 0;
  color: var(--dark);
  font-family: 'Syne', sans-serif;
  font-size: clamp(2rem, 3.2vw, 3rem);
  line-height: 1.08;
`;

const PostHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.95rem 1rem 0.85rem;
  background: color-mix(in srgb, var(--white) 96%, transparent);

  strong {
    display: block;
    font-size: 20px;
    line-height: 1.2;
    color: var(--dark);
  }

  p {
    margin: 0.12rem 0 0;
    font-size: 16px;
    color: color-mix(in srgb, var(--dark) 70%, var(--greyDark));
    line-height: 1.2;
  }
`;

const Avatar = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--greyDark) 42%, transparent);
  background: conic-gradient(from 120deg, var(--focus), var(--mainLight), var(--error), var(--focus));
`;

const Menu = styled.span`
  margin-left: auto;
  color: color-mix(in srgb, var(--dark) 70%, var(--greyDark));
  font-size: 18px;
`;

const OrderBadge = styled.span`
  display: inline-flex;
  align-items: center;
  margin-left: 0.45rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--greyDark) 32%, transparent);
  background: color-mix(in srgb, var(--gloom) 10%, var(--white));
  color: color-mix(in srgb, var(--dark) 76%, var(--greyDark));
  font-size: 13px;
  font-weight: 600;
`;

const Media = styled.div`
  aspect-ratio: ${(p) => p.$ratio || '4 / 5'};
  border-top: 1px solid color-mix(in srgb, var(--greyDark) 16%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--greyDark) 16%, transparent);
  background: color-mix(in srgb, var(--white) 98%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0;

  img, video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    display: block;
  }

  video { background: var(--black); }
`;

const MediaTag = styled.div`
  font-family: 'Syne', sans-serif;
  letter-spacing: 0.11em;
  font-size: 0.72rem;
  color: var(--accent);
`;

const MediaFilename = styled.div`
  margin-top: 0.6rem;
  color: var(--light);
  font-size: 1rem;
  opacity: 0.95;
  overflow-wrap: anywhere;
`;

const LikesLine = styled.div`
  padding: 0.72rem 0.95rem 0.15rem;
  color: var(--dark);
  font-size: 16px;
  font-weight: 600;
`;

const CarouselControls = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const CarouselControlButton = styled.button`
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--greyDark) 24%, transparent);
  background: color-mix(in srgb, var(--dark) 70%, transparent);
  color: var(--white);
  font: inherit;
  font-size: 1.2rem;
  width: 2.2rem;
  height: 2.2rem;
  cursor: pointer;
`;

const CarouselDots = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

const CarouselDot = styled.span`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: ${(p) => (p.$active ? 'var(--white)' : 'color-mix(in srgb, var(--white) 36%, transparent)')};
`;

const PreviewSection = styled.section`
  margin-top: 1.1rem;
  border-radius: 1.2rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 22%, transparent);
  background: color-mix(in srgb, var(--white) 95%, transparent);
  padding: 0.9rem;
  display: grid;
  gap: 0.7rem;
`;

const PreviewSectionTitle = styled.h3`
  margin: 0;
  color: var(--dark);
`;

const UnifiedGridWrap = styled.div`
  width: 100%;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--greyDark) 24%, transparent);
  background: color-mix(in srgb, var(--gloom) 10%, var(--white));

  img {
    width: 100%;
    height: auto;
    object-fit: contain;
    object-position: center;
    display: block;
  }
`;

const PostBody = styled.div`
  padding: 0 0.95rem 0.75rem;
  border-bottom: 1px solid color-mix(in srgb, var(--greyDark) 14%, transparent);
`;

const CaptionWrap = styled.div`
  display: grid;
  gap: 0.25rem;
  margin-top: 0.28rem;
`;

const Caption = styled.p`
  margin: 0.3rem 0 0;
  color: color-mix(in srgb, var(--dark) 88%, var(--greyDark));
  font-size: 15px;
  line-height: 1.45;
  min-height: calc(1.45em * 3);
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${(p) => (p.$expanded ? 'unset' : '3')};
  white-space: pre-wrap;

  strong { color: var(--dark); }
`;

const CaptionToggleRow = styled.div`
  min-height: 22px;
  display: flex;
  align-items: center;
`;

const ReviewSection = styled.div`
  margin-top: 0;
  padding: 0.75rem 0.95rem 0.95rem;
  background: color-mix(in srgb, var(--gloom) 12%, var(--white));
`;

const ReviewBox = styled.div`
  display: grid;
  gap: 0.55rem;
`;

const ArticleEditWrap = styled.div`
  display: grid;
  gap: 0.55rem;
`;

const ArticleEditTextarea = styled.textarea`
  width: 100%;
  min-height: 18rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 30%, transparent);
  border-radius: 0.9rem;
  background: color-mix(in srgb, var(--white) 98%, transparent);
  color: color-mix(in srgb, var(--dark) 90%, var(--greyDark));
  font: inherit;
  font-size: 1.6rem;
  line-height: 1.45;
  padding: 0.9rem;
  resize: vertical;
`;

const ReviewHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;

  span {
    font-size: 15px;
    font-weight: 600;
    color: color-mix(in srgb, var(--dark) 80%, var(--greyDark));
  }
`;

const InlineAction = styled.button`
  border: 0;
  background: transparent;
  color: color-mix(in srgb, var(--dark) 70%, var(--greyDark));
  text-decoration: underline;
  font: inherit;
  font-size: 14px;
  cursor: pointer;
  padding: 0;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NotesHistory = styled.div`
  border: 1px solid color-mix(in srgb, var(--greyDark) 24%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--white) 96%, transparent);
  max-height: 150px;
  overflow: auto;
  padding: 0.4rem;
  display: grid;
  gap: 0.35rem;
`;

const NoteItem = styled.article`
  border: 1px solid color-mix(in srgb, var(--greyDark) 20%, transparent);
  border-radius: 8px;
  padding: 0.35rem 0.45rem;
  background: color-mix(in srgb, var(--gloom) 8%, var(--white));

  small {
    color: color-mix(in srgb, var(--dark) 65%, var(--greyDark));
    font-size: 13px;
  }
`;

const NoteText = styled.p`
  margin: 0.25rem 0 0;
  color: var(--dark);
  font-size: 16px;
  line-height: 1.42;
  white-space: pre-wrap;
`;

const DecisionRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 0.45rem;
`;

const DecisionNotice = styled.p`
  margin: 0;
  border: 1px solid color-mix(in srgb, var(--greyDark) 28%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--white) 97%, transparent);
  color: color-mix(in srgb, var(--dark) 82%, var(--greyDark));
  padding: 0.45rem 0.62rem;
  font-size: 14px;
`;

const DecisionButton = styled.button`
  flex: 1;
  border: 1px solid color-mix(in srgb, var(--greyDark) 30%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--white) 97%, transparent);
  color: color-mix(in srgb, var(--dark) 80%, var(--greyDark));
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  padding: 0.46rem 0.72rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${(p) => p.$type === 'approve' && `
    border-color: color-mix(in srgb, var(--success) 38%, transparent);
    color: var(--success);
  `}

  ${(p) => p.$type === 'decline' && `
    border-color: color-mix(in srgb, var(--error) 40%, transparent);
    color: var(--error);
  `}
`;

const SaveRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const SaveNoteButton = styled.button`
  border: 1px solid color-mix(in srgb, var(--greyDark) 28%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--white) 98%, transparent);
  color: color-mix(in srgb, var(--dark) 80%, var(--greyDark));
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  padding: 0.35rem 0.62rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NoteCollapsed = styled.button`
  width: 100%;
  border: 1px dashed color-mix(in srgb, var(--greyDark) 40%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--white) 96%, transparent);
  color: color-mix(in srgb, var(--dark) 78%, var(--greyDark));
  padding: 0.65rem 0.75rem;
  text-align: left;
  font: inherit;
  font-size: 16px;
  cursor: pointer;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--dark) 58%, transparent);
  backdrop-filter: blur(1.2px);
  pointer-events: none;
`;

const LoadingBadge = styled.span`
  border: 1px solid color-mix(in srgb, var(--greyDark) 36%, transparent);
  border-radius: 999px;
  padding: 0.28rem 0.7rem;
  font-size: 0.74rem;
  color: var(--white);
  background: color-mix(in srgb, var(--gloom) 86%, transparent);
`;

const LogoDeck = styled.section`
  margin-top: 2.4rem;
  display: grid;
  gap: 1.2rem;
`;

const ProcessRibbon = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  color: var(--muted);
`;

const ProcessStep = styled.p`
  margin: 0;
  font-size: 1.2rem;
  color: ${(p) => (p.$active ? 'var(--white)' : 'var(--muted)')};
`;

const LogoTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const LogoTabButton = styled.button`
  border: 1px solid color-mix(in srgb, var(--greyDark) 30%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--gloom) 22%, transparent);
  color: ${(p) => (p.$active ? 'var(--white)' : 'var(--muted)')};
  font: inherit;
  font-size: 1.25rem;
  padding: 0.45rem 0.8rem;
  cursor: pointer;
`;

const SlideShell = styled.div`
  border-radius: 1.2rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 24%, transparent);
  background: linear-gradient(160deg, color-mix(in srgb, var(--white) 100%, transparent), color-mix(in srgb, var(--gloom) 6%, var(--white)));
  padding: 1rem;
`;

const SlideNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  margin-top: 0.7rem;
`;

const SlideNavButton = styled.button`
  border: 1px solid color-mix(in srgb, var(--greyDark) 28%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--gloom) 10%, var(--white));
  color: color-mix(in srgb, var(--dark) 84%, var(--greyDark));
  font: inherit;
  font-size: 1.2rem;
  padding: 0.38rem 0.75rem;
  cursor: pointer;
`;

const SlideCounter = styled.p`
  margin: 0;
  color: color-mix(in srgb, var(--dark) 72%, var(--greyDark));
  font-size: 1.2rem;
`;

const LogoSlide = styled.article`
  border-radius: 1.6rem;
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--white) 96%, transparent);
  box-shadow: 0 14px 30px color-mix(in srgb, var(--black) 30%, transparent);
  padding: 1.3rem;
`;

const LogoSlideTitle = styled.h2`
  margin: 0;
  color: var(--dark);
  font-family: 'Syne', sans-serif;
  font-size: 2.4rem;
`;

const ArrowLine = styled.p`
  margin: 0.45rem 0;
  color: color-mix(in srgb, var(--dark) 70%, var(--greyDark));
  font-size: 1.5rem;
`;

const LogoVisualGrid = styled.div`
  margin-top: 0.8rem;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const LogoVisualCard = styled.div`
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 24%, transparent);
  background: color-mix(in srgb, var(--gloom) 8%, var(--white));
  overflow: hidden;
  display: grid;
  gap: 0.45rem;
  padding: 0.5rem;
`;

const LogoVisualThumb = styled.div`
  width: 100%;
  height: 12rem;
  border-radius: 0.8rem;
  overflow: hidden;
  background: color-mix(in srgb, var(--gloom) 12%, var(--white));
  display: grid;
  place-items: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
`;

const LogoVisualName = styled.p`
  margin: 0;
  color: color-mix(in srgb, var(--dark) 82%, var(--greyDark));
  font-size: 1.2rem;
  overflow-wrap: anywhere;
`;

const ColorFlow = styled.div`
  margin-top: 0.9rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
`;

const ColorNode = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--greyDark) 26%, transparent);
  background: color-mix(in srgb, var(--gloom) 8%, var(--white));
  padding: 0.3rem 0.65rem;
`;

const ColorNodeSwatch = styled.span`
  width: 1rem;
  height: 1rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--greyDark) 36%, transparent);
  background: ${(p) => p.$color || 'transparent'};
`;

const ColorNodeLabel = styled.p`
  margin: 0;
  color: color-mix(in srgb, var(--dark) 80%, var(--greyDark));
  font-size: 1.2rem;
`;

const FontList = styled.div`
  margin-top: 0.8rem;
  display: grid;
  gap: 0.5rem;
`;

const FontRow = styled.div`
  border-radius: 0.9rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 22%, transparent);
  background: color-mix(in srgb, var(--gloom) 8%, var(--white));
  padding: 0.65rem 0.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
`;

const FontName = styled.p`
  margin: 0;
  color: color-mix(in srgb, var(--dark) 82%, var(--greyDark));
  font-size: 1.3rem;
  overflow-wrap: anywhere;
`;

const FontLink = styled.a`
  color: var(--accent);
  font-size: 1.2rem;
`;

const StoryFlow = styled.div`
  margin-top: 0.9rem;
  display: grid;
  gap: 0.5rem;
`;

const StoryLine = styled.p`
  margin: 0;
  color: color-mix(in srgb, var(--dark) 84%, var(--greyDark));
  font-size: clamp(1.25rem, 1.45vw, 1.75rem);
  line-height: 1.38;
`;

const BrandSite = styled.section`
  margin-top: 2.2rem;
  border-radius: 2rem;
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--white) 96%, transparent);
  box-shadow: 0 20px 40px color-mix(in srgb, var(--black) 28%, transparent);
  overflow: hidden;
`;

const BrandTopNav = styled.div`
  position: sticky;
  top: 0;
  z-index: 3;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  padding: 0.9rem 1rem;
  background: color-mix(in srgb, var(--white) 94%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--greyDark) 20%, transparent);
`;

const BrandNavButton = styled.button`
  border: 1px solid color-mix(in srgb, var(--greyDark) 28%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--gloom) 10%, var(--white));
  color: color-mix(in srgb, var(--dark) 72%, var(--greyDark));
  font: inherit;
  font-size: 1.15rem;
  font-weight: 700;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  ${(p) => p.$active && `
    color: var(--white);
    border-color: color-mix(in srgb, var(--dark) 40%, transparent);
    background: color-mix(in srgb, var(--dark) 92%, transparent);
  `}
`;

const BrandSection = styled.section`
  padding: clamp(1.2rem, 3vw, 2.3rem);
  border-top: 1px solid color-mix(in srgb, var(--greyDark) 14%, transparent);
  scroll-margin-top: 5.4rem;
`;

const BrandHero = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 1rem;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const BrandHeroText = styled.div`
  display: grid;
  gap: 0.8rem;
`;

const BrandKicker = styled.p`
  margin: 0;
  color: color-mix(in srgb, var(--dark) 58%, var(--greyDark));
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

const BrandHeadline = styled.h2`
  margin: 0;
  color: var(--dark);
  font-size: clamp(2.2rem, 5vw, 4.6rem);
  line-height: 0.95;
  font-family: ${(p) => p.$font || "'Syne', sans-serif"};
`;

const BrandLead = styled.p`
  margin: 0;
  color: color-mix(in srgb, var(--dark) 80%, var(--greyDark));
  font-size: 1.45rem;
  line-height: 1.5;
`;

const BrandHeroVisual = styled.div`
  min-height: 22rem;
  border-radius: 1.2rem;
  overflow: hidden;
  background:
    linear-gradient(150deg, ${(p) => p.$c1 || '#1F2A37'} 0%, ${(p) => p.$c2 || '#111827'} 100%);
  position: relative;
  padding: 1.2rem;

  img {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    object-position: center;
    mix-blend-mode: normal;
    display: block;
  }
`;

const BrandGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const BrandPanel = styled.div`
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 24%, transparent);
  background: color-mix(in srgb, var(--gloom) 8%, var(--white));
  padding: 0.95rem;
`;

const TypefaceLine = styled.p`
  margin: 0.4rem 0 0;
  color: color-mix(in srgb, var(--dark) 86%, var(--greyDark));
  font-size: 2rem;
  font-family: ${(p) => p.$font || "'Sora', sans-serif"};
`;

const PresentationShell = styled.div`
  margin-top: 2.2rem;
  display: grid;
  gap: 1rem;
`;

const SlideDeckCard = styled.article`
  border-radius: 1.6rem;
  border: 1px solid var(--panel-border);
  background:
    radial-gradient(circle at 12% 14%, color-mix(in srgb, var(--focus) 10%, transparent) 0%, transparent 42%),
    radial-gradient(circle at 86% 88%, color-mix(in srgb, var(--main) 10%, transparent) 0%, transparent 40%),
    color-mix(in srgb, var(--white) 98%, transparent);
  box-shadow: 0 20px 44px color-mix(in srgb, var(--black) 26%, transparent);
  overflow: hidden;
`;

const SlideFrame = styled.section`
  min-height: min(86vh, 66rem);
  padding: clamp(1.1rem, 2.8vw, 2.2rem);
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 1.15rem;
  animation: ${slideEnter} 300ms ease;
  overflow: visible;

  @media (max-width: 980px) {
    min-height: auto;
    height: auto;
  }
`;

const SlideBody = styled.div`
  min-height: 0;
  overflow: visible;
  padding-right: 0.2rem;
  display: grid;
  gap: 0.9rem;
`;

const SlideCanvas = styled.div`
  border-radius: 1.2rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 18%, transparent);
  min-height: 100%;
  padding: clamp(0.9rem, 2.1vw, 1.6rem);
  background:
    radial-gradient(circle at 14% 18%, color-mix(in srgb, ${(p) => p.$c1 || '#8A8BC4'} 34%, transparent) 0%, transparent 42%),
    radial-gradient(circle at 90% 92%, color-mix(in srgb, ${(p) => p.$c2 || '#5B3A2A'} 24%, transparent) 0%, transparent 46%),
    linear-gradient(145deg, color-mix(in srgb, ${(p) => p.$c1 || '#8A8BC4'} 17%, var(--white)) 0%, color-mix(in srgb, ${(p) => p.$c2 || '#5B3A2A'} 10%, var(--white)) 100%);
  display: grid;
  overflow: visible;
`;

const SlideHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid color-mix(in srgb, var(--greyDark) 14%, transparent);
  padding-bottom: 0.55rem;
`;

const SlideHeadLine = styled.div`
  width: 1px;
  height: 5rem;
  background: color-mix(in srgb, var(--dark) 55%, var(--greyDark));

  @media (max-width: 640px) {
    height: 3.4rem;
  }
`;

const SlideHeadRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.9rem;
  color: color-mix(in srgb, var(--dark) 74%, var(--greyDark));
  min-width: 0;

  p {
    margin: 0;
    white-space: nowrap;
    font-size: clamp(1.3rem, 2.4vw, 2rem);
  }
`;

const SlideTitle = styled.h2`
  margin: 0;
  color: var(--dark);
  font-family: ${(p) => p.$font || "'Syne', sans-serif"};
  font-size: clamp(3.2rem, 6vw, 7.4rem);
  line-height: 0.9;
`;

const SlideSubTitle = styled.h3`
  margin: 0;
  color: color-mix(in srgb, var(--dark) 84%, var(--greyDark));
  font-size: clamp(1.9rem, 3.8vw, 4.2rem);
  font-family: ${(p) => p.$font || "'Syne', sans-serif"};
  line-height: 0.98;
`;

const SlideLead = styled.p`
  margin: 0;
  max-width: 74ch;
  color: color-mix(in srgb, var(--dark) 80%, var(--greyDark));
  font-size: clamp(1.7rem, 2vw, 2.2rem);
  line-height: 1.45;
  white-space: pre-wrap;
`;

const SlideFooter = styled.div`
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const FooterLabel = styled.h4`
  margin: 0;
  color: color-mix(in srgb, var(--dark) 86%, var(--greyDark));
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const FooterConcept = styled.h4`
  margin: 0;
  color: color-mix(in srgb, var(--dark) 86%, var(--greyDark));
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const HeroVisual = styled.div`
  border-radius: 1rem;
  overflow: hidden;
  min-height: 28rem;
  background:
    linear-gradient(140deg, ${(p) => p.$primary || '#2B3440'} 0%, ${(p) => p.$secondary || '#111827'} 100%);
  border: 1px solid color-mix(in srgb, var(--greyDark) 18%, transparent);
  display: grid;
  place-items: center;
  padding: 1.6rem;

  img {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    object-position: center;
    display: block;
    animation: ${imageFade} 380ms ease;
  }
`;

const SummaryList = styled.ol`
  margin: 0.4rem 0 0;
  padding-left: 1.2rem;
  color: color-mix(in srgb, var(--dark) 88%, var(--greyDark));
  display: grid;
  gap: 0.55rem;
`;

const SummaryChips = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryChip = styled.div`
  border: 1px solid color-mix(in srgb, var(--greyDark) 20%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--white) 75%, transparent);
  padding: 0.65rem 0.9rem;
`;

const FamilyLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 1rem;
  height: 100%;
  align-items: stretch;

  @media (max-width: 940px) {
    grid-template-columns: 1fr;
  }
`;

const FamilyVisualStage = styled.div`
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 20%, transparent);
  background:
    radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--focus) 8%, transparent) 0%, transparent 34%),
    color-mix(in srgb, var(--gloom) 8%, var(--white));
  min-height: clamp(14rem, 24vh, 22rem);
  overflow: visible;
  display: grid;
  place-items: center;
  padding: 1.1rem;

  img {
    width: 100%;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    object-position: center;
    display: block;
    animation: ${imageFade} 360ms ease;
  }
`;

const FamilyVisualGrid = styled.div`
  margin-top: 0.8rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.6rem;
`;

const FamilyThumb = styled.button`
  border: 1px solid color-mix(in srgb, var(--greyDark) 22%, transparent);
  border-radius: 0.8rem;
  background: color-mix(in srgb, var(--white) 96%, transparent);
  padding: 0;
  overflow: hidden;
  min-height: 6rem;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    display: block;
    background: color-mix(in srgb, var(--gloom) 8%, var(--white));
  }
`;

const FamilyTextBlock = styled.div`
  display: grid;
  gap: 0.8rem;
`;

const QuoteCard = styled.div`
  border: 1px solid color-mix(in srgb, var(--greyDark) 20%, transparent);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--white) 82%, transparent);
  padding: 0.9rem;
`;

const TypoPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: 1rem;
  align-content: start;
  height: 100%;
  overflow: hidden;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const TypoCard = styled.div`
  border: 1px solid color-mix(in srgb, var(--greyDark) 22%, transparent);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--gloom) 8%, var(--white));
  padding: 1rem;
  display: grid;
  gap: 0.6rem;
  align-content: start;
  overflow: hidden;
`;

const TypoAlphabet = styled.p`
  margin: 0;
  color: color-mix(in srgb, var(--dark) 88%, var(--greyDark));
  font-size: clamp(1.6rem, 1.8vw, 2.1rem);
  letter-spacing: 0.01em;
  line-height: 1.45;
  font-family: ${(p) => p.$font || "'Sora', sans-serif"};
`;

const ColorBlocks = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;

  @media (max-width: 940px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const ColorGroup = styled.div`
  display: grid;
  gap: 0.65rem;
`;

const PaletteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const PaletteCard = styled.div`
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 20%, transparent);
  background: color-mix(in srgb, var(--white) 96%, transparent);
  padding: 0.8rem;
  display: grid;
  gap: 0.65rem;
`;

const PaletteBars = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.45rem;
`;

const PaletteBar = styled.div`
  border-radius: 0.65rem;
  height: 7.2rem;
  background: ${(p) => p.$color || '#E5E7EB'};
  border: 1px solid color-mix(in srgb, var(--greyDark) 20%, transparent);
`;

const GradientCard = styled.div`
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 20%, transparent);
  min-height: 8.8rem;
  background: ${(p) => p.$gradient || 'linear-gradient(135deg, #111827 0%, #334155 100%)'};
`;

const GroupTitle = styled.h4`
  margin: 0;
  color: color-mix(in srgb, var(--dark) 84%, var(--greyDark));
`;

const ColorBox = styled.div`
  border-radius: 0.8rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 20%, transparent);
  background: color-mix(in srgb, var(--white) 97%, transparent);
  overflow: hidden;
`;

const ColorSample = styled.div`
  height: 9.2rem;
  background: ${(p) => p.$color || '#E5E7EB'};
`;

const ColorHex = styled.p`
  margin: 0;
  padding: 0.6rem 0.65rem;
  color: color-mix(in srgb, var(--dark) 86%, var(--greyDark));
`;

const ApplicationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: auto;
  gap: 0.8rem;
  align-content: start;
  min-height: 0;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const StoryGrid = styled.div`
  display: grid;
  gap: 0.65rem;
`;

const SummaryStage = styled.div`
  min-height: 100%;
  border-radius: 1.2rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 16%, transparent);
  background: linear-gradient(145deg, color-mix(in srgb, var(--dark) 76%, transparent), color-mix(in srgb, var(--gloom) 86%, transparent));
  padding: clamp(1.4rem, 3.2vw, 2.8rem);
  display: grid;
  place-items: center;
`;

const SummaryListMinimal = styled.ol`
  margin: 0;
  padding-left: 0;
  list-style: none;
  display: grid;
  gap: 1rem;
  color: color-mix(in srgb, var(--white) 92%, var(--greyDark));
  text-align: center;
  width: min(100%, 44rem);

  li p {
    margin: 0;
    font-size: clamp(2.4rem, 3.6vw, 4rem);
    line-height: 1.08;
  }
`;

const SummarySide = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 16rem;
  justify-self: end;
`;

const ApplicationImage = styled.div`
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--greyDark) 22%, transparent);
  background: color-mix(in srgb, var(--gloom) 8%, var(--white));
  min-height: clamp(12rem, 21vh, 19rem);
  display: grid;
  place-items: center;
  padding: 0.9rem;

  img {
    width: 100%;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    object-position: center;
    display: block;
    animation: ${imageFade} 360ms ease;
  }
`;

const CenteredLogoStage = styled.div`
  min-height: clamp(18rem, 36vh, 40rem);
  border-radius: 1.2rem;
  border: 1px solid color-mix(in srgb, var(--greyDark) 20%, transparent);
  background: color-mix(in srgb, var(--white) 94%, transparent);
  display: grid;
  place-items: center;
  padding: 1.2rem;

  img {
    width: 100%;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    object-position: center;
    display: block;
    animation: ${imageFade} 320ms ease;
  }
`;

const SymbolFlow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 8rem minmax(0, 1fr);
  gap: 1rem;
  align-items: center;
  min-height: 0;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const TransitionArrow = styled.p`
  margin: 0;
  width: 8rem;
  height: 8rem;
  display: grid;
  place-items: center;
  color: color-mix(in srgb, var(--dark) 88%, var(--greyDark));
  font-size: clamp(4.6rem, 6vw, 7rem);
  line-height: 1;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--greyDark) 24%, transparent);
  background: color-mix(in srgb, var(--white) 80%, transparent);

  @media (max-width: 900px) {
    transform: rotate(90deg);
    justify-self: center;
  }
`;

const DeckNavigator = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  padding: 0.95rem 1rem;
  border-top: 1px solid color-mix(in srgb, var(--greyDark) 16%, transparent);
  background: color-mix(in srgb, var(--white) 96%, transparent);
`;

function createSupabaseClient() {
  const config = window.APP_CONFIG || {};
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY || config.SUPABASE_URL.includes('PASTE_')) {
    return null;
  }
  const cacheKey = `${config.SUPABASE_URL}::${config.SUPABASE_ANON_KEY}`;
  if (supabaseClientCache && supabaseClientCacheKey === cacheKey) {
    return supabaseClientCache;
  }
  supabaseClientCache = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  supabaseClientCacheKey = cacheKey;
  return supabaseClientCache;
}

function getClientSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('client') || '';
}

function getPreviewModeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode') || 'instagram';
  if (mode === 'article') return 'article';
  if (mode === 'logo') return 'logo';
  return 'instagram';
}

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

function parseInstagramPreviewMeta(post) {
  const rawTitle = stripPostTypePrefix(post?.title || '');
  const parts = rawTitle.split('::');
  const marker = (parts[0] || '').trim().toUpperCase();

  if (marker === 'CAROUSEL') {
    return {
      kind: 'carousel',
      groupId: (parts[1] || '').trim(),
      slideOrder: Number(parts[2]) || 0,
      fileName: parts.slice(3).join('::').trim() || rawTitle
    };
  }

  if (marker === 'STORY') {
    return {
      kind: 'story',
      groupId: '',
      slideOrder: 0,
      fileName: parts.slice(1).join('::').trim() || rawTitle
    };
  }

  if (marker === 'GRID9') {
    return {
      kind: 'grid9',
      groupId: '',
      slideOrder: 0,
      fileName: parts.slice(1).join('::').trim() || rawTitle
    };
  }

  if (marker === 'SINGLE') {
    return {
      kind: 'single',
      groupId: '',
      slideOrder: 0,
      fileName: parts.slice(1).join('::').trim() || rawTitle
    };
  }

  return {
    kind: 'single',
    groupId: '',
    slideOrder: 0,
    fileName: rawTitle
  };
}

function isVideoPost(post) {
  const value = `${post?.image_url || ''} ${stripPostTypePrefix(post?.title || '')}`.toLowerCase();
  return ['.mp4', '.mov', '.webm', '.m4v'].some((ext) => value.includes(ext));
}

function postOrderLabel(post, index) {
  const order = Number(post?.sort_order) || (index + 1);
  return `${order}η`;
}

function formatHistoryDateTime(iso) {
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return '-';
  return value.toLocaleString('el-GR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function readNotesHistory(storageKey) {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeNotesHistory(storageKey, value) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // Best effort only.
  }
}

function parseParagraphs(text) {
  return `${text || ''}`
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createParagraphDiff(beforeText, afterText) {
  const beforeParagraphs = parseParagraphs(beforeText);
  const afterParagraphs = parseParagraphs(afterText);
  const removed = beforeParagraphs
    .filter((paragraph) => !afterParagraphs.includes(paragraph))
    .map((paragraph) => ({ type: 'removed', paragraph }));
  const added = afterParagraphs
    .filter((paragraph) => !beforeParagraphs.includes(paragraph))
    .map((paragraph) => ({ type: 'added', paragraph }));
  return [...removed, ...added];
}

function parseLogoAssetCategory(fileName) {
  const value = `${fileName || ''}`;
  const match = value.match(/^([A-Z_]+)::/);
  return match ? match[1] : '';
}

function parseLogoMetaStep(storySteps) {
  const metaStep = (storySteps || []).find((step) => {
    try {
      const parsed = JSON.parse(`${step?.step_text || ''}`);
      return parsed?.type === 'logo_presentation_meta_v1';
    } catch {
      return false;
    }
  });
  if (!metaStep) return null;
  try {
    return JSON.parse(`${metaStep.step_text || ''}`);
  } catch {
    return null;
  }
}

function CaptionBlock({ username, caption }) {
  const [expanded, setExpanded] = useState(false);
  const finalCaption = (caption || 'Η λεζάντα εκκρεμεί...').trim();
  const shouldCollapse = finalCaption.length > 120;

  return (
    <CaptionWrap>
      <Caption $expanded={expanded}>
        <strong>{username || ''}</strong> {finalCaption}
      </Caption>
      <CaptionToggleRow>
        {shouldCollapse && (
          <InlineAction type="button" onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? 'Δείτε λιγότερα' : 'Δείτε περισσότερα'}
          </InlineAction>
        )}
      </CaptionToggleRow>
    </CaptionWrap>
  );
}

function PostCard({
  post,
  index,
  onUpdateReview,
  pending,
  historyEntries,
  onAppendHistory,
  previewMode,
  instagramKind = 'single',
  carouselSlides = [],
  postIds = []
}) {
  const fallback = previewMode === 'article' ? `Άρθρο ${index + 1}` : `Ανάρτηση ${index + 1}`;
  const [notes, setNotes] = useState('');
  const [articleText, setArticleText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [notesOpen, setNotesOpen] = useState(true);
  const [decisionLocked, setDecisionLocked] = useState(post.approval_status !== 'pending');
  const [decisionNotice, setDecisionNotice] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);

  const isInstagramStory = previewMode === 'instagram' && instagramKind === 'story';
  const isInstagramCarousel = previewMode === 'instagram' && instagramKind === 'carousel';
  const targetPostIds = postIds.length > 0 ? postIds : [post.id];
  const activeSlides = isInstagramCarousel
    ? (carouselSlides.length > 0 ? carouselSlides : [post])
    : [post];
  const activeSlide = activeSlides[carouselIndex] || activeSlides[0] || post;
  const isVideo = isVideoPost(activeSlide);

  const trimmedNotes = notes.trim();
  const noteMissing = trimmedNotes.length === 0;

  useEffect(() => {
    setDecisionLocked(post.approval_status !== 'pending');
  }, [post.approval_status]);

  useEffect(() => {
    setCarouselIndex(0);
  }, [post.id]);

  useEffect(() => {
    if (!decisionNotice) return;
    const timer = window.setTimeout(() => setDecisionNotice(''), 2200);
    return () => window.clearTimeout(timer);
  }, [decisionNotice]);

  useEffect(() => {
    const nextText = `${post.client_notes || post.caption || ''}`.trim();
    setArticleText(nextText);
  }, [post.client_notes, post.caption]);

  async function handleSaveNotes() {
    if (noteMissing) return;
    const ok = await onUpdateReview(targetPostIds, { client_notes: trimmedNotes }, 'Οι σημειώσεις αποθηκεύτηκαν.');
    if (!ok) return;
    onAppendHistory(post.id, trimmedNotes, 'Σημείωση');
    setNotes('');
    setNotesOpen(false);
  }

  async function handleDecision(nextStatus) {
    const articleValue = articleText.trim();
    const clientNotesValue = previewMode === 'article' ? articleValue : (nextStatus === 'approved' ? '' : trimmedNotes);
    const successLabel = previewMode === 'article'
      ? (nextStatus === 'approved' ? 'Το άρθρο εγκρίθηκε.' : 'Το άρθρο απορρίφθηκε.')
      : (nextStatus === 'approved' ? 'Η ανάρτηση εγκρίθηκε.' : 'Η ανάρτηση απορρίφθηκε.');

    const ok = await onUpdateReview(
      targetPostIds,
      { approval_status: nextStatus, client_notes: clientNotesValue },
      successLabel
    );
    if (!ok) return;
    onAppendHistory(
      post.id,
      previewMode === 'article' ? (articleValue || 'Χωρίς αλλαγή κειμένου.') : (trimmedNotes || 'Χωρίς σημείωση.'),
      nextStatus === 'approved' ? 'Έγκριση' : 'Απόρριψη'
    );
    setNotes('');
    setDecisionLocked(true);
    setDecisionNotice(
      previewMode === 'article'
        ? (nextStatus === 'approved' ? 'Εγκρίνατε το άρθρο.' : 'Απορρίψατε το άρθρο.')
        : (nextStatus === 'approved' ? 'Εγκρίνατε τη δημοσίευση.' : 'Απορρίψατε τη δημοσίευση.')
    );
  }

  async function handleArticleSave() {
    const nextText = articleText.trim();
    if (!nextText) return;
    const previousText = `${post.client_notes || post.caption || ''}`.trim();
    const ok = await onUpdateReview(
      post.id,
      { client_notes: nextText, approval_status: 'pending' },
      'Οι αλλαγές άρθρου αποθηκεύτηκαν και στάλθηκαν στον admin.'
    );
    if (!ok) return;
    onAppendHistory(post.id, { beforeText: previousText, afterText: nextText }, 'Αλλαγή άρθρου');
  }

  if (previewMode === 'article') {
    return (
      <BlogPost $loading={pending} $delay={`${Math.min(index * 45, 550)}ms`}>
        <BlogContent>
          <BlogTopRow>
            {post.image_url && (
              <BlogThumb>
                <img src={post.image_url} alt={stripPostTypePrefix(post.title) || fallback} loading="lazy" />
              </BlogThumb>
            )}
            <BlogTopMeta>
              <BlogMeta>
                {formatHistoryDateTime(post.created_at)}{post.username ? ` • ${post.username}` : ''}
              </BlogMeta>
              <BlogTitle>{stripPostTypePrefix(post.title) || fallback}</BlogTitle>
            </BlogTopMeta>
          </BlogTopRow>

          <ReviewSection>
            <ArticleEditWrap>
              <ReviewHead>
                <span>Επεξεργασία άρθρου πελάτη</span>
                <InlineAction type="button" onClick={() => setShowHistory((prev) => !prev)} disabled={(historyEntries || []).length === 0}>
                  Ιστορικό αλλαγών
                </InlineAction>
              </ReviewHead>
              {showHistory && (historyEntries || []).length > 0 && (
                <NotesHistory>
                  {(historyEntries || []).map((entry) => (
                    <NoteItem key={entry.id}>
                      <small>{formatHistoryDateTime(entry.createdAt)} • {entry.action}</small>
                      {(entry.changes || []).length > 0 ? (
                        (entry.changes || []).map((change, changeIndex) => (
                          <NoteText key={`${entry.id}-${change.type}-${changeIndex}`}>
                            {change.type === 'added' ? 'Added: ' : 'Removed: '}
                            {change.paragraph}
                          </NoteText>
                        ))
                      ) : (
                        <NoteText>{entry.text}</NoteText>
                      )}
                    </NoteItem>
                  ))}
                </NotesHistory>
              )}
              <ArticleEditTextarea
                rows="16"
                value={articleText}
                onChange={(event) => setArticleText(event.target.value)}
                placeholder="Επεξεργάσου το άρθρο και αποθήκευσε..."
              />
              <SaveRow>
                <SaveNoteButton type="button" onClick={handleArticleSave} disabled={pending || articleText.trim().length === 0}>
                  ⌾ Αποθήκευση αλλαγής άρθρου
                </SaveNoteButton>
              </SaveRow>
              <DecisionRow>
                {!decisionLocked && (
                  <DecisionButton type="button" $type="approve" onClick={() => handleDecision('approved')} disabled={pending}>
                    ✓ Έγκριση
                  </DecisionButton>
                )}
                {!decisionLocked && (
                  <DecisionButton type="button" $type="decline" onClick={() => handleDecision('disapproved')} disabled={pending}>
                    ✕ Απόρριψη
                  </DecisionButton>
                )}
                {decisionLocked && (
                  <DecisionButton type="button" onClick={() => setDecisionLocked(false)} disabled={pending}>
                    Αλλαγή Απόφασης
                  </DecisionButton>
                )}
              </DecisionRow>
              {decisionNotice && <DecisionNotice>{decisionNotice}</DecisionNotice>}
            </ArticleEditWrap>
          </ReviewSection>
        </BlogContent>
        {pending && (
          <LoadingOverlay>
            <LoadingBadge>Αποθήκευση...</LoadingBadge>
          </LoadingOverlay>
        )}
      </BlogPost>
    );
  }

  return (
    <Post $loading={pending} $delay={`${Math.min(index * 45, 550)}ms`}>
      <PostHeader>
        <Avatar />
        <div>
          <strong>
            {post.username || ''}
            <OrderBadge>{postOrderLabel(post, index)}</OrderBadge>
          </strong>
        </div>
        <Menu>...</Menu>
      </PostHeader>

      <Media role="img" aria-label="Προεπισκόπηση ανάρτησης Instagram" $ratio={isInstagramStory ? '9 / 16' : '4 / 5'}>
        {activeSlide.image_url && !isVideo ? (
          <img src={activeSlide.image_url} alt={stripPostTypePrefix(activeSlide.title) || fallback} loading="lazy" />
        ) : activeSlide.image_url && isVideo ? (
          <video src={activeSlide.image_url} controls playsInline preload="metadata" />
        ) : (
          <>
            <MediaTag>{previewMode === 'article' ? 'ΠΡΟΕΠΙΣΚΟΠΗΣΗ ΑΡΘΡΟΥ' : 'ΠΡΟΕΠΙΣΚΟΠΗΣΗ ΑΝΑΡΤΗΣΗΣ'}</MediaTag>
            <MediaFilename>{stripPostTypePrefix(activeSlide.title) || fallback}</MediaFilename>
          </>
        )}
        {isInstagramCarousel && activeSlides.length > 1 && (
          <CarouselControls>
            <CarouselControlButton
              type="button"
              onClick={() => setCarouselIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)}
            >
              ←
            </CarouselControlButton>
            <CarouselDots>
              {activeSlides.map((_, dotIndex) => (
                <CarouselDot key={`${post.id}-dot-${dotIndex}`} $active={dotIndex === carouselIndex} />
              ))}
            </CarouselDots>
            <CarouselControlButton
              type="button"
              onClick={() => setCarouselIndex((prev) => (prev + 1) % activeSlides.length)}
            >
              →
            </CarouselControlButton>
          </CarouselControls>
        )}
      </Media>

      {!isInstagramStory && <LikesLine>{previewMode === 'article' ? 'Article Preview' : '9,311 likes'}</LikesLine>}

      {!isInstagramStory && (
        <PostBody>
          <CaptionBlock username={post.username} caption={post.caption} />
        </PostBody>
      )}

      {previewMode === 'instagram' && (
      <ReviewSection>
        <ReviewBox>
          <ReviewHead>
            <span>Σημειώσεις πελάτη</span>
            <InlineAction type="button" onClick={() => setShowHistory((prev) => !prev)} disabled={(historyEntries || []).length === 0}>
              Ιστορικό σημειώσεων
            </InlineAction>
          </ReviewHead>
          {showHistory && (historyEntries || []).length > 0 && (
            <NotesHistory>
              {(historyEntries || []).map((entry) => (
                <NoteItem key={entry.id}>
                  <small>{formatHistoryDateTime(entry.createdAt)} • {entry.action}</small>
                  <NoteText>{entry.text}</NoteText>
                </NoteItem>
              ))}
            </NotesHistory>
          )}
          {notesOpen ? (
            <>
              <Textarea_
                id={`notes-${post.id}`}
                rows="3"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Γράψε σχόλιο για αυτή την ανάρτηση..."
              />
              <SaveRow>
                <SaveNoteButton type="button" onClick={handleSaveNotes} disabled={pending || noteMissing}>
                  ⌾ Αποθήκευση
                </SaveNoteButton>
              </SaveRow>
            </>
          ) : (
            <>
              <NoteCollapsed type="button" onClick={() => setNotesOpen(true)}>
                + Προσθήκη νέας σημείωσης
              </NoteCollapsed>
            </>
          )}
          <DecisionRow>
            {!decisionLocked && (
              <DecisionButton type="button" $type="approve" onClick={() => handleDecision('approved')} disabled={pending}>
                ✓ Έγκριση
              </DecisionButton>
            )}
            {!decisionLocked && (
              <DecisionButton type="button" $type="decline" onClick={() => handleDecision('disapproved')} disabled={pending}>
                ✕ Απόρριψη
              </DecisionButton>
            )}
            {decisionLocked && (
              <DecisionButton type="button" onClick={() => setDecisionLocked(false)} disabled={pending}>
                Αλλαγή Απόφασης
              </DecisionButton>
            )}
          </DecisionRow>
          {decisionNotice && <DecisionNotice>{decisionNotice}</DecisionNotice>}
        </ReviewBox>
      </ReviewSection>
      )}
      {pending && (
        <LoadingOverlay>
          <LoadingBadge>Αποθήκευση...</LoadingBadge>
        </LoadingOverlay>
      )}
    </Post>
  );
}

function LogoKitPresentation({
  logoKit,
  assets,
  colors,
  storySteps,
  clientName,
  pending,
  historyEntries,
  onAppendHistory,
  onUpdateLogoKitReview
}) {
  const allVisuals = (assets || []).filter((asset) => asset.asset_type === 'visual' && asset.file_url);
  const meta = parseLogoMetaStep(storySteps) || {};
  const visualGroups = allVisuals.reduce((acc, asset) => {
    const category = parseLogoAssetCategory(asset.file_name);
    if (!acc[category]) acc[category] = [];
    acc[category].push(asset);
    return acc;
  }, {});
  const mainLogo = (visualGroups.MAIN_LOGO || [])[0] || null;
  const secondaryLogo = (visualGroups.SECONDARY_LOGO || [])[0] || null;
  const logomark = (visualGroups.LOGOMARK || [])[0] || null;
  const inspirationImage = (visualGroups.INSPIRATION || [])[0] || null;
  const inspirationResultImage = (visualGroups.INSPIRATION_RESULT || [])[0] || mainLogo;
  const mascotPrimary = (visualGroups.MASCOT_PRIMARY || [])[0] || null;
  const mascotPoses = visualGroups.MASCOT_POSE || [];
  const logoVariations = visualGroups.LOGO_VARIATION || [];
  const patternVisuals = visualGroups.PATTERN || [];
  const mockupVisuals = visualGroups.MOCKUP || [];
  const stickerVisuals = visualGroups.STICKER || [];
  const applicationVisuals = [...patternVisuals, ...mockupVisuals, ...stickerVisuals];
  const fonts = (assets || []).filter((asset) => asset.asset_type === 'font' && asset.file_url);
  const primaryFontAsset = fonts.find((asset) => `${asset.file_name || ''}`.startsWith('FONT_PRIMARY::')) || fonts[0] || null;
  const secondaryFontAsset = fonts.find((asset) => `${asset.file_name || ''}`.startsWith('FONT_SECONDARY::')) || fonts[1] || null;
  const extraFontAssets = fonts.filter((asset) => `${asset.file_name || ''}`.startsWith('FONT_EXTRA::'));
  const hasSecondaryOrdering = (colors || []).some((row) => Number(row.sort_order) >= 1000);
  const primaryPalette = hasSecondaryOrdering
    ? (colors || []).filter((row) => Number(row.sort_order) < 1000).map((row) => row.hex_color).filter(Boolean)
    : (colors || []).map((row) => row.hex_color).filter(Boolean);
  const secondaryPalette = hasSecondaryOrdering
    ? (colors || []).filter((row) => Number(row.sort_order) >= 1000).map((row) => row.hex_color).filter(Boolean)
    : [];
  const palette = [...primaryPalette, ...secondaryPalette];
  const finalPrimaryPalette = primaryPalette.length > 0 ? primaryPalette : ['#00C73C', '#008C2C', '#D8DBD4', '#7BAAE4'];
  const finalSecondaryPalette = secondaryPalette.length > 0 ? secondaryPalette : ['#0E2E35', '#1BC45A', '#9CC4FF', '#E8EEE4'];
  const storyParagraphs = `${meta.shortDescription || ''}`
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const hasSymbolSlide = Boolean(inspirationImage || inspirationResultImage || mascotPrimary || storyParagraphs.length);
  const hasMainLogoSlide = Boolean(mainLogo);
  const hasSecondaryLogoSlide = Boolean(secondaryLogo);
  const hasLogoVariationsSlide = Boolean((logoVariations || []).length > 0);
  const hasLogomarkSlide = Boolean(logomark);
  const hasTypographySlide = Boolean((fonts || []).length > 0);
  const hasAnyPalette = Boolean((primaryPalette || []).length > 0 || (secondaryPalette || []).length > 0);
  const hasColorApplicationSlide = Boolean(hasAnyPalette && (mainLogo || secondaryLogo || logomark));
  const hasBrandPatternSlide = Boolean((patternVisuals || []).length > 0);
  const hasMockupsSlide = Boolean((mockupVisuals || []).length > 0);
  const hasStickersSlide = Boolean((stickerVisuals || []).length > 0);
  const hasClosingLogoSlide = Boolean(mainLogo || secondaryLogo || logomark);
  const fontFamilies = useMemo(
    () => [primaryFontAsset, secondaryFontAsset, ...extraFontAssets]
      .filter(Boolean)
      .map((font, index) => ({ family: `LogoKitFont_${font.id}_${index}`, url: font.file_url, fileName: font.file_name || '' })),
    [primaryFontAsset, secondaryFontAsset, extraFontAssets]
  );
  const slides = useMemo(
    () => [
      { id: 'cover', title: meta.brandName || clientName || 'Brand', side: 'Logo presentation', footer: `By ${meta.agencyName || 'Agency'}`, concept: '' },
      { id: 'summary', title: 'Summary', side: 'Summary', footer: 'Deck structure', concept: '' },
      ...(hasSymbolSlide ? [{ id: 'symbol', title: 'Symbol / Mascot', side: 'Symbol', footer: 'SYMBOL', concept: meta.conceptLabel || 'Concept 1' }] : []),
      ...(hasMainLogoSlide ? [{ id: 'main_logo', title: 'Main Logo', side: 'Logo', footer: 'MAIN LOGO', concept: meta.conceptLabel || 'Concept 1' }] : []),
      ...(hasSecondaryLogoSlide ? [{ id: 'secondary_logo', title: 'Secondary Logo', side: 'Logo', footer: 'SECONDARY LOGO', concept: meta.conceptLabel || 'Concept 1' }] : []),
      ...(hasLogoVariationsSlide ? [{ id: 'logo_variations', title: 'Logo Variations', side: 'Logo', footer: 'LOGO VARIATIONS', concept: meta.conceptLabel || 'Concept 1' }] : []),
      ...(hasLogomarkSlide ? [{ id: 'logomark', title: 'Logomark', side: 'Symbol', footer: 'LOGOMARK', concept: meta.conceptLabel || 'Concept 1' }] : []),
      ...(hasTypographySlide ? [{ id: 'typography', title: 'Typography', side: 'Typeface', footer: 'PRIMARY', concept: '' }] : []),
      ...(hasAnyPalette ? [{ id: 'palette', title: 'Color Palette', side: 'Colors', footer: 'PRIMARY + SECONDARY', concept: '' }] : []),
      ...(hasColorApplicationSlide ? [{ id: 'color_application', title: 'Color Application', side: 'Logo', footer: 'APPLICATION', concept: '' }] : []),
      ...(hasBrandPatternSlide ? [{ id: 'brand_pattern', title: 'Brand Pattern', side: 'Pattern', footer: 'PATTERN', concept: '' }] : []),
      ...(hasMockupsSlide ? [{ id: 'mockups', title: 'Mockups', side: 'Applications', footer: 'MOCKUPS', concept: '' }] : []),
      ...(hasStickersSlide ? [{ id: 'stickers', title: 'Stickers', side: 'Applications', footer: 'STICKERS', concept: '' }] : []),
      ...(hasClosingLogoSlide ? [{ id: 'closing_logo', title: 'Logo', side: 'Logo presentation', footer: '', concept: '' }] : [])
    ],
    [
      meta,
      clientName,
      hasSymbolSlide,
      hasMainLogoSlide,
      hasSecondaryLogoSlide,
      hasLogoVariationsSlide,
      hasLogomarkSlide,
      hasTypographySlide,
      hasAnyPalette,
      hasColorApplicationSlide,
      hasBrandPatternSlide,
      hasMockupsSlide,
      hasStickersSlide,
      hasClosingLogoSlide
    ]
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeVisualIndex, setActiveVisualIndex] = useState(0);
  const [notes, setNotes] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [notesOpen, setNotesOpen] = useState(true);
  const [decisionLocked, setDecisionLocked] = useState(logoKit?.approval_status !== 'pending');
  const [decisionNotice, setDecisionNotice] = useState('');
  const rotatingVisuals = logoVariations.length > 0 ? logoVariations : (applicationVisuals.length > 0 ? applicationVisuals : allVisuals);

  const activeSlide = slides[activeSlideIndex] || slides[0];
  const hasFooterContent = Boolean(activeSlide.footer || activeSlide.concept);
  const activeVisual = rotatingVisuals[activeVisualIndex] || rotatingVisuals[0];
  const trimmedNotes = notes.trim();
  const primaryColor = palette[0] || '#8A8BC4';
  const secondaryColor = palette[1] || '#5B3A2A';

  useEffect(() => {
    const previousStyle = document.getElementById('logo-kit-fonts-style');
    if (previousStyle) previousStyle.remove();
    if (fontFamilies.length === 0) return;

    const style = document.createElement('style');
    style.id = 'logo-kit-fonts-style';
    style.textContent = fontFamilies
      .map((fontDef) => `@font-face { font-family: '${fontDef.family}'; src: url('${fontDef.url}'); font-display: swap; }`)
      .join('\n');
    document.head.appendChild(style);
    return () => style.remove();
  }, [fontFamilies]);

  useEffect(() => {
    setDecisionLocked(logoKit?.approval_status !== 'pending');
    setNotes('');
    setNotesOpen(true);
    setActiveSlideIndex(0);
    setActiveVisualIndex(0);
  }, [logoKit?.id, logoKit?.approval_status]);

  useEffect(() => {
    if (activeSlideIndex <= slides.length - 1) return;
    setActiveSlideIndex(0);
  }, [activeSlideIndex, slides.length]);

  useEffect(() => {
    if (!decisionNotice) return;
    const timer = window.setTimeout(() => setDecisionNotice(''), 2200);
    return () => window.clearTimeout(timer);
  }, [decisionNotice]);

  useEffect(() => {
    if (rotatingVisuals.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveVisualIndex((prev) => (prev + 1) % rotatingVisuals.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [rotatingVisuals.length]);

  function nextSlide() {
    setActiveSlideIndex((prev) => (prev + 1) % slides.length);
  }

  function previousSlide() {
    setActiveSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }

  async function handleSaveNotes() {
    if (!trimmedNotes) return;
    const ok = await onUpdateLogoKitReview(
      { client_notes: trimmedNotes, approval_status: 'pending' },
      'Το σχόλιο αποθηκεύτηκε και στάλθηκε στον admin.'
    );
    if (!ok) return;
    onAppendHistory(logoKit.id, trimmedNotes, 'Σημείωση logo kit');
    setNotes('');
    setNotesOpen(false);
  }

  async function handleDecision(nextStatus) {
    const payload = {
      approval_status: nextStatus,
      client_notes: nextStatus === 'approved' ? '' : trimmedNotes
    };
    const successLabel = nextStatus === 'approved' ? 'Το logo kit εγκρίθηκε.' : 'Το logo kit απορρίφθηκε.';
    const ok = await onUpdateLogoKitReview(payload, successLabel);
    if (!ok) return;
    onAppendHistory(logoKit.id, trimmedNotes || 'Χωρίς σημείωση.', nextStatus === 'approved' ? 'Έγκριση' : 'Απόρριψη');
    setNotes('');
    setDecisionLocked(true);
    setDecisionNotice(nextStatus === 'approved' ? 'Εγκρίνατε το logo kit.' : 'Απορρίψατε το logo kit.');
  }

  if (!logoKit) {
    return (
      <SlideDeckCard>
        <SlideFrame>
          <LogoSlideTitle>Logo Kit</LogoSlideTitle>
          <SlideLead>Δεν υπάρχει δημοσιευμένο logo kit για αυτόν τον client ακόμα.</SlideLead>
        </SlideFrame>
      </SlideDeckCard>
    );
  }

  const primaryFontName = `${primaryFontAsset?.file_name || ''}`.replace('FONT_PRIMARY::', '') || 'Primary Font';
  const secondaryFontName = `${secondaryFontAsset?.file_name || ''}`.replace('FONT_SECONDARY::', '') || 'Secondary Font';
  const extraFontCards = extraFontAssets.map((asset, index) => ({
    id: asset.id || `extra-${index}`,
    name: `${asset.file_name || ''}`.replace('FONT_EXTRA::', '') || `Extra Font ${index + 1}`,
    family: fontFamilies[index + 2]?.family || fontFamilies[0]?.family
  }));

  const slideViewMap = {
    cover: (
      <SlideCanvas $c1={finalPrimaryPalette[0]} $c2={finalSecondaryPalette[0]}>
        <CenteredLogoStage>
          {mainLogo?.file_url ? <img src={mainLogo.file_url} alt="Cover logo" loading="lazy" /> : null}
          {/* {mainLogo?.file_url ? <img src={'https://images.pexels.com/photos/16643766/pexels-photo-16643766.jpeg'} alt="Cover logo" loading="lazy" /> : null} */}

        </CenteredLogoStage>
      </SlideCanvas>
    ),
    summary: (
      <SummaryStage>
        <SummaryListMinimal>
          <li><p>Logo</p></li>
          <li><p>Typography</p></li>
          <li><p>Color Palette</p></li>
          <li><p>Brand Applications</p></li>
        </SummaryListMinimal>
      </SummaryStage>
    ),
    symbol: (
      <SlideCanvas $c1={finalPrimaryPalette[0]} $c2={finalSecondaryPalette[0]}>
        <FamilyLayout>
          <div>
            <SymbolFlow>
              <FamilyVisualStage>
                {inspirationImage?.file_url ? <img src={inspirationImage.file_url} alt="Inspiration" loading="lazy" /> : null}
              </FamilyVisualStage>
              <TransitionArrow>→</TransitionArrow>
              <FamilyVisualStage>
                {(mascotPrimary?.file_url || inspirationResultImage?.file_url) ? <img src={(mascotPrimary || inspirationResultImage).file_url} alt="Symbol / mascot result" loading="lazy" /> : null}
              </FamilyVisualStage>
            </SymbolFlow>
          </div>
          <FamilyTextBlock>
            <SlideSubTitle $font={fontFamilies[0]?.family}>Symbol / Mascot</SlideSubTitle>
            <QuoteCard>
              {(storyParagraphs.length > 0 ? storyParagraphs : ['Brand symbol and mascot direction.']).map((line, index) => (
                <StoryLine key={`story-line-${index}`}>{line}</StoryLine>
              ))}
            </QuoteCard>
          </FamilyTextBlock>
        </FamilyLayout>
      </SlideCanvas>
    ),
    main_logo: (
      <SlideCanvas $c1={finalPrimaryPalette[1]} $c2={finalSecondaryPalette[1]}>
        <CenteredLogoStage>
          {mainLogo?.file_url ? <img src={mainLogo.file_url} alt="Main logo" loading="lazy" /> : null}
        </CenteredLogoStage>
      </SlideCanvas>
    ),
    secondary_logo: (
      <SlideCanvas $c1={finalPrimaryPalette[2]} $c2={finalSecondaryPalette[2]}>
        <CenteredLogoStage>
          {(secondaryLogo?.file_url || mainLogo?.file_url) ? <img src={(secondaryLogo || mainLogo).file_url} alt="Secondary logo" loading="lazy" /> : null}
        </CenteredLogoStage>
      </SlideCanvas>
    ),
    logo_variations: (
      <SlideCanvas $c1={finalPrimaryPalette[3]} $c2={finalSecondaryPalette[0]}>
        <ApplicationGrid>
          {(logoVariations.length > 0 ? logoVariations : [mainLogo, secondaryLogo, logomark].filter(Boolean)).slice(0, 4).map((visual) => (
            <ApplicationImage key={visual.id}>
              <img src={visual.file_url} alt={visual.file_name || 'Logo variation'} loading="lazy" />
            </ApplicationImage>
          ))}
        </ApplicationGrid>
      </SlideCanvas>
    ),
    logomark: (
      <SlideCanvas $c1={finalPrimaryPalette[0]} $c2={finalSecondaryPalette[2]}>
        <FamilyLayout>
          <FamilyVisualStage>
            {(logomark?.file_url || mainLogo?.file_url) ? <img src={(logomark || mainLogo).file_url} alt="Logomark" loading="lazy" /> : null}
          </FamilyVisualStage>
          <FamilyVisualStage>
            {(logomark?.file_url || secondaryLogo?.file_url || mainLogo?.file_url) ? <img src={(logomark || secondaryLogo || mainLogo).file_url} alt="Logomark variant" loading="lazy" /> : null}
          </FamilyVisualStage>
        </FamilyLayout>
      </SlideCanvas>
    ),
    typography: (
      <SlideCanvas $c1={finalSecondaryPalette[2]} $c2={finalPrimaryPalette[3]}>
        <TypoPanel>
          <TypoCard>
            <SlideSubTitle $font={fontFamilies[0]?.family}>{primaryFontName}</SlideSubTitle>
            <TypefaceLine $font={fontFamilies[0]?.family}>Aa Bb Cc 0123</TypefaceLine>
            <TypoAlphabet $font={fontFamilies[0]?.family}>Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz</TypoAlphabet>
          </TypoCard>
          <TypoCard>
            <SlideSubTitle $font={fontFamilies[1]?.family || fontFamilies[0]?.family}>{secondaryFontName}</SlideSubTitle>
            <TypefaceLine $font={fontFamilies[1]?.family || fontFamilies[0]?.family}>Aa Bb Cc 0123</TypefaceLine>
            <TypoAlphabet $font={fontFamilies[1]?.family || fontFamilies[0]?.family}>0 1 2 3 4 5 6 7 8 9</TypoAlphabet>
          </TypoCard>
          {extraFontCards.map((font) => (
            <TypoCard key={font.id}>
              <SlideSubTitle $font={font.family}>{font.name}</SlideSubTitle>
              <TypefaceLine $font={font.family}>Aa Bb Cc 0123</TypefaceLine>
              <TypoAlphabet $font={font.family}>Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz</TypoAlphabet>
            </TypoCard>
          ))}
        </TypoPanel>
      </SlideCanvas>
    ),
    palette: (
      <SlideCanvas $c1={finalPrimaryPalette[0]} $c2={finalPrimaryPalette[1]}>
        <PaletteGrid>
          <PaletteCard>
            <GroupTitle>Primary</GroupTitle>
            <ColorBlocks>
              {finalPrimaryPalette.map((colorValue, index) => (
                <ColorBox key={`primary-${colorValue}-${index}`}>
                  <ColorSample $color={colorValue} />
                  <ColorHex>{colorValue}</ColorHex>
                </ColorBox>
              ))}
            </ColorBlocks>
          </PaletteCard>
          <PaletteCard>
            <GroupTitle>Secondary</GroupTitle>
            <ColorBlocks>
              {finalSecondaryPalette.map((colorValue, index) => (
                <ColorBox key={`secondary-${colorValue}-${index}`}>
                  <ColorSample $color={colorValue} />
                  <ColorHex>{colorValue}</ColorHex>
                </ColorBox>
              ))}
            </ColorBlocks>
          </PaletteCard>
        </PaletteGrid>
      </SlideCanvas>
    ),
    color_application: (
      <SlideCanvas $c1={finalPrimaryPalette[0]} $c2={finalSecondaryPalette[0]}>
        <PaletteGrid>
          {finalPrimaryPalette.slice(0, 2).map((colorValue, index) => (
            <GradientCard key={`apply-${colorValue}-${index}`} $gradient={`linear-gradient(135deg, ${colorValue} 0%, ${finalSecondaryPalette[index] || colorValue} 100%)`} />
          ))}
        </PaletteGrid>
        <ApplicationGrid>
          {[mainLogo, secondaryLogo, logomark].filter(Boolean).slice(0, 2).map((visual) => (
            <ApplicationImage key={visual.id}>
              <img src={visual.file_url} alt={visual.file_name || 'Logo on color'} loading="lazy" />
            </ApplicationImage>
          ))}
        </ApplicationGrid>
      </SlideCanvas>
    ),
    brand_pattern: (
      <SlideCanvas $c1={finalPrimaryPalette[2]} $c2={finalSecondaryPalette[2]}>
        <ApplicationGrid>
          {(patternVisuals.length > 0 ? patternVisuals : stickerVisuals).slice(0, 2).map((visual) => (
            <ApplicationImage key={visual.id}>
              <img src={visual.file_url} alt={visual.file_name || 'Brand pattern'} loading="lazy" />
            </ApplicationImage>
          ))}
        </ApplicationGrid>
      </SlideCanvas>
    ),
    mockups: (
      <SlideCanvas $c1={finalPrimaryPalette[1]} $c2={finalSecondaryPalette[1]}>
        <ApplicationGrid>
          {(mockupVisuals.length > 0 ? mockupVisuals : applicationVisuals).slice(0, 4).map((visual) => (
            <ApplicationImage key={visual.id}>
              <img src={visual.file_url} alt={visual.file_name || 'Mockup'} loading="lazy" />
            </ApplicationImage>
          ))}
        </ApplicationGrid>
      </SlideCanvas>
    ),
    stickers: (
      <SlideCanvas $c1={finalPrimaryPalette[3]} $c2={finalSecondaryPalette[3]}>
        <ApplicationGrid>
          {(stickerVisuals.length > 0 ? stickerVisuals : mascotPoses).slice(0, 4).map((visual) => (
            <ApplicationImage key={visual.id}>
              <img src={visual.file_url} alt={visual.file_name || 'Sticker variation'} loading="lazy" />
            </ApplicationImage>
          ))}
        </ApplicationGrid>
      </SlideCanvas>
    ),
    closing_logo: (
      <SlideCanvas $c1={finalPrimaryPalette[0]} $c2={finalSecondaryPalette[0]}>
        <CenteredLogoStage>
          {(mainLogo?.file_url || secondaryLogo?.file_url || logomark?.file_url) ? <img src={(mainLogo || secondaryLogo || logomark).file_url} alt="Closing logo" loading="lazy" /> : null}
        </CenteredLogoStage>
      </SlideCanvas>
    )
  };
  const activeSlideContent = slideViewMap[activeSlide.id] || slideViewMap.cover;

  return (
    <PresentationShell>
      <SlideDeckCard>
        <SlideFrame>
          <SlideHead>
            <div>
              <LogoSlideTitle>{activeSlide.title}</LogoSlideTitle>
            </div>
            <SlideHeadRight>
              <SlideHeadLine />
              <p>{activeSlide.side}</p>
            </SlideHeadRight>
          </SlideHead>

          <SlideBody>
            {activeSlideContent}
          </SlideBody>

          {hasFooterContent && (
            <SlideFooter>
              <FooterLabel>{activeSlide.footer}</FooterLabel>
              <FooterConcept>{activeSlide.concept}</FooterConcept>
            </SlideFooter>
          )}
        </SlideFrame>

        <DeckNavigator>
          <SlideNavButton type="button" onClick={previousSlide}>← Previous</SlideNavButton>
          <SlideCounter>{activeSlideIndex + 1} / {slides.length}</SlideCounter>
          <SlideNavButton type="button" onClick={nextSlide}>Next →</SlideNavButton>
        </DeckNavigator>
      </SlideDeckCard>

      <SlideDeckCard>
        <ReviewSection>
          <ReviewBox>
            <ReviewHead>
              <span>Σχόλιο πελάτη για logo kit</span>
              <InlineAction type="button" onClick={() => setShowHistory((prev) => !prev)} disabled={(historyEntries || []).length === 0}>
                Ιστορικό σχολίων
              </InlineAction>
            </ReviewHead>
            {showHistory && (historyEntries || []).length > 0 && (
              <NotesHistory>
                {(historyEntries || []).map((entry) => (
                  <NoteItem key={entry.id}>
                    <small>{formatHistoryDateTime(entry.createdAt)} • {entry.action}</small>
                    <NoteText>{entry.text}</NoteText>
                  </NoteItem>
                ))}
              </NotesHistory>
            )}
            {notesOpen ? (
              <>
                <Textarea_
                  id={`logo-kit-notes-${logoKit?.id || 'new'}`}
                  rows="3"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Γράψε σχόλιο για το logo kit..."
                />
                <SaveRow>
                  <SaveNoteButton type="button" onClick={handleSaveNotes} disabled={pending || !trimmedNotes}>
                    ⌾ Αποθήκευση σχολίου
                  </SaveNoteButton>
                </SaveRow>
              </>
            ) : (
              <NoteCollapsed type="button" onClick={() => setNotesOpen(true)}>
                + Προσθήκη νέου σχολίου
              </NoteCollapsed>
            )}
            <DecisionRow>
              {!decisionLocked && (
                <DecisionButton type="button" $type="approve" onClick={() => handleDecision('approved')} disabled={pending}>
                  ✓ Έγκριση
                </DecisionButton>
              )}
              {!decisionLocked && (
                <DecisionButton type="button" $type="decline" onClick={() => handleDecision('disapproved')} disabled={pending}>
                  ✕ Απόρριψη
                </DecisionButton>
              )}
              {decisionLocked && (
                <DecisionButton type="button" onClick={() => setDecisionLocked(false)} disabled={pending}>
                  Αλλαγή Απόφασης
                </DecisionButton>
              )}
            </DecisionRow>
            {decisionNotice && <DecisionNotice>{decisionNotice}</DecisionNotice>}
          </ReviewBox>
        </ReviewSection>
      </SlideDeckCard>
    </PresentationShell>
  );
}

function App() {
  const [posts, setPosts] = useState([]);
  const [logoKit, setLogoKit] = useState(null);
  const [logoAssets, setLogoAssets] = useState([]);
  const [logoColors, setLogoColors] = useState([]);
  const [logoStorySteps, setLogoStorySteps] = useState([]);
  const [clientMeta, setClientMeta] = useState(null);
  const [clientSlug] = useState(getClientSlugFromUrl());
  const [previewMode] = useState(getPreviewModeFromUrl());
  const [status, setStatus] = useState({ loading: true, error: '', message: '' });
  const [savingId, setSavingId] = useState(null);
  const [notesHistoryByPost, setNotesHistoryByPost] = useState({});
  const notesStorageKey = `${NOTES_HISTORY_KEY}_${clientSlug || 'default'}_${previewMode}`;

  useEffect(() => {
    setNotesHistoryByPost(readNotesHistory(notesStorageKey));
  }, [notesStorageKey]);

  useEffect(() => {
    const clientName = clientMeta?.name || 'Clients Feed';
    const modeLabel = previewMode === 'article' ? 'Άρθρα' : previewMode === 'logo' ? 'Logo Kit' : 'Instagram';
    document.title = `${clientName} - ${modeLabel} Preview`;
  }, [clientMeta, previewMode]);

  useEffect(() => {
    const client = createSupabaseClient();
    if (!client) {
      setStatus({ loading: false, error: 'Ρύθμισε τα Supabase keys στο /public/config.js', message: '' });
      return;
    }

    if (!clientSlug) {
      setStatus({ loading: false, error: 'Λείπει client link. Χρησιμοποίησε το preview link από το portal.', message: '' });
      return;
    }

    client
      .from('clients')
      .select('id,name,slug')
      .eq('slug', clientSlug)
      .single()
      .then(({ data: clientData, error: clientError }) => {
        if (clientError) {
          setStatus({ loading: false, error: 'Το client link δεν είναι έγκυρο.', message: '' });
          return;
        }

        setClientMeta(clientData);

        if (previewMode === 'logo') {
          client
            .from('logo_kits')
            .select('id,title,status,approval_status,client_notes,version,created_at,client_id')
            .eq('client_id', clientData.id)
            .eq('status', 'published')
            .order('version', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(1)
            .then(async ({ data: kitsData, error: kitsError }) => {
              if (kitsError) {
                setStatus({ loading: false, error: kitsError.message, message: '' });
                return;
              }

              const selectedKit = (kitsData || [])[0] || null;
              setLogoKit(selectedKit);
              setPosts([]);

              if (!selectedKit) {
                setLogoAssets([]);
                setLogoColors([]);
                setLogoStorySteps([]);
                setStatus({ loading: false, error: '', message: '' });
                return;
              }

              const [{ data: assetsData, error: assetsError }, { data: colorsData, error: colorsError }, { data: storyData, error: storyError }] = await Promise.all([
                client.from('logo_assets').select('id,asset_type,file_name,file_ext,file_url,file_path,sort_order').eq('logo_kit_id', selectedKit.id).order('sort_order', { ascending: true }),
                client.from('logo_colors').select('id,hex_color,sort_order').eq('logo_kit_id', selectedKit.id).order('sort_order', { ascending: true }),
                client.from('logo_story_steps').select('id,step_order,step_text').eq('logo_kit_id', selectedKit.id).order('step_order', { ascending: true })
              ]);

              if (assetsError || colorsError || storyError) {
                setStatus({
                  loading: false,
                  error: assetsError?.message || colorsError?.message || storyError?.message || 'Σφάλμα logo kit φόρτωσης',
                  message: ''
                });
                return;
              }

              setLogoAssets(assetsData || []);
              setLogoColors(colorsData || []);
              setLogoStorySteps(storyData || []);
              setStatus({ loading: false, error: '', message: '' });
            });
          return;
        }

        client
          .from('posts')
          .select('id,title,caption,image_url,created_at,username,status,sort_order,approval_status,client_notes,client_id')
          .eq('status', 'published')
          .eq('client_id', clientData.id)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (error) {
              setStatus({ loading: false, error: error.message, message: '' });
              return;
            }
            setLogoKit(null);
            setLogoAssets([]);
            setLogoColors([]);
            setLogoStorySteps([]);
            setPosts(data || []);
            setStatus({ loading: false, error: '', message: '' });
          });
      });
  }, [clientSlug, previewMode]);

  async function updateReview(postId, changes, successMessage) {
    const client = createSupabaseClient();
    if (!client) return;
    const targetIds = Array.isArray(postId) ? postId : [postId];
    const savingKey = targetIds.length > 1 ? `group-${targetIds.join('-')}` : `${targetIds[0]}`;
    setSavingId(savingKey);
    setStatus((prev) => ({ ...prev, message: '' }));

    const query = client
      .from('posts')
      .update(changes)
      .select('id,approval_status,client_notes');

    const { data, error } = targetIds.length > 1
      ? await query.in('id', targetIds)
      : await query.eq('id', targetIds[0]).single();

    if (error) {
      setStatus((prev) => ({ ...prev, message: `Σφάλμα ενημέρωσης: ${error.message}` }));
      setSavingId(null);
      return false;
    }

    const rows = Array.isArray(data) ? data : [data];
    const rowsById = rows.reduce((acc, row) => {
      if (row?.id) acc[row.id] = row;
      return acc;
    }, {});

    setPosts((prev) =>
      prev.map((post) =>
        rowsById[post.id]
          ? {
              ...post,
              approval_status: rowsById[post.id].approval_status,
              client_notes: rowsById[post.id].client_notes
            }
          : post
      )
    );
    setStatus((prev) => ({ ...prev, message: successMessage }));
    setSavingId(null);
    return true;
  }

  async function updateLogoKitReview(changes, successMessage) {
    const client = createSupabaseClient();
    if (!client || !logoKit?.id) return false;
    const savingKey = `logo-${logoKit.id}`;
    setSavingId(savingKey);
    setStatus((prev) => ({ ...prev, message: '' }));

    const { data, error } = await client
      .from('logo_kits')
      .update(changes)
      .eq('id', logoKit.id)
      .select('id,approval_status,client_notes')
      .single();

    if (error) {
      setStatus((prev) => ({ ...prev, message: `Σφάλμα ενημέρωσης: ${error.message}` }));
      setSavingId(null);
      return false;
    }

    setLogoKit((prev) => ({
      ...prev,
      approval_status: data.approval_status,
      client_notes: data.client_notes
    }));
    setStatus((prev) => ({ ...prev, message: successMessage }));
    setSavingId(null);
    return true;
  }

  function appendNoteHistory(postId, text, action) {
    const hasArticleDiff = action === 'Αλλαγή άρθρου' && text && typeof text === 'object';
    const paragraphChanges = hasArticleDiff ? createParagraphDiff(text.beforeText, text.afterText) : [];
    const fallbackText = hasArticleDiff ? '' : text;
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: fallbackText,
      changes: paragraphChanges,
      action,
      createdAt: new Date().toISOString()
    };

    setNotesHistoryByPost((prev) => {
      const next = {
        ...prev,
        [postId]: [entry, ...(prev[postId] || [])]
      };
      writeNotesHistory(notesStorageKey, next);
      return next;
    });
  }

  const filteredPosts = useMemo(
    () => posts.filter((post) => parsePostType(post) === previewMode),
    [posts, previewMode]
  );
  const instagramPreview = useMemo(() => {
    const defaultValue = {
      feedItems: [],
      storyItems: [],
      gridPost: null,
      gridCaption: 'Έτσι θα διαμορφωθεί το Instagram feed σας μετά τη δημοσίευση όλων των posts.'
    };

    if (previewMode !== 'instagram') return defaultValue;

    const carouselGroups = {};
    const singlePosts = [];
    const storyPosts = [];
    const gridPosts = [];

    filteredPosts.forEach((post) => {
      const meta = parseInstagramPreviewMeta(post);

      if (meta.kind === 'story') {
        storyPosts.push({ post, meta });
        return;
      }

      if (meta.kind === 'grid9') {
        gridPosts.push({ post, meta });
        return;
      }

      if (meta.kind === 'carousel') {
        const groupKey = meta.groupId || `carousel-${post.id}`;
        if (!carouselGroups[groupKey]) carouselGroups[groupKey] = [];
        carouselGroups[groupKey].push({ post, meta });
        return;
      }

      singlePosts.push({ post, meta });
    });

    const singleFeedItems = singlePosts.map(({ post }) => ({
      key: `single-${post.id}`,
      kind: 'single',
      post: { ...post, id: `single-${post.id}` },
      postIds: [post.id],
      historyKey: `single-${post.id}`,
      savingKey: `${post.id}`,
      sortOrder: Number(post.sort_order) || 0,
      createdAt: post.created_at || ''
    }));

    const carouselFeedItems = Object.entries(carouselGroups).map(([groupKey, rows]) => {
      const sortedRows = [...rows].sort((a, b) => {
        const orderA = Number(a.meta.slideOrder) || 0;
        const orderB = Number(b.meta.slideOrder) || 0;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(a.post.created_at || 0).getTime() - new Date(b.post.created_at || 0).getTime();
      });

      const basePost = sortedRows[0]?.post || {};
      const allPosts = sortedRows.map((row) => row.post);
      const postIds = allPosts.map((row) => row.id);
      const approvalStatuses = allPosts.map((row) => row.approval_status || 'pending');
      const hasDisapproved = approvalStatuses.includes('disapproved');
      const hasPending = approvalStatuses.includes('pending');
      const nextApprovalStatus = hasDisapproved ? 'disapproved' : (hasPending ? 'pending' : 'approved');
      const firstNotes = allPosts.find((row) => `${row.client_notes || ''}`.trim().length > 0);
      const savingKey = `group-${postIds.join('-')}`;

      return {
        key: `carousel-${groupKey}`,
        kind: 'carousel',
        post: {
          ...basePost,
          id: `carousel-${groupKey}`,
          approval_status: nextApprovalStatus,
          client_notes: firstNotes ? firstNotes.client_notes : ''
        },
        postIds,
        slides: allPosts,
        historyKey: `carousel-${groupKey}`,
        savingKey,
        sortOrder: Number(basePost.sort_order) || 0,
        createdAt: basePost.created_at || ''
      };
    });

    const sortedFeedItems = [...singleFeedItems, ...carouselFeedItems].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    });

    const sortedStories = [...storyPosts]
      .sort((a, b) => {
        const orderA = Number(a.post.sort_order) || 0;
        const orderB = Number(b.post.sort_order) || 0;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(a.post.created_at || 0).getTime() - new Date(b.post.created_at || 0).getTime();
      })
      .map(({ post }) => ({
        key: `story-${post.id}`,
        kind: 'story',
        post: { ...post, id: `story-${post.id}` },
        postIds: [post.id],
        historyKey: `story-${post.id}`,
        savingKey: `${post.id}`
      }));

    const gridPost = gridPosts.length > 0 ? gridPosts[gridPosts.length - 1].post : null;
    const gridCaption = gridPost?.caption || defaultValue.gridCaption;

    return {
      feedItems: sortedFeedItems,
      storyItems: sortedStories,
      gridPost,
      gridCaption
    };
  }, [filteredPosts, previewMode]);
  const approvedCount = useMemo(
    () => (previewMode === 'logo'
      ? (logoKit?.approval_status === 'approved' ? 1 : 0)
      : filteredPosts.filter((post) => post.approval_status === 'approved').length),
    [filteredPosts, logoKit, previewMode]
  );
  const disapprovedCount = useMemo(
    () => (previewMode === 'logo'
      ? (logoKit?.approval_status === 'disapproved' ? 1 : 0)
      : filteredPosts.filter((post) => post.approval_status === 'disapproved').length),
    [filteredPosts, logoKit, previewMode]
  );
  const needsReviewCount = useMemo(
    () => (previewMode === 'logo'
      ? ((logoKit?.approval_status === 'pending' || `${logoKit?.client_notes || ''}`.trim().length > 0) ? 1 : 0)
      : filteredPosts.filter((post) => (post.client_notes || '').trim().length > 0).length),
    [filteredPosts, logoKit, previewMode]
  );
  const pageTitle = previewMode === 'article'
    ? `${clientMeta?.name ? `${clientMeta.name} Ροή Εγκρίσεων Άρθρων` : 'Ροή Εγκρίσεων Άρθρων'}`
    : previewMode === 'logo'
      ? `${clientMeta?.name ? `${clientMeta.name} Logo Kit` : 'Logo Kit'}`
      : `${clientMeta?.name ? `${clientMeta.name} Ροή Εγκρίσεων` : 'Ροή Εγκρίσεων'}`;
  const pageSubtitle = previewMode === 'article'
    ? 'WordPress-style preview: ο πελάτης κάνει edit, αποθηκεύει αλλαγές και δίνει έγκριση ή απόρριψη.'
    : previewMode === 'logo'
      ? 'Animated logo presentation με δομημένα slides, σχόλια πελάτη και έγκριση ή απόρριψη.'
      : 'Αυτή η σελίδα προορίζεται μόνο για τον πελάτη. Χρησιμοποιείται για σημειώσεις και εγκρίσεις αναρτήσεων.';

  return (
    <>
      <AppStyle />
      <Page>
        <Hero>
          <OrbLeft />
          <OrbRight />

          <Title>{pageTitle}</Title>
          <Subtitle>{pageSubtitle}</Subtitle>

          <Stats>
            <StatCard>
              <StatLabel>Εγκεκριμένα</StatLabel>
              <StatValue>{approvedCount}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Απορριφθέντα</StatLabel>
              <StatValue>{disapprovedCount}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Χρειάζονται έλεγχο</StatLabel>
              <StatValue>{needsReviewCount}</StatValue>
            </StatCard>
          </Stats>
        </Hero>

        {status.loading && <State>Φόρτωση προεπισκόπησης...</State>}
        {status.error && <State $error>Σφάλμα: {status.error}</State>}
        {status.message && <State>{status.message}</State>}

        {!status.loading && !status.error && previewMode === 'article' && (
          <Feed $mode={previewMode}>
            {filteredPosts.length === 0 ? (
              <State>Δεν υπάρχουν δημοσιευμένα στοιχεία ακόμα για αυτό το tab. Μπες στη Διαχείριση για ανέβασμα.</State>
            ) : (
              filteredPosts.map((post, idx) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={idx}
                  pending={savingId === `${post.id}`}
                  onUpdateReview={updateReview}
                  historyEntries={notesHistoryByPost[post.id] || []}
                  onAppendHistory={appendNoteHistory}
                  previewMode={previewMode}
                />
              ))
            )}
          </Feed>
        )}

        {!status.loading && !status.error && previewMode === 'instagram' && (
          <>
            <Feed $mode="instagram">
              {instagramPreview.feedItems.length === 0 ? (
                <State>Δεν υπάρχουν δημοσιευμένα Instagram posts ακόμα. Μπες στη Διαχείριση για ανέβασμα.</State>
              ) : (
                instagramPreview.feedItems.map((item, idx) => (
                  <PostCard
                    key={item.key}
                    post={item.post}
                    postIds={item.postIds}
                    carouselSlides={item.slides || []}
                    instagramKind={item.kind}
                    index={idx}
                    pending={savingId === item.savingKey}
                    onUpdateReview={updateReview}
                    historyEntries={notesHistoryByPost[item.historyKey] || []}
                    onAppendHistory={(postKey, text, action) => appendNoteHistory(item.historyKey, text, action)}
                    previewMode={previewMode}
                  />
                ))
              )}
            </Feed>

            {instagramPreview.gridPost?.image_url && (
              <PreviewSection>
                <PreviewSectionTitle>9άδα Grid Preview (3x3)</PreviewSectionTitle>
                <UnifiedGridWrap>
                  <img src={instagramPreview.gridPost.image_url} alt="Instagram 9-grid preview" loading="lazy" />
                </UnifiedGridWrap>
                <StoryLine>{instagramPreview.gridCaption}</StoryLine>
              </PreviewSection>
            )}

            <PreviewSection>
              <PreviewSectionTitle>Instagram Stories Preview (9:16)</PreviewSectionTitle>
              {instagramPreview.storyItems.length === 0 ? (
                <State>Δεν υπάρχουν stories ακόμα.</State>
              ) : (
                <Feed $mode="article">
                  {instagramPreview.storyItems.map((item, idx) => (
                    <PostCard
                      key={item.key}
                      post={item.post}
                      postIds={item.postIds}
                      instagramKind={item.kind}
                      index={idx}
                      pending={savingId === item.savingKey}
                      onUpdateReview={updateReview}
                      historyEntries={notesHistoryByPost[item.historyKey] || []}
                      onAppendHistory={(postKey, text, action) => appendNoteHistory(item.historyKey, text, action)}
                      previewMode={previewMode}
                    />
                  ))}
                </Feed>
              )}
            </PreviewSection>
          </>
        )}

        {!status.loading && !status.error && previewMode === 'logo' && (
          <LogoKitPresentation
            logoKit={logoKit}
            assets={logoAssets}
            colors={logoColors}
            storySteps={logoStorySteps}
            clientName={clientMeta?.name || 'Client'}
            pending={savingId === `logo-${logoKit?.id}`}
            historyEntries={notesHistoryByPost[logoKit?.id] || []}
            onAppendHistory={appendNoteHistory}
            onUpdateLogoKitReview={updateLogoKitReview}
          />
        )}
      </Page>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
