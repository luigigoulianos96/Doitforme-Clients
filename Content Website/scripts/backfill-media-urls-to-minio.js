#!/usr/bin/env node

require('./load-env');

const SUPABASE_URL = `${process.env.SUPABASE_URL || ''}`.trim().replace(/\/+$/, '');
const SUPABASE_KEY = `${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`.trim();
const MINIO_BASE_URL = `${process.env.MINIO_HOST || process.env.MINIO_BASE_URL || ''}`.trim().replace(/\/+$/, '');
const MINIO_BUCKET = `${process.env.MINIO_BUCKET || 'clientsfeed'}`.trim();
const DRY_RUN = `${process.env.BACKFILL_DRY_RUN || 'true'}`.toLowerCase() === 'true';
const PAGE_SIZE = Math.max(1, Number(process.env.BACKFILL_PAGE_SIZE || 1000));

function assertEnv(value, name) {
  if (!value) throw new Error(`Missing required env: ${name}`);
}

function buildHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };
}

function minioUrl(pathKey) {
  const clean = `${pathKey || ''}`.replace(/^\/+/, '');
  return `${MINIO_BASE_URL}/${MINIO_BUCKET}/${clean}`;
}

async function fetchTableRows(table, columns) {
  const all = [];
  let offset = 0;

  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(columns)}&order=id.asc&limit=${PAGE_SIZE}&offset=${offset}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: buildHeaders()
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Fetch failed for ${table}: ${response.status} ${text}`);
    }
    const rows = await response.json();
    if (!Array.isArray(rows) || rows.length === 0) break;
    all.push(...rows);
    if (rows.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return all;
}

async function patchRow(table, id, patch) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      ...buildHeaders(),
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(patch)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Patch failed for ${table}.${id}: ${response.status} ${text}`);
  }
}

async function run() {
  assertEnv(SUPABASE_URL, 'SUPABASE_URL');
  assertEnv(SUPABASE_KEY, 'SUPABASE_SERVICE_ROLE_KEY');
  assertEnv(MINIO_BASE_URL, 'MINIO_HOST or MINIO_BASE_URL');
  assertEnv(MINIO_BUCKET, 'MINIO_BUCKET');

  console.log(`Starting URL backfill. Dry run: ${DRY_RUN}`);

  const posts = await fetchTableRows('posts', 'id,image_path,image_url');
  const postCandidates = posts.filter((row) => row.image_path && row.image_url !== minioUrl(row.image_path));

  const assets = await fetchTableRows('logo_assets', 'id,file_path,file_url');
  const assetCandidates = assets.filter((row) => row.file_path && row.file_url !== minioUrl(row.file_path));

  console.log(`Posts to update: ${postCandidates.length}`);
  console.log(`Logo assets to update: ${assetCandidates.length}`);

  let postsUpdated = 0;
  let assetsUpdated = 0;

  for (const row of postCandidates) {
    const nextUrl = minioUrl(row.image_path);
    if (DRY_RUN) {
      console.log(`[POST][DRY] ${row.id} -> ${nextUrl}`);
      postsUpdated += 1;
      continue;
    }
    await patchRow('posts', row.id, { image_url: nextUrl });
    postsUpdated += 1;
    console.log(`[POST][OK] ${row.id}`);
  }

  for (const row of assetCandidates) {
    const nextUrl = minioUrl(row.file_path);
    if (DRY_RUN) {
      console.log(`[ASSET][DRY] ${row.id} -> ${nextUrl}`);
      assetsUpdated += 1;
      continue;
    }
    await patchRow('logo_assets', row.id, { file_url: nextUrl });
    assetsUpdated += 1;
    console.log(`[ASSET][OK] ${row.id}`);
  }

  console.log('Backfill finished.');
  console.log(`Posts updated: ${postsUpdated}`);
  console.log(`Logo assets updated: ${assetsUpdated}`);
}

run().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
