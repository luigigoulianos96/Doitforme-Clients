const BLOCK_SELECTOR = 'p, div, section, article, blockquote, ul, ol, li, h1, h2, h3, h4, h5, h6, br';
const NESTED_BLOCK_SELECTOR = 'p, div, section, article, blockquote, li, h1, h2, h3, h4, h5, h6';
const ALLOWED_TAGS = new Set([
  'a',
  'blockquote',
  'br',
  'div',
  'em',
  'strong',
  'b',
  'i',
  'u',
  'p',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6'
]);
const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

function escapeHtml(value) {
  return `${value || ''}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createHtmlDocument(html = '') {
  return new DOMParser().parseFromString(html, 'text/html');
}

function isHtmlLike(value) {
  return /<\/?[a-z][\s\S]*>/i.test(`${value || ''}`);
}

function sanitizeAnchor(node) {
  const href = `${node.getAttribute('href') || ''}`.trim();

  if (!href) {
    node.removeAttribute('href');
    node.removeAttribute('target');
    node.removeAttribute('rel');
    return;
  }

  try {
    const parsed = new URL(href, window.location.origin);
    if (!SAFE_PROTOCOLS.includes(parsed.protocol)) {
      node.replaceWith(...Array.from(node.childNodes));
      return;
    }
  } catch {
    node.replaceWith(...Array.from(node.childNodes));
    return;
  }

  node.setAttribute('href', href);
  node.setAttribute('target', '_blank');
  node.setAttribute('rel', 'noopener noreferrer');
  Array.from(node.attributes).forEach((attribute) => {
    if (!['href', 'target', 'rel'].includes(attribute.name)) {
      node.removeAttribute(attribute.name);
    }
  });
}

function sanitizeNode(node) {
  if (!node || !node.childNodes) return;

  Array.from(node.childNodes).forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const tagName = child.tagName.toLowerCase();
      sanitizeNode(child);

      if (!ALLOWED_TAGS.has(tagName)) {
        child.replaceWith(...Array.from(child.childNodes));
        return;
      }

      if (tagName === 'a') {
        sanitizeAnchor(child);
        return;
      }

      Array.from(child.attributes).forEach((attribute) => {
        child.removeAttribute(attribute.name);
      });
    }
  });
}

function cleanupHtml(html) {
  return `${html || ''}`
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
    .replace(/(?:<br\s*\/?>\s*){3,}/gi, '<br><br>')
    .trim();
}

function paragraphToHtml(paragraph) {
  const lines = `${paragraph || ''}`
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return '';

  return `<p>${lines.map((line) => escapeHtml(line)).join('<br>')}</p>`;
}

function buildHtmlFromPlainText(text) {
  const lines = `${text || ''}`.replace(/\r/g, '').split('\n');
  const parts = [];
  let paragraphBuffer = [];
  let listItems = [];

  function flushParagraphs() {
    if (paragraphBuffer.length === 0) return;
    parts.push(paragraphToHtml(paragraphBuffer.join('\n')));
    paragraphBuffer = [];
  }

  function flushList() {
    if (listItems.length === 0) return;
    parts.push(`<ul>${listItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`);
    listItems = [];
  }

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    const bulletMatch = line.match(/^[-*•]\s+(.+)$/);

    if (!line) {
      flushParagraphs();
      flushList();
      return;
    }

    if (bulletMatch) {
      flushParagraphs();
      listItems.push(bulletMatch[1].trim());
      return;
    }

    flushList();
    paragraphBuffer.push(rawLine);
  });

  flushParagraphs();
  flushList();

  return cleanupHtml(parts.join(''));
}

function normalizeRichTextHtml(value) {
  const input = `${value || ''}`.trim();
  if (!input) return '';

  if (!isHtmlLike(input)) {
    return buildHtmlFromPlainText(input);
  }

  const document = createHtmlDocument(input);
  sanitizeNode(document.body);
  return cleanupHtml(document.body.innerHTML);
}

function extractRichTextPlainText(value) {
  const input = `${value || ''}`.trim();
  if (!input) return '';

  if (!isHtmlLike(input)) {
    return input.replace(/\r/g, '').trim();
  }

  const document = createHtmlDocument(normalizeRichTextHtml(input));
  const blockNodes = Array.from(document.body.querySelectorAll(BLOCK_SELECTOR));

  if (blockNodes.length === 0) {
    return (document.body.textContent || '').replace(/\u00a0/g, ' ').trim();
  }

  return blockNodes
    .map((node) => {
      if (node.tagName.toLowerCase() === 'br') return '\n';
      if (['ul', 'ol'].includes(node.tagName.toLowerCase())) return '';
      if (node.querySelector && node.querySelector(NESTED_BLOCK_SELECTOR)) return '';
      return (node.textContent || '').replace(/\u00a0/g, ' ').trim();
    })
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function hasRichTextContent(value) {
  return extractRichTextPlainText(value).trim().length > 0;
}

function buildRichTextFromParagraphs(paragraphs) {
  const parts = [];
  let listItems = [];

  function flushList() {
    if (listItems.length === 0) return;
    parts.push(`<ul>${listItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`);
    listItems = [];
  }

  (paragraphs || []).forEach((paragraph) => {
    const value = `${paragraph || ''}`.trim();
    if (!value) {
      flushList();
      return;
    }

    const bulletMatch = value.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      listItems.push(bulletMatch[1].trim());
      return;
    }

    flushList();
    parts.push(paragraphToHtml(value));
  });

  flushList();

  return cleanupHtml(parts.join(''));
}

export {
  buildRichTextFromParagraphs,
  createHtmlDocument,
  extractRichTextPlainText,
  hasRichTextContent,
  normalizeRichTextHtml
};
