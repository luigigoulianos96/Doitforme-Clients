import { useEffect, useState } from 'react';

const NOTES_HISTORY_KEY = 'gymway_notes_history_v1';

function formatHistoryDateTime(iso) {
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return '-';
  return value.toLocaleString('el-GR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function readNotesHistory(storageKey) {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeNotesHistory(storageKey, value) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // Best effort only.
  }
}

function parseParagraphs(text) {
  return `${text || ''}`
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createParagraphDiff(beforeText, afterText) {
  const beforeParagraphs = parseParagraphs(beforeText);
  const afterParagraphs = parseParagraphs(afterText);
  const removed = beforeParagraphs
    .filter((paragraph) => !afterParagraphs.includes(paragraph))
    .map((paragraph) => ({ type: 'removed', paragraph }));
  const added = afterParagraphs
    .filter((paragraph) => !beforeParagraphs.includes(paragraph))
    .map((paragraph) => ({ type: 'added', paragraph }));
  return [...removed, ...added];
}

function useNotesHistory(clientSlug, previewMode) {
  const [notesHistoryByPost, setNotesHistoryByPost] = useState({});
  const notesStorageKey = `${NOTES_HISTORY_KEY}_${clientSlug || 'default'}_${previewMode}`;

  useEffect(() => {
    setNotesHistoryByPost(readNotesHistory(notesStorageKey));
  }, [notesStorageKey]);

  function appendNoteHistory(postId, text, action) {
    const hasArticleDiff = Boolean(
      text &&
      typeof text === 'object' &&
      'beforeText' in text &&
      'afterText' in text
    );
    const paragraphChanges = hasArticleDiff ? createParagraphDiff(text.beforeText, text.afterText) : [];
    const fallbackText = hasArticleDiff ? '' : text;
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: fallbackText,
      changes: paragraphChanges,
      action,
      createdAt: new Date().toISOString()
    };

    setNotesHistoryByPost((prev) => {
      const next = {
        ...prev,
        [postId]: [entry, ...(prev[postId] || [])]
      };
      writeNotesHistory(notesStorageKey, next);
      return next;
    });
  }

  return { notesHistoryByPost, appendNoteHistory };
}

export { NOTES_HISTORY_KEY, formatHistoryDateTime, useNotesHistory };
