import { useEffect, useMemo, useState } from 'react';
import { createEmptyLogoCaseStudyDraft } from './logoContentModel.js';
import { buildLogoStoryStepRows, createLogoStorySection } from './logoSectionBuilders.js';

export default function useLogoKitAdmin({
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
}) {
  const [logoKits, setLogoKits] = useState([]);
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
  const [logoCaseStudyDraft, setLogoCaseStudyDraft] = useState(() => createEmptyLogoCaseStudyDraft());

  function revokeCollectionItems(collection) {
    (collection || []).forEach((item) => {
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
  }

  const logoDraftCollections = [
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
  ];

  useEffect(() => {
    return () => {
      logoDraftCollections.forEach((collection) => {
        collection.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      });
    };
  }, [
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

  function clearLogoKits() {
    setLogoKits([]);
  }

  async function loadLogoKits() {
    if (!client || !selectedClient) return;
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

  function resetLogoDraftState() {
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
    setLogoCaseStudyDraft(createEmptyLogoCaseStudyDraft());
  }

  const legacyStructuredSections = useMemo(() => {
    const brandName = `${logoBrandName || ''}`.trim();
    const agencyName = `${logoAgencyName || ''}`.trim();
    const tagline = `${logoTagline || ''}`.trim();
    const shortDescription = `${logoShortDescription || ''}`.trim();
    const conceptLabel = `${logoConceptLabel || ''}`.trim() || 'Concept 1';
    const primaryColors = logoPrimaryColorInputs.map((value) => normalizeHexColor(value)).filter(Boolean);
    const secondaryColors = logoSecondaryColorInputs.map((value) => normalizeHexColor(value)).filter(Boolean);
    const hasConstructionVisuals = logoInspirationItems.length > 0 || logoInspirationResultItems.length > 0;
    const hasApplications = logoPatternItems.length > 0 || logoMockupItems.length > 0 || logoStickerItems.length > 0;

    return [
      createLogoStorySection('meta', {
        brandName,
        agencyName,
        projectTitle: brandName ? `${brandName} Brand Identity` : '',
        tagline,
        services: ['Brand Identity'],
        conceptLabel
      }),
      createLogoStorySection('hero', {
        eyebrow: 'Logo Kit',
        headline: brandName ? `${brandName} Brand Identity` : '',
        subheadline: tagline,
        lead: shortDescription,
        heroAssetRefs: ['MAIN_LOGO']
      }),
      createLogoStorySection('project_intro', {
        title: 'Project Overview',
        body: shortDescription
      }, { enabled: Boolean(shortDescription) }),
      createLogoStorySection('logo_showcase', {
        title: 'Logo System',
        showPrimary: true,
        showSecondary: logoSecondaryLogoItems.length > 0,
        showLogomark: logoLogomarkItems.length > 0,
        showVariations: logoVariationItems.length > 0,
        caption: tagline
      }, { enabled: logoMainLogoItems.length > 0 }),
      createLogoStorySection('logo_construction', {
        title: 'Construction & Exploration',
        body: shortDescription,
        assetRefs: ['INSPIRATION', 'INSPIRATION_RESULT']
      }, { enabled: hasConstructionVisuals }),
      createLogoStorySection('typography', {
        title: 'Typography',
        body: '',
        primaryLabel: logoPrimaryFontItems[0]?.file?.name || '',
        secondaryLabel: logoSecondaryFontItems[0]?.file?.name || '',
        usageNotes: ''
      }, { enabled: logoPrimaryFontItems.length > 0 || logoSecondaryFontItems.length > 0 || logoExtraFontItems.length > 0 }),
      createLogoStorySection('color_palette', {
        title: 'Color Palette',
        body: '',
        primaryPaletteTitle: 'Primary',
        secondaryPaletteTitle: 'Secondary',
        usageNotes: primaryColors.length > 0 || secondaryColors.length > 0 ? `Primary: ${primaryColors.length} / Secondary: ${secondaryColors.length}` : ''
      }, { enabled: primaryColors.length > 0 || secondaryColors.length > 0 }),
      createLogoStorySection('brand_applications', {
        title: 'Applications',
        body: '',
        assetRefs: ['PATTERN', 'MOCKUP', 'STICKER']
      }, { enabled: hasApplications }),
      createLogoStorySection('closing', {
        title: 'Final Mark',
        body: tagline
      }, { enabled: logoMainLogoItems.length > 0 || logoLogomarkItems.length > 0 || logoSecondaryLogoItems.length > 0 })
    ];
  }, [
    logoBrandName,
    logoAgencyName,
    logoTagline,
    logoShortDescription,
    logoConceptLabel,
    logoPrimaryColorInputs,
    logoSecondaryColorInputs,
    logoInspirationItems,
    logoInspirationResultItems,
    logoMainLogoItems,
    logoSecondaryLogoItems,
    logoLogomarkItems,
    logoVariationItems,
    logoPatternItems,
    logoMockupItems,
    logoStickerItems,
    logoPrimaryFontItems,
    logoSecondaryFontItems,
    logoExtraFontItems,
    normalizeHexColor
  ]);

  const hasStructuredDraftContent = useMemo(
    () =>
      (logoCaseStudyDraft?.sections || []).some((section) => {
        const data = section?.data || {};
        return Object.values(data).some((value) => {
          if (Array.isArray(value)) return value.length > 0;
          return `${value || ''}`.trim().length > 0;
        });
      }),
    [logoCaseStudyDraft]
  );

  function clearLogoDraft() {
    logoDraftCollections.forEach((collection) => {
      revokeCollectionItems(collection);
    });
    resetLogoDraftState();
    setStatus('Καθαρίστηκε το logo kit draft.');
  }

  async function loadDemoLogoKitDraft() {
    const demoBase = '/public/test-assets/logo-kit-dummy';
    const imageMap = {
      main: ['primary-logo.svg'],
      secondary: ['secondary-logo.svg'],
      logomark: ['logomark.svg'],
      variations: ['variation-01.svg', 'variation-02.svg'],
      inspiration: ['reference-board.svg'],
      construction: ['construction-grid.svg'],
      patterns: ['pattern-01.svg'],
      mockups: ['mockup-01.svg', 'mockup-02.svg'],
      gallery: ['gallery-01.svg', 'gallery-02.svg']
    };

    async function loadFile(fileName) {
      const response = await fetch(`${demoBase}/${fileName}`);
      if (!response.ok) throw new Error(`Δεν βρέθηκε το demo αρχείο: ${fileName}`);
      const blob = await response.blob();
      return new File([blob], fileName, { type: blob.type || 'image/svg+xml' });
    }

    async function loadImageItems(fileNames) {
      const files = await Promise.all((fileNames || []).map((fileName) => loadFile(fileName)));
      return buildUploadItems(files);
    }

    setBusy(true);
    setStatus('Φόρτωση demo logo kit...');

    try {
      logoDraftCollections.forEach((collection) => revokeCollectionItems(collection));

      const [
        mainItems,
        secondaryItems,
        logomarkItems,
        variationItems,
        inspirationItems,
        constructionItems,
        patternItems,
        mockupItems,
        galleryItems
      ] = await Promise.all([
        loadImageItems(imageMap.main),
        loadImageItems(imageMap.secondary),
        loadImageItems(imageMap.logomark),
        loadImageItems(imageMap.variations),
        loadImageItems(imageMap.inspiration),
        loadImageItems(imageMap.construction),
        loadImageItems(imageMap.patterns),
        loadImageItems(imageMap.mockups),
        loadImageItems(imageMap.gallery)
      ]);

      setLogoBrandName('Luko Pop');
      setLogoAgencyName('Doitforme');
      setLogoTagline('Pop into happiness');
      setLogoShortDescription('A clean, high-contrast identity system designed to make the brand feel sharp, modern and immediately recognizable across every touchpoint.');
      setLogoConceptLabel('Concept 1');

      setLogoInspirationItems(inspirationItems);
      setLogoInspirationResultItems(constructionItems);
      setLogoMainLogoItems(mainItems);
      setLogoSecondaryLogoItems(secondaryItems);
      setLogoLogomarkItems(logomarkItems);
      setLogoVariationItems(variationItems);
      setLogoMascotPrimaryItems([]);
      setLogoMascotPoseItems([]);
      setLogoPatternItems(patternItems);
      setLogoMockupItems(mockupItems);
      setLogoStickerItems(galleryItems);
      setLogoPrimaryFontItems([]);
      setLogoSecondaryFontItems([]);
      setLogoExtraFontItems([]);
      setLogoPrimaryColorInputs(['#8E8AD8', '#7A3A22', '#F4EBDD']);
      setLogoSecondaryColorInputs(['#F6B4C8', '#BFD9E3', '#F1D2C2']);

      setLogoCaseStudyDraft({
        ...createEmptyLogoCaseStudyDraft(),
        sections: [
          createLogoStorySection('meta', {
            brandName: 'Luko Pop',
            agencyName: 'Doitforme',
            projectTitle: 'Luko Pop Brand Identity',
            tagline: 'Pop into happiness',
            services: ['Brand Strategy', 'Logo Design', 'Visual Identity System', 'Packaging Direction', 'Brand Applications'],
            conceptLabel: 'Concept 1'
          }),
          createLogoStorySection('hero', {
            eyebrow: 'Logo Kit',
            headline: 'Luko Pop Brand Identity',
            subheadline: 'Warm, playful and instantly recognisable',
            lead: 'A clean, high-contrast identity system designed to make the brand feel sharp, modern and immediately recognizable across every touchpoint.',
            heroAssetRefs: ['MAIN_LOGO']
          }),
          createLogoStorySection('project_intro', {
            title: 'Project Overview',
            body: 'Luko Pop is a cheerful dessert brand built around a playful character and a soft, high-recognition visual language. The goal of the identity was to create a system that feels memorable at first glance, flexible in packaging, and clear across digital and physical applications.'
          }, { enabled: true }),
          createLogoStorySection('challenge', {
            title: 'The Challenge',
            body: 'The existing identity lacked consistency and did not scale well across different formats. The brief was to create a stronger visual core that would feel timeless, recognizable and easier to apply across print, digital and environmental uses.'
          }, { enabled: true }),
          createLogoStorySection('concept_pillars', {
            title: 'Concept Pillars',
            items: [
              { label: 'Precision', description: 'Built on clear structure, balance and controlled proportions' },
              { label: 'Presence', description: 'Designed to feel immediate, bold and recognisable' },
              { label: 'Versatility', description: 'Flexible enough to perform across multiple applications' }
            ]
          }, { enabled: true }),
          createLogoStorySection('design_rationale', {
            title: 'Design Rationale',
            body: 'The symbol and typography were shaped to create a sense of order, confidence and visual rhythm. Sharp contrasts, controlled spacing and simple geometry help the mark remain legible and distinctive, whether it appears very small or at large scale.',
            assetRefs: ['INSPIRATION', 'INSPIRATION_RESULT']
          }, { enabled: true }),
          createLogoStorySection('logo_showcase', {
            title: 'Logo System',
            showPrimary: true,
            showSecondary: true,
            showLogomark: true,
            showVariations: true,
            caption: 'Primary, secondary and symbol variations built for different scales and placements.'
          }, { enabled: true }),
          createLogoStorySection('logo_construction', {
            title: 'Construction',
            body: 'Simple geometric rules and consistent proportions create a logo that feels stable, repeatable and easy to extend across the wider visual system.',
            assetRefs: ['INSPIRATION', 'INSPIRATION_RESULT']
          }, { enabled: true }),
          createLogoStorySection('typography', {
            title: 'Typography',
            body: 'The type system combines a friendly rounded display voice with a cleaner supporting rhythm for captions and utility content. It is meant to feel playful without losing clarity.',
            primaryLabel: '',
            secondaryLabel: '',
            usageNotes: ''
          }, { enabled: true }),
          createLogoStorySection('color_palette', {
            title: 'Color Palette',
            body: 'The palette is built to feel soft, warm and highly ownable. The lilac base carries recognition, the cocoa tone adds contrast, and the cream keeps layouts open and clean.',
            primaryPaletteTitle: 'Primary',
            secondaryPaletteTitle: 'Secondary',
            usageNotes: ''
          }, { enabled: true }),
          createLogoStorySection('brand_applications', {
            title: 'Applications',
            body: 'The identity is designed to scale cleanly from hero brand moments to repeatable packaging and campaign assets. It stays expressive in large formats and clear in tighter branded surfaces.',
            assetRefs: ['PATTERN', 'MOCKUP', 'STICKER']
          }, { enabled: true }),
          createLogoStorySection('gallery', {
            title: 'Gallery',
            body: 'Additional applied visuals showing how the system performs in secondary layouts, supporting assets and expressive branded moments.',
            assetRefs: ['STICKER'],
            layout: 'mixed'
          }, { enabled: true }),
          createLogoStorySection('closing', {
            title: 'Closing',
            body: 'A bright, memorable brand system that keeps the product feeling joyful, polished and easy to recognize.'
          }, { enabled: true })
        ]
      });

      setStatus('Το demo logo kit draft φορτώθηκε. Πάτα Δημοσίευση για να δεις το preview.');
    } catch (error) {
      setStatus(`Σφάλμα φόρτωσης demo draft: ${error.message || 'Άγνωστο σφάλμα'}`);
    } finally {
      setBusy(false);
    }
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
    const storage = createStorageAdapter();
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
        const { error: uploadError } = await storage.upload(path, item.file, { cacheControl: '3600', upsert: false });
        if (uploadError) {
          setStatus(`Σφάλμα upload ${label} (${item.file.name}): ${uploadError.message}`);
          return { ok: false };
        }
        const { data: publicData } = storage.getPublicUrl(path);
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
        const { error: uploadError } = await storage.upload(path, item.file, { cacheControl: '3600', upsert: false });
        if (uploadError) {
          setStatus(`Σφάλμα upload font (${item.file.name}): ${uploadError.message}`);
          return { ok: false };
        }
        const { data: publicData } = storage.getPublicUrl(path);
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

    const draftSections = hasStructuredDraftContent && Array.isArray(logoCaseStudyDraft?.sections) && logoCaseStudyDraft.sections.length > 0
      ? logoCaseStudyDraft.sections
      : legacyStructuredSections;
    const storyRows = buildLogoStoryStepRows(draftSections).map((row) => ({
      ...row,
      logo_kit_id: insertedKit.id
    }));

    const { error: storyStepsError } = await client.from('logo_story_steps').insert(storyRows);
    if (storyStepsError) {
      setStatus(`Σφάλμα βάσης content sections: ${storyStepsError.message}`);
      setBusy(false);
      return;
    }

    logoDraftCollections.forEach((collection) => {
      collection.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    });
    resetLogoDraftState();
    setStatus('Ολοκληρώθηκε. Το logo kit δημοσιεύτηκε με το νέο structured preview model.');
    await loadPosts();
    await loadLogoKits();
    setBusy(false);
  }

  async function deleteLogoKitPermanently(logoKit) {
    if (!client || !logoKit) return;
    const confirmed = window.confirm(`Να διαγραφεί οριστικά το "${logoKit.title}";`);
    if (!confirmed) return;

    setBusy(true);
    setStatus(`Διαγραφή ${logoKit.title}...`);
    const storage = createStorageAdapter();

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
      const { error: storageError } = await storage.remove(paths);
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

  async function deleteAllLogoKitsPermanently() {
    if (!client || !selectedClient?.id || logoKits.length === 0) return;
    const confirmedLogoDelete = window.confirm(`Να διαγραφούν ΟΛΑ τα ${logoKits.length} logo kits; Αυτή η ενέργεια δεν αναιρείται.`);
    if (!confirmedLogoDelete) return;

    setBusy(true);
    setStatus('Γίνεται οριστική διαγραφή όλων των logo kits...');
    const storage = createStorageAdapter();

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
      const { error: storageError } = await storage.remove(paths);
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
  }

  return {
    logoKits,
    clearLogoKits,
    loadLogoKits,
    logoBrandName,
    setLogoBrandName,
    logoAgencyName,
    setLogoAgencyName,
    logoTagline,
    setLogoTagline,
    logoShortDescription,
    setLogoShortDescription,
    logoConceptLabel,
    setLogoConceptLabel,
    logoInspirationItems,
    setLogoInspirationItems,
    logoInspirationResultItems,
    setLogoInspirationResultItems,
    logoMainLogoItems,
    setLogoMainLogoItems,
    logoSecondaryLogoItems,
    setLogoSecondaryLogoItems,
    logoLogomarkItems,
    setLogoLogomarkItems,
    logoVariationItems,
    setLogoVariationItems,
    logoMascotPrimaryItems,
    setLogoMascotPrimaryItems,
    logoMascotPoseItems,
    setLogoMascotPoseItems,
    logoPatternItems,
    setLogoPatternItems,
    logoMockupItems,
    setLogoMockupItems,
    logoStickerItems,
    setLogoStickerItems,
    logoPrimaryFontItems,
    setLogoPrimaryFontItems,
    logoSecondaryFontItems,
    setLogoSecondaryFontItems,
    logoExtraFontItems,
    setLogoExtraFontItems,
    logoPrimaryColorInputs,
    logoSecondaryColorInputs,
    logoCaseStudyDraft,
    setLogoCaseStudyDraft,
    isPngOrSvgFile,
    isLogoVisualFile,
    normalizeHexColor,
    appendSingleImage,
    appendMultiImages,
    removeUploadItem,
    appendSingleFont,
    appendExtraFonts,
    updatePrimaryColorInput,
    updateSecondaryColorInput,
    addPrimaryColorInput,
    addSecondaryColorInput,
    removePrimaryColorInput,
    removeSecondaryColorInput,
    loadDemoLogoKitDraft,
    clearLogoDraft,
    publishLogoKit,
    deleteLogoKitPermanently,
    deleteAllLogoKitsPermanently
  };
}
