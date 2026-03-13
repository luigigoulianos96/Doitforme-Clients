function sendJson(res, status, payload, extraHeaders = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  Object.entries(extraHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  res.end(JSON.stringify(payload));
}

function handleCors(req, res) {
  if (req.method !== 'OPTIONS') return false;

  res.statusCode = 204;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  res.end();
  return true;
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;

  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString('utf8');
      if (body.length > 1024 * 1024) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (_error) {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', reject);
  });
}

function getSupabaseEnv() {
  return {
    url: `${process.env.SUPABASE_URL || ''}`.trim().replace(/\/+$/, ''),
    serviceRoleKey: `${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`.trim()
  };
}

function getWebPushEnv() {
  return {
    publicKey: `${process.env.WEB_PUSH_VAPID_PUBLIC_KEY || ''}`.trim(),
    privateKey: `${process.env.WEB_PUSH_VAPID_PRIVATE_KEY || ''}`.trim(),
    subject: `${process.env.WEB_PUSH_SUBJECT || 'mailto:admin@example.com'}`.trim()
  };
}

function validateSupabaseEnv() {
  const env = getSupabaseEnv();
  if (!env.url || !env.serviceRoleKey) {
    return 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.';
  }
  return '';
}

function validateWebPushEnv({ requirePrivate = false } = {}) {
  const env = getWebPushEnv();
  if (!env.publicKey) {
    return 'Missing WEB_PUSH_VAPID_PUBLIC_KEY.';
  }
  if (requirePrivate && !env.privateKey) {
    return 'Missing WEB_PUSH_VAPID_PRIVATE_KEY.';
  }
  return '';
}

function normalizeContentType(value) {
  if (value === 'article' || value === 'logo' || value === 'ideas') return value;
  return 'instagram';
}

function contentTypeLabel(value) {
  if (value === 'article') return 'Άρθρα';
  if (value === 'logo') return 'Logo Kit';
  if (value === 'ideas') return 'Ideas';
  return 'FB & IG';
}

function sanitizeClientSlug(value) {
  return `${value || ''}`.trim().replace(/[^a-zA-Z0-9_-]/g, '');
}

function sanitizePositiveInteger(value) {
  const nextValue = Number(value);
  if (!Number.isInteger(nextValue) || nextValue <= 0) return 0;
  return nextValue;
}

function normalizePositiveIntegers(values) {
  if (!Array.isArray(values)) return [];

  return [...new Set(values.map((value) => sanitizePositiveInteger(value)).filter(Boolean))];
}

function buildSupabaseUrl(path) {
  return `${getSupabaseEnv().url}/rest/v1/${path}`;
}

async function supabaseRequest(path, options = {}) {
  const env = getSupabaseEnv();
  const response = await fetch(buildSupabaseUrl(path), {
    method: options.method || 'GET',
    headers: {
      apikey: env.serviceRoleKey,
      Authorization: `Bearer ${env.serviceRoleKey}`,
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
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function fetchClientBySlug(clientSlug) {
  const rows = await supabaseRequest(`clients?slug=eq.${encodeURIComponent(clientSlug)}&select=id,name,slug&limit=1`);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function validateTargetsForClient(clientId, contentType, payload) {
  if (contentType === 'logo') {
    const logoKitId = sanitizePositiveInteger(payload?.logoKitId);
    if (!logoKitId) return false;

    const rows = await supabaseRequest(
      `logo_kits?client_id=eq.${clientId}&status=eq.published&id=eq.${logoKitId}&select=id&limit=1`
    );

    return Array.isArray(rows) && rows.length > 0;
  }

  const targetIds = normalizePositiveIntegers(payload?.targetIds);
  if (targetIds.length === 0) return false;

  if (contentType === 'ideas') {
    const rows = await supabaseRequest(
      `content_ideas?client_id=eq.${clientId}&status=eq.published&id=in.(${targetIds.join(',')})&select=id`
    );
    return Array.isArray(rows) && rows.length > 0;
  }

  const rows = await supabaseRequest(
    `posts?client_id=eq.${clientId}&status=eq.published&id=in.(${targetIds.join(',')})&select=id`
  );

  return Array.isArray(rows) && rows.length > 0;
}

async function upsertPushSubscription({ subscription, userId = '', userAgent = '' }) {
  const endpoint = `${subscription?.endpoint || ''}`.trim();
  const p256dh = `${subscription?.keys?.p256dh || ''}`.trim();
  const auth = `${subscription?.keys?.auth || ''}`.trim();

  if (!endpoint || !p256dh || !auth) {
    throw new Error('Invalid push subscription payload.');
  }

  const rows = await supabaseRequest('web_push_subscriptions?on_conflict=endpoint', {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation'
    },
    body: [{
      endpoint,
      p256dh_key: p256dh,
      auth_key: auth,
      user_id: userId || null,
      user_agent: `${userAgent || ''}`.trim().slice(0, 512),
      status: 'active',
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }]
  });

  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function fetchActiveSubscriptions() {
  const rows = await supabaseRequest(
    'web_push_subscriptions?status=eq.active&select=id,endpoint,p256dh_key,auth_key&order=updated_at.desc'
  );

  return Array.isArray(rows) ? rows : [];
}

async function deactivateSubscriptions(ids) {
  const subscriptionIds = normalizePositiveIntegers(ids);
  if (subscriptionIds.length === 0) return;

  await supabaseRequest(`web_push_subscriptions?id=in.(${subscriptionIds.join(',')})`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=minimal'
    },
    body: {
      status: 'inactive',
      updated_at: new Date().toISOString()
    }
  });
}

function createReviewNotificationPayload(input, clientRecord) {
  const contentType = normalizeContentType(input?.contentType);
  const sectionLabel = contentTypeLabel(contentType);
  const approvalStatus = `${input?.approvalStatus || ''}`.trim();
  const hasClientNotes = Boolean(input?.hasClientNotes);
  const hasFeedbackAttachment = Boolean(input?.hasFeedbackAttachment);
  const clientName = `${clientRecord?.name || input?.clientName || 'Client'}`.trim();

  let body = `${clientName}: νέο feedback στο ${sectionLabel}.`;
  if (approvalStatus === 'approved') {
    body = `${clientName}: εγκρίθηκε νέο περιεχόμενο στο ${sectionLabel}.`;
  } else if (approvalStatus === 'disapproved') {
    body = `${clientName}: ζητήθηκαν αλλαγές στο ${sectionLabel}.`;
  } else if (hasClientNotes && hasFeedbackAttachment) {
    body = `${clientName}: νέες σημειώσεις και attachments στο ${sectionLabel}.`;
  } else if (hasClientNotes) {
    body = `${clientName}: νέες σημειώσεις στο ${sectionLabel}.`;
  } else if (hasFeedbackAttachment) {
    body = `${clientName}: νέο attachment feedback στο ${sectionLabel}.`;
  }

  const adminUrl = contentType === 'ideas'
    ? `/ideas-admin.html?client=${encodeURIComponent(clientRecord.slug)}`
    : `/admin.html?client=${encodeURIComponent(clientRecord.slug)}&tab=${encodeURIComponent(contentType)}`;
  return {
    title: 'Content Portal',
    body,
    icon: '/service-worker-icon.svg',
    badge: '/service-worker-icon.svg',
    tag: `review-${clientRecord.slug}-${contentType}`,
    url: adminUrl,
    actions: [
      { action: 'open', title: 'Άνοιγμα' },
      { action: 'close', title: 'Κλείσιμο' }
    ],
    requireInteraction: true
  };
}

function getWebPushClient() {
  const configError = validateWebPushEnv({ requirePrivate: true });
  if (configError) {
    throw new Error(configError);
  }

  let webPush;
  try {
    webPush = require('web-push');
  } catch (_error) {
    throw new Error('Missing dependency "web-push". Run npm install.');
  }

  const env = getWebPushEnv();
  webPush.setVapidDetails(env.subject, env.publicKey, env.privateKey);
  return webPush;
}

function mapSubscriptionRow(row) {
  return {
    id: row.id,
    endpoint: row.endpoint,
    keys: {
      p256dh: row.p256dh_key,
      auth: row.auth_key
    }
  };
}

module.exports = {
  sendJson,
  handleCors,
  readJsonBody,
  validateSupabaseEnv,
  validateWebPushEnv,
  normalizeContentType,
  sanitizeClientSlug,
  fetchClientBySlug,
  validateTargetsForClient,
  upsertPushSubscription,
  fetchActiveSubscriptions,
  deactivateSubscriptions,
  createReviewNotificationPayload,
  getWebPushClient,
  mapSubscriptionRow
};
