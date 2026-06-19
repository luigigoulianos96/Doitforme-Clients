async function parseResponse(response) {
  try {
    return await response.json();
  } catch (_error) {
    return null;
  }
}

async function fetchReviewHistory(clientSlug, contentType) {
  const query = new URLSearchParams({
    client: `${clientSlug || ''}`.trim(),
    mode: `${contentType || ''}`.trim()
  });

  const response = await fetch(`/api/review-history?${query.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const payload = await parseResponse(response);

  if (!response.ok || !payload?.ok || !Array.isArray(payload?.entries)) {
    const message = payload?.error || `API request failed (${response.status})`;
    return { entries: [], error: { message } };
  }

  return { entries: payload.entries, error: null };
}

async function addReviewHistoryEntry({ clientSlug, contentType, entityKey, action, text = '', changes = [], createdAt = '' }) {
  const response = await fetch('/api/review-history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientSlug,
      contentType,
      entityKey,
      action,
      text,
      changes,
      createdAt
    })
  });
  const payload = await parseResponse(response);

  if (!response.ok || !payload?.ok) {
    const message = payload?.error || `API request failed (${response.status})`;
    return { entry: null, error: { message } };
  }

  return { entry: payload.entry || null, error: null };
}

export { fetchReviewHistory, addReviewHistoryEntry };
