const crypto = require('crypto');

/**
 * @param {string} content
 * @returns {string}
 */
function hashContent(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

module.exports = { hashContent };
