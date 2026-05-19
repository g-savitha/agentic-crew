const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { securityWorkflowYaml, resolveBackendKey } = require('../src/security-workflow');

describe('securityWorkflowYaml', () => {
  it('includes npm audit for nodejs', () => {
    assert.equal(resolveBackendKey('nodejs'), 'nodejs');
    assert.match(securityWorkflowYaml('nodejs'), /npm audit/);
  });

  it('includes govulncheck for go', () => {
    assert.match(securityWorkflowYaml('go'), /govulncheck/);
  });
});
