function getConfig() {
  const config = window.APP_CONFIG || {};
  return {
    baseUrl: `${config.MINIO_BASE_URL || ''}`.trim().replace(/\/+$/, ''),
    bucket: `${config.MINIO_BUCKET || ''}`.trim(),
    uploadEndpoint: `${config.MINIO_UPLOAD_ENDPOINT || ''}`.trim(),
    deleteEndpoint: `${config.MINIO_DELETE_ENDPOINT || ''}`.trim()
  };
}

function readErrorMessage(response, fallback) {
  return response
    .text()
    .then((text) => text || fallback)
    .catch(() => fallback);
}

function requireValue(value, name) {
  if (!value) {
    throw new Error(`Missing APP_CONFIG.${name}`);
  }
}

async function uploadFile({ file, path }) {
  const { uploadEndpoint } = getConfig();
  requireValue(uploadEndpoint, 'MINIO_UPLOAD_ENDPOINT');

  const presignResponse = await fetch(uploadEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path,
      contentType: file?.type || 'application/octet-stream'
    })
  });

  if (!presignResponse.ok) {
    const message = await readErrorMessage(presignResponse, `Presign failed (${presignResponse.status})`);
    throw new Error(message);
  }

  const payload = await presignResponse.json();
  const presignedUrl = payload?.uploadUrl || payload?.presignedUrl || payload?.url;
  requireValue(presignedUrl, 'MINIO_UPLOAD_ENDPOINT response url');

  const uploadHeaders = {
    ...(payload?.headers || {})
  };
  if (!uploadHeaders['Content-Type'] && file?.type) {
    uploadHeaders['Content-Type'] = file.type;
  }

  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    headers: uploadHeaders,
    body: file
  });

  if (!uploadResponse.ok) {
    const message = await readErrorMessage(uploadResponse, `Upload failed (${uploadResponse.status})`);
    throw new Error(message);
  }

  return path;
}

async function deleteFile({ path }) {
  const { deleteEndpoint } = getConfig();
  requireValue(deleteEndpoint, 'MINIO_DELETE_ENDPOINT');

  const response = await fetch(deleteEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path })
  });

  if (!response.ok) {
    const message = await readErrorMessage(response, `Delete failed (${response.status})`);
    throw new Error(message);
  }
}

function getPublicUrl(path) {
  if (!path) return '';
  const { baseUrl, bucket } = getConfig();
  const cleanPath = `${path}`.replace(/^\/+/, '');
  requireValue(baseUrl, 'MINIO_BASE_URL');
  requireValue(bucket, 'MINIO_BUCKET');
  return `${baseUrl}/${bucket}/${cleanPath}`;
}

export { uploadFile, deleteFile, getPublicUrl };
