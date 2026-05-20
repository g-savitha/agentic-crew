const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const {
  configExampleYaml,
  parseConfigFile,
  parseSimpleYaml,
  normalizeConfig,
  mergeConfigWithOptions,
} = require('../src/config');
const { answersFromOptions } = require('../src/options');
const { scaffold } = require('../src/scaffolder');

describe('config YAML safety', () => {
  it('configExampleYaml quotes values that would inject keys', () => {
    const yaml = configExampleYaml({
      projectName: 'evil\npreset: minimal',
      projectDescription: 'line1\ninjected: true',
      domains: ['ml'],
    });
    assert.match(yaml, /^name: "/m);
    assert.doesNotMatch(yaml, /^preset: minimal$/m);
    const parsed = parseSimpleYaml(yaml);
    assert.equal(parsed.name, 'evil\npreset: minimal');
    assert.equal(parsed.preset, 'full');
  });

  it('round-trips save-config fields through parse and normalize', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-cfg-rt-'));
    const yamlPath = path.join(tmp, '.agentic-crew.yaml');
    const yaml = configExampleYaml({
      projectName: 'round-trip',
      projectDescription: 'desc',
      frontend: 'react',
      backend: 'go',
      domains: ['ml', 'data'],
      targets: 'all',
      theme: 'professional',
      preset: 'startup',
      withSecurityCi: true,
      withGitignore: true,
    });
    await fs.writeFile(yamlPath, yaml);
    const raw = await parseConfigFile(yamlPath);
    const config = normalizeConfig(raw);
    assert.equal(config.name, 'round-trip');
    assert.deepEqual(config.domains, ['ml', 'data']);
    assert.equal(config.withSecurityCi, true);
    assert.equal(config.withGitignore, true);
  });

  it('rejects nested YAML structures', () => {
    assert.throws(
      () => parseSimpleYaml('foo:\n  bar: baz\n'),
      /Nested YAML is not supported/
    );
  });

  it('mergeConfigWithOptions includes withGitignore from config', () => {
    const merged = mergeConfigWithOptions({ withGitignore: true, name: 'app' }, { yes: true, name: 'app' });
    assert.equal(merged.withGitignore, true);
    const answers = answersFromOptions(merged);
    assert.equal(answers.withGitignore, true);
  });
});

describe('invalid optional roles', () => {
  it('throws on unknown optional role keys', () => {
    assert.throws(
      () => answersFromOptions({ name: 'x', yes: true, optional: 'hacker,admin' }),
      /Invalid optional role/
    );
  });
});

describe('preset theme precedence', () => {
  it('enterprise preset theme wins over CLI --theme', () => {
    const answers = answersFromOptions({
      name: 'x',
      yes: true,
      preset: 'enterprise',
      theme: 'phoenix',
    });
    assert.equal(answers.theme, 'professional');
  });
});

describe('strict IDE targets', () => {
  it('scaffold rejects invalid targets', async () => {
    const outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-bogus-'));
    await assert.rejects(
      () =>
        scaffold(
          {
            projectName: 't',
            frontend: 'none',
            backend: 'none',
            targets: 'bogus',
            outputDir,
          },
          { dryRun: true }
        ),
      /Invalid target/
    );
  });
});
