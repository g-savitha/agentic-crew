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

  it('allows absolute paths inside cwd', () => {
    const cwd = path.resolve('/tmp/agentic-crew-safe');
    const sub = path.join(cwd, 'nested');
    assert.equal(resolveSafeOutputDir(sub, cwd), sub);
  });

  it('allows absolute paths under system temp', () => {
    const cwd = path.resolve('/tmp/agentic-crew-safe');
    const os = require('os');
    const inTmp = path.join(os.tmpdir(), 'agentic-crew-test-out');
    assert.equal(resolveSafeOutputDir(inTmp, cwd), inTmp);
  });

  it('rejects absolute paths outside cwd and temp', () => {
    const cwd = path.resolve('/tmp/agentic-crew-safe');
    assert.throws(
      () => resolveSafeOutputDir('/etc', cwd),
      /Absolute --output-dir must stay within/
    );
  });
});
