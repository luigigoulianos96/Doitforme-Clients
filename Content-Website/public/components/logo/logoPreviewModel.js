import { parseLogoMetaStep } from '../../utils/appHelpers.js';
import { groupLogoAssetsByCategory, parseLogoStorySections } from '../../utils/logoPreviewHelpers.js';

function firstItem(items) {
  return (items || [])[0] || null;
}

function resolveCategoryAssets(assetGroups, category) {
  return assetGroups[category] || [];
}

function resolveAssetsByRefs(assetGroups, refs, fallback = []) {
  const normalizedRefs = (refs || []).filter(Boolean);
  if (normalizedRefs.length === 0) return fallback;
  return normalizedRefs.flatMap((ref) => assetGroups[ref] || []);
}

function normalizePalette(colors) {
  const hasSecondaryOrdering = (colors || []).some((row) => Number(row.sort_order) >= 1000);
  const primary = hasSecondaryOrdering ? (colors || []).filter((row) => Number(row.sort_order) < 1000) : (colors || []);
  const secondary = hasSecondaryOrdering ? (colors || []).filter((row) => Number(row.sort_order) >= 1000) : [];

  return {
    primary: primary.map((row) => row.hex_color).filter(Boolean),
    secondary: secondary.map((row) => row.hex_color).filter(Boolean)
  };
}

function createLegacySections(meta, visuals, fonts, palette) {
  const introBody = `${meta.shortDescription || ''}`.trim();
  return {
    hero: {
      eyebrow: 'Logo Kit',
      headline: meta.projectTitle || meta.brandName || 'Brand Identity',
      subheadline: meta.tagline || '',
      lead: introBody,
      heroAssetRefs: []
    },
    project_intro: introBody ? { title: 'Project Overview', body: introBody } : null,
    logo_showcase: visuals.mainLogo || visuals.secondaryLogo || visuals.logomark ? { title: 'Logo System', caption: '' } : null,
    typography: fonts.length > 0 ? { title: 'Typography', body: '' } : null,
    color_palette: palette.primary.length > 0 || palette.secondary.length > 0 ? { title: 'Color Palette', body: '' } : null,
    brand_applications: visuals.applicationVisuals.length > 0 ? { title: 'Applications', body: '', assetRefs: [] } : null,
    closing: visuals.mainLogo || visuals.secondaryLogo || visuals.logomark ? { title: 'Final Mark', body: meta.tagline || '' } : null
  };
}

function collectStructuredSections(storySteps) {
  const sections = parseLogoStorySections(storySteps);
  return sections.reduce((acc, section) => {
    acc[section.sectionType] = section;
    return acc;
  }, {});
}

function buildLogoPreviewModel({ logoKit, assets, colors, storySteps, clientName, parseLogoAssetCategory }) {
  const structuredSections = collectStructuredSections(storySteps);
  const meta = parseLogoMetaStep(storySteps) || {};
  const visualAssets = (assets || []).filter((asset) => asset.asset_type === 'visual' && asset.file_url);
  const assetGroups = groupLogoAssetsByCategory(visualAssets, parseLogoAssetCategory);
  const fonts = (assets || []).filter((asset) => asset.asset_type === 'font' && asset.file_url);
  const fontFamilies = fonts.map((font, index) => ({
    family: `LogoKitFont_${font.id || index}_${index}`,
    url: font.file_url
  }));
  const palette = normalizePalette(colors);

  const visuals = {
    mainLogo: firstItem(resolveCategoryAssets(assetGroups, 'MAIN_LOGO')),
    secondaryLogo: firstItem(resolveCategoryAssets(assetGroups, 'SECONDARY_LOGO')),
    logomark: firstItem(resolveCategoryAssets(assetGroups, 'LOGOMARK')),
    logoVariations: resolveCategoryAssets(assetGroups, 'LOGO_VARIATION'),
    constructionVisuals: [
      ...resolveCategoryAssets(assetGroups, 'INSPIRATION'),
      ...resolveCategoryAssets(assetGroups, 'INSPIRATION_RESULT')
    ],
    applicationVisuals: [
      ...resolveCategoryAssets(assetGroups, 'PATTERN'),
      ...resolveCategoryAssets(assetGroups, 'MOCKUP'),
      ...resolveCategoryAssets(assetGroups, 'STICKER')
    ]
  };

  const legacySections = createLegacySections(meta, visuals, fonts, palette);
  const sections = {
    hero: structuredSections.hero?.data || legacySections.hero,
    projectIntro: structuredSections.project_intro?.enabled !== false ? (structuredSections.project_intro?.data || legacySections.project_intro) : null,
    challenge: structuredSections.challenge?.enabled !== false ? structuredSections.challenge?.data || null : null,
    pillars: structuredSections.concept_pillars?.enabled !== false ? structuredSections.concept_pillars?.data || null : null,
    rationale: structuredSections.design_rationale?.enabled !== false ? structuredSections.design_rationale?.data || null : null,
    logoShowcase: structuredSections.logo_showcase?.enabled !== false ? (structuredSections.logo_showcase?.data || legacySections.logo_showcase) : null,
    construction: structuredSections.logo_construction?.enabled !== false ? structuredSections.logo_construction?.data || null : null,
    typography: structuredSections.typography?.enabled !== false ? (structuredSections.typography?.data || legacySections.typography) : null,
    palette: structuredSections.color_palette?.enabled !== false ? (structuredSections.color_palette?.data || legacySections.color_palette) : null,
    applications: structuredSections.brand_applications?.enabled !== false ? (structuredSections.brand_applications?.data || legacySections.brand_applications) : null,
    gallery: structuredSections.gallery?.enabled !== false ? structuredSections.gallery?.data || null : null,
    closing: structuredSections.closing?.enabled !== false ? (structuredSections.closing?.data || legacySections.closing) : null
  };

  const derived = {
    heroAsset: firstItem(
      resolveAssetsByRefs(assetGroups, sections.hero?.heroAssetRefs, [visuals.mainLogo, visuals.logomark, visuals.secondaryLogo].filter(Boolean))
    ) || visuals.mainLogo || visuals.logomark || visuals.secondaryLogo,
    rationaleVisuals: resolveAssetsByRefs(assetGroups, sections.rationale?.assetRefs, visuals.constructionVisuals).slice(0, 2),
    constructionVisuals: resolveAssetsByRefs(assetGroups, sections.construction?.assetRefs, visuals.constructionVisuals).slice(0, 3),
    applicationVisuals: resolveAssetsByRefs(assetGroups, sections.applications?.assetRefs, visuals.applicationVisuals),
    galleryVisuals: resolveAssetsByRefs(assetGroups, sections.gallery?.assetRefs, visuals.applicationVisuals.slice(2))
  };

  const heroTitle = sections.hero?.headline || meta.projectTitle || meta.brandName || clientName || 'Brand Identity';
  const heroEyebrow = sections.hero?.eyebrow || meta.brandName || 'Logo Kit';
  const heroSub = sections.hero?.subheadline || meta.tagline || '';
  const heroLead = sections.hero?.lead || '';
  const introBody = `${sections.projectIntro?.body || ''}`.trim();
  const heroLeadNormalized = `${heroLead || ''}`.trim();
  const shouldRenderIntroSection = Boolean(introBody) && introBody !== heroLeadNormalized;
  const metaItems = [
    { label: 'Client', value: meta.brandName || clientName || '' },
    { label: 'Agency', value: meta.agencyName || '' },
    { label: 'Project', value: meta.projectTitle || '' },
    { label: 'Services', value: Array.isArray(meta.services) ? meta.services.join(', ') : '' }
  ].filter((item) => item.value);

  return {
    logoKit,
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
    shouldRenderIntroSection,
    metaItems
  };
}

export { buildLogoPreviewModel };
