const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const { scaffold } = require('../src/scaffolder');
const { loadProjectConfig, mergeConfigWithOptions, parseConfigFile, configExampleYaml } = require('../src/config');
const { normalizeCommandTargets, resolveCommandDirs, shouldGenerateAgentsMd } = require('../src/targets');
const { resolvePreset } = require('../src/presets');
const { resolveAllAgents } = require('../src/agents');
const { countAgents } = require('../src/utils');
const { getThemePack } = require('../src/themes');
const { testScaffoldOpts } = require('./_helpers');

/** @type {boolean | undefined} */
let canWriteCursorDir;

async function detectCursorWriteAccess() {
  if (canWriteCursorDir !== undefined) return canWriteCursorDir;
  const probe = path.join(os.tmpdir(), `ac-cursor-probe-${process.pid}`);
  try {
    await fs.ensureDir(path.join(probe, '.cursor', 'commands'));
    await fs.remove(probe);
    canWriteCursorDir = true;
  } catch {
    canWriteCursorDir = false;
  }
  return canWriteCursorDir;
}

describe('config file support', () => {
  it('loads JSON config and merges with CLI overrides', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-cfg-'));
    const configPath = path.join(tmp, '.agentic-crew.config.json');
    await fs.writeJson(configPath, {
      name: 'from-config',
      frontend: 'react',
      backend: 'go',
      target: 'claude',
      theme: 'phoenix',
      preset: 'minimal',
    });

    const { config } = await loadProjectConfig({ configPath });
    const merged = mergeConfigWithOptions(config, { name: 'cli-wins', yes: true });
    assert.equal(merged.name, 'cli-wins');
    assert.equal(merged.frontend, 'react');
  });

  it('parses simple YAML config', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-yaml-'));
    const yamlPath = path.join(tmp, '.agentic-crew.yaml');
    await fs.writeFile(
      yamlPath,
      'name: yaml-app\nfrontend: nextjs\nbackend: python\ntarget: all\n'
    );
    const raw = await parseConfigFile(yamlPath);
    assert.equal(raw.name, 'yaml-app');
    assert.equal(raw.frontend, 'nextjs');
  });

  it('configExampleYaml produces valid-looking config', () => {
    const yaml = configExampleYaml({
      projectName: 'demo',
      frontend: 'react',
      backend: 'go',
      targets: 'both',
      theme: 'phoenix',
      preset: 'full',
      domains: ['ml'],
    });
    assert.match(yaml, /name: "demo"/);
    assert.match(yaml, /- "ml"/);
  });
});

describe('IDE targets', () => {
  it('all expands to four command directories', () => {
    const targets = normalizeCommandTargets('all');
    assert.deepEqual(targets, ['claude', 'cursor', 'codex', 'windsurf']);
    const dirs = resolveCommandDirs(targets, '/proj');
    assert.equal(dirs.length, 4);
    assert.ok(dirs.some((d) => d.endsWith('.codex/skills')));
    assert.ok(dirs.some((d) => d.endsWith('.windsurf/workflows')));
  });

  it('codex target generates AGENTS.md', () => {
    assert.equal(shouldGenerateAgentsMd('codex'), true);
    assert.equal(shouldGenerateAgentsMd('claude'), false);
    assert.equal(shouldGenerateAgentsMd('all'), true);
  });

  it('scaffolds team router and AGENTS.md for codex target', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-targets-codex-'));
    await scaffold(
      {
        projectName: 'targets-app',
        frontend: 'none',
        backend: 'go',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'phoenix',
        targets: 'codex',
        preset: 'startup',
      },
      testScaffoldOpts({ force: true })
    );

    assert.ok(await fs.pathExists(path.join(tmp, '.codex', 'skills', 'team.md')));
    assert.ok(await fs.pathExists(path.join(tmp, 'AGENTS.md')));
    const team = await fs.readFile(path.join(tmp, '.codex', 'skills', 'team.md'), 'utf8');
    assert.match(team, /Agent Router/);
    assert.match(team, /\/team manager/);

    const manifest = await fs.readJson(path.join(tmp, '.agentic-crew.json'));
    assert.ok(manifest.supplementaryFiles?.includes('AGENTS.md'));
  });

  it('scaffolds cursor rule when cursor target is selected', async (t) => {
    if (!(await detectCursorWriteAccess())) {
      t.skip('Cannot create .cursor/ in this environment (sandbox EPERM)');
    }
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-targets-cursor-'));
    await scaffold(
      {
        projectName: 'targets-cursor-app',
        frontend: 'none',
        backend: 'go',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'phoenix',
        targets: 'cursor',
        preset: 'startup',
      },
      testScaffoldOpts({ force: true })
    );

    assert.ok(await fs.pathExists(path.join(tmp, '.cursor', 'commands', 'team.md')));
    assert.ok(await fs.pathExists(path.join(tmp, '.cursor', 'rules', 'agentic-crew.mdc')));
    const manifest = await fs.readJson(path.join(tmp, '.agentic-crew.json'));
    assert.ok(manifest.supplementaryFiles?.includes('.cursor/rules/agentic-crew.mdc'));
  });

  it('startup preset uses professional theme and lean roster', () => {
    const preset = resolvePreset('startup');
    assert.equal(preset.theme, 'professional');
    assert.ok(preset.excludeFiles.has('documentation'));
  });

  it('resolveAllAgents applies preset exclusions before stack agents', () => {
    const preset = resolvePreset('startup');
    const agents = resolveAllAgents({
      frontend: 'react',
      backend: 'nodejs',
      domains: [],
      optionalRoles: [],
      customRoles: [],
      preset: preset.key,
      presetExcludeFiles: preset.excludeFiles,
      theme: 'phoenix',
    });
    assert.equal(countAgents(agents), 10);
    assert.ok(!agents.some((a) => a.file === 'marketing'));
    assert.ok(!agents.some((a) => a.file === 'documentation'));
    assert.ok(agents.some((a) => a.file === 'frontend'));
    assert.ok(agents.some((a) => a.file === 'backend'));
  });

  it('theme packs provide catalog and start command', () => {
    assert.equal(getThemePack('phoenix').startCommand, 'dumbledore');
    assert.equal(getThemePack('phoenix').catalogCommand, 'lumos');
    assert.equal(getThemePack('professional').startCommand, 'manager');
    assert.equal(getThemePack('professional').catalogCommand, 'help');
  });

  it('scaffolds windsurf workflows with team router', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-windsurf-'));
    await scaffold(
      {
        projectName: 'windsurf-app',
        frontend: 'none',
        backend: 'go',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'phoenix',
        targets: 'windsurf',
        preset: 'startup',
      },
      testScaffoldOpts({ force: true })
    );
    const team = path.join(tmp, '.windsurf', 'workflows', 'team.md');
    assert.ok(await fs.pathExists(team));
    const content = await fs.readFile(team, 'utf8');
    assert.match(content, /Agent Router|\/team/);
    assert.ok(await fs.pathExists(path.join(tmp, '.windsurf', 'workflows', 'lumos.md')));
  });

  it('heartbeat uses structured template', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-hb-'));
    await scaffold(
      {
        projectName: 'hb-app',
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
    const heartbeat = await fs.readFile(path.join(tmp, '.agent', 'reports', 'heartbeat.md'), 'utf8');
    assert.match(heartbeat, /blockers:/);
    assert.match(heartbeat, /decisions_needed:/);
    assert.match(heartbeat, /accomplishments:/);
  });

  it('prompt options include all IDE targets', () => {
    const { IDE_TARGET_PROMPT_OPTIONS } = require('../src/targets');
    const values = IDE_TARGET_PROMPT_OPTIONS.map((o) => o.value);
    assert.ok(values.includes('all'));
    assert.ok(values.includes('codex'));
    assert.ok(values.includes('windsurf'));
    assert.ok(values.includes('both'));
  });
});
