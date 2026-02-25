import styled, { createGlobalStyle, css } from 'styled-components';
import { cardIn, cardFlip, slideEnter, imageFade } from '../animations.js';

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

export {
  AppStyle,
  Page,
  Hero,
  OrbLeft,
  OrbRight,
  Title,
  Subtitle,
  Stats,
  StatCard,
  StatLabel,
  StatValue,
  State,
  Feed,
  Post,
  BlogPost,
  BlogTopRow,
  BlogThumb,
  BlogTopMeta,
  BlogContent,
  BlogMeta,
  BlogTitle,
  PostHeader,
  Avatar,
  Menu,
  OrderBadge,
  Media,
  MediaTag,
  MediaFilename,
  LikesLine,
  CarouselControls,
  CarouselControlButton,
  CarouselDots,
  CarouselDot,
  PreviewSection,
  PreviewSectionTitle,
  UnifiedGridWrap,
  PostBody,
  CaptionWrap,
  Caption,
  CaptionToggleRow,
  ReviewSection,
  ReviewBox,
  ArticleEditWrap,
  ArticleEditTextarea,
  ReviewHead,
  InlineAction,
  NotesHistory,
  NoteItem,
  NoteText,
  DecisionRow,
  DecisionNotice,
  DecisionButton,
  SaveRow,
  SaveNoteButton,
  NoteCollapsed,
  LoadingOverlay,
  LoadingBadge,
  LogoDeck,
  ProcessRibbon,
  ProcessStep,
  LogoTabs,
  LogoTabButton,
  SlideShell,
  SlideNav,
  SlideNavButton,
  SlideCounter,
  LogoSlide,
  LogoSlideTitle,
  ArrowLine,
  LogoVisualGrid,
  LogoVisualCard,
  LogoVisualThumb,
  LogoVisualName,
  ColorFlow,
  ColorNode,
  ColorNodeSwatch,
  ColorNodeLabel,
  FontList,
  FontRow,
  FontName,
  FontLink,
  StoryFlow,
  StoryLine,
  BrandSite,
  BrandTopNav,
  BrandNavButton,
  BrandSection,
  BrandHero,
  BrandHeroText,
  BrandKicker,
  BrandHeadline,
  BrandLead,
  BrandHeroVisual,
  BrandGrid,
  BrandPanel,
  TypefaceLine,
  PresentationShell,
  SlideDeckCard,
  SlideFrame,
  SlideBody,
  SlideCanvas,
  SlideHead,
  SlideHeadLine,
  SlideHeadRight,
  SlideTitle,
  SlideSubTitle,
  SlideLead,
  SlideFooter,
  FooterLabel,
  FooterConcept,
  HeroVisual,
  SummaryList,
  SummaryChips,
  SummaryChip,
  FamilyLayout,
  FamilyVisualStage,
  FamilyVisualGrid,
  FamilyThumb,
  FamilyTextBlock,
  QuoteCard,
  TypoPanel,
  TypoCard,
  TypoAlphabet,
  ColorBlocks,
  ColorGroup,
  PaletteGrid,
  PaletteCard,
  PaletteBars,
  PaletteBar,
  GradientCard,
  GroupTitle,
  ColorBox,
  ColorSample,
  ColorHex,
  ApplicationGrid,
  StoryGrid,
  SummaryStage,
  SummaryListMinimal,
  SummarySide,
  ApplicationImage,
  CenteredLogoStage,
  SymbolFlow,
  TransitionArrow,
  DeckNavigator
};
