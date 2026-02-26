const http = require('http');
const fs = require('fs');
const path = require('path');
const { S3Client, DeleteObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const PORT = process.env.PORT || 4180;
const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const JSON_BODY_LIMIT_BYTES = 1024 * 1024;
const STORAGE_UPLOAD_ROUTE = '/api/storage/presign-upload';
const STORAGE_DELETE_ROUTE = '/api/storage/delete';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.jsx': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};

const storageEnv = {
  host: `${process.env.MINIO_HOST || process.env.MINIO_BASE_URL || ''}`.trim().replace(/\/+$/, ''),
  accessKey: `${process.env.MINIO_ACCESS_KEY || ''}`.trim(),
  secretKey: `${process.env.MINIO_SECRET_KEY || ''}`.trim(),
  bucket: `${process.env.MINIO_BUCKET || process.env.bucket || ''}`.trim(),
  region: `${process.env.MINIO_REGION || 'us-east-1'}`.trim()
};

const s3Client = storageEnv.host && storageEnv.accessKey && storageEnv.secretKey
  ? new S3Client({
      region: storageEnv.region,
      endpoint: storageEnv.host,
      forcePathStyle: true,
      credentials: {
        accessKeyId: storageEnv.accessKey,
        secretAccessKey: storageEnv.secretKey
      }
    })
  : null;

// Streams one local file and sends proper mime headers.
// Backend integration: this server is static-only and does not proxy Supabase calls.
const serve_file = (res, filePath) => {
  fs.stat(filePath, (statError, stats) => {
    const missing = statError || !stats.isFile();

    if (missing) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[extension] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-store' });
    fs.createReadStream(filePath).pipe(res);
  });
};

const send_json = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
};

const read_json_body = (req) =>
  new Promise((resolve, reject) => {
    let body = '';
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > JSON_BODY_LIMIT_BYTES) {
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      body += chunk.toString('utf8');
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

    req.on('error', (error) => reject(error));
  });

const is_safe_storage_path = (inputPath) => {
  const value = `${inputPath || ''}`.trim();
  if (!value) return false;
  if (value.startsWith('/')) return false;
  if (value.includes('..')) return false;
  if (value.includes('\\')) return false;
  return true;
};

const ensure_storage_config = () => {
  if (!s3Client || !storageEnv.bucket || !storageEnv.host) {
    return 'Missing MINIO_HOST/MINIO_ACCESS_KEY/MINIO_SECRET_KEY/MINIO_BUCKET environment variables.';
  }
  return '';
};

const handle_storage_presign_upload = async (req, res) => {
  const configError = ensure_storage_config();
  if (configError) {
    send_json(res, 500, { error: configError });
    return;
  }

  let payload;
  try {
    payload = await read_json_body(req);
  } catch (error) {
    send_json(res, 400, { error: error.message });
    return;
  }

  const objectPath = payload.path;
  const contentType = `${payload.contentType || 'application/octet-stream'}`.trim();
  if (!is_safe_storage_path(objectPath)) {
    send_json(res, 400, { error: 'Invalid path' });
    return;
  }

  try {
    const command = new PutObjectCommand({
      Bucket: storageEnv.bucket,
      Key: objectPath,
      ContentType: contentType
    });
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    send_json(res, 200, { uploadUrl, headers: {} });
  } catch (error) {
    send_json(res, 500, { error: error.message || 'Failed to create presigned URL' });
  }
};

const handle_storage_delete = async (req, res) => {
  const configError = ensure_storage_config();
  if (configError) {
    send_json(res, 500, { error: configError });
    return;
  }

  let payload;
  try {
    payload = await read_json_body(req);
  } catch (error) {
    send_json(res, 400, { error: error.message });
    return;
  }

  const objectPath = payload.path;
  if (!is_safe_storage_path(objectPath)) {
    send_json(res, 400, { error: 'Invalid path' });
    return;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: storageEnv.bucket,
      Key: objectPath
    });
    await s3Client.send(command);
    send_json(res, 200, { ok: true, path: objectPath });
  } catch (error) {
    send_json(res, 500, { error: error.message || 'Failed to delete object' });
  }
};

// Resolves request path to project files while preventing path traversal.
// Backend integration: all runtime API communication still goes directly from frontend to Supabase.
const resolve_local_path = (requestPath) => {
  const pathMap = {
    '/': '/public/portal.html',
    '/portal': '/public/portal.html',
    '/portal.html': '/public/portal.html',
    '/portal.js': '/public/portal.js',
    '/app.js': '/public/app.js',
    '/admin.js': '/public/admin.js',
    '/config.js': '/public/config.js',
    '/index.html': '/public/index.html',
    '/admin.html': '/public/admin.html'
  };

  const publicPrefixMap = [
    ['/admin/', '/public/admin/'],
    ['/api/', '/public/api/'],
    ['/components/', '/public/components/'],
    ['/core/', '/public/core/'],
    ['/hooks/', '/public/hooks/'],
    ['/services/', '/public/services/'],
    ['/utils/', '/public/utils/']
  ];
  const mappedPrefix = publicPrefixMap.find(([fromPrefix]) => requestPath.startsWith(fromPrefix));
  const mappedPath = mappedPrefix
    ? requestPath.replace(mappedPrefix[0], mappedPrefix[1])
    : (pathMap[requestPath] || requestPath);
  const normalized = path.normalize(mappedPath).replace(/^([.][./\\])+/, '');
  const withoutLeadingSlash = normalized.replace(/^[/\\]+/, '');
  return path.join(ROOT_DIR, withoutLeadingSlash);
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === STORAGE_UPLOAD_ROUTE || url.pathname === STORAGE_DELETE_ROUTE) {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-store'
      });
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      send_json(res, 405, { error: 'Method not allowed' });
      return;
    }

    if (url.pathname === STORAGE_UPLOAD_ROUTE) {
      await handle_storage_presign_upload(req, res);
      return;
    }

    await handle_storage_delete(req, res);
    return;
  }

  const filePath = resolve_local_path(url.pathname);
  const isInsideRoot = filePath.startsWith(ROOT_DIR);

  if (!isInsideRoot) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Invalid path');
    return;
  }

  serve_file(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Presentation site live at http://localhost:${PORT}`);
  console.log(`Portal page: http://localhost:${PORT}/public/portal.html`);
  console.log(`Public page: http://localhost:${PORT}/public/index.html`);
  console.log(`Admin page: http://localhost:${PORT}/public/admin.html`);
  console.log(`Storage upload endpoint: http://localhost:${PORT}${STORAGE_UPLOAD_ROUTE}`);
  console.log(`Storage delete endpoint: http://localhost:${PORT}${STORAGE_DELETE_ROUTE}`);
});
