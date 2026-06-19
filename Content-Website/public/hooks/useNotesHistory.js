import { useEffect, useState } from 'react';
import { addReviewHistoryEntry, fetchReviewHistory } from '../services/reviewHistoryService.js';

const NOTES_HISTORY_KEY = 'gymway_notes_history_v1';
const NOTES_HISTORY_MIGRATION_KEY = 'gymway_notes_history_db_migrated_v1';

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

function readLegacyNotesHistory(storageKey) {
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

function readMigrationFlag(flagKey) {
  try {
    return window.localStorage.getItem(flagKey) === '1';
  } catch {
    return false;
  }
}

function writeMigrationFlag(flagKey) {
  try {
    window.localStorage.setItem(flagKey, '1');
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

function normalizeHistoryEntry(entry) {
  return {
    id: `${entry?.id || ''}`.trim() || `db-${Date.now()}`,
    text: `${entry?.text || ''}`,
    changes: Array.isArray(entry?.changes) ? entry.changes : [],
    action: `${entry?.action || ''}`,
    createdAt: entry?.createdAt || new Date().toISOString()
  };
}

function mergeHistoryMaps(...maps) {
  const merged = {};

  maps.forEach((source) => {
    Object.entries(source || {}).forEach(([entityKey, entries]) => {
      if (!entityKey || !Array.isArray(entries)) return;
      const currentEntries = merged[entityKey] || [];
      const seen = new Set(
        currentEntries.map((entry) => JSON.stringify([
          entry.createdAt || '',
          entry.action || '',
          entry.text || '',
          Array.isArray(entry.changes) ? entry.changes : []
        ]))
      );

      entries.forEach((entry) => {
        const normalizedEntry = normalizeHistoryEntry(entry);
        const signature = JSON.stringify([
          normalizedEntry.createdAt || '',
          normalizedEntry.action || '',
          normalizedEntry.text || '',
          normalizedEntry.changes
        ]);
        if (seen.has(signature)) return;
        currentEntries.push(normalizedEntry);
        seen.add(signature);
      });

      currentEntries.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      merged[entityKey] = currentEntries;
    });
  });

  return merged;
}

function useNotesHistory(clientSlug, previewMode) {
  const [notesHistoryByPost, setNotesHistoryByPost] = useState({});

  useEffect(() => {
    let active = true;

    async function migrateLegacyHistoryIfNeeded() {
      const notesStorageKey = `${NOTES_HISTORY_KEY}_${clientSlug || 'default'}_${previewMode}`;
      const migrationFlagKey = `${NOTES_HISTORY_MIGRATION_KEY}_${clientSlug || 'default'}_${previewMode}`;
      if (readMigrationFlag(migrationFlagKey)) return;

      const legacyByEntity = readLegacyNotesHistory(notesStorageKey);
      const entries = Object.entries(legacyByEntity).flatMap(([entityKey, historyList]) => {
        if (!Array.isArray(historyList)) return [];
        return historyList
          .map((entry) => ({
            entityKey: `${entityKey || ''}`.trim(),
            action: `${entry?.action || ''}`,
            text: `${entry?.text || ''}`,
            changes: Array.isArray(entry?.changes) ? entry.changes : [],
            createdAt: entry?.createdAt || ''
          }))
          .filter((entry) => entry.entityKey);
      });

      if (entries.length === 0) {
        writeMigrationFlag(migrationFlagKey);
        return;
      }

      const results = await Promise.all(entries.map((entry) => addReviewHistoryEntry({
        clientSlug,
        contentType: previewMode,
        entityKey: entry.entityKey,
        action: entry.action,
        text: entry.text,
        changes: entry.changes,
        createdAt: entry.createdAt
      })));

      const hasError = results.some((result) => result?.error);
      if (!hasError) {
        writeMigrationFlag(migrationFlagKey);
      }
    }

    async function load() {
      if (!clientSlug || !previewMode) {
        if (active) setNotesHistoryByPost({});
        return;
      }

      const notesStorageKey = `${NOTES_HISTORY_KEY}_${clientSlug || 'default'}_${previewMode}`;
      const legacyByEntity = readLegacyNotesHistory(notesStorageKey);
      await migrateLegacyHistoryIfNeeded();
      const { entries, error } = await fetchReviewHistory(clientSlug, previewMode);
      if (!active) return;
      if (error) {
        setNotesHistoryByPost(legacyByEntity);
        return;
      }

      const dbHistoryByEntity = (entries || []).reduce((acc, entry) => {
        const entityKey = `${entry?.entityKey || ''}`.trim();
        if (!entityKey) return acc;
        const normalizedEntry = normalizeHistoryEntry(entry);
        acc[entityKey] = [...(acc[entityKey] || []), normalizedEntry];
        return acc;
      }, {});

      const next = mergeHistoryMaps(legacyByEntity, dbHistoryByEntity);
      writeNotesHistory(notesStorageKey, next);
      setNotesHistoryByPost(next);
    }

    load();
    return () => {
      active = false;
    };
  }, [clientSlug, previewMode]);

  function appendNoteHistory(postId, text, action) {
    if (!postId) return;
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

    const entryKey = `${postId}`;
    const notesStorageKey = `${NOTES_HISTORY_KEY}_${clientSlug || 'default'}_${previewMode}`;
    setNotesHistoryByPost((prev) => {
      const next = {
        ...prev,
        [entryKey]: [entry, ...(prev[entryKey] || [])]
      };
      writeNotesHistory(notesStorageKey, next);
      return next;
    });

    addReviewHistoryEntry({
      clientSlug,
      contentType: previewMode,
      entityKey: entryKey,
      action,
      text: fallbackText,
      changes: paragraphChanges
    }).catch(() => {
      // Keep optimistic UI and local backup; DB persistence failures should not erase notes.
    });
  }

  return { notesHistoryByPost, appendNoteHistory };
}

export { NOTES_HISTORY_KEY, formatHistoryDateTime, useNotesHistory };
