const LOGO_SECTION_TYPE = 'logo_case_study_section_v1';

function safeParseJson(value) {
  try {
    return JSON.parse(`${value || ''}`);
  } catch {
    return null;
  }
}

function parseLogoStorySection(step) {
  const parsed = safeParseJson(step?.step_text);
  if (!parsed || parsed.type !== LOGO_SECTION_TYPE) return null;
  if (!parsed.sectionType) return null;
  return {
    type: parsed.type,
    sectionType: parsed.sectionType,
    enabled: parsed.enabled !== false,
    data: parsed.data || {},
    stepOrder: Number(step?.step_order) || 0
  };
}

function parseLogoStorySections(storySteps) {
  return (storySteps || [])
    .map(parseLogoStorySection)
    .filter(Boolean)
    .sort((a, b) => a.stepOrder - b.stepOrder);
}

function groupLogoAssetsByCategory(assets, parseLogoAssetCategory) {
  return (assets || []).reduce((acc, asset) => {
    const category = parseLogoAssetCategory(asset?.file_name || '');
    if (!category) return acc;
    if (!acc[category]) acc[category] = [];
    acc[category].push(asset);
    return acc;
  }, {});
}

export {
  LOGO_SECTION_TYPE,
  safeParseJson,
  parseLogoStorySection,
  parseLogoStorySections,
  groupLogoAssetsByCategory
};
