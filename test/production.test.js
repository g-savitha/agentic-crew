const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const { resolveConditionalAgents } = require('../src/agents');
const { scaffold } = require('../src/scaffolder');
const { runUpdate } = require('../src/update');
const { runDoctor } = require('../src/doctor');
const { runUninstall } = require('../src/uninstall');
const { pruneStaleFiles } = require('../src/prune');
const { migrateManifest, SCHEMA_VERSION } = require('../src/manifest');
const { resolvePreset } = require('../src/presets');
const api = require('../src/api');

describe('production hardening', () => {
  it('public API exports core functions', () => {
    assert.equal(typeof api.scaffold, 'function');
    assert.equal(typeof api.runDoctor, 'function');
    assert.equal(typeof api.runUpdate, 'function');
    assert.equal(typeof api.runUninstall, 'function');
    assert.equal(api.SCHEMA_VERSION, SCHEMA_VERSION);
  });

  it('joins multiple custom domain labels into one domain-expert', () => {
    const agents = resolveConditionalAgents({
      frontend: 'none',
      backend: 'none',
      domains: ['FinTech compliance', 'Healthcare HIPAA'],
    });
    assert.equal(agents.length, 1);
    assert.match(agents[0].customDomainLabel, /FinTech compliance/);
    assert.match(agents[0].customDomainLabel, /Healthcare HIPAA/);
  });

  it('minimal preset excludes non-core agents', () => {
    const preset = resolvePreset('minimal');
    assert.ok(preset.excludeFiles.has('marketing'));
    assert.ok(preset.excludeFiles.has('perf'));
  });

  it('migrateManifest adds schemaVersion to legacy manifests', () => {
    const migrated = migrateManifest({ packageVersion: '0.2.0', agents: [{ file: 'manager', role: 'EM' }] });
    assert.equal(migrated.schemaVersion, 1);
    assert.deepEqual(migrated.commandHashes, {});
  });

  it('update --force controls docs overwrite only', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-force-'));
    await scaffold(
      {
        projectName: 'force-app',
        frontend: 'none',
        backend: 'go',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'professional',
        targets: 'claude',
      },
      { force: true }
    );
    const tasksPath = path.join(tmp, '.agent', 'backlog', 'tasks.md');
    await fs.writeFile(tasksPath, '# CUSTOM BACKLOG\n');

    await runUpdate(tmp, { force: false });
    assert.match(await fs.readFile(tasksPath, 'utf8'), /CUSTOM BACKLOG/);

    await runUpdate(tmp, { force: true });
    assert.doesNotMatch(await fs.readFile(tasksPath, 'utf8'), /CUSTOM BACKLOG/);
  });

  it('prunes stale command files when roster shrinks', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-prune-'));
    await scaffold(
      {
        projectName: 'prune-app',
        frontend: 'react',
        backend: 'go',
        domains: ['ml'],
        customRoles: [],
        outputDir: tmp,
        theme: 'phoenix',
        targets: 'claude',
      },
      { force: true }
    );
    const frontendPath = path.join(tmp, '.claude', 'commands', 'frontend.md');
    assert.ok(await fs.pathExists(frontendPath));

    const manifestPath = path.join(tmp, '.agentic-crew.json');
    const manifest = await fs.readJson(manifestPath);
    manifest.stacks.frontend = 'none';
    manifest.agents = manifest.agents.filter((a) => a.file !== 'frontend');
    await fs.writeJson(manifestPath, manifest, { spaces: 2 });

    await runUpdate(tmp, { force: false });
    assert.equal(await fs.pathExists(frontendPath), false);
    assert.equal(await fs.pathExists(path.join(tmp, '.claude', 'commands', 'ginny.md')), false);
  });

  it('update dry-run reports stale files without writing', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-dryupd-'));
    await scaffold(
      {
        projectName: 'dry-app',
        frontend: 'react',
        backend: 'none',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'professional',
        targets: 'claude',
      },
      { force: true }
    );
    const manifest = await fs.readJson(path.join(tmp, '.agentic-crew.json'));
    manifest.stacks.frontend = 'none';
    manifest.agents = manifest.agents.filter((a) => a.file !== 'frontend');
    await fs.writeJson(path.join(tmp, '.agentic-crew.json'), manifest, { spaces: 2 });

    const result = await runUpdate(tmp, { dryRun: true, json: true });
    assert.equal(result.dryRun, true);
    assert.ok(result.wouldPrune.some((f) => f.includes('frontend.md')));
    assert.ok(await fs.pathExists(path.join(tmp, '.claude', 'commands', 'frontend.md')));
  });

  it('doctor --fix creates missing status files', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-fix-'));
    await scaffold(
      {
        projectName: 'fix-app',
        frontend: 'none',
        backend: 'go',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'professional',
        targets: 'claude',
      },
      { force: true }
    );
    const statusPath = path.join(tmp, '.agent', 'status', 'manager.md');
    await fs.remove(statusPath);

    const before = await runDoctor(tmp, { json: true, quiet: true });
    assert.equal(before.ok, false);

    const after = await runDoctor(tmp, { fix: true, json: true, quiet: true });
    assert.equal(after.ok, true);
    assert.ok(await fs.pathExists(statusPath));
  });

  it('uninstall removes tracked artifacts and can keep .agent', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-uninst-'));
    await scaffold(
      {
        projectName: 'rm-app',
        frontend: 'none',
        backend: 'go',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'professional',
        targets: 'claude',
      },
      { force: true }
    );
    const result = await runUninstall(tmp, { keepState: true });
    assert.ok(result.removed.some((f) => f.endsWith('.agentic-crew.json')));
    assert.ok(await fs.pathExists(path.join(tmp, '.agent', 'backlog', 'tasks.md')));
    assert.equal(await fs.pathExists(path.join(tmp, '.claude', 'commands', 'manager.md')), false);
  });

  it('new manifest includes schemaVersion', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-schema-'));
    await scaffold(
      {
        projectName: 'schema-app',
        frontend: 'none',
        backend: 'none',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'professional',
        targets: 'claude',
        preset: 'full',
      },
      { force: true }
    );
    const manifest = await fs.readJson(path.join(tmp, '.agentic-crew.json'));
    assert.equal(manifest.schemaVersion, SCHEMA_VERSION);
    assert.equal(manifest.preset, 'full');
  });
});

describe('pruneStaleFiles', () => {
  it('dry-run lists files without deleting', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-prune-unit-'));
    const commandsDir = path.join(tmp, '.claude', 'commands');
    await fs.ensureDir(commandsDir);
    await fs.writeFile(path.join(commandsDir, 'orphan.md'), '# orphan');
    await fs.writeFile(path.join(commandsDir, 'setup.md'), '# setup');

    const allAgents = [{ file: 'manager', role: 'EM', character: 'M' }];
    const removed = await pruneStaleFiles({
      outputDir: tmp,
      commandDirs: [commandsDir],
      allAgents,
      theme: 'professional',
      agentDir: path.join(tmp, '.agent'),
      dryRun: true,
    });
    assert.ok(removed.includes('.claude/commands/orphan.md'));
    assert.ok(await fs.pathExists(path.join(commandsDir, 'orphan.md')));
  });
});
