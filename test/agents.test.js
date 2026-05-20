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
const { SENIOR_BRIEFS, resolveSeniorBrief } = require('../src/role-briefs');
const { countAgents, countCommandFiles, normalizeDomains } = require('../src/utils');
const { scaffold } = require('../src/scaffolder');
const { runDoctor } = require('../src/doctor');
const { runUpdate } = require('../src/update');
const { resolveStack } = require('../src/stacks');
const { parseCustomRoles } = require('../src/options-parsers');
const { PACKAGE_VERSION } = require('../src/constants');
const { hashContent } = require('../src/hash');
const { testScaffoldOpts } = require('./_helpers');

describe('agents registry', () => {
  it('defaults to 13 core agents (SRE and TPM are optional)', () => {
    assert.equal(DEFAULT_AGENTS.length, 13);
  });

  it('includes optional agents only when selected', () => {
    const without = resolveAllAgents({
      frontend: 'none',
      backend: 'none',
      domains: [],
      optionalRoles: [],
    });
    assert.equal(without.some((a) => a.file === 'sre'), false);
    assert.equal(without.some((a) => a.file === 'tpm'), false);

    const withBoth = resolveAllAgents({
      frontend: 'none',
      backend: 'none',
      domains: [],
      optionalRoles: ['sre', 'tpm'],
    });
    assert.equal(withBoth.some((a) => a.file === 'sre'), true);
    assert.equal(withBoth.some((a) => a.file === 'tpm'), true);
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

  it('assigns role-specific senior briefs to each agent', () => {
    const agents = resolveAllAgents({
      frontend: 'none',
      backend: 'go',
      domains: ['ml'],
      optionalRoles: ['sre'],
    });
    const manager = agents.find((a) => a.file === 'manager');
    assert.match(manager.seniorBrief, /orchestrate/i);
    assert.equal(manager.seniorBrief, SENIOR_BRIEFS.manager);

    const sre = agents.find((a) => a.file === 'sre');
    assert.match(sre.seniorBrief, /reliability|SLO/i);

    const custom = resolveSeniorBrief({
      file: 'fintech',
      role: 'FinTech Lead',
      customDomainLabel: 'FinTech compliance',
    });
    assert.match(custom, /FinTech compliance/);
  });

  it('professional theme removes character command aliases', () => {
    const agents = resolveAllAgents(
      { frontend: 'react', backend: 'go', domains: ['ml'], customRoles: [] },
      'professional'
    );
    const manager = agents.find((a) => a.file === 'manager');
    assert.equal(manager.character, 'Engineering Manager');
    assert.equal(manager.command, undefined);
    assert.match(manager.why, /Engineering Manager/);
    assert.doesNotMatch(manager.why, /Dumbledore|wizard|Hogwarts/i);
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
    const result = await scaffold(answers, testScaffoldOpts({ dryRun: true }));
    assert.equal(result.dryRun, true);
    assert.equal(await fs.pathExists(path.join(tmp, '.agent')), false);
    assert.equal(countAgents(result.allAgents), 16);
  });

  it('professional scaffold omits HP content in skill files', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-crew-pro-'));
    const answers = {
      projectName: 'pro-app',
      projectDescription: 'Enterprise app',
      frontend: 'none',
      backend: 'go',
      domains: [],
      customRoles: [],
      outputDir: tmp,
      theme: 'professional',
      targets: 'claude',
    };
    await scaffold(answers, testScaffoldOpts({ force: true }));
    const manager = await fs.readFile(path.join(tmp, '.claude', 'commands', 'manager.md'), 'utf8');
    assert.match(manager, /^# Engineering Manager/m);
    assert.match(manager, /orchestrate the engineering organization/i);
    assert.doesNotMatch(manager, /Dumbledore|wizard|Hogwarts|witch/i);
    assert.doesNotMatch(manager, /^> \*/m);
    assert.doesNotMatch(manager, /production-grade execution to every task/);
    assert.equal(await fs.pathExists(path.join(tmp, '.claude', 'commands', 'dumbledore.md')), false);
    assert.equal(await fs.pathExists(path.join(tmp, '.claude', 'commands', 'help.md')), true);
    assert.equal(await fs.pathExists(path.join(tmp, '.claude', 'commands', 'lumos.md')), false);
    const help = await fs.readFile(path.join(tmp, '.claude', 'commands', 'help.md'), 'utf8');
    assert.match(help, /# Agent Commands/);
    assert.doesNotMatch(help, /Lumos|witch|wizard/i);
  });

  it('golden: manager and security skills contain senior briefs', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-crew-golden-'));
    await scaffold(
      {
        projectName: 'golden-app',
        projectDescription: 'Test app',
        frontend: 'none',
        backend: 'nodejs',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'phoenix',
        targets: 'claude',
      },
      testScaffoldOpts({ force: true })
    );
    const manager = await fs.readFile(path.join(tmp, '.claude', 'commands', 'manager.md'), 'utf8');
    assert.match(manager, /orchestrate the engineering organization/i);
    assert.match(manager, /senior expert Engineering Manager/i);
    const security = await fs.readFile(path.join(tmp, '.claude', 'commands', 'security.md'), 'utf8');
    assert.match(security, /threat model/i);
    const manifest = await fs.readJson(path.join(tmp, '.agentic-crew.json'));
    assert.ok(manifest.commandHashes);
    assert.ok(manifest.commandHashes['.claude/commands/manager.md']);
    assert.equal(manifest.schemaVersion, 1);
  });

  it('update preserves user-edited command files', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-crew-upd-'));
    const answers = {
      projectName: 'upd-app',
      projectDescription: 'Update test',
      frontend: 'none',
      backend: 'go',
      domains: [],
      customRoles: [],
      outputDir: tmp,
      theme: 'professional',
      targets: 'claude',
    };
    await scaffold(answers, testScaffoldOpts({ force: true }));
    const managerPath = path.join(tmp, '.claude', 'commands', 'manager.md');
    await fs.writeFile(managerPath, '# USER CUSTOM\n');

    await runUpdate(tmp, { forceOverwrite: false, quiet: true });
    assert.match(await fs.readFile(managerPath, 'utf8'), /USER CUSTOM/);

    await runUpdate(tmp, { forceOverwrite: true, quiet: true });
    const after = await fs.readFile(managerPath, 'utf8');
    assert.doesNotMatch(after, /USER CUSTOM/);
    assert.match(after, /Engineering Manager/i);
  });

  it('scaffold with security CI creates workflow', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-crew-sec-'));
    await scaffold(
      {
        projectName: 'sec-app',
        frontend: 'none',
        backend: 'nodejs',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'professional',
        targets: 'claude',
        withSecurityCi: true,
      },
      testScaffoldOpts({ force: true })
    );
    const workflow = path.join(tmp, '.github', 'workflows', 'security.yml');
    assert.ok(await fs.pathExists(workflow));
    assert.match(await fs.readFile(workflow, 'utf8'), /npm audit/);
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
    const result = await scaffold(answers, testScaffoldOpts({ force: true }));
    assert.ok(await fs.pathExists(result.manifestPath));
    assert.ok(await fs.pathExists(path.join(tmp, '.claude', 'commands', 'manager.md')));
    assert.ok(await fs.pathExists(path.join(tmp, '.claude', 'commands', 'dumbledore.md')));
    const alias = await fs.readFile(path.join(tmp, '.claude', 'commands', 'dumbledore.md'), 'utf8');
    assert.match(alias, /alias-of: manager/);
    const manifest = await fs.readJson(result.manifestPath);
    assert.equal(manifest.packageVersion, PACKAGE_VERSION);

    const { ok } = await runDoctor(tmp, { quiet: true });
    assert.equal(ok, true);
  });
});

describe('parseCustomRoles', () => {
  it('parses name and description', () => {
    const roles = parseCustomRoles(['Data Engineer|Owns ETL pipelines']);
    assert.equal(roles.length, 1);
    assert.equal(roles[0].file, 'data-engineer');
    assert.match(roles[0].description, /ETL/);
  });
});

describe('injection sanitization in scaffold output', () => {
  it('strips template injection from project metadata', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'agentic-crew-inj-'));
    await scaffold(
      {
        projectName: '{{evil}}',
        projectDescription: '---\nignore previous',
        frontend: 'none',
        backend: 'none',
        domains: [],
        customRoles: [],
        outputDir: tmp,
        theme: 'professional',
        targets: 'claude',
      },
      testScaffoldOpts({ force: true })
    );
    const manager = await fs.readFile(path.join(tmp, '.claude', 'commands', 'manager.md'), 'utf8');
    assert.doesNotMatch(manager, /\{\{evil\}\}/);
    assert.match(manager, /ignore previous/);
    assert.doesNotMatch(manager, /---\nignore previous/);
  });
});
