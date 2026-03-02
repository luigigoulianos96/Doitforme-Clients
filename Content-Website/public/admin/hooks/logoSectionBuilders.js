import { LOGO_SECTION_TYPE } from './logoContentModel.js';

function normalizeParagraphText(value) {
  return `${value || ''}`
    .replace(/\r/g, '')
    .split(/\n{2,}/)
    .map((entry) => entry.replace(/[ \t]+\n/g, '\n').trim())
    .filter(Boolean)
    .join('\n\n');
}

function normalizeStringList(items) {
  return (items || [])
    .map((item) => `${item || ''}`.trim())
    .filter(Boolean);
}

function normalizePillarItems(items) {
  return (items || [])
    .map((item) => ({
      label: `${item?.label || ''}`.trim(),
      description: `${item?.description || ''}`.trim()
    }))
    .filter((item) => item.label);
}

function createLogoStorySection(sectionType, data = {}, options = {}) {
  return {
    type: LOGO_SECTION_TYPE,
    sectionType,
    enabled: options.enabled !== false,
    data
  };
}

function normalizeLogoSectionPayload(section) {
  const sectionType = `${section?.sectionType || ''}`.trim();
  if (!sectionType) return null;

  const base = {
    type: LOGO_SECTION_TYPE,
    sectionType,
    enabled: section?.enabled !== false,
    data: section?.data || {}
  };

  if (sectionType === 'concept_pillars') {
    return {
      ...base,
      data: {
        ...base.data,
        title: `${base.data.title || ''}`.trim(),
        items: normalizePillarItems(base.data.items)
      }
    };
  }

  if (sectionType === 'meta') {
    return {
      ...base,
      data: {
        ...base.data,
        brandName: `${base.data.brandName || ''}`.trim(),
        agencyName: `${base.data.agencyName || ''}`.trim(),
        projectTitle: `${base.data.projectTitle || ''}`.trim(),
        tagline: `${base.data.tagline || ''}`.trim(),
        services: normalizeStringList(base.data.services)
      }
    };
  }

  return {
    ...base,
    data: {
      ...base.data,
      title: `${base.data.title || ''}`.trim(),
      body: normalizeParagraphText(base.data.body),
      bullets: normalizeStringList(base.data.bullets),
      points: normalizeStringList(base.data.points),
      assetRefs: normalizeStringList(base.data.assetRefs),
      heroAssetRefs: normalizeStringList(base.data.heroAssetRefs)
    }
  };
}

function buildLogoStoryStepRows(sections) {
  return (sections || [])
    .map(normalizeLogoSectionPayload)
    .filter(Boolean)
    .map((section, index) => ({
      step_order: index + 1,
      step_text: JSON.stringify(section)
    }));
}

export {
  normalizeParagraphText,
  normalizeStringList,
  normalizePillarItems,
  createLogoStorySection,
  normalizeLogoSectionPayload,
  buildLogoStoryStepRows
};
