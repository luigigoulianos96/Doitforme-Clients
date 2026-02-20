// Detects whether a post source URL should be rendered as video media.
// Backend integration: keep image_url/title extensions aligned with upload naming.
export const detect_post_media_kind = (post) => {
  const value = `${post?.image_url || ''} ${post?.title || ''}`.toLowerCase();
  const videoExtensions = ['.mp4', '.mov', '.webm', '.m4v'];
  const hasVideoExtension = videoExtensions.some((extension) => value.includes(extension));

  return hasVideoExtension ? 'video' : 'image';
};

// Maps moderation status to Greek labels for both admin and client pages.
// Backend integration: keep approval_status values in sync with DB enum values.
export const approval_status_label = (status) => {
  const labels = {
    approved: 'Εγκρίθηκε',
    disapproved: 'Απορρίφθηκε',
    pending: 'Σε αναμονή'
  };

  return labels[status] || labels.pending;
};

// Converts uploaded filename into storage-safe slug.
// Backend integration: keep path format stable so delete operations can target exact keys.
export const slug_filename = (name) => {
  return `${name || ''}`.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
};

// Parses caption text into per-post caption values using Post 1: blocks or paragraphs.
// Backend integration: parse captions before upload loop and map captions by media index order.
export const parse_captions_text = (text) => {
  const cleaned = `${text || ''}`.trim();
  const blockRegex = /Post\s*(\d+)\s*:\s*([\s\S]*?)(?=(?:\n\s*Post\s*\d+\s*:)|$)/gi;
  const parsedByIndex = [];
  let match = blockRegex.exec(cleaned);

  while (match) {
    const index = Number(match[1]) - 1;
    const isIndexValid = index >= 0;
    const nextArray = isIndexValid ? parsedByIndex : [];

    if (nextArray.length !== 0 || isIndexValid) {
      parsedByIndex[index] = `${match[2] || ''}`.trim();
    }

    match = blockRegex.exec(cleaned);
  }

  const hasBlockPattern = parsedByIndex.some(Boolean);
  const paragraphs = cleaned
    .split(/\n\s*\n/g)
    .map((entry) => entry.trim())
    .filter(Boolean);

  return hasBlockPattern ? parsedByIndex : paragraphs;
};
