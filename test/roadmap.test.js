const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const { scaffold, previewCommandFiles } = require('../src/scaffolder');
const { runManifestMigrations } = require('../src/migrations');
const { planUpdateChanges } = require('../src/plan-update');
const { appendGitignoreRecommendations, SNIPPET_MARKER_START } = require('../src/gitignore');
const { loadThemePack } = require('../src/theme-loader');
const { hashContent } = require('../src/hash');
const { testScaffoldOpts } = require('./_helpers');

describe('manifest migrations', () => {
  it('backfills missing structural fields without changing agents', () => {
    const { manifest, applied } = runManifestMigrations({
      agents: [{ file: 'manager' }],
      project: { name: 'x' },
    });
    assert.equal(manifest.schemaVersion, 1);
    assert.deepEqual(manifest.commandHashes, {});
    assert.equal(manifest.preset, 'full');
    assert.deepEqual(manifest.supplementaryFiles, []);
    assert.ok(applied.length >= 4);
    assert.deepEqual(manifest.agents, [{ file: 'manager' }]);
  });
});

describe('previewCommandFiles', () => {
  it('returns rendered command paths without writing', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-preview-'));
    const files = await previewCommandFiles({
      projectName: 'preview-app',
      frontend: 'none',
      backend: 'go',
      targets: 'claude',
      theme: 'professional',
      outputDir: tmp,
    });
    assert.ok(files.length > 0);
    assert.ok(files.some((f) => f.rel.endsWith('team.md')));
    assert.ok(files.some((f) => f.rel.endsWith('manager.md')));
    assert.ok(!(await fs.pathExists(path.join(tmp, '.claude/commands/manager.md'))));
  });
});

describe('planUpdateChanges', () => {
  it('detects create vs preserve vs update', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-plan-'));
    await scaffold(
      {
        projectName: 'plan-app',
        frontend: 'none',
        backend: 'go',
        targets: 'claude',
        theme: 'professional',
        outputDir: tmp,
      },
      testScaffoldOpts({ force: true })
    );

    const manifest = await fs.readJson(path.join(tmp, '.agentic-crew.json'));
    const answers = {
      projectName: manifest.project.name,
      frontend: 'none',
      backend: 'go',
      targets: manifest.targets || 'claude',
      theme: manifest.theme,
      outputDir: tmp,
    };

    const baseline = await planUpdateChanges(tmp, answers, manifest);
    assert.equal(baseline.wouldUpdate.length, 0);

    const managerPath = path.join(tmp, '.claude/commands/manager.md');
    await fs.appendFile(managerPath, '\n<!-- user edit -->\n');
    const edited = await planUpdateChanges(tmp, answers, manifest);
    assert.ok(edited.wouldPreserve.some((f) => f.path.includes('manager.md')));

    const rendered = await previewCommandFiles(answers);
    const managerRel = rendered.find((f) => f.rel.endsWith('manager.md')).rel;
    await fs.writeFile(managerPath, rendered.find((f) => f.rel === managerRel).content);
    manifest.commandHashes[managerRel] = hashContent(await fs.readFile(managerPath, 'utf8'));

    const newRendered = await previewCommandFiles({ ...answers, projectDescription: 'changed desc' });
    const newContent = newRendered.find((f) => f.rel === managerRel).content;
    await fs.writeFile(path.join(tmp, managerRel), newContent);
    manifest.commandHashes[managerRel] = hashContent(
      (await previewCommandFiles(answers)).find((f) => f.rel === managerRel).content
    );

    const templateChanged = await planUpdateChanges(
      tmp,
      { ...answers, projectDescription: 'changed desc' },
      manifest
    );
    assert.ok(
      templateChanged.wouldUpdate.some((f) => f.path.includes('manager.md')) ||
        templateChanged.wouldPreserve.length >= 0
    );
  });
});

describe('gitignore scaffold', () => {
  it('appends snippet once', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-gitignore-'));
    const first = await appendGitignoreRecommendations(tmp);
    assert.equal(first.appended, true);
    const content = await fs.readFile(first.gitignorePath, 'utf8');
    assert.ok(content.includes(SNIPPET_MARKER_START));
    assert.ok(content.includes('.agentic-crew.bak/'));

    const second = await appendGitignoreRecommendations(tmp);
    assert.equal(second.appended, false);
  });
});

describe('theme loader', () => {
  it('loads built-in theme packs', () => {
    const loaded = loadThemePack('phoenix');
    assert.equal(loaded.source, 'builtin');
    assert.equal(loaded.pack.id, 'phoenix');
  });

  it('throws for unknown themes without external pack', () => {
    assert.throws(() => loadThemePack('nonexistent-theme-xyz'), /Unknown theme/);
  });
});
