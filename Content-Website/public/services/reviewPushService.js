const REVIEW_PUSH_NOTIFY_ENDPOINT = '/api/push/notify-review-event';

function normalizeNumericIds(values) {
  if (!Array.isArray(values)) return [];

  return [...new Set(
    values
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0)
  )];
}

async function notifyReviewEvent(payload) {
  try {
    const body = {
      clientSlug: `${payload?.clientSlug || ''}`.trim(),
      clientName: `${payload?.clientName || ''}`.trim(),
      contentType: `${payload?.contentType || 'instagram'}`.trim(),
      approvalStatus: `${payload?.approvalStatus || ''}`.trim(),
      hasClientNotes: Boolean(payload?.hasClientNotes),
      hasFeedbackAttachment: Boolean(payload?.hasFeedbackAttachment),
      targetIds: normalizeNumericIds(payload?.targetIds),
      logoKitId: Number.isFinite(Number(payload?.logoKitId)) ? Number(payload.logoKitId) : null
    };

    if (!body.clientSlug) return false;

    const response = await fetch(REVIEW_PUSH_NOTIFY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    return response.ok;
  } catch (_error) {
    return false;
  }
}

export { notifyReviewEvent };
