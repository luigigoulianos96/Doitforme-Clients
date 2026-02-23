const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4180;
const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

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

// Resolves request path to project files while preventing path traversal.
// Backend integration: all runtime API communication still goes directly from frontend to Supabase.
const resolve_local_path = (requestPath) => {
  const pathMap = {
    '/': '/public/portal.html',
    '/portal': '/public/portal.html',
    '/portal.html': '/public/portal.html',
    '/index.html': '/public/index.html',
    '/admin.html': '/public/admin.html'
  };

  const mappedPath = pathMap[requestPath] || requestPath;
  const normalized = path.normalize(mappedPath).replace(/^([.][./\\])+/, '');
  const withoutLeadingSlash = normalized.replace(/^[/\\]+/, '');
  return path.join(ROOT_DIR, withoutLeadingSlash);
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
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
});
