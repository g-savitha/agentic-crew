const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const { scaffold } = require('../src/scaffolder');
const { loadThemePack, resolveThemePack } = require('../src/theme-loader');
const { testScaffoldOpts } = require('./_helpers');

const THEME_SAMPLE_DIR = path.join(__dirname, '..', 'packages', 'theme-sample');

async function installSampleTheme(tmpDir) {
  const dest = path.join(tmpDir, 'node_modules', '@agentic-crew', 'theme-sample');
  await fs.ensureDir(path.dirname(dest));
  await fs.copy(THEME_SAMPLE_DIR, dest);
}

describe('@agentic-crew/theme-sample', () => {
  it('loads from node_modules', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-theme-'));
    await installSampleTheme(tmp);
    const loaded = loadThemePack('sample', { cwd: tmp });
    assert.equal(loaded.source, 'external');
    assert.equal(loaded.pack.id, 'sample');
    assert.equal(loaded.pack.catalogCommand, 'help');
  });

  it('scaffolds with external theme catalog and manager start', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-theme-scaffold-'));
    await installSampleTheme(tmp);
    await scaffold(
      {
        projectName: 'sample-theme-app',
        frontend: 'none',
        backend: 'go',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'sample',
        targets: 'claude',
        preset: 'startup',
      },
      testScaffoldOpts({ force: true })
    );

    const team = await fs.readFile(path.join(tmp, '.claude', 'commands', 'team.md'), 'utf8');
    assert.match(team, /\/team manager/);
    assert.ok(await fs.pathExists(path.join(tmp, '.claude', 'commands', 'help.md')));
    assert.equal(await fs.pathExists(path.join(tmp, '.claude', 'commands', 'dumbledore.md')), false);

    const manifest = await fs.readJson(path.join(tmp, '.agentic-crew.json'));
    assert.equal(manifest.theme, 'sample');
    assert.equal(manifest.catalogCommand, 'help');

    const manager = await fs.readFile(path.join(tmp, '.claude', 'commands', 'manager.md'), 'utf8');
    assert.match(manager, /Team Lead|Engineering Manager/);
  });

  it('resolveThemePack matches loadThemePack pack', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-theme-res-'));
    await installSampleTheme(tmp);
    assert.deepEqual(resolveThemePack('sample', { cwd: tmp }), loadThemePack('sample', { cwd: tmp }).pack);
  });
});
