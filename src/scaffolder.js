const path = require('path');
const fs = require('fs-extra');
const Handlebars = require('handlebars');
const chalk = require('chalk');
const { AGENTS, RESERVE_CHARACTERS } = require('./agents');
const { STACK_DESCRIPTIONS } = require('./stacks');

const TEMPLATES_DIR = path.join(__dirname, 'templates');

function loadTemplate(relativePath) {
  const full = path.join(TEMPLATES_DIR, relativePath);
  return Handlebars.compile(fs.readFileSync(full, 'utf8'));
}

function resolveStack(answers) {
  const fe = STACK_DESCRIPTIONS.frontend[answers.frontend] || answers.frontend || null;
  const be = STACK_DESCRIPTIONS.backend[answers.backend] || answers.backend || null;
  const dom = STACK_DESCRIPTIONS.domain[answers.domain] || answers.domain || null;
  return { frontendStack: fe, backendStack: be, domainExpertise: dom };
}

async function scaffold(answers) {
  const outputDir = path.resolve(answers.outputDir);
  const { frontendStack, backendStack, domainExpertise } = resolveStack(answers);

  const baseContext = {
    projectName: answers.projectName || 'your project',
    projectDescription: answers.projectDescription || '',
    githubRepo: answers.githubRepo || '',
    frontendStack: frontendStack || 'Not specified',
    backendStack: backendStack || 'Not specified',
    domainExpertise: domainExpertise || 'General software engineering',
    hasFrontend: !!frontendStack,
    hasBackend: !!backendStack,
    hasDomain: !!domainExpertise,
  };

  const commandsDir = path.join(outputDir, '.claude', 'commands');
  const agentDir = path.join(outputDir, '.agent');
  const statusDir = path.join(agentDir, 'status');
  const messagesDir = path.join(agentDir, 'messages');
  const backlogDir = path.join(agentDir, 'backlog');
  const reportsDir = path.join(agentDir, 'reports');
  const docsWikiDir = path.join(outputDir, 'docs', 'wiki');
  const docsAdrDir = path.join(outputDir, 'docs', 'adr');
  const docsRunbooksDir = path.join(outputDir, 'docs', 'runbooks');

  await Promise.all([
    fs.ensureDir(commandsDir),
    fs.ensureDir(statusDir),
    fs.ensureDir(messagesDir),
    fs.ensureDir(backlogDir),
    fs.ensureDir(reportsDir),
    fs.ensureDir(docsWikiDir),
    fs.ensureDir(docsAdrDir),
    fs.ensureDir(docsRunbooksDir),
  ]);

  // ── Scaffold default agents ───────────────────────────────────────
  for (const agent of AGENTS) {
    const tpl = loadTemplate(`commands/${agent.file}.md.hbs`);
    const ctx = {
      ...baseContext,
      characterName: agent.character,
      characterBreathing: agent.breathing,
      characterWhy: agent.why,
      role: agent.role,
    };
    await fs.writeFile(path.join(commandsDir, `${agent.file}.md`), tpl(ctx));
    process.stdout.write(chalk.green('  ✓ ') + chalk.dim(`.claude/commands/${agent.file}.md`) + chalk.cyan(`  (${agent.character})\n`));
  }

  // ── Scaffold setup meta-skill ────────────────────────────────────
  const setupTpl = loadTemplate('commands/setup.md.hbs');
  await fs.writeFile(path.join(commandsDir, 'setup.md'), setupTpl(baseContext));
  process.stdout.write(chalk.green('  ✓ ') + chalk.dim('.claude/commands/setup.md') + chalk.cyan('  (bootstrap)\n'));

  // ── Custom roles ─────────────────────────────────────────────────
  if (answers.customRoles && answers.customRoles.length > 0) {
    const customTpl = loadTemplate('commands/custom-role.md.hbs');
    for (const role of answers.customRoles) {
      const ctx = { ...baseContext, ...role, roleName: role.name };
      await fs.writeFile(path.join(commandsDir, `${role.file}.md`), customTpl(ctx));
      process.stdout.write(chalk.green('  ✓ ') + chalk.dim(`.claude/commands/${role.file}.md`) + chalk.cyan(`  (${role.character})\n`));
    }
  }

  // ── Agent status + message files ─────────────────────────────────
  const allAgentFiles = [
    ...AGENTS.map((a) => a.file),
    'setup',
    ...(answers.customRoles || []).map((r) => r.file),
  ];

  for (const agentFile of AGENTS.map((a) => a.file)) {
    await fs.writeFile(path.join(statusDir, `${agentFile}.md`), `---\nagent: ${agentFile}\nstatus: Idle\n---\n`);
    await fs.writeFile(path.join(messagesDir, `${agentFile}.md`), `---\n---\n`);
  }
  for (const role of (answers.customRoles || [])) {
    await fs.writeFile(path.join(statusDir, `${role.file}.md`), `---\nagent: ${role.file}\nstatus: Idle\n---\n`);
    await fs.writeFile(path.join(messagesDir, `${role.file}.md`), `---\n---\n`);
  }

  // ── .agent/ structure ─────────────────────────────────────────────
  const agentReadmeTpl = loadTemplate('agent/README.md.hbs');
  await fs.writeFile(path.join(agentDir, 'README.md'), agentReadmeTpl({ ...baseContext, agents: AGENTS }));

  const tasksTpl = loadTemplate('agent/tasks.md.hbs');
  await fs.writeFile(path.join(backlogDir, 'tasks.md'), tasksTpl(baseContext));

  await fs.writeFile(path.join(reportsDir, '.gitkeep'), '');

  // ── docs/ structure ───────────────────────────────────────────────
  const troubleshootingTpl = loadTemplate('docs/troubleshooting.md.hbs');
  await fs.writeFile(path.join(docsWikiDir, '11-troubleshooting.md'), troubleshootingTpl(baseContext));

  const adrTpl = loadTemplate('docs/adr-template.md.hbs');
  await fs.writeFile(path.join(docsAdrDir, 'template.md'), adrTpl(baseContext));

  await fs.writeFile(path.join(docsRunbooksDir, '.gitkeep'), '');

  return { commandsDir, agentDir, allAgentFiles, outputDir };
}

function printManifest(answers, result) {
  const allAgents = [
    ...AGENTS.map((a) => ({ character: a.character, file: a.file })),
    ...(answers.customRoles || []).map((r) => ({ character: r.character, file: r.file })),
  ];

  console.log('\n' + chalk.bold.green('  Your Demon Slayer Corps is assembled:\n'));

  const maxChar = Math.max(...allAgents.map((a) => a.character.length));
  for (const a of allAgents) {
    console.log(
      '  ' + chalk.cyan(a.character.padEnd(maxChar + 2)) +
      chalk.dim('→ ') + chalk.white(`/${a.file}`)
    );
  }

  console.log('\n  ' + chalk.dim('Setup skill: ') + chalk.white('/setup'));
  console.log(
    '\n  ' +
    chalk.bold('You are the CEO.') +
    chalk.dim(' Open Claude Code and run ') +
    chalk.white('/manager') +
    chalk.dim(' to brief your corps.\n')
  );
}

module.exports = { scaffold, printManifest };
