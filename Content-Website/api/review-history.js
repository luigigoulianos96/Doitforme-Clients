const { sendJson, handleCors, readJsonBody, validateSupabaseEnv } = require('./push/_shared');

const ALLOWED_CONTENT_TYPES = new Set(['instagram', 'article', 'logo', 'linkedin', 'ideas']);
const MAX_ACTION_LENGTH = 120;
const MAX_TEXT_LENGTH = 12000;
const MAX_ROWS = 600;

function sanitizeClientSlug(value) {
  return `${value || ''}`.trim().replace(/[^a-zA-Z0-9_-]/g, '');
}

function sanitizeContentType(value) {
  const normalized = `${value || ''}`.trim().toLowerCase();
  return ALLOWED_CONTENT_TYPES.has(normalized) ? normalized : 'instagram';
}

function sanitizeEntityKey(value) {
  return `${value || ''}`.trim().slice(0, 180);
}

function sanitizeAction(value) {
  return `${value || ''}`.trim().slice(0, MAX_ACTION_LENGTH);
}

function sanitizeText(value) {
  return `${value || ''}`.trim().slice(0, MAX_TEXT_LENGTH);
}

function sanitizeChanges(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      type: `${item?.type || ''}`.trim().slice(0, 32),
      paragraph: `${item?.paragraph || ''}`.trim().slice(0, MAX_TEXT_LENGTH)
    }))
    .filter((item) => item.type && item.paragraph);
}

function sanitizeIsoDate(value) {
  const raw = `${value || ''}`.trim();
  if (!raw) return '';
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString();
}

function buildSupabaseUrl(path) {
  const base = `${process.env.SUPABASE_URL || ''}`.trim().replace(/\/+$/, '');
  return `${base}/rest/v1/${path}`;
}

async function supabaseRequest(path, options = {}) {
  const serviceRoleKey = `${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`.trim();
  const response = await fetch(buildSupabaseUrl(path), {
    method: options.method || 'GET',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  const rawText = await response.text();
  let payload = null;
  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch (_error) {
      payload = rawText;
    }
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || response.statusText || 'Supabase request failed';
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  return payload;
}

async function fetchClientBySlug(clientSlug) {
  const rows = await supabaseRequest(`clients?slug=eq.${encodeURIComponent(clientSlug)}&select=id,slug&limit=1`);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

function mapHistoryRow(row) {
  return {
    id: `${row?.id || ''}`.trim() || `db-${Date.now()}`,
    text: `${row?.text_value || ''}`.trim(),
    changes: Array.isArray(row?.changes) ? row.changes : [],
    action: `${row?.action || ''}`.trim(),
    createdAt: row?.created_at || new Date().toISOString(),
    entityKey: `${row?.entity_key || ''}`.trim()
  };
}

function getRequestUrl(req) {
  try {
    return new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch {
    return new URL('http://localhost/');
  }
}

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const configError = validateSupabaseEnv();
  if (configError) {
    sendJson(res, 500, { error: configError });
    return;
  }

  if (req.method === 'GET') {
    const url = getRequestUrl(req);
    const clientSlug = sanitizeClientSlug(url.searchParams.get('client'));
    const contentType = sanitizeContentType(url.searchParams.get('mode'));
    if (!clientSlug) {
      sendJson(res, 400, { error: 'Missing client slug.' });
      return;
    }

    try {
      const clientRecord = await fetchClientBySlug(clientSlug);
      if (!clientRecord?.id) {
        sendJson(res, 404, { error: 'Client not found.' });
        return;
      }

      const rows = await supabaseRequest(
        `review_notes_history?client_id=eq.${clientRecord.id}&content_type=eq.${contentType}&select=id,entity_key,action,text_value,changes,created_at&order=created_at.desc&limit=${MAX_ROWS}`
      );

      sendJson(res, 200, {
        ok: true,
        entries: (Array.isArray(rows) ? rows : []).map(mapHistoryRow)
      });
      return;
    } catch (error) {
      sendJson(res, 500, { error: error.message || 'Failed to load review history.' });
      return;
    }
  }

  if (req.method === 'POST') {
    let payload;
    try {
      payload = await readJsonBody(req);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    const clientSlug = sanitizeClientSlug(payload?.clientSlug);
    const contentType = sanitizeContentType(payload?.contentType);
    const entityKey = sanitizeEntityKey(payload?.entityKey);
    if (!clientSlug || !entityKey) {
      sendJson(res, 400, { error: 'Missing client slug or entity key.' });
      return;
    }

    const createdAt = sanitizeIsoDate(payload?.createdAt);
    const rowPayload = {
      action: sanitizeAction(payload?.action),
      text_value: sanitizeText(payload?.text),
      changes: sanitizeChanges(payload?.changes),
      ...(createdAt ? { created_at: createdAt } : {})
    };

    try {
      const clientRecord = await fetchClientBySlug(clientSlug);
      if (!clientRecord?.id) {
        sendJson(res, 404, { error: 'Client not found.' });
        return;
      }

      const rows = await supabaseRequest(
        `review_notes_history?select=id,entity_key,action,text_value,changes,created_at`,
        {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: [{
            client_id: clientRecord.id,
            content_type: contentType,
            entity_key: entityKey,
            ...rowPayload
          }]
        }
      );

      const created = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
      sendJson(res, 200, { ok: true, entry: created ? mapHistoryRow(created) : null });
      return;
    } catch (error) {
      sendJson(res, 500, { error: error.message || 'Failed to save review history.' });
      return;
    }
  }

  sendJson(res, 405, { error: 'Method not allowed' });
};
