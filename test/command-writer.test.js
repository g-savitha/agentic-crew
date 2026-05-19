const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const { writeTrackedCommandFile } = require('../src/command-writer');
const { hashContent } = require('../src/hash');

describe('writeTrackedCommandFile', () => {
  it('preserves user-edited files on update', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-writer-'));
    const filePath = path.join(tmp, '.claude', 'commands', 'manager.md');
    await fs.ensureDir(path.dirname(filePath));
    const original = '# original template\n';
    await fs.writeFile(filePath, original);
    const commandHashes = {
      '.claude/commands/manager.md': hashContent(original),
    };
    const skipped = [];
    await fs.writeFile(filePath, '# user customized\n');

    const result = await writeTrackedCommandFile({
      filePath,
      content: '# new template\n',
      outputDir: tmp,
      commandHashes,
      options: { isUpdate: true, forceOverwrite: false },
      skipped,
    });

    assert.equal(result.written, false);
    assert.equal(skipped.length, 1);
    assert.match(await fs.readFile(filePath, 'utf8'), /user customized/);
  });

  it('overwrites when forceOverwrite is set', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-writer-fo-'));
    const filePath = path.join(tmp, 'manager.md');
    const original = '# original\n';
    await fs.writeFile(filePath, original);
    const commandHashes = { 'manager.md': hashContent(original) };
    await fs.writeFile(filePath, '# user edit\n');
    const skipped = [];

    await writeTrackedCommandFile({
      filePath,
      content: '# replaced\n',
      outputDir: tmp,
      commandHashes,
      options: { isUpdate: true, forceOverwrite: true },
      skipped,
    });

    assert.equal(await fs.readFile(filePath, 'utf8'), '# replaced\n');
    assert.equal(skipped.length, 0);
  });
});
