import React, { useEffect, useMemo, useState } from 'react';
import { Textarea_ } from 'monica-alexandria';
import {
  ReviewSection,
  ReviewBox,
  ReviewHead,
  InlineAction,
  NotesHistory,
  NoteItem,
  NoteText,
  SaveRow,
  SaveNoteButton,
  NoteCollapsed,
  DecisionRow,
  DecisionButton,
  DecisionNotice,
  PresentationShell,
  SlideDeckCard,
  SlideFrame,
  SlideHead,
  LogoSlideTitle,
  SlideHeadRight,
  SlideHeadLine,
  SlideBody,
  SlideFooter,
  FooterLabel,
  FooterConcept,
  DeckNavigator,
  SlideNavButton,
  SlideCounter,
  SlideLead,
  SlideCanvas,
  CenteredLogoStage,
  SummaryStage,
  SummaryListMinimal,
  FamilyLayout,
  SymbolFlow,
  FamilyVisualStage,
  TransitionArrow,
  FamilyTextBlock,
  SlideSubTitle,
  QuoteCard,
  StoryLine,
  ApplicationGrid,
  ApplicationImage,
  TypoPanel,
  TypoCard,
  TypefaceLine,
  TypoAlphabet,
  PaletteGrid,
  PaletteCard,
  GroupTitle,
  ColorBlocks,
  ColorBox,
  ColorSample,
  ColorHex,
  GradientCard } from
'../../core/styles/App.styles.js';
import { formatHistoryDateTime } from '../../hooks/useNotesHistory.js';
import { parseLogoAssetCategory, parseLogoMetaStep } from '../../utils/appHelpers.js';

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
  const primaryPalette = hasSecondaryOrdering ?
  (colors || []).filter((row) => Number(row.sort_order) < 1000).map((row) => row.hex_color).filter(Boolean) :
  (colors || []).map((row) => row.hex_color).filter(Boolean);
  const secondaryPalette = hasSecondaryOrdering ?
  (colors || []).filter((row) => Number(row.sort_order) >= 1000).map((row) => row.hex_color).filter(Boolean) :
  [];
  const palette = [...primaryPalette, ...secondaryPalette];
  const finalPrimaryPalette = primaryPalette.length > 0 ? primaryPalette : ['#00C73C', '#008C2C', '#D8DBD4', '#7BAAE4'];
  const finalSecondaryPalette = secondaryPalette.length > 0 ? secondaryPalette : ['#0E2E35', '#1BC45A', '#9CC4FF', '#E8EEE4'];
  const storyParagraphs = `${meta.shortDescription || ''}`.
  split('\n').
  map((line) => line.trim()).
  filter(Boolean);
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
    () => [primaryFontAsset, secondaryFontAsset, ...extraFontAssets].
    filter(Boolean).
    map((font, index) => ({ family: `LogoKitFont_${font.id}_${index}`, url: font.file_url, fileName: font.file_name || '' })),
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
    ...(hasClosingLogoSlide ? [{ id: 'closing_logo', title: 'Logo', side: 'Logo presentation', footer: '', concept: '' }] : [])],

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
    hasClosingLogoSlide]

  );
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeVisualIndex, setActiveVisualIndex] = useState(0);
  const [notes, setNotes] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [notesOpen, setNotesOpen] = useState(true);
  const [decisionLocked, setDecisionLocked] = useState(logoKit?.approval_status !== 'pending');
  const [decisionNotice, setDecisionNotice] = useState('');
  const rotatingVisuals = logoVariations.length > 0 ? logoVariations : applicationVisuals.length > 0 ? applicationVisuals : allVisuals;

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
    style.textContent = fontFamilies.
    map((fontDef) => `@font-face { font-family: '${fontDef.family}'; src: url('${fontDef.url}'); font-display: swap; }`).
    join('\n');
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
    const existingClientNotes = `${logoKit.client_notes || ''}`.trim();
    const payload = {
      approval_status: nextStatus,
      client_notes: trimmedNotes || existingClientNotes
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
    return React.createElement(SlideDeckCard, null, React.createElement(SlideFrame, null, React.createElement(LogoSlideTitle, null, "Logo Kit"), React.createElement(SlideLead, null, "Δεν υπάρχει δημοσιευμένο logo kit για αυτόν τον client ακόμα.")));







  }

  const primaryFontName = `${primaryFontAsset?.file_name || ''}`.replace('FONT_PRIMARY::', '') || 'Primary Font';
  const secondaryFontName = `${secondaryFontAsset?.file_name || ''}`.replace('FONT_SECONDARY::', '') || 'Secondary Font';
  const extraFontCards = extraFontAssets.map((asset, index) => ({
    id: asset.id || `extra-${index}`,
    name: `${asset.file_name || ''}`.replace('FONT_EXTRA::', '') || `Extra Font ${index + 1}`,
    family: fontFamilies[index + 2]?.family || fontFamilies[0]?.family
  }));

  const slideViewMap = {
    cover: React.createElement(SlideCanvas, { $c1:
      finalPrimaryPalette[0], $c2: finalSecondaryPalette[0] }, React.createElement(CenteredLogoStage, null,

    mainLogo?.file_url ? React.createElement("img", { src: mainLogo.file_url, alt: "Cover logo", loading: "lazy" }) : null)),





    summary: React.createElement(SummaryStage, null, React.createElement(SummaryListMinimal, null, React.createElement("li", null, React.createElement("p", null, "Logo")), React.createElement("li", null, React.createElement("p", null, "Typography")), React.createElement("li", null, React.createElement("p", null, "Color Palette")), React.createElement("li", null, React.createElement("p", null, "Brand Applications")))),









    symbol: React.createElement(SlideCanvas, { $c1:
      finalPrimaryPalette[0], $c2: finalSecondaryPalette[0] }, React.createElement(FamilyLayout, null, React.createElement("div", null, React.createElement(SymbolFlow, null, React.createElement(FamilyVisualStage, null,




    inspirationImage?.file_url ? React.createElement("img", { src: inspirationImage.file_url, alt: "Inspiration", loading: "lazy" }) : null), React.createElement(TransitionArrow, null, "→"), React.createElement(FamilyVisualStage, null,



    mascotPrimary?.file_url || inspirationResultImage?.file_url ? React.createElement("img", { src: (mascotPrimary || inspirationResultImage).file_url, alt: "Symbol / mascot result", loading: "lazy" }) : null))), React.createElement(FamilyTextBlock, null, React.createElement(SlideSubTitle, { $font:




      fontFamilies[0]?.family }, "Symbol / Mascot"), React.createElement(QuoteCard, null,

    (storyParagraphs.length > 0 ? storyParagraphs : ['Brand symbol and mascot direction.']).map((line, index) => React.createElement(StoryLine, { key:
      `story-line-${index}` }, line)
    ))))),





    main_logo: React.createElement(SlideCanvas, { $c1:
      finalPrimaryPalette[1], $c2: finalSecondaryPalette[1] }, React.createElement(CenteredLogoStage, null,

    mainLogo?.file_url ? React.createElement("img", { src: mainLogo.file_url, alt: "Main logo", loading: "lazy" }) : null)),



    secondary_logo: React.createElement(SlideCanvas, { $c1:
      finalPrimaryPalette[2], $c2: finalSecondaryPalette[2] }, React.createElement(CenteredLogoStage, null,

    secondaryLogo?.file_url || mainLogo?.file_url ? React.createElement("img", { src: (secondaryLogo || mainLogo).file_url, alt: "Secondary logo", loading: "lazy" }) : null)),



    logo_variations: React.createElement(SlideCanvas, { $c1:
      finalPrimaryPalette[3], $c2: finalSecondaryPalette[0] }, React.createElement(ApplicationGrid, null,

    (logoVariations.length > 0 ? logoVariations : [mainLogo, secondaryLogo, logomark].filter(Boolean)).slice(0, 4).map((visual) => React.createElement(ApplicationImage, { key:
      visual.id }, React.createElement("img", { src:
      visual.file_url, alt: visual.file_name || 'Logo variation', loading: "lazy" }))

    ))),



    logomark: React.createElement(SlideCanvas, { $c1:
      finalPrimaryPalette[0], $c2: finalSecondaryPalette[2] }, React.createElement(FamilyLayout, null, React.createElement(FamilyVisualStage, null,


    logomark?.file_url || mainLogo?.file_url ? React.createElement("img", { src: (logomark || mainLogo).file_url, alt: "Logomark", loading: "lazy" }) : null), React.createElement(FamilyVisualStage, null,


    logomark?.file_url || secondaryLogo?.file_url || mainLogo?.file_url ? React.createElement("img", { src: (logomark || secondaryLogo || mainLogo).file_url, alt: "Logomark variant", loading: "lazy" }) : null))),




    typography: React.createElement(SlideCanvas, { $c1:
      finalSecondaryPalette[2], $c2: finalPrimaryPalette[3] }, React.createElement(TypoPanel, null, React.createElement(TypoCard, null, React.createElement(SlideSubTitle, { $font:


      fontFamilies[0]?.family }, primaryFontName), React.createElement(TypefaceLine, { $font:
      fontFamilies[0]?.family }, "Aa Bb Cc 0123"), React.createElement(TypoAlphabet, { $font:
      fontFamilies[0]?.family }, "Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz")), React.createElement(TypoCard, null, React.createElement(SlideSubTitle, { $font:


      fontFamilies[1]?.family || fontFamilies[0]?.family }, secondaryFontName), React.createElement(TypefaceLine, { $font:
      fontFamilies[1]?.family || fontFamilies[0]?.family }, "Aa Bb Cc 0123"), React.createElement(TypoAlphabet, { $font:
      fontFamilies[1]?.family || fontFamilies[0]?.family }, "0 1 2 3 4 5 6 7 8 9")),

    extraFontCards.map((font) => React.createElement(TypoCard, { key:
      font.id }, React.createElement(SlideSubTitle, { $font:
      font.family }, font.name), React.createElement(TypefaceLine, { $font:
      font.family }, "Aa Bb Cc 0123"), React.createElement(TypoAlphabet, { $font:
      font.family }, "Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz"))

    ))),



    palette: React.createElement(SlideCanvas, { $c1:
      finalPrimaryPalette[0], $c2: finalPrimaryPalette[1] }, React.createElement(PaletteGrid, null, React.createElement(PaletteCard, null, React.createElement(GroupTitle, null, "Primary"), React.createElement(ColorBlocks, null,




    finalPrimaryPalette.map((colorValue, index) => React.createElement(ColorBox, { key:
      `primary-${colorValue}-${index}` }, React.createElement(ColorSample, { $color:
      colorValue }), React.createElement(ColorHex, null,
    colorValue))

    ))), React.createElement(PaletteCard, null, React.createElement(GroupTitle, null, "Secondary"), React.createElement(ColorBlocks, null,





    finalSecondaryPalette.map((colorValue, index) => React.createElement(ColorBox, { key:
      `secondary-${colorValue}-${index}` }, React.createElement(ColorSample, { $color:
      colorValue }), React.createElement(ColorHex, null,
    colorValue))

    ))))),





    color_application: React.createElement(SlideCanvas, { $c1:
      finalPrimaryPalette[0], $c2: finalSecondaryPalette[0] }, React.createElement(PaletteGrid, null,

    finalPrimaryPalette.slice(0, 2).map((colorValue, index) => React.createElement(GradientCard, { key:
      `apply-${colorValue}-${index}`, $gradient: `linear-gradient(135deg, ${colorValue} 0%, ${finalSecondaryPalette[index] || colorValue} 100%)` })
    )), React.createElement(ApplicationGrid, null,


    [mainLogo, secondaryLogo, logomark].filter(Boolean).slice(0, 2).map((visual) => React.createElement(ApplicationImage, { key:
      visual.id }, React.createElement("img", { src:
      visual.file_url, alt: visual.file_name || 'Logo on color', loading: "lazy" }))

    ))),



    brand_pattern: React.createElement(SlideCanvas, { $c1:
      finalPrimaryPalette[2], $c2: finalSecondaryPalette[2] }, React.createElement(ApplicationGrid, null,

    (patternVisuals.length > 0 ? patternVisuals : stickerVisuals).slice(0, 2).map((visual) => React.createElement(ApplicationImage, { key:
      visual.id }, React.createElement("img", { src:
      visual.file_url, alt: visual.file_name || 'Brand pattern', loading: "lazy" }))

    ))),



    mockups: React.createElement(SlideCanvas, { $c1:
      finalPrimaryPalette[1], $c2: finalSecondaryPalette[1] }, React.createElement(ApplicationGrid, null,

    (mockupVisuals.length > 0 ? mockupVisuals : applicationVisuals).slice(0, 4).map((visual) => React.createElement(ApplicationImage, { key:
      visual.id }, React.createElement("img", { src:
      visual.file_url, alt: visual.file_name || 'Mockup', loading: "lazy" }))

    ))),



    stickers: React.createElement(SlideCanvas, { $c1:
      finalPrimaryPalette[3], $c2: finalSecondaryPalette[3] }, React.createElement(ApplicationGrid, null,

    (stickerVisuals.length > 0 ? stickerVisuals : mascotPoses).slice(0, 4).map((visual) => React.createElement(ApplicationImage, { key:
      visual.id }, React.createElement("img", { src:
      visual.file_url, alt: visual.file_name || 'Sticker variation', loading: "lazy" }))

    ))),



    closing_logo: React.createElement(SlideCanvas, { $c1:
      finalPrimaryPalette[0], $c2: finalSecondaryPalette[0] }, React.createElement(CenteredLogoStage, null,

    mainLogo?.file_url || secondaryLogo?.file_url || logomark?.file_url ? React.createElement("img", { src: (mainLogo || secondaryLogo || logomark).file_url, alt: "Closing logo", loading: "lazy" }) : null))



  };
  const activeSlideContent = slideViewMap[activeSlide.id] || slideViewMap.cover;

  return React.createElement(PresentationShell, null, React.createElement(SlideDeckCard, null, React.createElement(SlideFrame, null, React.createElement(SlideHead, null, React.createElement("div", null, React.createElement(LogoSlideTitle, null,





  activeSlide.title)), React.createElement(SlideHeadRight, null, React.createElement(SlideHeadLine, null), React.createElement("p", null,



  activeSlide.side))), React.createElement(SlideBody, null,




  activeSlideContent),


  hasFooterContent && React.createElement(SlideFooter, null, React.createElement(FooterLabel, null,

  activeSlide.footer), React.createElement(FooterConcept, null,
  activeSlide.concept))
  ), React.createElement(DeckNavigator, null, React.createElement(SlideNavButton, { type:




    "button", onClick: previousSlide }, "← Previous"), React.createElement(SlideCounter, null,
  activeSlideIndex + 1, " / ", slides.length), React.createElement(SlideNavButton, { type:
    "button", onClick: nextSlide }, "Next →"))), React.createElement(SlideDeckCard, null, React.createElement(ReviewSection, null, React.createElement(ReviewBox, null, React.createElement(ReviewHead, null, React.createElement("span", null, "Σχόλιο πελάτη για logo kit"), React.createElement(InlineAction, { type:








    "button", onClick: () => setShowHistory((prev) => !prev), disabled: (historyEntries || []).length === 0 }, "Ιστορικό σχολίων")),



  showHistory && (historyEntries || []).length > 0 && React.createElement(NotesHistory, null,

  (historyEntries || []).map((entry) => React.createElement(NoteItem, { key:
    entry.id }, React.createElement("small", null,
  formatHistoryDateTime(entry.createdAt), " • ", entry.action), React.createElement(NoteText, null,
  entry.text))

  )),


  notesOpen ? React.createElement(React.Fragment, null, React.createElement(Textarea_, { id:


    `logo-kit-notes-${logoKit?.id || 'new'}`, rows:
    "3", value:
    notes, onChange:
    (event) => setNotes(event.target.value), placeholder:
    "Γράψε σχόλιο για το logo kit..." }), React.createElement(SaveRow, null, React.createElement(SaveNoteButton, { type:


    "button", onClick: handleSaveNotes, disabled: pending || !trimmedNotes }, "⌾ Αποθήκευση σχολίου"))) : React.createElement(NoteCollapsed, { type:





    "button", onClick: () => setNotesOpen(true) }, "+ Προσθήκη νέου σχολίου"),

  React.createElement(DecisionRow, null,


  !decisionLocked && React.createElement(DecisionButton, { type:
    "button", $type: "approve", onClick: () => handleDecision('approved'), disabled: pending }, "✓ Έγκριση"),



  !decisionLocked && React.createElement(DecisionButton, { type:
    "button", $type: "decline", onClick: () => handleDecision('disapproved'), disabled: pending }, "✕ Απόρριψη"),



  decisionLocked && React.createElement(DecisionButton, { type:
    "button", onClick: () => setDecisionLocked(false), disabled: pending }, "Αλλαγή Απόφασης")

  ),


  decisionNotice && React.createElement(DecisionNotice, null, decisionNotice)))));





}

export { LogoKitPresentation };
