const {
  sendJson,
  handleCors,
  validateWebPushEnv
} = require('./_shared');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const configError = validateWebPushEnv({ requirePrivate: false });
  if (configError) {
    sendJson(res, 500, { error: configError });
    return;
  }

  sendJson(res, 200, {
    publicKey: `${process.env.WEB_PUSH_VAPID_PUBLIC_KEY || ''}`.trim()
  });
};
