const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const {
  resolveAllAgents,
  resolveConditionalAgents,
  validateCustomRoles,
  DEFAULT_AGENTS,
} = require('../src/agents');
const { countAgents, countCommandFiles, normalizeDomains } = require('../src/utils');
const { scaffold } = require('../src/scaffolder');
const { runDoctor } = require('../src/doctor');
const { resolveStack } = require('../src/stacks');

describe('agents registry', () => {
  it('defaults to 15 core agents', () => {
    assert.equal(DEFAULT_AGENTS.length, 15);
  });

  it('resolves multiple domains without duplicates', () => {
    const agents = resolveConditionalAgents({
      frontend: 'none',
      backend: 'none',
      domains: ['ml', 'data'],
    });
    assert.equal(agents.length, 2);
    assert.deepEqual(
      agents.map((a) => a.file),
      ['ml-engineer', 'dba']
    );
  });

  it('adds domain-expert for custom domain text', () => {
    const agents = resolveConditionalAgents({
      frontend: 'none',
      backend: 'none',
      domains: ['FinTech compliance'],
    });
    assert.equal(agents.length, 1);
    assert.equal(agents[0].file, 'domain-expert');
  });

  it('professional theme removes character command aliases', () => {
    const agents = resolveAllAgents(
      { frontend: 'react', backend: 'go', domains: ['ml'], customRoles: [] },
      'professional'
    );
    const manager = agents.find((a) => a.file === 'manager');
    assert.equal(manager.character, 'Engineering Manager');
    assert.equal(manager.command, undefined);
  });

  it('counts command files including aliases', () => {
    const agents = resolveAllAgents(
      { frontend: 'none', backend: 'none', domains: [], customRoles: [] },
      'phoenix'
    );
    assert.ok(countCommandFiles(agents) > countAgents(agents));
  });

  it('validateCustomRoles rejects reserved slugs', () => {
    assert.throws(() => {
      validateCustomRoles([{ name: 'Hack', file: 'manager', command: 'x', description: 'd' }]);
    }, /reserved/);
  });
});

describe('normalizeDomains', () => {
  it('parses comma-separated string', () => {
    assert.deepEqual(normalizeDomains('ml, data,none'), ['ml', 'data']);
  });
});

describe('resolveStack', () => {
  it('joins multiple domain labels', () => {
    const stack = resolveStack({ domains: ['ml', 'data'] });
    assert.match(stack.domainExpertise, /Machine Learning/);
    assert.match(stack.domainExpertise, /Databases/);
    assert.equal(stack.hasDomain, true);
  });
});

describe('scaffold dry-run and doctor', () => {
  it('dry-run does not write files', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-crew-'));
    const answers = {
      projectName: 'test-app',
      projectDescription: 'Test',
      frontend: 'react',
      backend: 'go',
      domains: ['ml'],
      customRoles: [],
      outputDir: tmp,
      theme: 'professional',
      targets: 'both',
    };
    const result = await scaffold(answers, { dryRun: true });
    assert.equal(result.dryRun, true);
    assert.equal(await fs.pathExists(path.join(tmp, '.agent')), false);
    assert.equal(countAgents(result.allAgents), 18);
  });

  it('scaffold creates manifest and passes doctor', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-crew-'));
    const answers = {
      projectName: 'prod-app',
      projectDescription: 'Production test',
      frontend: 'nextjs',
      backend: 'python',
      domains: ['data'],
      customRoles: [],
      outputDir: tmp,
      theme: 'phoenix',
      targets: 'claude',
    };
    const result = await scaffold(answers, { force: true });
    assert.ok(await fs.pathExists(result.manifestPath));
    assert.ok(await fs.pathExists(path.join(tmp, '.claude', 'commands', 'manager.md')));
    assert.ok(await fs.pathExists(path.join(tmp, '.claude', 'commands', 'dumbledore.md')));
    const alias = await fs.readFile(path.join(tmp, '.claude', 'commands', 'dumbledore.md'), 'utf8');
    assert.match(alias, /alias-of: manager/);
    const { ok } = await runDoctor(tmp);
    assert.equal(ok, true);
  });
});
