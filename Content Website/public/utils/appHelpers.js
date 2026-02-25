const CONTENT_PREFIX = {
  instagram: '[IG]',
  article: '[ARTICLE]',
  logo: '[LOGO]'
};

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

export {
  CONTENT_PREFIX,
  getClientSlugFromUrl,
  getPreviewModeFromUrl,
  parsePostType,
  stripPostTypePrefix,
  parseInstagramPreviewMeta,
  isVideoPost,
  postOrderLabel,
  parseLogoAssetCategory,
  parseLogoMetaStep
};
