const {
  sendJson,
  handleCors,
  readJsonBody,
  validateSupabaseEnv,
  sanitizeClientSlug,
  normalizeContentType,
  fetchClientBySlug,
  validateTargetsForClient,
  fetchActiveSubscriptions,
  deactivateSubscriptions,
  createReviewNotificationPayload,
  getWebPushClient,
  mapSubscriptionRow
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

  const clientSlug = sanitizeClientSlug(payload?.clientSlug);
  if (!clientSlug) {
    sendJson(res, 400, { error: 'Missing client slug.' });
    return;
  }

  const contentType = normalizeContentType(payload?.contentType);

  try {
    const clientRecord = await fetchClientBySlug(clientSlug);
    if (!clientRecord) {
      sendJson(res, 404, { error: 'Client not found.' });
      return;
    }

    const hasValidTargets = await validateTargetsForClient(clientRecord.id, contentType, payload);
    if (!hasValidTargets) {
      sendJson(res, 202, {
        ok: true,
        sent: 0,
        skipped: true
      });
      return;
    }

    const subscriptions = await fetchActiveSubscriptions();
    if (subscriptions.length === 0) {
      sendJson(res, 200, {
        ok: true,
        sent: 0
      });
      return;
    }

    const webPush = getWebPushClient();
    const notificationPayload = JSON.stringify(createReviewNotificationPayload(
      { ...payload, contentType },
      clientRecord
    ));

    const invalidIds = [];
    let sent = 0;

    await Promise.all(subscriptions.map(async (subscriptionRow) => {
      try {
        await webPush.sendNotification(mapSubscriptionRow(subscriptionRow), notificationPayload, {
          TTL: 60
        });
        sent += 1;
      } catch (error) {
        const statusCode = error?.statusCode || 0;
        if (statusCode === 404 || statusCode === 410) {
          invalidIds.push(subscriptionRow.id);
        }
      }
    }));

    if (invalidIds.length > 0) {
      await deactivateSubscriptions(invalidIds);
    }

    sendJson(res, 200, {
      ok: true,
      sent,
      deactivated: invalidIds.length
    });
  } catch (error) {
    sendJson(res, 500, { error: error.message || 'Failed to send review notifications.' });
  }
};
