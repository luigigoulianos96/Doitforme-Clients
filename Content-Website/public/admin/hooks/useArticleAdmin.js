import { useEffect, useState } from 'react';
import {
  buildRichTextFromParagraphs,
  hasRichTextContent,
  normalizeRichTextHtml
} from '../../utils/richText.js';

function createEmptyArticleDraft(id) {
  return { id, title: '', body: '', imageFile: null, imagePreview: '' };
}

function readUint16(view, offset) {
  return view.getUint16(offset, true);
}

function readUint32(view, offset) {
  return view.getUint32(offset, true);
}

async function inflateRaw(bytes) {
  if (typeof DecompressionStream !== 'function') {
    throw new Error('Ο browser δεν υποστηρίζει ανάγνωση .docx εδώ. Χρησιμοποίησε απλό text ή νεότερο browser.');
  }

  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  const buffer = await new Response(stream).arrayBuffer();
  return new Uint8Array(buffer);
}

async function extractZipEntry(file, entryName) {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  let eocdOffset = -1;
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65557); offset -= 1) {
    if (readUint32(view, offset) === 0x06054b50) {
      eocdOffset = offset;
      break;
    }
  }

  if (eocdOffset < 0) {
    throw new Error('Μη έγκυρο .docx αρχείο.');
  }

  const centralDirectoryOffset = readUint32(view, eocdOffset + 16);
  const totalEntries = readUint16(view, eocdOffset + 10);
  const decoder = new TextDecoder();
  let cursor = centralDirectoryOffset;

  for (let index = 0; index < totalEntries; index += 1) {
    if (readUint32(view, cursor) !== 0x02014b50) {
      break;
    }

    const compressionMethod = readUint16(view, cursor + 10);
    const compressedSize = readUint32(view, cursor + 20);
    const fileNameLength = readUint16(view, cursor + 28);
    const extraLength = readUint16(view, cursor + 30);
    const commentLength = readUint16(view, cursor + 32);
    const localHeaderOffset = readUint32(view, cursor + 42);
    const fileNameStart = cursor + 46;
    const fileName = decoder.decode(bytes.slice(fileNameStart, fileNameStart + fileNameLength));

    if (fileName === entryName) {
      if (readUint32(view, localHeaderOffset) !== 0x04034b50) {
        throw new Error('Μη έγκυρο .docx αρχείο.');
      }

      const localNameLength = readUint16(view, localHeaderOffset + 26);
      const localExtraLength = readUint16(view, localHeaderOffset + 28);
      const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
      const entryBytes = bytes.slice(dataStart, dataStart + compressedSize);

      if (compressionMethod === 0) return entryBytes;
      if (compressionMethod === 8) return inflateRaw(entryBytes);
      throw new Error('Μη υποστηριζόμενο format συμπίεσης στο .docx.');
    }

    cursor += 46 + fileNameLength + extraLength + commentLength;
  }

  throw new Error('Δεν βρέθηκε περιεχόμενο στο .docx.');
}

function normalizeParagraphs(paragraphs) {
  return paragraphs
    .map((paragraph) => paragraph.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean);
}

async function readDocxParagraphs(file) {
  const entryBytes = await extractZipEntry(file, 'word/document.xml');
  const xmlText = new TextDecoder().decode(entryBytes);
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'application/xml');
  const paragraphs = Array.from(xml.getElementsByTagName('w:p')).map((paragraph) =>
    `${paragraph.getElementsByTagName('w:numPr').length > 0 ? '• ' : ''}${Array.from(paragraph.getElementsByTagName('w:t'))
      .map((node) => node.textContent || '')
      .join('')}`
  );

  return normalizeParagraphs(paragraphs);
}

function readHtmlDraft(text) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  const blocks = Array.from(doc.body?.querySelectorAll('h1, h2, h3, p, li, ul, ol') || []);

  if (blocks.length === 0) {
    const fallbackText = (doc.body?.textContent || doc.documentElement?.textContent || '').trim();
    return {
      title: fallbackText,
      body: normalizeRichTextHtml(fallbackText)
    };
  }

  const title = (blocks[0].textContent || '').trim();
  const bodySource = blocks.slice(1).map((node) => node.outerHTML).join('') || blocks[0].outerHTML;

  return {
    title,
    body: normalizeRichTextHtml(bodySource)
  };
}

function readHtmlParagraphs(text) {
  const draft = readHtmlDraft(text);
  const plainBody = `${draft.title}\n\n${draft.body}`
    .replace(/\r/g, '');

  return normalizeParagraphs(
    plainBody
      .replace(/<[^>]+>/g, '\n')
      .split(/\n+/)
  );
}

function readRtfParagraphs(text) {
  const plainText = text
    .replace(/\\par[d]?/g, '\n')
    .replace(/\\'[0-9a-fA-F]{2}/g, ' ')
    .replace(/\\[a-z]+-?\d* ?/g, '')
    .replace(/[{}]/g, '')
    .replace(/\r/g, '');

  return normalizeParagraphs(plainText.split('\n'));
}

async function readDocumentParagraphs(file) {
  const lowerName = (file.name || '').toLowerCase();

  if (lowerName.endsWith('.docx')) {
    return readDocxParagraphs(file);
  }

  if (lowerName.endsWith('.doc')) {
    throw new Error('Το legacy .doc δεν υποστηρίζεται. Χρησιμοποίησε .docx ή απλό text.');
  }

  const text = await file.text();

  if (lowerName.endsWith('.html') || lowerName.endsWith('.htm')) {
    return readHtmlParagraphs(text);
  }

  if (lowerName.endsWith('.rtf')) {
    return readRtfParagraphs(text);
  }

  return normalizeParagraphs(text.split(/\r?\n/));
}

async function parseArticleDocument(file) {
  const lowerName = (file.name || '').toLowerCase();

  if (lowerName.endsWith('.html') || lowerName.endsWith('.htm')) {
    const text = await file.text();
    const htmlDraft = readHtmlDraft(text);

    if (!htmlDraft.title || !hasRichTextContent(htmlDraft.body)) {
      throw new Error('Το αρχείο δεν περιέχει αναγνώσιμο κείμενο.');
    }

    return htmlDraft;
  }

  const paragraphs = await readDocumentParagraphs(file);

  if (paragraphs.length === 0) {
    throw new Error('Το αρχείο δεν περιέχει αναγνώσιμο κείμενο.');
  }

  const title = paragraphs[0];
  const body = buildRichTextFromParagraphs(paragraphs.length > 1 ? paragraphs.slice(1) : [paragraphs[0]]);

  return { title, body };
}

export default function useArticleAdmin({
  client,
  session,
  selectedClient,
  posts,
  setBusy,
  setStatus,
  loadPosts,
  validateSelectedClientScope,
  createStorageAdapter,
  slugFilename,
  makeTypedTitle
}) {
  const [articleDrafts, setArticleDrafts] = useState([]);

  const composerState = {
    drafts: articleDrafts,
    primaryDraft: null,
    queuedDrafts: articleDrafts,
    readyDraftCount: articleDrafts.filter(
      (draft) => draft.title.trim().length > 0 && hasRichTextContent(draft.body)
    ).length
  };

  useEffect(() => {
    return () => {
      articleDrafts.forEach((draft) => {
        if (draft.imagePreview) URL.revokeObjectURL(draft.imagePreview);
      });
    };
  }, [articleDrafts]);

  function addArticleDraft() {
    setArticleDrafts((prev) => [
      ...prev,
      createEmptyArticleDraft(`${Date.now()}-${Math.random().toString(36).slice(2, 7)}`)
    ]);
  }

  function updateArticleDraftField(draftId, field, value) {
    const nextValue = field === 'body' ? normalizeRichTextHtml(value) : value;
    setArticleDrafts((prev) =>
      prev.map((draft) => (draft.id === draftId ? { ...draft, [field]: nextValue } : draft))
    );
  }

  function setArticleDraftFile(draftId, file) {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setArticleDrafts((prev) =>
      prev.map((draft) => {
        if (draft.id !== draftId) return draft;
        if (draft.imagePreview) URL.revokeObjectURL(draft.imagePreview);
        return { ...draft, imageFile: file, imagePreview: previewUrl };
      })
    );
  }

  function removeArticleDraft(draftId) {
    setArticleDrafts((prev) => {
      const selected = prev.find((draft) => draft.id === draftId);
      if (selected?.imagePreview) URL.revokeObjectURL(selected.imagePreview);
      return prev.filter((draft) => draft.id !== draftId);
    });
  }

  async function importArticleDraftDocument(draftId, file) {
    if (!file) return;

    try {
      const { title, body } = await parseArticleDocument(file);
      setArticleDrafts((prev) =>
        prev.map((draft) => (draft.id === draftId ? { ...draft, title, body } : draft))
      );
      setStatus(`Το κείμενο φορτώθηκε από ${file.name}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Δεν έγινε ανάγνωση του αρχείου.');
    }
  }

  async function importArticleDraftDocuments(files) {
    const selectedFiles = Array.from(files || []).filter(Boolean);
    if (selectedFiles.length === 0) return;

    const importedDrafts = [];
    const failedFiles = [];

    for (const file of selectedFiles) {
      try {
        const { title, body } = await parseArticleDocument(file);
        importedDrafts.push({
          ...createEmptyArticleDraft(`${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
          title,
          body
        });
      } catch (error) {
        failedFiles.push(error instanceof Error ? `${file.name}: ${error.message}` : `${file.name}: Δεν έγινε ανάγνωση του αρχείου.`);
      }
    }

    if (importedDrafts.length > 0) {
      setArticleDrafts((prev) => [...prev, ...importedDrafts]);
    }

    if (importedDrafts.length > 0 && failedFiles.length === 0) {
      setStatus(
        importedDrafts.length === 1
          ? `Το κείμενο φορτώθηκε από ${selectedFiles[0].name}.`
          : `Φορτώθηκαν ${importedDrafts.length} αρχεία στα πρόχειρα άρθρα.`
      );
      return;
    }

    if (importedDrafts.length > 0) {
      setStatus(`Φορτώθηκαν ${importedDrafts.length} αρχεία. ${failedFiles[0]}`);
      return;
    }

    setStatus(failedFiles[0] || 'Δεν έγινε ανάγνωση των αρχείων.');
  }

  async function publishArticles() {
    if (!client || !session || !selectedClient) return;
    const clientScope = await validateSelectedClientScope();
    if (!clientScope.ok) return;

    const readyDrafts = articleDrafts
      .map((draft) => ({
        ...draft,
        title: draft.title.trim(),
        body: normalizeRichTextHtml(draft.body)
      }))
      .filter((draft) => draft.title.length > 0 && hasRichTextContent(draft.body));

    if (readyDrafts.length === 0) {
      setStatus('Συμπλήρωσε τίτλο και κείμενο σε τουλάχιστον 1 άρθρο πριν τη δημοσίευση.');
      return;
    }

    setBusy(true);
    setStatus('Γίνεται ανέβασμα άρθρων...');
    const storage = createStorageAdapter();
    const highestSortOrder = posts.reduce((max, post) => Math.max(max, post.sort_order || 0), 0);

    for (let i = 0; i < readyDrafts.length; i += 1) {
      const draft = readyDrafts[i];
      let imagePath = '';
      let imageUrl = '';

      if (draft.imageFile) {
        const fileName = `${Date.now()}-article-${i}-${slugFilename(draft.imageFile.name)}`;
        const path = `${session.user.id}/${fileName}`;
        const { error: uploadError } = await storage.upload(path, draft.imageFile, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          setStatus(`Σφάλμα upload άρθρου (${draft.title}): ${uploadError.message}`);
          setBusy(false);
          return;
        }

        const { data: publicData } = storage.getPublicUrl(path);
        imagePath = path;
        imageUrl = publicData.publicUrl;
      }

      const payload = {
        title: makeTypedTitle('article', draft.title),
        caption: draft.body,
        image_url: imageUrl,
        image_path: imagePath,
        client_id: clientScope.value.id,
        status: 'published',
        approval_status: 'pending',
        client_notes: '',
        username: 'content.writer',
        like_count: 0,
        sort_order: highestSortOrder + i + 1
      };

      const { error: insertError } = await client.from('posts').insert(payload);
      if (insertError) {
        setStatus(`Σφάλμα βάσης άρθρου (${draft.title}): ${insertError.message}`);
        setBusy(false);
        return;
      }
    }

    articleDrafts.forEach((draft) => {
      if (draft.imagePreview) URL.revokeObjectURL(draft.imagePreview);
    });
    setArticleDrafts([]);
    setStatus(`Ολοκληρώθηκε. Δημοσιεύτηκαν ${readyDrafts.length} άρθρα.`);
    await loadPosts();
    setBusy(false);
  }

  return {
    state: composerState,
    actions: {
      addArticleDraft,
      updateArticleDraftField,
      importArticleDraftDocuments,
      importArticleDraftDocument,
      setArticleDraftFile,
      removeArticleDraft,
      publishArticles
    }
  };
}
