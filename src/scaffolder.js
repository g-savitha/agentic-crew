const path = require('path');
const fs = require('fs-extra');
const Handlebars = require('handlebars');
const chalk = require('chalk');
const { DEFAULT_AGENTS, resolveActiveAgents } = require('./agents');
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

  // Compute full agent list: defaults + conditionals based on user selections
  const conditionalAgents = resolveActiveAgents(answers);
  const allCoreAgents = [...DEFAULT_AGENTS, ...conditionalAgents];

  // ── Scaffold all core agents ─────────────────────────────────────
  for (const agent of allCoreAgents) {
    const templateFile = `commands/${agent.file}.md.hbs`;
    const tpl = loadTemplate(templateFile);
    const ctx = {
      ...baseContext,
      characterName: agent.character,
      characterTrait: agent.trait,
      characterWhy: agent.why,
      role: agent.role,
    };
    const rendered = tpl(ctx);
    await fs.writeFile(path.join(commandsDir, `${agent.file}.md`), rendered);
    if (agent.command && agent.command !== agent.file) {
      await fs.writeFile(path.join(commandsDir, `${agent.command}.md`), rendered);
    }
    process.stdout.write(chalk.green('  ✓ ') + chalk.dim(`.claude/commands/${agent.file}.md`) + chalk.cyan(`  (${agent.character})\n`));
  }

  // ── Scaffold setup meta-skill ─────────────────────────────────────
  const setupTpl = loadTemplate('commands/setup.md.hbs');
  await fs.writeFile(path.join(commandsDir, 'setup.md'), setupTpl(baseContext));
  process.stdout.write(chalk.green('  ✓ ') + chalk.dim('.claude/commands/setup.md') + chalk.cyan('  (bootstrap)\n'));

  // ── Custom roles ──────────────────────────────────────────────────
  if (answers.customRoles && answers.customRoles.length > 0) {
    const customTpl = loadTemplate('commands/custom-role.md.hbs');
    for (const role of answers.customRoles) {
      const ctx = { ...baseContext, ...role, roleName: role.name, characterTrait: role.trait };
      await fs.writeFile(path.join(commandsDir, `${role.file}.md`), customTpl(ctx));
      process.stdout.write(chalk.green('  ✓ ') + chalk.dim(`.claude/commands/${role.file}.md`) + chalk.cyan(`  (${role.character})\n`));
    }
  }

  // ── Agent status + message files ──────────────────────────────────
  for (const agent of allCoreAgents) {
    await fs.writeFile(path.join(statusDir, `${agent.file}.md`), `---\nagent: ${agent.file}\nstatus: Idle\n---\n`);
    await fs.writeFile(path.join(messagesDir, `${agent.file}.md`), `---\n---\n`);
  }
  for (const role of (answers.customRoles || [])) {
    await fs.writeFile(path.join(statusDir, `${role.file}.md`), `---\nagent: ${role.file}\nstatus: Idle\n---\n`);
    await fs.writeFile(path.join(messagesDir, `${role.file}.md`), `---\n---\n`);
  }

  // ── .agent/ structure ─────────────────────────────────────────────
  const agentReadmeTpl = loadTemplate('agent/README.md.hbs');
  await fs.writeFile(path.join(agentDir, 'README.md'), agentReadmeTpl({ ...baseContext, agents: allCoreAgents }));

  const tasksTpl = loadTemplate('agent/tasks.md.hbs');
  await fs.writeFile(path.join(backlogDir, 'tasks.md'), tasksTpl(baseContext));

  await fs.writeFile(path.join(reportsDir, '.gitkeep'), '');

  // ── docs/ structure ───────────────────────────────────────────────
  const troubleshootingTpl = loadTemplate('docs/troubleshooting.md.hbs');
  await fs.writeFile(path.join(docsWikiDir, '11-troubleshooting.md'), troubleshootingTpl(baseContext));

  const adrTpl = loadTemplate('docs/adr-template.md.hbs');
  await fs.writeFile(path.join(docsAdrDir, 'template.md'), adrTpl(baseContext));

  await fs.writeFile(path.join(docsRunbooksDir, '.gitkeep'), '');

  return { commandsDir, agentDir, allCoreAgents, outputDir, conditionalAgents };
}

function printManifest(answers, result) {
  const { allCoreAgents, conditionalAgents } = result;
  const customRoles = answers.customRoles || [];

  console.log('\n' + chalk.bold.green('  Your Order of the Phoenix is assembled:\n'));

  // Default agents
  console.log(chalk.dim('  ── Always included ─────────────────────────────────────────'));
  const maxChar = Math.max(...DEFAULT_AGENTS.map((a) => a.character.length));
  const maxCmd = Math.max(...DEFAULT_AGENTS.map((a) => (a.command || a.file).length));
  for (const a of DEFAULT_AGENTS) {
    const cmd = a.command || a.file;
    console.log(
      '  ' + chalk.cyan(a.character.padEnd(maxChar + 2)) +
      chalk.white(('/' + cmd).padEnd(maxCmd + 3)) +
      chalk.dim('or  ') + chalk.dim(`/${a.file}`)
    );
  }

  // Conditional agents (if any)
  if (conditionalAgents.length > 0) {
    console.log(chalk.dim('\n  ── Added for your stack ────────────────────────────────────'));
    const maxCondChar = Math.max(...conditionalAgents.map((a) => a.character.length));
    const maxCondCmd = Math.max(...conditionalAgents.map((a) => (a.command || a.file).length));
    for (const a of conditionalAgents) {
      const cmd = a.command || a.file;
      console.log(
        '  ' + chalk.cyan(a.character.padEnd(maxCondChar + 2)) +
        chalk.white(('/' + cmd).padEnd(maxCondCmd + 3)) +
        chalk.dim('or  ') + chalk.dim(`/${a.file}`) +
        chalk.dim(`  (${a.role})`)
      );
    }
  }

  // Custom roles (if any)
  if (customRoles.length > 0) {
    console.log(chalk.dim('\n  ── Your custom roles ───────────────────────────────────────'));
    for (const r of customRoles) {
      console.log(
        '  ' + chalk.cyan(r.character.padEnd(maxChar + 2)) +
        chalk.white(`/${r.file}`)
      );
    }
  }

  console.log('\n  ' + chalk.dim('Setup skill: ') + chalk.white('/setup'));
  console.log(
    '\n  ' +
    chalk.bold('You are the CEO.') +
    chalk.dim(' Open your agentic IDE (Claude Code, Cursor, Codex, etc.) and say ') +
    chalk.white('/dumbledore') +
    chalk.dim(', brief your order.\n')
  );
}

module.exports = { scaffold, printManifest };
