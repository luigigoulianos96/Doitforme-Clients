import React from 'react';
import { LogoCaseStudyScene } from './LogoCaseStudyScene.js';

const h = React.createElement;

const rootStyle = {
  width: '100%'
};

const pageStyle = {
  width: '100%',
  background: '#b9b9b9',
  color: '#050505'
};

const cssText = `
  .logo-makers-page {
    --makers-bg: #b9b9b9;
    --makers-text: #050505;
    --makers-muted: #1f1f1f;
    --makers-accent: #ff5a1f;
    --makers-line: rgba(0, 0, 0, 0.2);
    --makers-max: 1500px;
    background: var(--makers-bg);
    color: var(--makers-text);
  }

  @media (hover: hover) and (pointer: fine) {
    .logo-makers-page.has-custom-cursor,
    .logo-makers-page.has-custom-cursor * {
      cursor: none !important;
    }
  }

  .logo-makers-page,
  .logo-makers-page * {
    box-sizing: border-box;
  }

  .logo-makers-page .mk-container {
    width: min(var(--makers-max), 100%);
    margin-right: auto;
    margin-left: auto;
    padding-right: 18px;
    padding-left: 18px;
  }

  .logo-makers-page .mk-header {
    display: grid;
    gap: 12px;
    padding-top: 28px;
    padding-bottom: 12px;
  }

  .logo-makers-page .mk-label-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .logo-makers-page .mk-label {
    margin: 0;
    font-family: "Sora", sans-serif;
    font-size: 10px;
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .logo-makers-page .mk-label.right {
    text-align: right;
    max-width: 14ch;
  }

  .logo-makers-page .mk-title {
    margin: 0;
    font-family: "Syne", sans-serif;
    font-size: clamp(34px, 6vw, 72px);
    line-height: 0.88;
    letter-spacing: -0.055em;
    font-weight: 700;
    text-transform: uppercase;
  }

  .logo-makers-page .mk-meta {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding-top: 10px;
    font-family: "Sora", sans-serif;
    font-size: 9px;
    line-height: 1.3;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .logo-makers-page .mk-divider {
    border-top: 1px solid var(--makers-line);
    margin-top: 6px;
  }

  .logo-makers-page .mk-main-image {
    margin-top: 18px;
    display: grid;
    place-items: center;
    min-height: clamp(260px, 48vw, 680px);
    padding: clamp(14px, 3vw, 36px);
    overflow: visible;
    border-radius: 20px;
  }

  .logo-makers-page .mk-image {
    display: block;
    width: 100%;
    height: auto;
    border: 0;
  }

  .logo-makers-page .mk-copy {
    display: grid;
    grid-template-columns: 14px minmax(0, 1fr);
    gap: 12px;
    margin-top: 14px;
  }

  .logo-makers-page .mk-copy-mark {
    font-family: "Sora", sans-serif;
    font-size: clamp(24px, 3vw, 36px);
    line-height: 1;
    font-weight: 700;
  }

  .logo-makers-page .mk-copy-text {
    display: grid;
    gap: 10px;
    max-width: none;
  }

  .logo-makers-page .mk-copy-text p {
    margin: 0;
    font-family: "Sora", sans-serif;
    font-size: clamp(15px, 1.5vw, 20px);
    line-height: 1.75;
    color: rgba(0, 0, 0, 0.84);
  }

  .logo-makers-page .mk-split {
    display: grid;
    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
    gap: 24px;
    margin-top: 40px;
    align-items: start;
  }

  .logo-makers-page .mk-side-note {
    display: grid;
    gap: 12px;
  }

  .logo-makers-page .mk-meta-list {
    display: grid;
    gap: 0;
  }

  .logo-makers-page .mk-meta-row {
    display: grid;
    grid-template-columns: minmax(110px, 180px) minmax(0, 1fr);
    align-items: center;
    gap: 18px;
    padding: 16px 0;
    border-top: 1px solid rgba(0, 0, 0, 0.14);
  }

  .logo-makers-page .mk-meta-row:last-child {
    border-bottom: 1px solid rgba(0, 0, 0, 0.14);
  }

  .logo-makers-page .mk-meta-key,
  .logo-makers-page .mk-meta-value {
    margin: 0;
    font-family: "Sora", sans-serif;
    color: rgba(0, 0, 0, 0.88);
  }

  .logo-makers-page .mk-meta-key {
    font-size: clamp(12px, 0.95vw, 14px);
    line-height: 1.2;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .logo-makers-page .mk-meta-value {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 12px 28px;
    font-size: clamp(18px, 1.9vw, 28px);
    line-height: 1.25;
    letter-spacing: -0.02em;
    text-align: right;
  }

  .logo-makers-page .mk-meta-value.service-list {
    gap: 12px 36px;
  }

  .logo-makers-page .mk-meta-chip {
    display: inline-block;
    white-space: nowrap;
  }

  .logo-makers-page .mk-side-note p {
    margin: 0;
    font-family: "Sora", sans-serif;
    font-size: clamp(13px, 1.2vw, 16px);
    line-height: 1.7;
    letter-spacing: 0.02em;
    color: rgba(0, 0, 0, 0.82);
  }

  .logo-makers-page .detail-card {
    display: grid;
    gap: 8px;
    padding: 14px 0 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.14);
  }

  .logo-makers-page .detail-card h3,
  .logo-makers-page .detail-card p,
  .logo-makers-page .detail-card ul,
  .logo-makers-page .detail-card li {
    margin: 0;
  }

  .logo-makers-page .detail-card h3 {
    font-family: "Sora", sans-serif;
    font-size: clamp(12px, 1vw, 14px);
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .logo-makers-page .detail-card p,
  .logo-makers-page .detail-card li {
    font-family: "Sora", sans-serif;
    font-size: clamp(14px, 1.3vw, 17px);
    line-height: 1.75;
    color: rgba(0, 0, 0, 0.82);
  }

  .logo-makers-page .detail-card ul {
    display: grid;
    gap: 6px;
    padding: 0;
    list-style: none;
  }

  .logo-makers-page .mk-statement {
    display: grid;
    grid-template-columns: 14px minmax(0, 1fr);
    gap: 12px;
    align-items: start;
    margin-top: 34px;
  }

  .logo-makers-page .mk-statement-text {
    margin: 0 auto;
    max-width: 22ch;
    text-align: center;
    font-family: "Syne", sans-serif;
    font-size: clamp(20px, 4vw, 42px);
    line-height: 0.94;
    letter-spacing: -0.04em;
    text-transform: uppercase;
    font-weight: 700;
  }

  .logo-makers-page .mk-gallery {
    display: grid;
    gap: 16px;
    margin-top: 28px;
  }

  .logo-makers-page .mk-gallery.full {
    grid-template-columns: 1fr;
  }

  .logo-makers-page .mk-gallery.pair {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .logo-makers-page .mk-gallery.triple {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .logo-makers-page .mk-gallery figure {
    margin: 0;
    min-width: 0;
    display: grid;
  }

  .logo-makers-page .mk-frame {
    display: grid;
    place-items: center;
    width: 100%;
    overflow: hidden;
    border-radius: 18px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    background: rgba(255, 255, 255, 0.16);
  }

  .logo-makers-page .mk-frame.surface {
    background: rgba(255, 255, 255, 0.36);
    padding: clamp(14px, 2.2vw, 28px);
  }

  .logo-makers-page .mk-frame.contain {
    min-height: clamp(220px, 30vw, 420px);
    place-items: center;
  }

  .logo-makers-page .mk-frame.contain .mk-image {
    width: auto;
    max-width: 100%;
    max-height: min(54vh, 420px);
    object-fit: contain;
  }

  .logo-makers-page .mk-main-image.logo-hero {
    background: transparent;
    border: 0;
    min-height: clamp(260px, 54vw, 760px);
  }

  .logo-makers-page .mk-main-image.logo-hero .mk-image {
    width: auto;
    max-width: 100%;
    max-height: min(68vh, 720px);
    object-fit: contain;
  }

  .logo-makers-page .mk-main-image.photo-hero {
    aspect-ratio: auto;
    overflow: visible;
    min-height: clamp(260px, 48vw, 760px);
    background: rgba(255, 255, 255, 0.34);
    border: 1px solid rgba(0, 0, 0, 0.08);
    padding: clamp(14px, 3vw, 36px);
  }

  .logo-makers-page .mk-main-image .mk-image,
  .logo-makers-page .mk-frame:not(.contain) .mk-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .logo-makers-page .mk-frame.logo {
    aspect-ratio: auto;
    min-height: clamp(220px, 30vw, 420px);
    padding: clamp(12px, 2.4vw, 26px);
    border-color: rgba(0, 0, 0, 0.04);
    background: transparent;
  }

  .logo-makers-page .mk-frame.logo .mk-image {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: min(54vh, 420px);
    object-fit: contain;
  }

  .logo-makers-page .mk-frame.photo {
    aspect-ratio: auto;
    min-height: clamp(220px, 30vw, 420px);
    padding: clamp(12px, 2.4vw, 26px);
    border-color: rgba(0, 0, 0, 0.05);
    background: rgba(255, 255, 255, 0.22);
  }

  .logo-makers-page .mk-main-image.photo-hero .mk-image,
  .logo-makers-page .mk-frame.photo .mk-image {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: min(68vh, 760px);
    object-fit: contain;
  }

  .logo-makers-page .mk-gallery.full .mk-frame {
    aspect-ratio: 16 / 10;
  }

  .logo-makers-page .mk-gallery.pair .mk-frame {
    aspect-ratio: 4 / 5;
  }

  .logo-makers-page .mk-gallery.triple .mk-frame {
    aspect-ratio: 1 / 1;
  }

  .logo-makers-page .mk-gallery .mk-frame.logo {
    aspect-ratio: auto;
  }

  .logo-makers-page .mk-gallery .mk-frame.photo {
    aspect-ratio: auto;
  }

  .logo-makers-page .mk-caption {
    display: block;
    margin-top: 10px;
    font-family: "Sora", sans-serif;
    font-size: 9px;
    line-height: 1.3;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.76);
  }

  .logo-makers-page .mk-section-block {
    display: grid;
    gap: 18px;
    margin-top: 34px;
  }

  .logo-makers-page .mk-section-head {
    display: grid;
    gap: 10px;
  }

  .logo-makers-page .mk-section-title {
    margin: 0;
    font-family: "Sora", sans-serif;
    font-size: clamp(14px, 1.1vw, 18px);
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .logo-makers-page .mk-section-body {
    display: grid;
    gap: 10px;
    max-width: none;
  }

  .logo-makers-page .mk-section-body p {
    margin: 0;
    font-family: "Sora", sans-serif;
    font-size: clamp(14px, 1.25vw, 18px);
    line-height: 1.75;
    color: rgba(0, 0, 0, 0.82);
  }

  .logo-makers-page .mk-font-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .logo-makers-page .mk-font-card {
    display: grid;
    gap: 10px;
    padding: clamp(14px, 2vw, 24px);
    border-radius: 18px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    background: rgba(255, 255, 255, 0.16);
  }

  .logo-makers-page .mk-font-label {
    margin: 0;
    font-family: "Sora", sans-serif;
    font-size: 11px;
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.7);
  }

  .logo-makers-page .mk-font-sample {
    margin: 0;
    font-size: clamp(34px, 4vw, 68px);
    line-height: 0.95;
    letter-spacing: -0.04em;
    color: rgba(0, 0, 0, 0.9);
  }

  .logo-makers-page .mk-palette {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-top: 24px;
  }

  .logo-makers-page .mk-palette-col {
    display: grid;
    gap: 14px;
  }

  .logo-makers-page .mk-palette-card {
    background: #dcdcdc;
    padding: 14px;
    border-radius: 14px;
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  .logo-makers-page .mk-swatch {
    width: 100%;
    height: clamp(56px, 10vw, 120px);
    border: 1px solid rgba(0, 0, 0, 0.12);
  }

  .logo-makers-page .mk-swatch-meta {
    margin-top: 8px;
    font-family: "Sora", sans-serif;
    font-size: 9px;
    line-height: 1.3;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .logo-makers-page .mk-next {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 18px 32px;
    min-height: 130px;
    margin-top: 32px;
    text-align: center;
  }

  .logo-makers-page .mk-next-link {
    text-decoration: none;
  }

  .logo-makers-page .mk-next-label {
    margin: 0;
    font-family: "Sora", sans-serif;
    font-size: clamp(16px, 3vw, 28px);
    line-height: 1;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--makers-accent);
  }

  .logo-makers-page .mk-cursor {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    width: 18px;
    height: 18px;
    margin-left: -9px;
    margin-top: -9px;
    pointer-events: none;
    opacity: 0;
    transform: translate3d(-100px, -100px, 0);
    transition: opacity 140ms ease;
  }

  .logo-makers-page .mk-cursor.visible {
    opacity: 1;
  }

  .logo-makers-page .mk-cursor-core,
  .logo-makers-page .mk-cursor-ring {
    position: absolute;
    inset: 0;
    border-radius: 999px;
  }

  .logo-makers-page .mk-cursor-core {
    inset: 5px;
    background: var(--makers-cursor-primary, var(--makers-accent));
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--makers-cursor-secondary, var(--makers-accent)) 18%, transparent),
      0 0 18px color-mix(in srgb, var(--makers-cursor-primary, var(--makers-accent)) 28%, transparent);
    transition:
      inset 180ms ease,
      background 180ms ease,
      box-shadow 180ms ease,
      transform 180ms ease;
  }

  .logo-makers-page .mk-cursor-ring {
    border: 1px solid color-mix(in srgb, var(--makers-cursor-secondary, var(--makers-accent)) 78%, transparent);
    background:
      radial-gradient(circle at center, color-mix(in srgb, var(--makers-cursor-primary, var(--makers-accent)) 20%, transparent) 0%, transparent 62%),
      radial-gradient(circle at 68% 34%, color-mix(in srgb, var(--makers-cursor-secondary, var(--makers-accent)) 28%, transparent) 0%, transparent 58%);
    transform: scale(0.82);
    opacity: 0.9;
    transition:
      transform 220ms ease,
      border-color 180ms ease,
      opacity 180ms ease,
      background 180ms ease;
  }

  .logo-makers-page .mk-cursor.active .mk-cursor-core {
    inset: 3px;
    background: linear-gradient(135deg, var(--makers-cursor-primary, var(--makers-accent)), var(--makers-cursor-secondary, var(--makers-accent)));
    transform: scale(0.92);
  }

  .logo-makers-page .mk-cursor.active .mk-cursor-ring {
    transform: scale(2.8);
    opacity: 0.88;
    border-color: color-mix(in srgb, var(--makers-cursor-primary, var(--makers-accent)) 50%, var(--makers-cursor-secondary, var(--makers-accent)));
    background:
      radial-gradient(circle at center, color-mix(in srgb, var(--makers-cursor-primary, var(--makers-accent)) 18%, transparent) 0%, transparent 44%),
      conic-gradient(from 180deg, color-mix(in srgb, var(--makers-cursor-primary, var(--makers-accent)) 22%, transparent), color-mix(in srgb, var(--makers-cursor-secondary, var(--makers-accent)) 24%, transparent), color-mix(in srgb, var(--makers-cursor-primary, var(--makers-accent)) 14%, transparent));
  }

  .logo-makers-page .mk-cursor.pressed .mk-cursor-core {
    transform: scale(0.74);
  }

  .logo-makers-page .mk-cursor.pressed .mk-cursor-ring {
    transform: scale(2.15);
  }

  @media only screen and (max-width: 1023px) {
    .logo-makers-page .mk-container {
      padding-right: calc(12px + env(safe-area-inset-right));
      padding-left: calc(12px + env(safe-area-inset-left));
    }

    .logo-makers-page .mk-split {
      grid-template-columns: 1fr;
      gap: 16px;
      margin-top: 28px;
    }

    .logo-makers-page .mk-meta-row {
      grid-template-columns: 1fr;
      gap: 8px;
      align-items: start;
    }

    .logo-makers-page .mk-meta-value {
      justify-content: flex-start;
      text-align: left;
      font-size: 18px;
    }

    .logo-makers-page .mk-gallery {
      gap: 12px;
      margin-top: 22px;
    }

    .logo-makers-page .mk-gallery.triple {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .logo-makers-page .mk-frame.contain {
      min-height: 160px;
    }

    .logo-makers-page .mk-main-image,
    .logo-makers-page .mk-gallery.full .mk-frame {
      aspect-ratio: 5 / 4;
    }

    .logo-makers-page .mk-gallery.pair .mk-frame {
      aspect-ratio: 1 / 1.18;
    }

    .logo-makers-page .mk-main-image.logo-hero,
    .logo-makers-page .mk-main-image.photo-hero,
    .logo-makers-page .mk-gallery .mk-frame.logo,
    .logo-makers-page .mk-gallery .mk-frame.photo {
      aspect-ratio: auto;
    }

    .logo-makers-page .mk-statement-text {
      max-width: 18ch;
    }

    .logo-makers-page .mk-copy-text p,
    .logo-makers-page .detail-card p,
    .logo-makers-page .detail-card li {
      font-size: 14px;
    }

    .logo-makers-page .mk-palette {
      gap: 12px;
    }

    .logo-makers-page .mk-font-grid {
      grid-template-columns: 1fr;
    }
  }
`;

function normalizeText(value) {
  return `${value || ''}`.trim();
}

function splitParagraphs(value) {
  return normalizeText(value)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function uniqueAssets(items) {
  const seen = new Set();
  return (items || []).filter((item) => {
    const key = item?.id || item?.file_url;
    if (!key || !item?.file_url || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderParagraphSet(text, keyPrefix) {
  return splitParagraphs(text).map((line, index) =>
    h('p', { key: `${keyPrefix}-${index}` }, line)
  );
}

function parseAssetCategory(asset) {
  const value = `${asset?.file_name || ''}`;
  const match = value.match(/^([A-Z_]+)::/);
  return match ? match[1] : '';
}

function isLogoLikeAsset(asset) {
  return ['MAIN_LOGO', 'SECONDARY_LOGO', 'LOGOMARK', 'LOGO_VARIATION', 'INSPIRATION_RESULT'].includes(parseAssetCategory(asset));
}

function buildNextProposalUrl(clientSlug, nextProposalNumber) {
  const params = new URLSearchParams();
  params.set('client', clientSlug || '');
  params.set('mode', 'logo');
  params.set('proposal', `${nextProposalNumber}`);
  return `?${params.toString()}`;
}

function renderImageFigure(asset, label, options = {}) {
  if (!asset?.file_url) return null;
  const contain = options.contain ?? isLogoLikeAsset(asset);
  const surface = options.surface ?? false;
  const classNames = ['mk-frame'];
  if (contain) classNames.push('contain', 'logo');
  else classNames.push('photo');
  if (surface) classNames.push('surface');

  return h(
    'figure',
    { key: `${asset.id || asset.file_url}-${label || 'visual'}` },
    h(
      'div',
      { className: classNames.join(' ') },
      h('img', {
        src: asset.file_url,
        alt: label || asset.file_name || 'Logo visual',
        className: 'mk-image',
        loading: 'lazy'
      })
    ),
    label ? h('span', { className: 'mk-caption' }, label) : null
  );
}

function renderGallery(assets, type, options = {}) {
  const unique = uniqueAssets(assets);
  if (unique.length === 0) return null;

  return h(
    LogoCaseStudyScene,
    {
      as: 'section',
      className: `mk-gallery mk-container ${type}`,
      variant: options.variant || 'soft',
      delayMs: options.delayMs || 0
    },
    unique.map((asset, index) =>
      renderImageFigure(asset, options.showLabels ? `${options.labelPrefix || 'Visual'} ${index + 1}` : null, {
        surface: options.surface,
        contain: options.contain
      })
    )
  );
}

function renderStatement(text, delayMs) {
  const value = normalizeText(text);
  if (!value) return null;

  return h(
    LogoCaseStudyScene,
    {
      as: 'section',
      className: 'mk-statement mk-container',
      variant: 'soft',
      delayMs
    },
    h('div', { className: 'mk-copy-mark' }, '✱'),
    h('p', { className: 'mk-statement-text' }, value)
  );
}

function renderSideCard(title, content, key, isList = false) {
  const lines = isList ? (content || []).filter(Boolean) : splitParagraphs(content);
  if (!normalizeText(title) && lines.length === 0) return null;

  return h(
    'div',
    { key, className: 'detail-card' },
    title ? h('h3', null, title) : null,
    isList
      ? h(
          'ul',
          null,
          lines.map((line, index) => h('li', { key: `${key}-${index}` }, line))
        )
      : lines.map((line, index) => h('p', { key: `${key}-${index}` }, line))
  );
}

function renderMetaRow(item) {
  if (!item?.value) return null;
  const chips = item.label === 'Services'
    ? `${item.value}`.split(',').map((part) => part.trim()).filter(Boolean)
    : [`${item.value}`];

  return h(
    'div',
    { key: item.label, className: 'mk-meta-row' },
    h('p', { className: 'mk-meta-key' }, `${item.label}:`),
    h(
      'div',
      { className: `mk-meta-value${item.label === 'Services' ? ' service-list' : ''}` },
      chips.map((chip, index) => h('span', { key: `${item.label}-${index}`, className: 'mk-meta-chip' }, chip))
    )
  );
}

function renderSectionHeader(title, body) {
  const heading = normalizeText(title);
  const paragraphs = splitParagraphs(body);
  if (!heading && paragraphs.length === 0) return null;

  return h(
    'div',
    { className: 'mk-section-head' },
    heading ? h('p', { className: 'mk-section-title' }, heading) : null,
    paragraphs.length > 0
      ? h('div', { className: 'mk-section-body' }, paragraphs.map((line, index) => h('p', { key: `${heading || 'section'}-${index}` }, line)))
      : null
  );
}

function renderTypographySection(typographySection, fonts, fontFamilies, delayMs) {
  const title = typographySection?.title || 'Typography';
  const body = typographySection?.body || '';
  const header = renderSectionHeader(title, body);
  const availableFonts = (fonts || []).slice(0, 2);

  if (!header && availableFonts.length === 0) return null;

  return h(
    LogoCaseStudyScene,
    { as: 'section', className: 'mk-container mk-section-block', variant: 'soft', delayMs },
    header,
    availableFonts.length > 0
      ? h(
          'div',
          { className: 'mk-font-grid' },
          availableFonts.map((font, index) =>
            h(
              'div',
              { key: font.id || font.file_url || `font-${index}`, className: 'mk-font-card' },
              h('p', { className: 'mk-font-label' }, font.file_name || `Font ${index + 1}`),
              h(
                'p',
                {
                  className: 'mk-font-sample',
                  style: { fontFamily: fontFamilies[index]?.family || '"Syne", sans-serif' }
                },
                'Luko Pop'
              )
            )
          )
        )
      : h(
          'div',
          { className: 'mk-font-grid' },
          h(
            'div',
            { className: 'mk-font-card' },
            h('p', { className: 'mk-font-label' }, typographySection?.primaryLabel || 'Primary Display'),
            h('p', { className: 'mk-font-sample', style: { fontFamily: '"Syne", sans-serif' } }, 'Luko Pop')
          ),
          h(
            'div',
            { className: 'mk-font-card' },
            h('p', { className: 'mk-font-label' }, typographySection?.secondaryLabel || 'Support Text'),
            h('p', { className: 'mk-font-sample', style: { fontFamily: '"Sora", sans-serif', fontSize: 'clamp(24px, 3vw, 42px)' } }, 'Pop into happiness')
          )
        )
  );
}

function renderSectionGalleryFlow(title, body, assets, delayMs, options = {}) {
  const unique = uniqueAssets(assets);
  const header = renderSectionHeader(title, body);
  if (!header && unique.length === 0) return null;

  const leadAssets = unique.slice(0, 1);
  const pairAssets = unique.slice(1, 3);
  const finalAsset = unique.slice(3, 4);

  return h(
    React.Fragment,
    null,
    h(
      LogoCaseStudyScene,
      { as: 'section', className: 'mk-container mk-section-block', variant: 'soft', delayMs },
      header
    ),
    leadAssets.length > 0 ? renderGallery(leadAssets, 'full', { delayMs: delayMs + 20, contain: options.contain }) : null,
    pairAssets.length > 0 ? renderGallery(pairAssets, 'pair', { delayMs: delayMs + 40, contain: options.contain }) : null,
    finalAsset.length > 0 ? renderGallery(finalAsset, 'full', { delayMs: delayMs + 60, contain: options.contain }) : null
  );
}

function renderPaletteSection(section, palette, delayMs) {
  if ((palette.primary || []).length === 0 && (palette.secondary || []).length === 0) return null;

  function renderColumn(title, colors) {
    if ((colors || []).length === 0) return null;
    return h(
      'div',
      { className: 'mk-palette-col' },
      colors.map((colorValue, index) =>
        h(
          'div',
          { key: `${title}-${colorValue}-${index}`, className: 'mk-palette-card' },
          h('div', { className: 'mk-swatch', style: { background: colorValue } }),
          h('div', { className: 'mk-swatch-meta' }, `${title} ${index + 1} / ${colorValue}`)
        )
      )
    );
  }

  return h(
    LogoCaseStudyScene,
    { as: 'section', className: 'mk-container mk-section-block', variant: 'soft', delayMs },
    renderSectionHeader(
      section?.title || 'Color Palette',
      section?.body || 'Η δυνατότητα της πολυμορφικής απόδοσης μέσα από το χρώμα.'
    ),
    h(
      'div',
      { className: 'mk-palette' },
      renderColumn('Primary', palette.primary),
      renderColumn('Secondary', palette.secondary)
    )
  );
}

function LogoPreviewCursor({ primaryColor, secondaryColor }) {
  const [cursor, setCursor] = React.useState({
    x: -100,
    y: -100,
    visible: false,
    active: false,
    pressed: false
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const hoverSelector = [
      '.mk-gallery figure',
      '.mk-palette-card',
      '.mk-statement',
      '.mk-side-note',
      '.mk-next',
      '.mk-main-image'
    ].join(', ');

    const handleMove = (event) => {
      setCursor((prev) => ({
        ...prev,
        x: event.clientX,
        y: event.clientY,
        visible: true
      }));
    };

    const handleLeave = () => {
      setCursor((prev) => ({
        ...prev,
        visible: false,
        active: false,
        pressed: false
      }));
    };

    const handleOver = (event) => {
      const isHoverTarget = Boolean(event.target?.closest?.(hoverSelector));
      setCursor((prev) => ({
        ...prev,
        active: isHoverTarget
      }));
    };

    const handleDown = () => {
      setCursor((prev) => ({
        ...prev,
        pressed: true
      }));
    };

    const handleUp = () => {
      setCursor((prev) => ({
        ...prev,
        pressed: false
      }));
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mouseout', handleLeave);
    window.addEventListener('mouseover', handleOver);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseout', handleLeave);
      window.removeEventListener('mouseover', handleOver);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  return h(
    'div',
    {
      className: `mk-cursor${cursor.visible ? ' visible' : ''}${cursor.active ? ' active' : ''}${cursor.pressed ? ' pressed' : ''}`,
      style: {
        transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`,
        '--makers-cursor-primary': primaryColor,
        '--makers-cursor-secondary': secondaryColor
      }
    },
    h('span', { className: 'mk-cursor-ring' }),
    h('span', { className: 'mk-cursor-core' })
  );
}

function LogoCaseStudyRenderer({ model, logoKitIndex = 0, logoKitCount = 0, clientSlug = '' }) {
  if (!model?.logoKit) {
    return h(
      'div',
      { style: rootStyle, className: 'logo-makers-page' },
      h('style', null, cssText),
      h(
        'article',
        { style: pageStyle },
        h(
          'section',
          { className: 'mk-container', style: { paddingTop: '32px', paddingBottom: '40px' } },
          h('p', { className: 'mk-label' }, 'Logo Kit'),
          h('h1', { className: 'mk-title' }, 'The Makers'),
          h('div', { className: 'mk-divider' }),
          h(
            'div',
            { className: 'mk-copy-text' },
            h('p', null, 'Δεν υπάρχει δημοσιευμένο logo kit για αυτόν τον client ακόμα.')
          )
        )
      )
    );
  }

  const {
    meta,
    fonts,
    fontFamilies,
    palette,
    visuals,
    sections,
    derived,
    heroTitle,
    heroEyebrow,
    heroSub,
    heroLead,
    introBody,
    metaItems
  } = model;

  const services = Array.isArray(meta.services) ? meta.services.filter(Boolean) : [];
  const mainHero = derived.heroAsset || visuals.mainLogo || visuals.secondaryLogo || visuals.logomark || null;
  const logoSet = uniqueAssets([
    visuals.mainLogo,
    visuals.secondaryLogo,
    visuals.logomark,
    ...(visuals.logoVariations || [])
  ]);
  const rationaleSet = uniqueAssets([
    ...(derived.rationaleVisuals || []),
    ...(derived.constructionVisuals || [])
  ]);
  const applicationSet = uniqueAssets(derived.applicationVisuals || []);
  const extraGallerySet = uniqueAssets(derived.galleryVisuals || []);
  const supportSet = uniqueAssets([
    ...(visuals.logoVariations || []).slice(0, 2),
    ...(rationaleSet || []).slice(0, 2)
  ]);
  const introText = normalizeText(heroLead || introBody || sections.projectIntro?.body);
  const displayBrandTitle = meta.brandName || heroTitle || 'Brand Identity';
  const cursorPrimary = palette.primary?.[0] || '#ff5a1f';
  const cursorSecondary = palette.secondary?.[0] || palette.primary?.[1] || cursorPrimary;
  const isLogoHero = isLogoLikeAsset(mainHero);
  const previousProposalNumber = logoKitIndex;
  const nextProposalNumber = logoKitIndex + 2;
  const hasPreviousProposal = previousProposalNumber >= 1;
  const hasNextProposal = nextProposalNumber <= logoKitCount;
  const shouldShowProposalNav = hasPreviousProposal || hasNextProposal;
  const previousProposalUrl = hasPreviousProposal ? buildNextProposalUrl(clientSlug, previousProposalNumber) : '';
  const shouldShowNextProposal = hasNextProposal;
  const nextProposalUrl = hasNextProposal ? buildNextProposalUrl(clientSlug, nextProposalNumber) : '';
  const quoteA = normalizeText(
    sections.challenge?.title ||
      sections.rationale?.title ||
      sections.closing?.title ||
      heroSub
  );
  const sideCards = [
    renderSideCard(sections.challenge?.title || 'Challenge', sections.challenge?.body, 'challenge'),
    renderSideCard('Concept Pillars', (sections.pillars?.items || []).map((item) => item.description ? `${item.label}: ${item.description}` : item.label), 'pillars', true),
    renderSideCard(sections.rationale?.title || 'Design Rationale', sections.rationale?.body, 'rationale')
  ].filter(Boolean);

  return h(
    'div',
    {
      style: {
        ...rootStyle,
        '--makers-cursor-primary': cursorPrimary,
        '--makers-cursor-secondary': cursorSecondary
      },
      className: 'logo-makers-page has-custom-cursor'
    },
    h('style', null, cssText),
    h(LogoPreviewCursor, { primaryColor: cursorPrimary, secondaryColor: cursorSecondary }),
    h(
      'article',
      { style: pageStyle },
      h(
        LogoCaseStudyScene,
        { as: 'header', className: 'mk-header mk-container', variant: 'hero', delayMs: 30 },
        h(
          'div',
          { className: 'mk-label-row' },
          h('p', { className: 'mk-label' }, heroEyebrow || 'Logo Presentation'),
          h('p', { className: 'mk-label right' }, services.slice(0, 2).join(' / ') || 'Brand Identity')
        ),
        h('h1', { className: 'mk-title' }, displayBrandTitle),
        h(
          'div',
          { className: 'mk-meta' },
          h('span', null, heroTitle),
          h('span', null, meta.agencyName || meta.brandName || '')
        ),
        h('div', { className: 'mk-divider' })
      ),
      mainHero
        ? h(
            LogoCaseStudyScene,
            {
              as: 'section',
              className: `mk-main-image mk-container ${isLogoHero ? 'logo-hero' : 'photo-hero'}`,
              variant: 'section',
              delayMs: 50
            },
            h('img', {
              src: mainHero.file_url,
              alt: heroTitle || mainHero.file_name || 'Hero visual',
              className: 'mk-image',
              loading: 'lazy'
            })
          )
        : null,
      introText
        ? h(
            LogoCaseStudyScene,
            { as: 'section', className: 'mk-copy mk-container', variant: 'soft', delayMs: 70 },
            h('div', { className: 'mk-copy-mark' }, '✱'),
            h('div', { className: 'mk-copy-text' }, renderParagraphSet(introText, 'intro'))
          )
        : null,
      (sideCards.length > 0 || supportSet.length > 0)
        ? h(
            LogoCaseStudyScene,
            { as: 'section', className: 'mk-split mk-container', variant: 'soft', delayMs: 90 },
            h(
              'div',
              { className: 'mk-side-note' },
              h('div', { className: 'mk-meta-list' }, metaItems.map((item) => renderMetaRow(item))),
              heroSub ? h('p', null, heroSub) : null
            ),
            h(
              'div',
              { className: 'mk-side-note' },
              sideCards,
              supportSet.length > 0
                ? h(
                    'div',
                    { className: 'mk-gallery pair', style: { marginTop: '0' } },
                    supportSet.slice(0, 2).map((asset, index) =>
                      renderImageFigure(asset, null, { surface: false, contain: false, key: `support-${index}` })
                    )
                  )
                : null
            )
          )
        : null,
      renderGallery(logoSet.slice(0, 1), 'full', { variant: 'section', delayMs: 110 }),
      renderStatement(quoteA, 130),
      renderGallery(rationaleSet.slice(0, 2), 'pair', { delayMs: 150 }),
      renderSectionGalleryFlow(
        sections.logoShowcase?.title || 'Logo System',
        sections.logoShowcase?.caption || '',
        logoSet.slice(1),
        180,
        { contain: true }
      ),
      renderTypographySection(sections.typography, fonts, fontFamilies, 240),
      renderPaletteSection(sections.palette, palette, 280),
      renderSectionGalleryFlow(
        sections.applications?.title || 'Applications',
        sections.applications?.body || '',
        applicationSet,
        320
      ),
      renderSectionGalleryFlow(
        sections.gallery?.title || 'Gallery',
        sections.gallery?.body || '',
        extraGallerySet,
        400
      ),
      renderSectionGalleryFlow(
        sections.closing?.title || 'Closing',
        sections.closing?.body || '',
        [visuals.mainLogo || visuals.secondaryLogo || visuals.logomark].filter(Boolean),
        460,
        { contain: true }
      ),
      shouldShowProposalNav
        ? h(
            LogoCaseStudyScene,
            { as: 'section', className: 'mk-next mk-container', variant: 'soft', delayMs: 520 },
            hasPreviousProposal
              ? h(
                  'a',
                  { href: previousProposalUrl, className: 'mk-next-link' },
                  h('p', { className: 'mk-next-label' }, 'ΠΡΟΗΓΟΥΜΕΝΗ ΠΡΟΤΑΣΗ')
                )
              : null,
            shouldShowNextProposal
              ? h(
                  'a',
                  { href: nextProposalUrl, className: 'mk-next-link' },
                  h('p', { className: 'mk-next-label' }, 'ΕΠΟΜΕΝΗ ΠΡΟΤΑΣΗ')
                )
              : null
          )
        : null
    )
  );
}

export { LogoCaseStudyRenderer };
