/**
 * Sanitize user-provided strings before Handlebars render (skill files / manifest).
 */

const MAX_PROJECT_NAME = 120;
const MAX_DESCRIPTION = 500;
const MAX_CUSTOM_ROLE_DESC = 300;

/**
 * @param {string} text
 * @param {number} [maxLen]
 * @returns {string}
 */
function sanitizeUserText(text, maxLen = MAX_DESCRIPTION) {
  if (text == null) return '';
  return String(text)
    .trim()
    .slice(0, maxLen)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\0/g, '')
    .replace(/---/g, '—')
    .replace(/\{\{/g, '')
    .replace(/\}\}/g, '');
}

/**
 * Escape content for markdown table cells (trusted or sanitized text).
 * @param {string} text
 * @returns {string}
 */
function escapeMarkdownCell(text) {
  if (text == null) return '';
  return String(text)
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ')
    .replace(/\{\{/g, '')
    .replace(/\}\}/g, '');
}

module.exports = {
  sanitizeUserText,
  escapeMarkdownCell,
  MAX_PROJECT_NAME,
  MAX_DESCRIPTION,
  MAX_CUSTOM_ROLE_DESC,
};
