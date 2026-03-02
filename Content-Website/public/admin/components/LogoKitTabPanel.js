import React from 'react';
import CollapsiblePanel from './CollapsiblePanel.js';

const h = React.createElement;

function renderMediaTile({ MediaTile, MediaThumb, MediaName, ActionButton }, item, label, onRemove) {
  const displayLabel = label ? `${label}: ${item.file.name}` : item.file.name;
  return h(
    MediaTile,
    { key: item.id },
    h(MediaThumb, null, h('img', { src: item.previewUrl, alt: item.file.name, loading: 'lazy' })),
    h(MediaName, null, displayLabel),
    h(ActionButton, { type: 'button', $type: 'danger', onClick: onRemove }, 'Αφαίρεση')
  );
}

function parseLines(value) {
  return `${value || ''}`.split(/[\n,]+/).map((entry) => entry.trim()).filter(Boolean);
}

function parsePillarLines(value) {
  return parseLines(value)
    .map((line) => {
      const [label, ...rest] = line.split('::');
      return { label: `${label || ''}`.trim(), description: rest.join('::').trim() };
    })
    .filter((item) => item.label);
}

function formatPillarLines(items) {
  return (items || []).map((item) => [item?.label || '', item?.description || ''].filter(Boolean).join(' :: ')).join('\n');
}

function getSection(sections, sectionType) {
  return (sections || []).find((section) => section.sectionType === sectionType) || null;
}

function updateSection(sections, sectionType, updater) {
  return (sections || []).map((section) => (section.sectionType !== sectionType ? section : updater(section)));
}

function setSectionData(sections, sectionType, field, value, options = {}) {
  return updateSection(sections, sectionType, (section) => ({
    ...section,
    enabled: options.enabled !== undefined ? options.enabled : section.enabled,
    data: { ...(section.data || {}), [field]: value }
  }));
}

function setSectionEnabled(sections, sectionType, enabled) {
  return updateSection(sections, sectionType, (section) => ({ ...section, enabled }));
}

function renderDropzone(config) {
  const {
    title,
    hint,
    active,
    setActive,
    Dropzone,
    DropText,
    FilePicker,
    FilePickerButton,
    FileInput,
    onPick,
    multiple = false,
    accept = 'image/*',
    buttonLabel = 'Επιλογή'
  } = config;

  return h(
    Dropzone,
    {
      $active: active,
      onDragOver: (event) => {
        event.preventDefault();
        setActive(true);
      },
      onDragLeave: () => setActive(false),
      onDrop: (event) => {
        event.preventDefault();
        setActive(false);
        onPick(event.dataTransfer.files || []);
      }
    },
    h(DropText, null, title),
    hint ? h('small', null, hint) : null,
    h(
      FilePicker,
      null,
      h(FilePickerButton, null, buttonLabel),
      h(FileInput, {
        type: 'file',
        accept,
        multiple,
        onChange: (event) => {
          onPick(event.target.files || []);
          event.target.value = '';
        }
      })
    )
  );
}

export default function LogoKitTabPanel({ logo, ui }) {
  const {
    busy,
    dragActive,
    setDragActive,
    logoBrandName,
    setLogoBrandName,
    logoAgencyName,
    setLogoAgencyName,
    logoTagline,
    setLogoTagline,
    logoShortDescription,
    setLogoShortDescription,
    logoMainLogoItems,
    setLogoMainLogoItems,
    logoSecondaryLogoItems,
    setLogoSecondaryLogoItems,
    logoLogomarkItems,
    setLogoLogomarkItems,
    logoVariationItems,
    setLogoVariationItems,
    logoInspirationItems,
    setLogoInspirationItems,
    logoInspirationResultItems,
    setLogoInspirationResultItems,
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
    appendSingleImage,
    appendMultiImages,
    appendSingleFont,
    appendExtraFonts,
    removeUploadItem,
    isPngOrSvgFile,
    isLogoVisualFile,
    normalizeHexColor,
    updatePrimaryColorInput,
    updateSecondaryColorInput,
    addPrimaryColorInput,
    addSecondaryColorInput,
    removePrimaryColorInput,
    removeSecondaryColorInput,
    loadDemoLogoKitDraft,
    clearLogoDraft,
    publishLogoKit
  } = logo;

  const {
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
  } = ui;

  const sections = logoCaseStudyDraft?.sections || [];
  const metaSection = getSection(sections, 'meta');
  const heroSection = getSection(sections, 'hero');
  const challengeSection = getSection(sections, 'challenge');
  const pillarsSection = getSection(sections, 'concept_pillars');
  const rationaleSection = getSection(sections, 'design_rationale');
  const logoShowcaseSection = getSection(sections, 'logo_showcase');
  const typographySection = getSection(sections, 'typography');
  const paletteSection = getSection(sections, 'color_palette');
  const applicationsSection = getSection(sections, 'brand_applications');
  const gallerySection = getSection(sections, 'gallery');
  const closingSection = getSection(sections, 'closing');
  const tileUi = { MediaTile, MediaThumb, MediaName, ActionButton };
  const [servicesInput, setServicesInput] = React.useState('');
  const [pillarsInput, setPillarsInput] = React.useState('');
  const servicesEditingRef = React.useRef(false);
  const pillarsEditingRef = React.useRef(false);

  React.useEffect(() => {
    if (servicesEditingRef.current) {
      servicesEditingRef.current = false;
      return;
    }
    const nextValue = Array.isArray(metaSection?.data?.services) ? metaSection.data.services.join('\n') : '';
    setServicesInput(nextValue);
  }, [metaSection?.data?.services]);

  React.useEffect(() => {
    if (pillarsEditingRef.current) {
      pillarsEditingRef.current = false;
      return;
    }
    setPillarsInput(formatPillarLines(pillarsSection?.data?.items));
  }, [pillarsSection?.data?.items]);

  function commitSections(nextSections) {
    setLogoCaseStudyDraft((prev) => ({ ...(prev || {}), sections: nextSections }));
  }

  function updateDraftField(sectionType, field, value, options = {}) {
    commitSections(setSectionData(sections, sectionType, field, value, options));
  }

  function toggleSection(sectionType, enabled) {
    commitSections(setSectionEnabled(sections, sectionType, enabled));
  }

  function syncBrandName(value) {
    setLogoBrandName(value);
    const titleValue = value.trim() ? `${value.trim()} Brand Identity` : '';
    let nextSections = setSectionData(sections, 'meta', 'brandName', value);
    nextSections = setSectionData(nextSections, 'meta', 'projectTitle', titleValue);
    nextSections = setSectionData(nextSections, 'hero', 'headline', titleValue);
    commitSections(nextSections);
  }

  function syncAgencyName(value) {
    setLogoAgencyName(value);
    updateDraftField('meta', 'agencyName', value);
  }

  function syncTagline(value) {
    setLogoTagline(value);
    let nextSections = setSectionData(sections, 'meta', 'tagline', value);
    nextSections = setSectionData(nextSections, 'hero', 'subheadline', value);
    nextSections = setSectionData(nextSections, 'closing', 'body', value, { enabled: Boolean(value.trim()) });
    commitSections(nextSections);
  }

  function syncShortDescription(value) {
    setLogoShortDescription(value);
    let nextSections = setSectionData(sections, 'hero', 'lead', value);
    nextSections = setSectionData(nextSections, 'project_intro', 'body', value, { enabled: Boolean(value.trim()) });
    commitSections(nextSections);
  }

  function syncServices(value) {
    updateDraftField('meta', 'services', parseLines(value));
  }

  function renderTextAreaField(label, sectionType, field, placeholder, rows, options = {}) {
    const section = getSection(sections, sectionType);
    const value = `${section?.data?.[field] || ''}`;
    return h(
      'label',
      null,
      label,
      h(CaptionInput, {
        rows: `${rows}`,
        value,
        onChange: (event) => updateDraftField(sectionType, field, event.target.value, options),
        placeholder
      })
    );
  }

  return h(
    Form,
    { onSubmit: (event) => event.preventDefault() },
    h(
      CollapsiblePanel,
      { title: 'Brief & Κείμενα', defaultOpen: true },
      h(
        Step,
        null,
        h(StepTitle, null, 'Βασικά στοιχεία έργου'),
        h(MutedSmall, null, 'Συμπλήρωσε τα στοιχεία που τροφοδοτούν το πάνω μέρος του preview και δίνουν σωστό context στο case study.'),
        h('label', null, 'Όνομα brand / project (υποχρεωτικό)', h(InlineInput, { value: logoBrandName, onChange: (event) => syncBrandName(event.target.value), placeholder: 'The Makers' })),
        h('label', null, 'Studio / agency', h(InlineInput, { value: logoAgencyName, onChange: (event) => syncAgencyName(event.target.value), placeholder: 'Doitforme' })),
        h('label', null, 'Τίτλος έργου στο preview', h(InlineInput, { value: `${metaSection?.data?.projectTitle || ''}`, onChange: (event) => updateDraftField('meta', 'projectTitle', event.target.value), placeholder: 'Brand Identity System' })),
        h('label', null, 'Σύντομο tagline / υπότιτλος', h(InlineInput, { value: logoTagline, onChange: (event) => syncTagline(event.target.value), placeholder: 'A precise visual identity with premium character' })),
        h(
          'label',
          null,
          'Υπηρεσίες / scope (μία ανά γραμμή ή comma separated)',
          h(CaptionInput, {
            rows: '3',
            value: servicesInput,
            onChange: (event) => {
              const nextValue = event.target.value;
              servicesEditingRef.current = true;
              setServicesInput(nextValue);
              syncServices(nextValue);
            },
            placeholder: 'Brand Strategy\nVisual Identity\nApplications'
          })
        )
      ),
      h(
        Step,
        null,
        h(StepTitle, null, 'Opening Fold'),
        h(MutedSmall, null, 'Αυτό γεμίζει το πρώτο editorial κομμάτι του preview. Γράψε σύντομα, καθαρά κείμενα, όχι bullets.'),
        h('label', null, 'Eyebrow / μικρή ετικέτα πάνω από το hero', h(InlineInput, { value: `${heroSection?.data?.eyebrow || ''}`, onChange: (event) => updateDraftField('hero', 'eyebrow', event.target.value), placeholder: 'Logo Kit' })),
        h('label', null, 'Hero heading (υποχρεωτικό)', h(InlineInput, { value: `${heroSection?.data?.headline || ''}`, onChange: (event) => updateDraftField('hero', 'headline', event.target.value), placeholder: 'The Makers Brand Identity' })),
        h('label', null, 'Δεύτερη γραμμή / subheadline', h(InlineInput, { value: `${heroSection?.data?.subheadline || ''}`, onChange: (event) => updateDraftField('hero', 'subheadline', event.target.value), placeholder: 'Minimal, architectural and editorial direction' })),
        h(
          'label',
          null,
          'Intro paragraph',
          h(CaptionInput, {
            rows: '5',
            value: `${heroSection?.data?.lead || ''}`,
            onChange: (event) => syncShortDescription(event.target.value),
            placeholder: 'Γράψε 1 μικρή εισαγωγική παράγραφο που να στέκεται όμορφα δίπλα στο πρώτο μεγάλο visual.'
          })
        )
      ),
      h(
        Step,
        null,
        h(StepTitle, null, 'Editorial Κείμενα'),
        h(MutedSmall, null, 'Τα παρακάτω γεμίζουν τα ενδιάμεσα sections του preview και βοηθούν να “δέσει” οπτικά το case study.'),
        h('label', null, 'Project overview title', h(InlineInput, { value: `${getSection(sections, 'project_intro')?.data?.title || ''}`, onChange: (event) => updateDraftField('project_intro', 'title', event.target.value, { enabled: true }), placeholder: 'Project Overview' })),
        renderTextAreaField('Project overview / συνοπτική περιγραφή', 'project_intro', 'body', 'Περιέγραψε τι είναι το brand, σε ποιο κοινό απευθύνεται και τι έπρεπε να αποδώσει η νέα ταυτότητα.', 6, { enabled: true }),
        h(
          'label',
          null,
          h(
            Actions,
            null,
            h('span', null, 'Challenge / brief'),
            h(ActionButton, { type: 'button', onClick: () => toggleSection('challenge', !(challengeSection?.enabled !== false)) }, challengeSection?.enabled !== false ? 'Απόκρυψη' : 'Εμφάνιση')
          ),
          h(InlineInput, { value: `${challengeSection?.data?.title || ''}`, onChange: (event) => updateDraftField('challenge', 'title', event.target.value, { enabled: true }), placeholder: 'The Challenge' }),
          h(CaptionInput, { rows: '5', value: `${challengeSection?.data?.body || ''}`, onChange: (event) => updateDraftField('challenge', 'body', event.target.value, { enabled: true }), placeholder: 'Τι πρόβλημα έπρεπε να λυθεί; Ποια αίσθηση ή ποιο positioning έπρεπε να περάσει η ταυτότητα;' })
        ),
        h(
          'label',
          null,
          h(InlineInput, { value: `${pillarsSection?.data?.title || ''}`, onChange: (event) => updateDraftField('concept_pillars', 'title', event.target.value, { enabled: true }), placeholder: 'Concept Pillars' }),
          'Concept pillars (μία γραμμή ανά άξονα, μορφή: Τίτλος :: σύντομη εξήγηση)',
          h(CaptionInput, {
            rows: '5',
            value: pillarsInput,
            onChange: (event) => {
              const nextValue = event.target.value;
              pillarsEditingRef.current = true;
              setPillarsInput(nextValue);
              updateDraftField('concept_pillars', 'items', parsePillarLines(nextValue), { enabled: true });
            },
            placeholder: 'Precision :: Καθαρή γεωμετρία και δομή\nContrast :: Ισορροπία αυστηρότητας και έντασης\nPresence :: Δυνατή και άμεση αναγνωρισιμότητα'
          })
        ),
        h(
          'label',
          null,
          h(
            Actions,
            null,
            h('span', null, 'Design rationale'),
            h(ActionButton, { type: 'button', onClick: () => toggleSection('design_rationale', !(rationaleSection?.enabled !== false)) }, rationaleSection?.enabled !== false ? 'Απόκρυψη' : 'Εμφάνιση')
          ),
          h(InlineInput, { value: `${rationaleSection?.data?.title || ''}`, onChange: (event) => updateDraftField('design_rationale', 'title', event.target.value, { enabled: true }), placeholder: 'Design Rationale' }),
          h(CaptionInput, { rows: '6', value: `${rationaleSection?.data?.body || ''}`, onChange: (event) => updateDraftField('design_rationale', 'body', event.target.value, { enabled: true }), placeholder: 'Εξήγησε σύντομα γιατί το σύμβολο, οι αναλογίες, το contrast ή το visual rhythm λειτουργούν για το brand.' })
        )
      )
    ),
    h(
      CollapsiblePanel,
      { title: 'Logo Assets', defaultOpen: true },
      h(
        Step,
        null,
        h(StepTitle, null, 'Αρχεία λογοτύπου'),
        h(MutedSmall, null, 'Ανέβασε μόνο καθαρά τελικά exports. Για καλύτερο preview προτίμησε PNG ή SVG με σωστό περιθώριο και χωρίς περιττό background.'),
        h('label', null, 'Logo System title', h(InlineInput, { value: `${logoShowcaseSection?.data?.title || ''}`, onChange: (event) => updateDraftField('logo_showcase', 'title', event.target.value, { enabled: true }), placeholder: 'Logo System' })),
        h('label', null, 'Logo system caption (optional)', h(CaptionInput, { rows: '3', value: `${logoShowcaseSection?.data?.caption || ''}`, onChange: (event) => updateDraftField('logo_showcase', 'caption', event.target.value, { enabled: true }), placeholder: 'Προαιρετικό explanatory caption κάτω από τα logo assets.' })),
        renderDropzone({ title: 'Primary logo (υποχρεωτικό)', hint: '1 αρχείο. Το βασικό lockup που θα κρατήσει το page.', active: dragActive, setActive: setDragActive, Dropzone, DropText, FilePicker, FilePickerButton, FileInput, onPick: (files) => appendSingleImage(setLogoMainLogoItems, files, 'Το Primary Logo δέχεται μόνο .png/.svg/.jpg/.jpeg.'), accept: '.png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg', buttonLabel: 'Primary Logo' }),
        renderDropzone({ title: 'Secondary logo', hint: '1 αρχείο. Οριζόντια, stacked ή δεύτερη βασική εκδοχή.', active: dragActive, setActive: setDragActive, Dropzone, DropText, FilePicker, FilePickerButton, FileInput, onPick: (files) => appendSingleImage(setLogoSecondaryLogoItems, files, 'Το Secondary Logo δέχεται μόνο .png/.svg/.jpg/.jpeg.'), accept: '.png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg', buttonLabel: 'Secondary' }),
        renderDropzone({ title: 'Logomark / symbol', hint: '1 αρχείο. Το καθαρό σύμβολο που μπορεί να σταθεί μόνο του.', active: dragActive, setActive: setDragActive, Dropzone, DropText, FilePicker, FilePickerButton, FileInput, onPick: (files) => appendSingleImage(setLogoLogomarkItems, files, 'Το Logomark δέχεται μόνο .png/.svg/.jpg/.jpeg.'), accept: '.png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg', buttonLabel: 'Logomark' }),
        renderDropzone({ title: 'Logo variations', hint: 'Πολλαπλά αρχεία. Reversed, mono, icon set ή εναλλακτικές που αξίζει να μπουν στις gallery ζώνες.', active: dragActive, setActive: setDragActive, Dropzone, DropText, FilePicker, FilePickerButton, FileInput, onPick: (files) => appendMultiImages(setLogoVariationItems, files, isPngOrSvgFile, 'Τα Logo Variations δέχονται μόνο .png/.svg/.jpg/.jpeg.'), multiple: true, accept: '.png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg', buttonLabel: 'Variations' }),
        h(
          MediaGrid,
          null,
          logoMainLogoItems.map((item) => renderMediaTile(tileUi, item, 'Primary', () => removeUploadItem(setLogoMainLogoItems, item.id))),
          logoSecondaryLogoItems.map((item) => renderMediaTile(tileUi, item, 'Secondary', () => removeUploadItem(setLogoSecondaryLogoItems, item.id))),
          logoLogomarkItems.map((item) => renderMediaTile(tileUi, item, 'Logomark', () => removeUploadItem(setLogoLogomarkItems, item.id))),
          logoVariationItems.map((item) => renderMediaTile(tileUi, item, 'Variation', () => removeUploadItem(setLogoVariationItems, item.id)))
        )
      ),
      h(
        Step,
        null,
        h(StepTitle, null, 'Process & explanatory visuals'),
        h(MutedSmall, null, 'Αυτές οι εικόνες γεμίζουν τα split/gallery sections του preview. Διάλεξε visuals που δείχνουν εξέλιξη, σκέψη ή κατασκευή.'),
        renderDropzone({ title: 'Reference / inspiration visual', hint: '1 αρχείο. Mood, visual reference, sketch ή direction frame.', active: dragActive, setActive: setDragActive, Dropzone, DropText, FilePicker, FilePickerButton, FileInput, onPick: (files) => appendSingleImage(setLogoInspirationItems, files, 'Το reference visual δέχεται μόνο εικόνες.'), accept: 'image/*', buttonLabel: 'Reference' }),
        renderDropzone({ title: 'Construction / result visual', hint: '1 αρχείο. Grid, build, before/after ή evolution frame.', active: dragActive, setActive: setDragActive, Dropzone, DropText, FilePicker, FilePickerButton, FileInput, onPick: (files) => appendSingleImage(setLogoInspirationResultItems, files, 'Το construction visual δέχεται μόνο εικόνες.'), accept: 'image/*', buttonLabel: 'Construction' }),
        h(
          MediaGrid,
          null,
          logoInspirationItems.map((item) => renderMediaTile(tileUi, item, 'Reference', () => removeUploadItem(setLogoInspirationItems, item.id))),
          logoInspirationResultItems.map((item) => renderMediaTile(tileUi, item, 'Construction', () => removeUploadItem(setLogoInspirationResultItems, item.id)))
        )
      ),
      h(
        Step,
        null,
        h(StepTitle, null, 'Typography & Παλέτα'),
        h(MutedSmall, null, 'Δώσε μόνο τελικά fonts και ακριβή HEX ώστε το preview να βγάζει καθαρή, ολοκληρωμένη παρουσίαση.'),
        h('label', null, 'Typography title', h(InlineInput, { value: `${typographySection?.data?.title || ''}`, onChange: (event) => updateDraftField('typography', 'title', event.target.value, { enabled: true }), placeholder: 'Typography' })),
        h('label', null, 'Typography note / usage', h(CaptionInput, { rows: '4', value: `${typographySection?.data?.body || ''}`, onChange: (event) => updateDraftField('typography', 'body', event.target.value, { enabled: true }), placeholder: 'Περιέγραψε σύντομα hierarchy, ρόλους και ύφος των γραμματοσειρών.' })),
        h(
          Actions,
          null,
          h(FilePicker, null, h(FilePickerButton, null, 'Primary Font'), h(FileInput, { type: 'file', accept: '.otf,.ttf', onChange: (event) => { appendSingleFont(setLogoPrimaryFontItems, event.target.files || []); event.target.value = ''; } })),
          h(FilePicker, null, h(FilePickerButton, null, 'Secondary Font'), h(FileInput, { type: 'file', accept: '.otf,.ttf', onChange: (event) => { appendSingleFont(setLogoSecondaryFontItems, event.target.files || []); event.target.value = ''; } })),
          h(FilePicker, null, h(FilePickerButton, null, 'Extra Fonts'), h(FileInput, { type: 'file', accept: '.otf,.ttf', multiple: true, onChange: (event) => { appendExtraFonts(event.target.files || []); event.target.value = ''; } }))
        ),
        h(
          Actions,
          null,
          logoPrimaryFontItems.map((item) => h(ActionButton, { key: item.id, type: 'button', onClick: () => removeUploadItem(setLogoPrimaryFontItems, item.id) }, `Primary: ${item.file.name}`)),
          logoSecondaryFontItems.map((item) => h(ActionButton, { key: item.id, type: 'button', onClick: () => removeUploadItem(setLogoSecondaryFontItems, item.id) }, `Secondary: ${item.file.name}`)),
          logoExtraFontItems.map((item) => h(ActionButton, { key: item.id, type: 'button', onClick: () => removeUploadItem(setLogoExtraFontItems, item.id) }, `Extra: ${item.file.name}`))
        ),
        h('label', null, 'Color palette title', h(InlineInput, { value: `${paletteSection?.data?.title || ''}`, onChange: (event) => updateDraftField('color_palette', 'title', event.target.value, { enabled: true }), placeholder: 'Color Palette' })),
        h('label', null, 'Σημείωση παλέτας', h(CaptionInput, { rows: '3', value: `${paletteSection?.data?.body || ''}`, onChange: (event) => updateDraftField('color_palette', 'body', event.target.value, { enabled: true }), placeholder: 'Γράψε τι ρόλο παίζουν τα χρώματα ή τι αίσθηση πρέπει να μεταφέρουν.' })),
        h(MutedSmall, null, 'Primary colors'),
        h(
          Actions,
          null,
          logoPrimaryColorInputs.map((value, index) => {
            const normalized = normalizeHexColor(value);
            return h(
              ColorChip,
              { key: `primary-input-${index}`, as: 'div' },
              h(ColorSwatch, { $color: normalized || 'transparent' }),
              h(InlineInput, { value, onChange: (event) => updatePrimaryColorInput(index, event.target.value), placeholder: `Primary ${index + 1}` }),
              h(ActionButton, { type: 'button', $type: 'danger', onClick: () => removePrimaryColorInput(index) }, 'Αφαίρεση')
            );
          })
        ),
        h(Actions, null, h(ActionButton, { type: 'button', onClick: addPrimaryColorInput }, 'Προσθήκη Primary')),
        h(MutedSmall, null, 'Secondary colors'),
        h(
          Actions,
          null,
          logoSecondaryColorInputs.map((value, index) => {
            const normalized = normalizeHexColor(value);
            return h(
              ColorChip,
              { key: `secondary-input-${index}`, as: 'div' },
              h(ColorSwatch, { $color: normalized || 'transparent' }),
              h(InlineInput, { value, onChange: (event) => updateSecondaryColorInput(index, event.target.value), placeholder: `Secondary ${index + 1}` }),
              h(ActionButton, { type: 'button', $type: 'danger', onClick: () => removeSecondaryColorInput(index) }, 'Αφαίρεση')
            );
          })
        ),
        h(Actions, null, h(ActionButton, { type: 'button', onClick: addSecondaryColorInput }, 'Προσθήκη Secondary'))
      )
    ),
    h(
      CollapsiblePanel,
      { title: 'Mockups & Δημοσίευση', defaultOpen: true },
      h(
        Step,
        null,
        h(StepTitle, null, 'Mockups & εφαρμογές'),
        h(MutedSmall, null, 'Εδώ μπαίνουν τα τελικά εφαρμοσμένα visuals. Για πιο “όμορφο” preview, βάλε διαφορετικά κάδρα και απόφυγε πολλά σχεδόν ίδια mockups.'),
        h('label', null, 'Applications title', h(InlineInput, { value: `${applicationsSection?.data?.title || ''}`, onChange: (event) => updateDraftField('brand_applications', 'title', event.target.value, { enabled: true }), placeholder: 'Applications' })),
        h('label', null, 'Applications intro', h(CaptionInput, { rows: '4', value: `${applicationsSection?.data?.body || ''}`, onChange: (event) => updateDraftField('brand_applications', 'body', event.target.value, { enabled: true }), placeholder: 'Γράψε μια σύντομη εισαγωγή για το πώς ζει η ταυτότητα σε εφαρμογές.' })),
        h('label', null, 'Gallery title', h(InlineInput, { value: `${gallerySection?.data?.title || ''}`, onChange: (event) => updateDraftField('gallery', 'title', event.target.value, { enabled: true }), placeholder: 'Gallery' })),
        h('label', null, 'Extra gallery intro (optional)', h(CaptionInput, { rows: '3', value: `${gallerySection?.data?.body || ''}`, onChange: (event) => updateDraftField('gallery', 'body', event.target.value, { enabled: true }), placeholder: 'Μικρό intro για το κάτω gallery block.' })),
        renderDropzone({ title: 'Pattern / surface visuals', hint: 'Πολλαπλά αρχεία. Surfaces, textures, supporting graphics ή branded μοτίβα.', active: dragActive, setActive: setDragActive, Dropzone, DropText, FilePicker, FilePickerButton, FileInput, onPick: (files) => appendMultiImages(setLogoPatternItems, files, isLogoVisualFile, 'Τα pattern visuals δέχονται μόνο εικόνες.'), multiple: true, accept: 'image/*', buttonLabel: 'Patterns' }),
        renderDropzone({ title: 'Mockups', hint: 'Πολλαπλά αρχεία. Signage, packaging, stationery, digital use, bags κ.λπ.', active: dragActive, setActive: setDragActive, Dropzone, DropText, FilePicker, FilePickerButton, FileInput, onPick: (files) => appendMultiImages(setLogoMockupItems, files, isLogoVisualFile, 'Τα mockups δέχονται μόνο εικόνες.'), multiple: true, accept: 'image/*', buttonLabel: 'Mockups' }),
        renderDropzone({ title: 'Extra gallery visuals', hint: 'Πολλαπλά αρχεία. Επιπλέον frames που θα γεμίσουν το κάτω gallery block.', active: dragActive, setActive: setDragActive, Dropzone, DropText, FilePicker, FilePickerButton, FileInput, onPick: (files) => { appendMultiImages(setLogoStickerItems, files, isLogoVisualFile, 'Το extra gallery δέχεται μόνο εικόνες.'); toggleSection('gallery', true); }, multiple: true, accept: 'image/*', buttonLabel: 'Gallery' }),
        h('label', null, 'Closing title', h(InlineInput, { value: `${closingSection?.data?.title || ''}`, onChange: (event) => updateDraftField('closing', 'title', event.target.value, { enabled: true }), placeholder: 'Closing' })),
        h('label', null, 'Closing statement', h(CaptionInput, { rows: '4', value: `${closingSection?.data?.body || ''}`, onChange: (event) => updateDraftField('closing', 'body', event.target.value, { enabled: true }), placeholder: 'Σύντομη τελική φράση που να κλείνει κομψά την παρουσίαση.' })),
        h(
          MediaGrid,
          null,
          logoPatternItems.map((item) => renderMediaTile(tileUi, item, 'Pattern', () => removeUploadItem(setLogoPatternItems, item.id))),
          logoMockupItems.map((item) => renderMediaTile(tileUi, item, 'Mockup', () => removeUploadItem(setLogoMockupItems, item.id))),
          logoStickerItems.map((item) => renderMediaTile(tileUi, item, 'Gallery', () => removeUploadItem(setLogoStickerItems, item.id)))
        )
      ),
      h(
        Step,
        null,
        h(StepTitle, null, 'Publish'),
        h(MutedSmall, null, 'Για σωστό αποτέλεσμα στο preview, βάλε τουλάχιστον: brand name, hero heading, 1 primary logo, 1 intro paragraph, 2-3 καλά mockups και βασικά colors.'),
        h(
          Actions,
          null,
          h(ActionButton, { type: 'button', onClick: loadDemoLogoKitDraft, disabled: busy }, 'Load Demo'),
          h(ActionButton, { type: 'button', $type: 'danger', onClick: clearLogoDraft }, 'Καθαρισμός'),
          h(ActionButton, { type: 'button', $type: 'primary', disabled: busy, onClick: publishLogoKit }, 'Δημοσίευση')
        )
      )
    )
  );
}
