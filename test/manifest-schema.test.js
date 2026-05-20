const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { validateManifestSchema } = require('../src/manifest-schema-validator');
const { validateManifestStructure } = require('../src/manifest');

describe('validateManifestSchema', () => {
  it('passes a minimal valid manifest', () => {
    const issues = validateManifestSchema({
      schemaVersion: 1,
      packageVersion: '0.7.0',
      theme: 'professional',
      preset: 'startup',
      targets: 'claude',
      project: { name: 'app' },
      agents: [{ file: 'manager', role: 'Engineering Manager' }],
      commandDirs: ['.claude/commands'],
    });
    assert.deepEqual(issues, []);
  });

  it('reports invalid preset and theme', () => {
    const issues = validateManifestSchema({
      schemaVersion: 1,
      packageVersion: '0.7.0',
      theme: 'invalid',
      preset: 'bogus',
      targets: 'nope',
      project: { name: 'app' },
      agents: [],
      commandDirs: [],
    });
    assert.ok(issues.some((i) => i.includes('theme')));
    assert.ok(issues.some((i) => i.includes('preset') || i.includes('agents')));
  });

  it('validateManifestStructure delegates to schema validator', () => {
    const issues = validateManifestStructure({
      schemaVersion: 1,
      packageVersion: '0.7.0',
      project: { name: 'x' },
      agents: [{ file: 'manager', role: 'EM' }],
      commandDirs: ['.claude/commands'],
    });
    assert.equal(issues.length, 0);
  });
});
