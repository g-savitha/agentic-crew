const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { validateCatalogContent, extractCatalogSlugs } = require('../src/catalog');

describe('validateCatalogContent', () => {
  const agents = [
    { file: 'manager', command: 'dumbledore' },
    { file: 'qa', command: 'moody' },
  ];

  it('passes when catalog matches roster', () => {
    const content = `
| Character | Command | Alias | Role |
| Albus | \`/dumbledore\` | \`/manager\` | EM |
| Moody | \`/moody\` | \`/qa\` | QA |
| \`/setup\` | bootstrap |
| \`/lumos\` | catalog |
`;
    assert.deepEqual(validateCatalogContent(content, { agents, catalogCommand: 'lumos' }), []);
  });

  it('reports phantom commands', () => {
    const content = '| Ghost | `/cedric` | `/documentation` | Docs |';
    const issues = validateCatalogContent(content, { agents, catalogCommand: 'lumos' });
    assert.ok(issues.some((i) => i.includes('cedric')));
  });

  it('reports missing roster entries', () => {
    const content = '| Albus | `/dumbledore` | `/manager` | EM |';
    const issues = validateCatalogContent(content, { agents, catalogCommand: 'lumos' });
    assert.ok(issues.some((i) => i.includes('/qa')));
  });
});

describe('extractCatalogSlugs', () => {
  it('collects slash commands from backticks', () => {
    const slugs = extractCatalogSlugs('Use `/team` then `/manager`');
    assert.ok(slugs.has('team'));
    assert.ok(slugs.has('manager'));
  });
});
