const IDEA_APPROVAL_STATUSES = ['pending', 'approved', 'disapproved'];

function normalizeIdeaApprovalStatus(value) {
  const nextValue = `${value || ''}`.trim().toLowerCase();
  if (IDEA_APPROVAL_STATUSES.includes(nextValue)) return nextValue;
  return 'pending';
}

function inferLinkPlatform(url) {
  const value = `${url || ''}`.toLowerCase();
  if (value.includes('tiktok.com')) return 'TikTok';
  if (value.includes('instagram.com')) return 'Instagram';
  if (value.includes('facebook.com') || value.includes('fb.watch')) return 'Facebook';
  return 'Link';
}

function normalizeIdeaLink(rawValue) {
  const value = `${rawValue || ''}`.trim();
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `https://${value}`;
}

function parseLinksText(value) {
  return `${value || ''}`
    .split('\n')
    .map((item) => normalizeIdeaLink(item))
    .filter(Boolean)
    .map((url) => ({ url, platform: inferLinkPlatform(url) }));
}

function linksToText(links) {
  if (!Array.isArray(links)) return '';
  return links
    .map((item) => `${item?.url || ''}`.trim())
    .filter(Boolean)
    .join('\n');
}

function formatIdeaDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('el-GR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function approvalLabel(status) {
  if (status === 'approved') return 'Εγκρίθηκε';
  if (status === 'disapproved') return 'Χρειάζεται αλλαγές';
  return 'Σε αναμονή';
}

export {
  IDEA_APPROVAL_STATUSES,
  normalizeIdeaApprovalStatus,
  inferLinkPlatform,
  normalizeIdeaLink,
  parseLinksText,
  linksToText,
  formatIdeaDate,
  approvalLabel
};
