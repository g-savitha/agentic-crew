const HEARTBEAT_REQUIRED_KEYS = ['updated', 'blockers', 'decisions_needed', 'accomplishments'];

/**
 * Validate manager heartbeat snapshot format (YAML frontmatter).
 * @param {string} content
 * @returns {{ valid: boolean, reason?: string }}
 */
function validateHeartbeatContent(content) {
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
  const missing = HEARTBEAT_REQUIRED_KEYS.filter((key) => !new RegExp(`^${key}:`, 'm').test(block));
  if (missing.length) {
    return { valid: false, reason: `missing required keys: ${missing.join(', ')}` };
  }
  return { valid: true };
}

module.exports = { HEARTBEAT_REQUIRED_KEYS, validateHeartbeatContent };
