const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const { scaffold } = require('../src/scaffolder');
const { loadProjectConfig, mergeConfigWithOptions, parseConfigFile, configExampleYaml } = require('../src/config');
const { normalizeCommandTargets, resolveCommandDirs, shouldGenerateAgentsMd } = require('../src/targets');
const { resolvePreset } = require('../src/presets');
const { getThemePack } = require('../src/themes');

describe('config file support', () => {
  it('loads JSON config and merges with CLI overrides', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-cfg-'));
    const configPath = path.join(tmp, '.agentic-crew.config.json');
    await fs.writeJson(configPath, {
      name: 'from-config',
      frontend: 'react',
      backend: 'go',
      target: 'claude',
      theme: 'professional',
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
    assert.match(yaml, /name: demo/);
    assert.match(yaml, /- ml/);
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

  it('scaffolds team router, AGENTS.md, and cursor rule', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-targets-'));
    await scaffold(
      {
        projectName: 'targets-app',
        frontend: 'none',
        backend: 'go',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'professional',
        targets: 'all',
        preset: 'startup',
      },
      { force: true }
    );

    assert.ok(await fs.pathExists(path.join(tmp, '.claude', 'commands', 'team.md')));
    assert.ok(await fs.pathExists(path.join(tmp, '.codex', 'skills', 'team.md')));
    assert.ok(await fs.pathExists(path.join(tmp, 'AGENTS.md')));
    assert.ok(await fs.pathExists(path.join(tmp, '.cursor', 'rules', 'agentic-crew.mdc')));

    const team = await fs.readFile(path.join(tmp, '.cursor', 'commands', 'team.md'), 'utf8');
    assert.match(team, /Agent Router/);
    assert.match(team, /\/team manager/);

    const manifest = await fs.readJson(path.join(tmp, '.agentic-crew.json'));
    assert.ok(manifest.supplementaryFiles?.includes('AGENTS.md'));
  });

  it('startup preset uses professional theme and lean roster', () => {
    const preset = resolvePreset('startup');
    assert.equal(preset.theme, 'professional');
    assert.ok(preset.excludeFiles.has('documentation'));
  });

  it('theme pack provides catalog and start command', () => {
    assert.equal(getThemePack('phoenix').startCommand, 'dumbledore');
    assert.equal(getThemePack('professional').catalogCommand, 'help');
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
        theme: 'professional',
        targets: 'claude',
      },
      { force: true }
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
