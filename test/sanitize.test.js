const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeUserText, escapeMarkdownCell } = require('../src/sanitize');

describe('sanitize', () => {
  it('strips handlebars and frontmatter breaks', () => {
    const out = sanitizeUserText('evil ---\n{{inject}}');
    assert.doesNotMatch(out, /\{\{/);
    assert.doesNotMatch(out, /---/);
  });

  it('escapeMarkdownCell removes pipes and newlines', () => {
    assert.equal(escapeMarkdownCell('a|b\nc'), 'a\\|b c');
  });
});
