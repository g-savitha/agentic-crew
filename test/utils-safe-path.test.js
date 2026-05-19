const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { resolveSafeOutputDir } = require('../src/utils');

describe('resolveSafeOutputDir', () => {
  it('allows subdirectories within cwd', () => {
    const cwd = path.resolve('/tmp/agentic-crew-safe');
    assert.equal(resolveSafeOutputDir('./out', cwd), path.join(cwd, 'out'));
  });

  it('rejects relative path traversal outside cwd', () => {
    const cwd = path.resolve('/tmp/agentic-crew-safe');
    assert.throws(() => resolveSafeOutputDir('../../etc', cwd), /must stay within/);
  });

  it('allows absolute output directories', () => {
    const abs = path.resolve('/tmp/agentic-crew-abs');
    assert.equal(resolveSafeOutputDir(abs), abs);
  });
});
