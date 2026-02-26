#!/usr/bin/env node

const {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand
} = require('@aws-sdk/client-s3');
require('./load-env');

const SUPABASE_URL = `${process.env.SUPABASE_URL || ''}`.trim().replace(/\/+$/, '');
const SUPABASE_KEY = `${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''}`.trim();
const SUPABASE_BUCKET = `${process.env.SUPABASE_STORAGE_BUCKET || 'post-photos'}`.trim();

const MINIO_HOST = `${process.env.MINIO_HOST || process.env.MINIO_BASE_URL || ''}`.trim().replace(/\/+$/, '');
const MINIO_ACCESS_KEY = `${process.env.MINIO_ACCESS_KEY || ''}`.trim();
const MINIO_SECRET_KEY = `${process.env.MINIO_SECRET_KEY || ''}`.trim();
const MINIO_BUCKET = `${process.env.MINIO_BUCKET || 'clientsfeed'}`.trim();
const MINIO_REGION = `${process.env.MINIO_REGION || 'us-east-1'}`.trim();

const PREFIX = `${process.env.MIGRATION_PREFIX || ''}`.trim().replace(/^\/+/, '').replace(/\/+$/, '');
const LIMIT = Math.max(1, Number(process.env.MIGRATION_LIST_LIMIT || 100));
const CONCURRENCY = Math.max(1, Number(process.env.MIGRATION_CONCURRENCY || 4));
const DRY_RUN = `${process.env.MIGRATION_DRY_RUN || 'false'}`.toLowerCase() === 'true';
const SKIP_EXISTING = `${process.env.MIGRATION_SKIP_EXISTING || 'true'}`.toLowerCase() === 'true';

function assertEnv(value, name) {
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
}

function buildSupabaseHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`
  };
}

function encodePathForUrl(key) {
  return key
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
}

async function listObjectsPage(prefix, offset) {
  const url = `${SUPABASE_URL}/storage/v1/object/list/${encodeURIComponent(SUPABASE_BUCKET)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...buildSupabaseHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prefix,
      limit: LIMIT,
      offset,
      sortBy: { column: 'name', order: 'asc' }
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase list failed for prefix "${prefix}" (${response.status}): ${text}`);
  }

  return response.json();
}

function isFolderEntry(entry) {
  if (!entry) return false;
  if (entry.name && entry.name.endsWith('/')) return true;
  if (entry.id == null && !entry.metadata) return true;
  return false;
}

function joinPrefix(prefix, name) {
  if (!prefix) return name;
  if (!name) return prefix;
  return `${prefix}/${name}`;
}

async function listAllObjectKeys(rootPrefix) {
  const files = [];
  const queue = [rootPrefix];

  while (queue.length > 0) {
    const currentPrefix = queue.shift();
    let offset = 0;

    while (true) {
      const entries = await listObjectsPage(currentPrefix, offset);
      if (!Array.isArray(entries) || entries.length === 0) {
        break;
      }

      for (const entry of entries) {
        const name = `${entry?.name || ''}`.trim();
        if (!name) continue;
        const fullPath = joinPrefix(currentPrefix, name.replace(/\/+$/, ''));
        if (!fullPath) continue;

        if (isFolderEntry(entry)) {
          queue.push(fullPath);
          continue;
        }

        files.push(fullPath);
      }

      if (entries.length < LIMIT) break;
      offset += LIMIT;
    }
  }

  return Array.from(new Set(files)).sort();
}

async function fetchObjectFromSupabase(pathKey) {
  const encoded = encodePathForUrl(pathKey);
  const url = `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(SUPABASE_BUCKET)}/${encoded}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: buildSupabaseHeaders()
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase download failed for "${pathKey}" (${response.status}): ${text}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return {
    body: buffer,
    contentType: response.headers.get('content-type') || 'application/octet-stream',
    contentLength: buffer.length
  };
}

function createMinioClient() {
  return new S3Client({
    region: MINIO_REGION,
    endpoint: MINIO_HOST,
    forcePathStyle: true,
    credentials: {
      accessKeyId: MINIO_ACCESS_KEY,
      secretAccessKey: MINIO_SECRET_KEY
    }
  });
}

async function objectExists(client, key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: MINIO_BUCKET, Key: key }));
    return true;
  } catch (error) {
    const statusCode = error?.$metadata?.httpStatusCode;
    if (statusCode === 404) return false;
    const message = `${error?.name || ''}`.toLowerCase();
    if (message.includes('notfound')) return false;
    throw error;
  }
}

async function uploadToMinio(client, key, body, contentType, contentLength) {
  const command = new PutObjectCommand({
    Bucket: MINIO_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    ContentLength: contentLength ? Number(contentLength) : undefined
  });
  await client.send(command);
}

async function runWithConcurrency(items, limit, handler) {
  let index = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (true) {
      const current = index;
      index += 1;
      if (current >= items.length) return;
      await handler(items[current], current);
    }
  });
  await Promise.all(workers);
}

async function main() {
  assertEnv(SUPABASE_URL, 'SUPABASE_URL');
  assertEnv(SUPABASE_KEY, 'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
  assertEnv(SUPABASE_BUCKET, 'SUPABASE_STORAGE_BUCKET');
  assertEnv(MINIO_HOST, 'MINIO_HOST');
  assertEnv(MINIO_ACCESS_KEY, 'MINIO_ACCESS_KEY');
  assertEnv(MINIO_SECRET_KEY, 'MINIO_SECRET_KEY');
  assertEnv(MINIO_BUCKET, 'MINIO_BUCKET');

  console.log('Starting storage migration...');
  console.log(`Supabase bucket: ${SUPABASE_BUCKET}`);
  console.log(`MinIO bucket: ${MINIO_BUCKET}`);
  console.log(`Prefix: ${PREFIX || '(all)'}`);
  console.log(`Dry run: ${DRY_RUN}`);
  console.log(`Skip existing: ${SKIP_EXISTING}`);
  console.log(`Concurrency: ${CONCURRENCY}`);

  const keys = await listAllObjectKeys(PREFIX);
  console.log(`Found ${keys.length} object(s) in Supabase storage.`);

  if (keys.length === 0) {
    console.log('Nothing to migrate.');
    return;
  }

  const minio = createMinioClient();

  const summary = {
    total: keys.length,
    migrated: 0,
    skipped: 0,
    failed: 0
  };

  await runWithConcurrency(keys, CONCURRENCY, async (key, i) => {
    const prefix = `[${i + 1}/${keys.length}]`;
    try {
      if (SKIP_EXISTING && (await objectExists(minio, key))) {
        summary.skipped += 1;
        console.log(`${prefix} SKIP existing ${key}`);
        return;
      }

      if (DRY_RUN) {
        summary.migrated += 1;
        console.log(`${prefix} DRY ${key}`);
        return;
      }

      const objectData = await fetchObjectFromSupabase(key);
      await uploadToMinio(minio, key, objectData.body, objectData.contentType, objectData.contentLength);
      summary.migrated += 1;
      console.log(`${prefix} OK ${key}`);
    } catch (error) {
      summary.failed += 1;
      console.error(`${prefix} FAIL ${key}`);
      console.error(error?.message || error);
    }
  });

  console.log('Migration finished.');
  console.log(`Total: ${summary.total}`);
  console.log(`Migrated: ${summary.migrated}`);
  console.log(`Skipped: ${summary.skipped}`);
  console.log(`Failed: ${summary.failed}`);

  if (summary.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
