const LOGO_SECTION_TYPE = 'logo_case_study_section_v1';

const DEFAULT_LOGO_SECTION_ORDER = [
  'meta',
  'hero',
  'project_intro',
  'challenge',
  'concept_pillars',
  'design_rationale',
  'logo_showcase',
  'logo_construction',
  'typography',
  'color_palette',
  'brand_applications',
  'gallery',
  'closing'
];

function createSectionEnvelope(sectionType, data = {}, options = {}) {
  return {
    type: LOGO_SECTION_TYPE,
    sectionType,
    enabled: options.enabled !== false,
    data
  };
}

function createDefaultLogoCaseStudySections() {
  return [
    createSectionEnvelope('meta', {
      brandName: '',
      agencyName: 'Doitforme',
      projectTitle: '',
      tagline: '',
      services: []
    }),
    createSectionEnvelope('hero', {
      eyebrow: '',
      headline: '',
      subheadline: '',
      lead: '',
      heroAssetRefs: []
    }),
    createSectionEnvelope('project_intro', {
      title: 'Project Overview',
      body: ''
    }),
    createSectionEnvelope('challenge', {
      title: 'The Challenge',
      body: '',
      bullets: []
    }, { enabled: false }),
    createSectionEnvelope('concept_pillars', {
      title: 'Concept Pillars',
      items: []
    }, { enabled: false }),
    createSectionEnvelope('design_rationale', {
      title: 'Design Rationale',
      body: '',
      points: [],
      assetRefs: []
    }, { enabled: false }),
    createSectionEnvelope('logo_showcase', {
      title: 'Logo System',
      showPrimary: true,
      showSecondary: true,
      showLogomark: true,
      showVariations: true,
      caption: ''
    }),
    createSectionEnvelope('logo_construction', {
      title: 'Construction',
      body: '',
      assetRefs: []
    }, { enabled: false }),
    createSectionEnvelope('typography', {
      title: 'Typography',
      body: '',
      primaryLabel: '',
      secondaryLabel: '',
      usageNotes: ''
    }),
    createSectionEnvelope('color_palette', {
      title: 'Color Palette',
      body: '',
      primaryPaletteTitle: 'Primary',
      secondaryPaletteTitle: 'Secondary',
      usageNotes: ''
    }),
    createSectionEnvelope('brand_applications', {
      title: 'Applications',
      body: '',
      assetRefs: []
    }, { enabled: false }),
    createSectionEnvelope('gallery', {
      title: 'Gallery',
      body: '',
      assetRefs: [],
      layout: 'mixed'
    }, { enabled: false }),
    createSectionEnvelope('closing', {
      title: 'Closing',
      body: '',
      closingNote: ''
    }, { enabled: false })
  ];
}

function createEmptyLogoCaseStudyDraft() {
  return {
    versionLabel: '',
    sections: createDefaultLogoCaseStudySections(),
    assetCollections: {
      primaryLogo: [],
      secondaryLogo: [],
      logomark: [],
      variations: [],
      typography: [],
      applications: [],
      gallery: []
    },
    colorCollections: {
      primary: [''],
      secondary: ['']
    }
  };
}

export {
  LOGO_SECTION_TYPE,
  DEFAULT_LOGO_SECTION_ORDER,
  createSectionEnvelope,
  createDefaultLogoCaseStudySections,
  createEmptyLogoCaseStudyDraft
};
