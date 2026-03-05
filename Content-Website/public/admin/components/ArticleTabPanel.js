import React from 'react';
import CollapsiblePanel from './CollapsiblePanel.js';
import RichTextEditor from '../../components/RichTextEditor.js';
import { hasRichTextContent } from '../../utils/richText.js';

const h = React.createElement;

const helperTextStyle = {
  color: 'color-mix(in srgb, var(--muted) 80%, var(--text))',
  fontSize: '1.2rem',
  lineHeight: 1.45
};

const primaryUploadBlockStyle = (active) => ({
  display: 'grid',
  gap: '0.65rem',
  padding: '1rem',
  borderRadius: '0.95rem',
  border: `1px solid ${active ? 'color-mix(in srgb, var(--ok) 38%, transparent)' : 'color-mix(in srgb, var(--ok) 20%, var(--greyDark))'}`,
  background: active
    ? 'color-mix(in srgb, var(--ok) 10%, var(--gloomDark))'
    : 'linear-gradient(180deg, color-mix(in srgb, var(--ok) 5%, var(--gloomDark)), color-mix(in srgb, var(--gloomDark) 42%, transparent))',
  boxShadow: active ? '0 0 0 1px color-mix(in srgb, var(--ok) 12%, transparent)' : 'none'
});

const uploadHeadingStyle = {
  fontSize: '1.48rem',
  lineHeight: 1.3
};

const uploadSubLabelStyle = {
  fontSize: '1.2rem',
  fontWeight: 400
};

const uploadButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  borderRadius: '999px',
  border: '1px solid color-mix(in srgb, var(--greyDark) 36%, transparent)',
  background: 'color-mix(in srgb, var(--gloom) 64%, transparent)',
  color: 'var(--text)',
  padding: '0.62rem 1rem',
  fontSize: '1.35rem',
  cursor: 'pointer'
};

const draftCardStyle = {
  display: 'grid',
  gap: '0.85rem',
  padding: '1rem',
  borderRadius: '1rem',
  border: '1px solid color-mix(in srgb, var(--greyDark) 18%, transparent)',
  background:
    'linear-gradient(180deg, color-mix(in srgb, var(--gloomDark) 38%, transparent), color-mix(in srgb, var(--gloom) 18%, transparent))'
};

const draftHeaderStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.6rem'
};

const draftLabelStyle = {
  fontSize: '1.08rem',
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'color-mix(in srgb, var(--accent) 74%, var(--text))'
};

const pickerRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.6rem',
  alignItems: 'center'
};

const actionShelfStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.6rem',
  alignItems: 'center',
  justifyContent: 'space-between'
};

const advancedIntroStyle = {
  display: 'grid',
  gap: '0.45rem',
  padding: '0.95rem 1rem',
  borderRadius: '0.95rem',
  border: '1px solid color-mix(in srgb, var(--greyDark) 16%, transparent)',
  background: 'color-mix(in srgb, var(--gloomDark) 28%, transparent)'
};

const compactSectionTitleStyle = {
  margin: 0,
  fontFamily: 'inherit',
  fontSize: '1.42rem',
  fontWeight: 700,
  lineHeight: 1.35
};

function renderImagePicker({ FilePicker, FilePickerButton, FileInput, onPick, hasImage }) {
  return h(
    FilePicker,
    null,
    h(FilePickerButton, null, hasImage ? 'Αλλαγή εικόνας' : 'Εικόνα'),
    h(FileInput, {
      type: 'file',
      accept: 'image/*',
      onChange: (event) => {
        onPick((event.target.files || [])[0]);
        event.target.value = '';
      }
    })
  );
}

export default function ArticleTabPanel({
  article,
  ui
}) {
  const [dragActive, setDragActive] = React.useState(false);
  const { busy, state, actions } = article;
  const { drafts } = state;
  const {
    updateArticleDraftField,
    importArticleDraftDocuments,
    setArticleDraftFile,
    removeArticleDraft,
    publishArticles
  } = actions;

  const {
    Form,
    Step,
    StepTitle,
    State,
    Actions,
    ActionButton,
    CaptionInput,
    FilePicker,
    FilePickerButton,
    FileInput,
    ArticleDraftPreview
  } = ui;

  function handleDocumentUpload(files) {
    const selectedFiles = Array.from(files || []).filter(Boolean);
    if (selectedFiles.length === 0) return;
    importArticleDraftDocuments(files);
  }

  function renderPrimaryDocumentUpload() {
    return h(
      'div',
      {
        style: primaryUploadBlockStyle(dragActive),
        onDragOver: (event) => {
          event.preventDefault();
          setDragActive(true);
        },
        onDragLeave: () => setDragActive(false),
        onDrop: (event) => {
          event.preventDefault();
          setDragActive(false);
          handleDocumentUpload(event.dataTransfer.files || []);
        }
      },
      h(
        'strong',
        { style: uploadHeadingStyle },
        'Ανέβασμα άρθρου'
      ),
      h(
        'span',
        { style: uploadSubLabelStyle },
        'Αρχεία .doc'
      ),
      h(
        'label',
        { style: uploadButtonStyle },
        'Επιλογή',
        h('input', {
          type: 'file',
          multiple: true,
          accept: '.docx,.txt,.md,.rtf,.html,.htm,.doc',
          style: { display: 'none' },
          onChange: (event) => {
            handleDocumentUpload(event.target.files || []);
            event.target.value = '';
          }
        })
      ),
      h(
        'small',
        { style: helperTextStyle },
        'Σύρε ένα ή περισσότερα αρχεία εδώ ή επίλεξέ τα για να προστεθούν στα πρόχειρα άρθρα.'
      )
    );
  }

  function renderDraftCard(draft, label) {
    const isReady = draft.title.trim().length > 0 && hasRichTextContent(draft.body);

    return h(
      'section',
      { style: draftCardStyle },
      h(
        'div',
        { style: draftHeaderStyle },
        h('span', { style: draftLabelStyle }, label),
        h(State, null, isReady ? 'Έτοιμο' : 'Σε επεξεργασία')
      ),
      h(
        'label',
        null,
        'Τίτλος',
        h(CaptionInput, {
          rows: '2',
          value: draft.title,
          onChange: (event) => updateArticleDraftField(draft.id, 'title', event.target.value),
          placeholder: 'Γράψε τίτλο άρθρου'
        })
      ),
      h(
        'label',
        null,
        'Κείμενο',
        h(RichTextEditor, {
          value: draft.body,
          onChange: (nextHtml) => updateArticleDraftField(draft.id, 'body', nextHtml),
          placeholder: 'Γράψε το κείμενο που θα εγκρίνει ο πελάτης',
          minHeight: '16rem'
        })
      ),
      h(
        'div',
        { style: pickerRowStyle },
        renderImagePicker({
          FilePicker,
          FilePickerButton,
          FileInput,
          hasImage: Boolean(draft.imagePreview),
          onPick: (file) => setArticleDraftFile(draft.id, file)
        })
      ),
      draft.imagePreview
        ? h(
            ArticleDraftPreview,
            null,
            h('img', {
              src: draft.imagePreview,
              alt: draft.title || 'Προεπισκόπηση άρθρου',
              loading: 'lazy'
            })
          )
        : null,
      h(
        'div',
        { style: actionShelfStyle },
        h(
          Actions,
          null,
          h(
            ActionButton,
            { type: 'button', $type: 'danger', onClick: () => removeArticleDraft(draft.id) },
            'Αφαίρεση'
          )
        )
      )
    );
  }

  return h(
    Form,
    { onSubmit: (event) => event.preventDefault() },
    h(
      CollapsiblePanel,
      { title: 'Αναρτήσεις Άρθρων', defaultOpen: true },
      h(
        Step,
        null,
        h(StepTitle, { style: compactSectionTitleStyle }, 'Ανέβασμα άρθρων'),
        renderPrimaryDocumentUpload()
      )
    ),
    h(
      CollapsiblePanel,
      { title: 'Πρόχειρα άρθρα', defaultOpen: true },
      h(
        Step,
        null,
        h(StepTitle, { style: compactSectionTitleStyle }, 'Ανεβασμένα Πρόχειρα Άρθρα'),
        h(
          'div',
          { style: advancedIntroStyle },
          h(
            'small',
            { style: helperTextStyle },
            drafts.length > 0
              ? `Υπάρχουν ${drafts.length} πρόχειρα άρθρα έτοιμα για επεξεργασία ή δημοσίευση.`
              : 'Δεν υπάρχουν πρόχειρα άρθρα αυτή τη στιγμή.'
          )
        ),
        drafts.map((draft, index) => renderDraftCard(draft, `Άρθρο ${index + 1}`)),
        drafts.length > 0
          ? h(
              'div',
              { style: actionShelfStyle },
              h('small', { style: helperTextStyle }, 'Η δημοσίευση παραμένει ίδια και στέλνει όλα τα έτοιμα drafts.'),
              h(
                Actions,
                null,
                h(
                  ActionButton,
                  { type: 'button', $type: 'primary', disabled: busy, onClick: publishArticles },
                  'Δημοσίευση'
                )
              )
            )
          : null
      )
    )
  );
}
