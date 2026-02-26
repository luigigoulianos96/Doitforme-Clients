const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const {
  sendJson,
  handleCors,
  readJsonBody,
  isSafeStoragePath,
  getStorageEnv,
  validateStorageEnv
} = require('./_shared');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const storageEnv = getStorageEnv();
  const configError = validateStorageEnv(storageEnv);
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

  const objectPath = payload.path;
  if (!isSafeStoragePath(objectPath)) {
    sendJson(res, 400, { error: 'Invalid path' });
    return;
  }

  try {
    const s3Client = new S3Client({
      region: storageEnv.region,
      endpoint: storageEnv.host,
      forcePathStyle: true,
      credentials: {
        accessKeyId: storageEnv.accessKey,
        secretAccessKey: storageEnv.secretKey
      }
    });

    await s3Client.send(new DeleteObjectCommand({
      Bucket: storageEnv.bucket,
      Key: objectPath
    }));

    sendJson(res, 200, { ok: true, path: objectPath });
  } catch (error) {
    sendJson(res, 500, { error: error.message || 'Failed to delete object' });
  }
};
