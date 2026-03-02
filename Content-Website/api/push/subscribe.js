const {
  sendJson,
  handleCors,
  readJsonBody,
  validateSupabaseEnv,
  upsertPushSubscription
} = require('./_shared');

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

  try {
    const row = await upsertPushSubscription(payload || {});
    sendJson(res, 200, {
      ok: true,
      id: row?.id || null
    });
  } catch (error) {
    sendJson(res, 400, { error: error.message || 'Failed to save push subscription.' });
  }
};
