function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(payload));
}

function handleCors(req, res) {
  if (req.method !== 'OPTIONS') return false;
  res.statusCode = 204;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (_error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function isSafeStoragePath(inputPath) {
  const value = `${inputPath || ''}`.trim();
  if (!value) return false;
  if (value.startsWith('/')) return false;
  if (value.includes('..')) return false;
  if (value.includes('\\')) return false;
  return true;
}

function getStorageEnv() {
  return {
    host: `${process.env.MINIO_HOST || process.env.MINIO_BASE_URL || ''}`.trim().replace(/\/+$/, ''),
    accessKey: `${process.env.MINIO_ACCESS_KEY || ''}`.trim(),
    secretKey: `${process.env.MINIO_SECRET_KEY || ''}`.trim(),
    bucket: `${process.env.MINIO_BUCKET || process.env.bucket || ''}`.trim(),
    region: `${process.env.MINIO_REGION || 'us-east-1'}`.trim()
  };
}

function validateStorageEnv(storageEnv) {
  if (!storageEnv.host || !storageEnv.accessKey || !storageEnv.secretKey || !storageEnv.bucket) {
    return 'Missing MINIO_HOST/MINIO_ACCESS_KEY/MINIO_SECRET_KEY/MINIO_BUCKET environment variables.';
  }
  return '';
}

module.exports = {
  sendJson,
  handleCors,
  readJsonBody,
  isSafeStoragePath,
  getStorageEnv,
  validateStorageEnv
};
