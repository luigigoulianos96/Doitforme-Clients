const NOTES_HISTORY_KEY = 'gymway_notes_history_v1';

// Reads local notes history map from browser storage.
// Backend integration: replace localStorage with API read before post list render when backend is ready.
export const read_notes_history = () => {
  try {
    const raw = window.localStorage.getItem(NOTES_HISTORY_KEY);
    const parsed = JSON.parse(raw || '{}');
    const isObject = parsed && typeof parsed === 'object';

    return isObject ? parsed : {};
  } catch {
    return {};
  }
};

// Persists local notes history map after append operations.
// Backend integration: persist note action payload to backend first, then mirror local cache.
export const write_notes_history = (value) => {
  try {
    window.localStorage.setItem(NOTES_HISTORY_KEY, JSON.stringify(value));
  } catch {
    return null;
  }

  return value;
};

// Creates a notes history entry payload with deterministic shape.
// Backend integration: send this entry shape in order: save post update, then append note history entry.
export const create_history_entry = (text, action) => {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text,
    action,
    createdAt: new Date().toISOString()
  };
};
