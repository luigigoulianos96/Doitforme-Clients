import React from 'react';
import CollapsiblePanel from './CollapsiblePanel.js';

const h = React.createElement;

function renderMediaTile({ MediaTile, MediaThumb, MediaName, ActionButton }, item, label, onRemove) {
  const displayLabel = label ? `${label}: ${item.file.name}` : item.file.name;
  return h(
    MediaTile,
    { key: item.id },
    h(
      MediaThumb,
      null,
      h('img', { src: item.previewUrl, alt: item.file.name, loading: 'lazy' })
    ),
    h(MediaName, null, displayLabel),
    h(
      ActionButton,
      { type: 'button', $type: 'danger', onClick: onRemove },
      'Αφαίρεση'
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

  const tileUi = { MediaTile, MediaThumb, MediaName, ActionButton };

  return h(
    Form,
    { onSubmit: (event) => event.preventDefault() },
    h(
      Step,
      null,
      h(StepTitle, null, 'Primary workflow'),
      h(
        'label',
        null,
        'Brand Name',
        h(InlineInput, {
          value: logoBrandName,
          onChange: (event) => setLogoBrandName(event.target.value),
          placeholder: 'Luko pops'
        })
      ),
      h(
        'label',
        null,
        'Agency Name',
        h(InlineInput, {
          value: logoAgencyName,
          onChange: (event) => setLogoAgencyName(event.target.value),
          placeholder: 'Doitforme'
        })
      ),
      h(
        'label',
        null,
        'Tagline',
        h(InlineInput, {
          value: logoTagline,
          onChange: (event) => setLogoTagline(event.target.value),
          placeholder: 'Pop into happiness'
        })
      ),
      h(
        'label',
        null,
        'Concept Label (footer)',
        h(InlineInput, {
          value: logoConceptLabel,
          onChange: (event) => setLogoConceptLabel(event.target.value),
          placeholder: 'Concept 1'
        })
      ),
      h(
        'label',
        null,
        'Short Brand Description (για Symbol/Mascot slide)',
        h(CaptionInput, {
          rows: '4',
          value: logoShortDescription,
          onChange: (event) => setLogoShortDescription(event.target.value),
          placeholder: 'Σύντομη περιγραφή έμπνευσης και κατεύθυνσης brand...'
        })
      )
    ),
    h(
      CollapsiblePanel,
      { title: 'Assets (Advanced)' },
      h(
        Step,
        null,
        h(StepTitle, null, 'Inspiration (Nature -> Result)'),
        h(
          Dropzone,
          {
            $active: dragActive,
            onDragOver: (event) => {
              event.preventDefault();
              setDragActive(true);
            },
            onDragLeave: () => setDragActive(false),
            onDrop: (event) => {
              event.preventDefault();
              setDragActive(false);
              appendSingleImage(setLogoInspirationItems, event.dataTransfer.files, 'Επίλεξε εικόνα inspiration.');
            }
          },
          h(DropText, null, 'Inspiration image (.jpg/.jpeg/.png/.svg)'),
          h(
            FilePicker,
            null,
            h(FilePickerButton, null, 'Inspire'),
            h(FileInput, {
              type: 'file',
              accept: 'image/*',
              onChange: (event) => {
                appendSingleImage(setLogoInspirationItems, event.target.files || [], 'Επίλεξε εικόνα inspiration.');
                event.target.value = '';
              }
            })
          )
        ),
        logoInspirationItems.length > 0
          ? h(
              MediaGrid,
              null,
              logoInspirationItems.map((item) =>
                renderMediaTile(tileUi, item, '', () => removeUploadItem(setLogoInspirationItems, item.id))
              )
            )
          : null,
        h(
          Dropzone,
          {
            $active: dragActive,
            onDragOver: (event) => {
              event.preventDefault();
              setDragActive(true);
            },
            onDragLeave: () => setDragActive(false),
            onDrop: (event) => {
              event.preventDefault();
              setDragActive(false);
              appendSingleImage(setLogoInspirationResultItems, event.dataTransfer.files, 'Επίλεξε image τελικού αποτελέσματος.');
            }
          },
          h(DropText, null, 'Result image (.png/.svg/.jpg/.jpeg)'),
          h(
            FilePicker,
            null,
            h(FilePickerButton, null, 'Result'),
            h(FileInput, {
              type: 'file',
              accept: '.png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg',
              onChange: (event) => {
                appendSingleImage(setLogoInspirationResultItems, event.target.files || [], 'Επίλεξε image τελικού αποτελέσματος.');
                event.target.value = '';
              }
            })
          )
        ),
        logoInspirationResultItems.length > 0
          ? h(
              Actions,
              null,
              logoInspirationResultItems.map((item) =>
                h(
                  ActionButton,
                  {
                    key: item.id,
                    type: 'button',
                    onClick: () => removeUploadItem(setLogoInspirationResultItems, item.id)
                  },
                  'Αφαίρεση'
                )
              )
            )
          : null
      ),
      h(
        Step,
        null,
        h(StepTitle, null, 'Logo Upload'),
        h(MutedSmall, null, 'Main Logo / Secondary / Logomark / Variations'),
        h(
          Actions,
          null,
          h(
            FilePicker,
            null,
            h(FilePickerButton, null, 'Main'),
            h(FileInput, {
              type: 'file',
              accept: '.png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg',
              onChange: (event) => {
                appendSingleImage(setLogoMainLogoItems, event.target.files || [], 'Main Logo δέχεται μόνο .png/.svg/.jpg/.jpeg');
                event.target.value = '';
              }
            })
          ),
          h(
            FilePicker,
            null,
            h(FilePickerButton, null, 'Secondary'),
            h(FileInput, {
              type: 'file',
              accept: '.png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg',
              onChange: (event) => {
                appendSingleImage(setLogoSecondaryLogoItems, event.target.files || [], 'Secondary Logo δέχεται μόνο .png/.svg/.jpg/.jpeg');
                event.target.value = '';
              }
            })
          ),
          h(
            FilePicker,
            null,
            h(FilePickerButton, null, 'Logomark'),
            h(FileInput, {
              type: 'file',
              accept: '.png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg',
              onChange: (event) => {
                appendSingleImage(setLogoLogomarkItems, event.target.files || [], 'Logomark δέχεται μόνο .png/.svg/.jpg/.jpeg');
                event.target.value = '';
              }
            })
          ),
          h(
            FilePicker,
            null,
            h(FilePickerButton, null, 'Variants'),
            h(FileInput, {
              type: 'file',
              accept: '.png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg',
              multiple: true,
              onChange: (event) => {
                appendMultiImages(setLogoVariationItems, event.target.files || [], isPngOrSvgFile, 'Logo Variations δέχονται μόνο .png/.svg/.jpg/.jpeg');
                event.target.value = '';
              }
            })
          )
        ),
        h(
          MediaGrid,
          null,
          logoMainLogoItems.map((item) =>
            renderMediaTile(tileUi, item, 'Main', () => removeUploadItem(setLogoMainLogoItems, item.id))
          ),
          logoSecondaryLogoItems.map((item) =>
            renderMediaTile(tileUi, item, 'Secondary', () => removeUploadItem(setLogoSecondaryLogoItems, item.id))
          ),
          logoLogomarkItems.map((item) =>
            renderMediaTile(tileUi, item, 'Logomark', () => removeUploadItem(setLogoLogomarkItems, item.id))
          ),
          logoVariationItems.map((item) =>
            renderMediaTile(tileUi, item, 'Variation', () => removeUploadItem(setLogoVariationItems, item.id))
          )
        )
      ),
      h(
        Step,
        null,
        h(StepTitle, null, 'Mascot Upload (Optional)'),
        h(
          Actions,
          null,
          h(
            FilePicker,
            null,
            h(FilePickerButton, null, 'Mascot'),
            h(FileInput, {
              type: 'file',
              accept: '.png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg',
              onChange: (event) => {
                appendSingleImage(setLogoMascotPrimaryItems, event.target.files || [], 'Mascot primary δέχεται μόνο .png/.svg/.jpg/.jpeg');
                event.target.value = '';
              }
            })
          ),
          h(
            FilePicker,
            null,
            h(FilePickerButton, null, 'Poses'),
            h(FileInput, {
              type: 'file',
              accept: '.png,.svg,.jpg,.jpeg,image/png,image/svg+xml,image/jpeg',
              multiple: true,
              onChange: (event) => {
                appendMultiImages(setLogoMascotPoseItems, event.target.files || [], isPngOrSvgFile, 'Mascot poses δέχονται μόνο .png/.svg/.jpg/.jpeg');
                event.target.value = '';
              }
            })
          )
        ),
        h(
          MediaGrid,
          null,
          logoMascotPrimaryItems.map((item) =>
            renderMediaTile(tileUi, item, 'Mascot', () => removeUploadItem(setLogoMascotPrimaryItems, item.id))
          ),
          logoMascotPoseItems.map((item) =>
            renderMediaTile(tileUi, item, 'Pose', () => removeUploadItem(setLogoMascotPoseItems, item.id))
          )
        )
      ),
      h(
        Step,
        null,
        h(StepTitle, null, 'Typography Upload'),
        h(
          Actions,
          null,
          h(
            FilePicker,
            null,
            h(FilePickerButton, null, 'Primary'),
            h(FileInput, {
              type: 'file',
              accept: '.otf,.ttf',
              onChange: (event) => {
                appendSingleFont(setLogoPrimaryFontItems, event.target.files || []);
                event.target.value = '';
              }
            })
          ),
          h(
            FilePicker,
            null,
            h(FilePickerButton, null, 'Secondary'),
            h(FileInput, {
              type: 'file',
              accept: '.otf,.ttf',
              onChange: (event) => {
                appendSingleFont(setLogoSecondaryFontItems, event.target.files || []);
                event.target.value = '';
              }
            })
          ),
          h(
            FilePicker,
            null,
            h(FilePickerButton, null, 'Extras'),
            h(FileInput, {
              type: 'file',
              accept: '.otf,.ttf',
              multiple: true,
              onChange: (event) => {
                appendExtraFonts(event.target.files || []);
                event.target.value = '';
              }
            })
          )
        ),
        h(
          Actions,
          null,
          logoPrimaryFontItems.map((item) =>
            h(
              ActionButton,
              { key: item.id, type: 'button', onClick: () => removeUploadItem(setLogoPrimaryFontItems, item.id) },
              'Αφαίρεση'
            )
          ),
          logoSecondaryFontItems.map((item) =>
            h(
              ActionButton,
              { key: item.id, type: 'button', onClick: () => removeUploadItem(setLogoSecondaryFontItems, item.id) },
              'Αφαίρεση'
            )
          ),
          logoExtraFontItems.map((item) =>
            h(
              ActionButton,
              { key: item.id, type: 'button', onClick: () => removeUploadItem(setLogoExtraFontItems, item.id) },
              'Αφαίρεση'
            )
          )
        )
      ),
      h(
        Step,
        null,
        h(StepTitle, null, 'Color Palette (HEX)'),
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
              h(InlineInput, {
                value,
                onChange: (event) => updatePrimaryColorInput(index, event.target.value),
                placeholder: `Primary ${index + 1}`
              }),
              h(
                ActionButton,
                { type: 'button', $type: 'danger', onClick: () => removePrimaryColorInput(index) },
                'Αφαίρεση'
              )
            );
          })
        ),
        h(
          Actions,
          null,
          h(ActionButton, { type: 'button', onClick: addPrimaryColorInput }, 'Προσθήκη')
        ),
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
              h(InlineInput, {
                value,
                onChange: (event) => updateSecondaryColorInput(index, event.target.value),
                placeholder: `Secondary ${index + 1}`
              }),
              h(
                ActionButton,
                { type: 'button', $type: 'danger', onClick: () => removeSecondaryColorInput(index) },
                'Αφαίρεση'
              )
            );
          })
        ),
        h(
          Actions,
          null,
          h(ActionButton, { type: 'button', onClick: addSecondaryColorInput }, 'Προσθήκη')
        )
      ),
      h(
        Step,
        null,
        h(StepTitle, null, 'Mockups / Applications'),
        h(
          Actions,
          null,
          h(
            FilePicker,
            null,
            h(FilePickerButton, null, 'Pattern'),
            h(FileInput, {
              type: 'file',
              accept: 'image/*',
              multiple: true,
              onChange: (event) => {
                appendMultiImages(setLogoPatternItems, event.target.files || [], isLogoVisualFile, 'Pattern δέχεται μόνο εικόνες.');
                event.target.value = '';
              }
            })
          ),
          h(
            FilePicker,
            null,
            h(FilePickerButton, null, 'Mockups'),
            h(FileInput, {
              type: 'file',
              accept: 'image/*',
              multiple: true,
              onChange: (event) => {
                appendMultiImages(setLogoMockupItems, event.target.files || [], isLogoVisualFile, 'Mockups δέχονται μόνο εικόνες.');
                event.target.value = '';
              }
            })
          ),
          h(
            FilePicker,
            null,
            h(FilePickerButton, null, 'Stickers'),
            h(FileInput, {
              type: 'file',
              accept: 'image/*',
              multiple: true,
              onChange: (event) => {
                appendMultiImages(setLogoStickerItems, event.target.files || [], isLogoVisualFile, 'Stickers δέχονται μόνο εικόνες.');
                event.target.value = '';
              }
            })
          )
        ),
        h(
          MediaGrid,
          null,
          logoPatternItems.map((item) =>
            renderMediaTile(tileUi, item, 'Pattern', () => removeUploadItem(setLogoPatternItems, item.id))
          ),
          logoMockupItems.map((item) =>
            renderMediaTile(tileUi, item, 'Mockup', () => removeUploadItem(setLogoMockupItems, item.id))
          ),
          logoStickerItems.map((item) =>
            renderMediaTile(tileUi, item, 'Sticker', () => removeUploadItem(setLogoStickerItems, item.id))
          )
        )
      )
    ),
    h(
      Actions,
      null,
      h(
        ActionButton,
        { type: 'button', $type: 'danger', onClick: clearLogoDraft },
        'Καθαρισμός'
      ),
      h(
        ActionButton,
        { type: 'button', $type: 'primary', disabled: busy, onClick: publishLogoKit },
        'Δημοσίευση'
      )
    )
  );
}
