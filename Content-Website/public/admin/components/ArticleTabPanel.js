import React from 'react';
import CollapsiblePanel from './CollapsiblePanel.js';

const h = React.createElement;

const workflowIntroStyle = {
  display: 'grid',
  gap: '0.7rem',
  padding: '1rem',
  borderRadius: '1rem',
  border: '1px solid color-mix(in srgb, var(--greyDark) 18%, transparent)',
  background:
    'linear-gradient(180deg, color-mix(in srgb, var(--gloomDark) 34%, transparent), color-mix(in srgb, var(--gloom) 20%, transparent))'
};

const progressRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  alignItems: 'center'
};

const progressChipStyle = (tone) => ({
  display: 'inline-flex',
  alignItems: 'center',
  width: 'fit-content',
  padding: '0.22rem 0.55rem',
  borderRadius: '999px',
  border: `1px solid color-mix(in srgb, ${tone} 24%, transparent)`,
  background: `color-mix(in srgb, ${tone} 10%, var(--gloomDark))`,
  color: `color-mix(in srgb, ${tone} 80%, var(--text))`,
  fontSize: '1.05rem',
  fontWeight: 700,
  letterSpacing: '0.03em'
});

const helperTextStyle = {
  color: 'color-mix(in srgb, var(--muted) 80%, var(--text))',
  fontSize: '1.2rem',
  lineHeight: 1.45
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

function renderDocumentPicker({ FilePicker, FilePickerButton, FileInput, onPick }) {
  return h(
    FilePicker,
    null,
    h(FilePickerButton, null, 'Doc'),
    h(FileInput, {
      type: 'file',
      accept: '.docx,.txt,.md,.rtf,.html,.htm,.doc',
      onChange: (event) => {
        onPick((event.target.files || [])[0]);
        event.target.value = '';
      }
    })
  );
}

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
  const { busy, state, actions } = article;
  const { drafts, primaryDraft, queuedDrafts, readyDraftCount } = state;
  const {
    addArticleDraft,
    updateArticleDraftField,
    importArticleDraftDocument,
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

  function renderDraftCard(draft, label) {
    const isReady = draft.title.trim().length > 0 && draft.body.trim().length > 0;

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
        h(CaptionInput, {
          rows: '8',
          value: draft.body,
          onChange: (event) => updateArticleDraftField(draft.id, 'body', event.target.value),
          placeholder: 'Γράψε το κείμενο που θα εγκρίνει ο πελάτης'
        })
      ),
      h(
        'div',
        { style: pickerRowStyle },
        renderDocumentPicker({
          FilePicker,
          FilePickerButton,
          FileInput,
          onPick: (file) => importArticleDraftDocument(draft.id, file)
        }),
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
      Step,
      null,
      h(StepTitle, null, 'Primary workflow'),
      h(State, null, `Έτοιμα: ${readyDraftCount}/${drafts.length}`),
      h(
        'div',
        { style: workflowIntroStyle },
        h(
          'div',
          { style: progressRowStyle },
          h('span', { style: progressChipStyle('var(--success)') }, `Ready ${readyDraftCount}`),
          h('span', { style: progressChipStyle('var(--accent)') }, `Drafts ${drafts.length}`)
        ),
        h(
          'small',
          { style: helperTextStyle },
          'Πρόσθεσε κείμενο χειροκίνητα ή φόρτωσε ένα doc για αυτόματη συμπλήρωση τίτλου και κύριου κειμένου.'
        ),
        h(
          Actions,
          null,
          h(ActionButton, { type: 'button', onClick: addArticleDraft }, 'Νέο')
        )
      ),
      primaryDraft ? renderDraftCard(primaryDraft, 'Κύριο άρθρο') : null
    ),
    h(
      CollapsiblePanel,
      { title: 'Drafts (Advanced)' },
      h(
        Step,
        null,
        h(StepTitle, null, 'Advanced drafts'),
        h(
          'div',
          { style: advancedIntroStyle },
          h(
            'small',
            { style: helperTextStyle },
            queuedDrafts.length > 0
              ? `Υπάρχουν ${queuedDrafts.length} επιπλέον draft${queuedDrafts.length === 1 ? '' : 's'} έτοιμα για επεξεργασία ή δημοσίευση.`
              : 'Δεν υπάρχουν επιπλέον drafts αυτή τη στιγμή.'
          )
        ),
        queuedDrafts.map((draft, index) => renderDraftCard(draft, `Άρθρο ${index + 2}`))
      )
    ),
    h(
      Step,
      null,
      h(StepTitle, null, 'Publish'),
      h(
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
    )
  );
}
