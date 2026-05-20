const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const { scaffold } = require('../src/scaffolder');
const { runDoctor } = require('../src/doctor');
const { validateHeartbeatContent } = require('../src/heartbeat');
const { validateStatusContent } = require('../src/status');
const { resolvePreset } = require('../src/presets');
const { answersFromOptions } = require('../src/options');
const { testScaffoldOpts } = require('./_helpers');

describe('v1 hardening', () => {
  it('default preset is startup when omitted', () => {
    const def = resolvePreset();
    assert.equal(def.key, 'startup');
    const answers = answersFromOptions({ name: 'x', yes: true });
    assert.equal(answers.preset, 'startup');
  });

  it('scaffolds starter runbooks referenced by DevOps/SRE', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-runbooks-'));
    await scaffold(
      {
        projectName: 'runbooks-app',
        frontend: 'none',
        backend: 'go',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'phoenix',
        targets: 'claude',
      },
      testScaffoldOpts({ force: true })
    );
    for (const file of ['release.md', 'on-call.md', 'incident.md']) {
      const p = path.join(tmp, 'docs', 'runbooks', file);
      assert.ok(await fs.pathExists(p), `missing ${file}`);
      const content = await fs.readFile(p, 'utf8');
      assert.match(content, /runbooks-app|Release runbook|On-call|Incident/i);
    }
  });

  it('agent README documents heartbeat overwrite not append', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-proto-'));
    await scaffold(
      {
        projectName: 'proto-app',
        frontend: 'none',
        backend: 'none',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'phoenix',
        targets: 'claude',
      },
      testScaffoldOpts({ force: true })
    );
    const readme = await fs.readFile(path.join(tmp, '.agent', 'README.md'), 'utf8');
    assert.match(readme, /heartbeat\.md.*is overwritten/i);
    assert.doesNotMatch(readme, /Reports are append-only; use dated sections in `reports\/heartbeat\.md`/i);
  });

  it('validateHeartbeatContent accepts scaffolded heartbeat', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-hb-val-'));
    await scaffold(
      {
        projectName: 'hb-val',
        frontend: 'none',
        backend: 'none',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'phoenix',
        targets: 'claude',
      },
      testScaffoldOpts({ force: true })
    );
    const content = await fs.readFile(path.join(tmp, '.agent', 'reports', 'heartbeat.md'), 'utf8');
    assert.equal(validateHeartbeatContent(content).valid, true);
  });

  it('doctor --strict fails on invalid heartbeat', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-strict-'));
    await scaffold(
      {
        projectName: 'strict-app',
        frontend: 'none',
        backend: 'go',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'phoenix',
        targets: 'claude',
      },
      testScaffoldOpts({ force: true })
    );
    await fs.writeFile(path.join(tmp, '.agent', 'reports', 'heartbeat.md'), '# broken\n');

    const loose = await runDoctor(tmp, { json: true, quiet: true });
    assert.equal(loose.ok, true);

    const strict = await runDoctor(tmp, { strict: true, json: true, quiet: true });
    assert.equal(strict.ok, false);
    assert.ok(strict.issues.some((i) => /heartbeat/i.test(i)));
  });

  it('doctor --fix without --prune keeps orphan command files', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-fix-prune-'));
    await scaffold(
      {
        projectName: 'prune-app',
        frontend: 'react',
        backend: 'none',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'phoenix',
        targets: 'claude',
      },
      testScaffoldOpts({ force: true })
    );
    const orphan = path.join(tmp, '.claude', 'commands', 'orphan-role.md');
    await fs.writeFile(orphan, '# orphan');

    await runDoctor(tmp, { fix: true, quiet: true });
    assert.ok(await fs.pathExists(orphan));
  });

  it('doctor --fix --prune removes stale roster command files', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-fix-prune-'));
    await scaffold(
      {
        projectName: 'prune-app',
        frontend: 'react',
        backend: 'none',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'phoenix',
        targets: 'claude',
      },
      testScaffoldOpts({ force: true })
    );
    const manifest = await fs.readJson(path.join(tmp, '.agentic-crew.json'));
    manifest.agents = manifest.agents.filter((a) => a.file !== 'frontend');
    manifest.stacks.frontend = 'none';
    await fs.writeJson(path.join(tmp, '.agentic-crew.json'), manifest, { spaces: 2 });

    await runDoctor(tmp, { fix: true, prune: true, quiet: true });
    assert.equal(await fs.pathExists(path.join(tmp, '.claude', 'commands', 'frontend.md')), false);
  });

  it('doctor --strict fails when starter runbooks are missing', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-rb-strict-'));
    await scaffold(
      {
        projectName: 'rb-strict-app',
        frontend: 'none',
        backend: 'go',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'phoenix',
        targets: 'claude',
      },
      testScaffoldOpts({ force: true })
    );
    await fs.remove(path.join(tmp, 'docs', 'runbooks', 'release.md'));

    const loose = await runDoctor(tmp, { json: true, quiet: true });
    assert.equal(loose.ok, true);

    const strict = await runDoctor(tmp, { strict: true, json: true, quiet: true });
    assert.equal(strict.ok, false);
    assert.ok(strict.issues.some((i) => /runbooks\/release\.md/.test(i)));
  });

  it('update creates missing runbooks on existing installs', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-rb-upd-'));
    await scaffold(
      {
        projectName: 'rb-upd-app',
        frontend: 'none',
        backend: 'go',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'phoenix',
        targets: 'claude',
      },
      testScaffoldOpts({ force: true })
    );
    await fs.remove(path.join(tmp, 'docs', 'runbooks'));

    const { runUpdate } = require('../src/update');
    await runUpdate(tmp, { quiet: true });

    assert.ok(await fs.pathExists(path.join(tmp, 'docs', 'runbooks', 'release.md')));
    assert.ok(await fs.pathExists(path.join(tmp, 'docs', 'runbooks', 'on-call.md')));
    assert.ok(await fs.pathExists(path.join(tmp, 'docs', 'runbooks', 'incident.md')));
  });

  it('scaffolds retro.md for Scrum protocol', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-retro-'));
    await scaffold(
      {
        projectName: 'retro-app',
        frontend: 'none',
        backend: 'none',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'phoenix',
        targets: 'claude',
      },
      testScaffoldOpts({ force: true })
    );
    const retro = await fs.readFile(path.join(tmp, '.agent', 'reports', 'retro.md'), 'utf8');
    assert.match(retro, /Sprint retrospective/);
    const doctor = await runDoctor(tmp, { strict: true, json: true, quiet: true });
    assert.equal(doctor.ok, true);
  });

  it('validateStatusContent accepts scaffolded status files', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-status-val-'));
    await scaffold(
      {
        projectName: 'status-val',
        frontend: 'none',
        backend: 'none',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'phoenix',
        targets: 'claude',
      },
      testScaffoldOpts({ force: true })
    );
    const content = await fs.readFile(path.join(tmp, '.agent', 'status', 'manager.md'), 'utf8');
    assert.equal(validateStatusContent(content).valid, true);
  });

  it('doctor --strict fails on invalid status frontmatter', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-status-strict-'));
    await scaffold(
      {
        projectName: 'status-strict',
        frontend: 'none',
        backend: 'go',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'phoenix',
        targets: 'claude',
      },
      testScaffoldOpts({ force: true })
    );
    await fs.writeFile(path.join(tmp, '.agent', 'status', 'manager.md'), '# broken\n');

    const strict = await runDoctor(tmp, { strict: true, json: true, quiet: true });
    assert.equal(strict.ok, false);
    assert.ok(strict.issues.some((i) => /status.*manager/i.test(i)));
  });

  it('doctor --strict fails when catalog lists agents not on roster', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-cat-strict-'));
    const preset = resolvePreset('startup');
    await scaffold(
      {
        projectName: 'cat-strict',
        frontend: 'react',
        backend: 'nodejs',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'phoenix',
        targets: 'claude',
        preset: preset.key,
        presetExcludeFiles: preset.excludeFiles,
      },
      testScaffoldOpts({ force: true })
    );
    const lumosPath = path.join(tmp, '.claude', 'commands', 'lumos.md');
    const lumos = await fs.readFile(lumosPath, 'utf8');
    await fs.writeFile(lumosPath, `${lumos}\n| Ghost | \`/cedric\` | \`/documentation\` | Docs | Example |\n`);

    const strict = await runDoctor(tmp, { strict: true, json: true, quiet: true });
    assert.equal(strict.ok, false);
    assert.ok(strict.issues.some((i) => /catalog.*cedric|catalog references/i.test(i)));
  });

  it('config-driven init scaffolds security CI and runbooks', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-cfg-init-'));
    const { loadProjectConfig, mergeConfigWithOptions } = require('../src/config');
    const { config } = await loadProjectConfig({
      configPath: path.join(__dirname, '..', 'examples', 'hello-team', '.agentic-crew.yaml'),
    });
    const merged = mergeConfigWithOptions(config, { outputDir: tmp });
    const answers = answersFromOptions(merged);
    assert.ok(answers);
    assert.equal(answers.withSecurityCi, false);
    assert.equal(answers.theme, 'phoenix');

    await scaffold(
      {
        ...answers,
        projectName: 'cfg-init-app',
        outputDir: tmp,
        targets: 'claude',
        withSecurityCi: true,
      },
      testScaffoldOpts({ force: true })
    );

    assert.ok(await fs.pathExists(path.join(tmp, '.github', 'workflows', 'security.yml')));
    assert.ok(await fs.pathExists(path.join(tmp, 'docs', 'runbooks', 'release.md')));

    const doctor = await runDoctor(tmp, { strict: true, json: true, quiet: true });
    assert.equal(doctor.ok, true);
  });
});
