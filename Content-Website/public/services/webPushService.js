const REVIEW_PUSH_VAPID_ENDPOINT = '/api/push/vapid-public-key';
const REVIEW_PUSH_SUBSCRIBE_ENDPOINT = '/api/push/subscribe';
const REVIEW_PUSH_SERVICE_WORKER_URL = '/service-worker.js';

function decodeBase64UrlToUint8Array(value) {
  const normalized = `${value || ''}`.trim();
  if (!normalized) {
    throw new Error('Λείπει το VAPID public key.');
  }

  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  const base64 = (normalized + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);

  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index);
  }

  return output;
}

function isReviewPushSupported() {
  return typeof window !== 'undefined'
    && 'Notification' in window
    && 'serviceWorker' in navigator
    && 'PushManager' in window;
}

async function fetchVapidPublicKey() {
  const response = await fetch(REVIEW_PUSH_VAPID_ENDPOINT, {
    method: 'GET',
    cache: 'no-store'
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || 'Δεν φορτώθηκε το VAPID public key.');
  }

  if (!payload?.publicKey) {
    throw new Error('Το VAPID public key λείπει από το backend.');
  }

  return payload.publicKey;
}

async function persistSubscription(subscription, userId = '') {
  const response = await fetch(REVIEW_PUSH_SUBSCRIBE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subscription,
      userId,
      userAgent: navigator.userAgent || ''
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || 'Η αποθήκευση του push subscription απέτυχε.');
  }

  return payload;
}

async function ensureServiceWorkerRegistration() {
  const registration = await navigator.serviceWorker.register(REVIEW_PUSH_SERVICE_WORKER_URL, {
    scope: '/'
  });

  await navigator.serviceWorker.ready;
  return registration;
}

async function ensureSubscription(userId = '', { requestPermission = false } = {}) {
  if (!isReviewPushSupported()) {
    throw new Error('Ο browser δεν υποστηρίζει web push notifications.');
  }

  let permission = window.Notification.permission;
  if (requestPermission && permission === 'default') {
    permission = await window.Notification.requestPermission();
  }

  if (permission !== 'granted') {
    if (permission === 'denied') {
      throw new Error('Οι ειδοποιήσεις έχουν μπλοκαριστεί από τον browser.');
    }
    throw new Error('Οι ειδοποιήσεις δεν επιτράπηκαν.');
  }

  const registration = await ensureServiceWorkerRegistration();
  let subscription = await registration.pushManager.getSubscription();
  const alreadyActive = Boolean(subscription);

  if (!subscription) {
    const publicKey = await fetchVapidPublicKey();
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeBase64UrlToUint8Array(publicKey)
    });
  }

  await persistSubscription(subscription, userId);
  return { alreadyActive, subscription };
}

async function enableReviewPushNotifications(userId = '') {
  return ensureSubscription(userId, { requestPermission: true });
}

async function syncReviewPushSubscription(userId = '') {
  if (!isReviewPushSupported() || window.Notification.permission !== 'granted') {
    return { alreadyActive: false, subscription: null };
  }

  try {
    return await ensureSubscription(userId, { requestPermission: false });
  } catch (_error) {
    return { alreadyActive: false, subscription: null };
  }
}

export {
  isReviewPushSupported,
  enableReviewPushNotifications,
  syncReviewPushSubscription
};
