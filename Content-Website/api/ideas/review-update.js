const { sendJson, handleCors, readJsonBody, validateSupabaseEnv } = require('../push/_shared');

const ALLOWED_APPROVAL_STATUSES = new Set(['pending', 'approved', 'disapproved']);
const SELECT_FIELDS = 'id,client_id,title,analysis,requirements,status,approval_status,client_notes,client_feedback_image_url,client_feedback_image_path,client_feedback_audio_url,client_feedback_audio_path,inspiration_links,sort_order,created_at,updated_at';

function sanitizeClientSlug(value) {
  return `${value || ''}`.trim().replace(/[^a-zA-Z0-9_-]/g, '');
}

function sanitizePositiveInteger(value) {
  const nextValue = Number(value);
  if (!Number.isInteger(nextValue) || nextValue <= 0) return 0;
  return nextValue;
}

function normalizeApprovalStatus(value) {
  const nextValue = `${value || ''}`.trim().toLowerCase();
  return ALLOWED_APPROVAL_STATUSES.has(nextValue) ? nextValue : 'pending';
}

function normalizeText(value) {
  return `${value || ''}`.trim();
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
  const rows = await supabaseRequest(`clients?slug=eq.${encodeURIComponent(clientSlug)}&select=id,name,slug&limit=1`);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

function buildReviewPayload(rawPayload = {}) {
  const hasApprovalStatus = Object.prototype.hasOwnProperty.call(rawPayload, 'approval_status');
  const hasClientNotes = Object.prototype.hasOwnProperty.call(rawPayload, 'client_notes');
  const hasImageFeedback = Object.prototype.hasOwnProperty.call(rawPayload, 'client_feedback_image_url')
    || Object.prototype.hasOwnProperty.call(rawPayload, 'client_feedback_image_path');
  const hasAudioFeedback = Object.prototype.hasOwnProperty.call(rawPayload, 'client_feedback_audio_url')
    || Object.prototype.hasOwnProperty.call(rawPayload, 'client_feedback_audio_path');

  return {
    ...(hasApprovalStatus ? { approval_status: normalizeApprovalStatus(rawPayload.approval_status) } : {}),
    ...(hasClientNotes ? { client_notes: normalizeText(rawPayload.client_notes) } : {}),
    ...(hasImageFeedback
      ? {
          client_feedback_image_url: normalizeText(rawPayload.client_feedback_image_url),
          client_feedback_image_path: normalizeText(rawPayload.client_feedback_image_path)
        }
      : {}),
    ...(hasAudioFeedback
      ? {
          client_feedback_audio_url: normalizeText(rawPayload.client_feedback_audio_url),
          client_feedback_audio_path: normalizeText(rawPayload.client_feedback_audio_path)
        }
      : {})
  };
}

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const configError = validateSupabaseEnv();
  if (configError) {
    sendJson(res, 500, { error: configError });
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
    return;
  }

  const clientSlug = sanitizeClientSlug(payload?.clientSlug);
  const ideaId = sanitizePositiveInteger(payload?.ideaId);
  if (!clientSlug || !ideaId) {
    sendJson(res, 400, { error: 'Missing client slug or idea id.' });
    return;
  }

  try {
    const clientRecord = await fetchClientBySlug(clientSlug);
    if (!clientRecord?.id) {
      sendJson(res, 404, { error: 'Client not found.' });
      return;
    }

    const existingRows = await supabaseRequest(
      `content_ideas?client_id=eq.${clientRecord.id}&id=eq.${ideaId}&status=eq.published&select=id&limit=1`
    );
    if (!Array.isArray(existingRows) || existingRows.length === 0) {
      sendJson(res, 404, { error: 'Idea not found for this client.' });
      return;
    }

    const reviewPayload = buildReviewPayload(payload?.changes || {});
    const updatedRows = await supabaseRequest(
      `content_ideas?client_id=eq.${clientRecord.id}&id=eq.${ideaId}&status=eq.published&select=${encodeURIComponent(SELECT_FIELDS)}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: reviewPayload
      }
    );

    const updated = Array.isArray(updatedRows) && updatedRows.length > 0 ? updatedRows[0] : null;
    if (!updated) {
      sendJson(res, 500, { error: 'Failed to update idea review.' });
      return;
    }

    sendJson(res, 200, { ok: true, data: updated });
  } catch (error) {
    sendJson(res, 500, { error: error.message || 'Failed to update idea review.' });
  }
};
