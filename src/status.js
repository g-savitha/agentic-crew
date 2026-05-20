const STATUS_REQUIRED_KEYS = ['agent', 'status'];

/**
 * Validate agent status file format (YAML frontmatter).
 * @param {string} content
 * @returns {{ valid: boolean, reason?: string }}
 */
function validateStatusContent(content) {
  if (!content || !content.trim()) {
    return { valid: false, reason: 'empty file' };
  }
  if (!content.startsWith('---\n')) {
    return { valid: false, reason: 'missing YAML frontmatter' };
  }
  const end = content.indexOf('\n---\n', 4);
  if (end === -1) {
    return { valid: false, reason: 'unclosed YAML frontmatter' };
  }
  const block = content.slice(4, end);
  const missing = STATUS_REQUIRED_KEYS.filter((key) => !new RegExp(`^${key}:`, 'm').test(block));
  if (missing.length) {
    return { valid: false, reason: `missing required keys: ${missing.join(', ')}` };
  }
  return { valid: true };
}

module.exports = { STATUS_REQUIRED_KEYS, validateStatusContent };
