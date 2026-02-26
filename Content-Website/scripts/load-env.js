const fs = require('fs');
const path = require('path');

function normalizeEnvValue(rawValue) {
  const value = `${rawValue || ''}`.trim();
  if (!value) return '';
  const first = value[0];
  const last = value[value.length - 1];
  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return value.slice(1, -1);
  }
  return value;
}

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = `${lines[i] || ''}`.trim();
    if (!line || line.startsWith('#')) continue;
    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    if (!key || process.env[key]) continue;

    const rawValue = line.slice(separatorIndex + 1);
    process.env[key] = normalizeEnvValue(rawValue);
  }
}

loadEnvFile();

