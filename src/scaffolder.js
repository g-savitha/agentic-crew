const path = require('path');
const fs = require('fs-extra');
const Handlebars = require('handlebars');
const chalk = require('chalk');
const {
  DEFAULT_AGENTS,
  applyTheme,
  resolveConditionalAgents,
  resolveAllAgents,
  templatePathForAgent,
  validateCustomRoles,
} = require('./agents');
const { resolveStack } = require('./stacks');
const { PACKAGE_VERSION, MANIFEST_FILENAME, catalogCommandForTheme } = require('./constants');
const {
  countAgents,
  countCommandFiles,
  resolveCommandDirs,
  normalizeTargets,
} = require('./utils');

const TEMPLATES_DIR = path.join(__dirname, 'templates');
const templateCache = new Map();
let partialsRegistered = false;

function registerPartials() {
  if (partialsRegistered) return;
  const introPath = path.join(TEMPLATES_DIR, 'partials', 'agent-intro.md.hbs');
  Handlebars.registerPartial('agent-intro', fs.readFileSync(introPath, 'utf8'));
  partialsRegistered = true;
}

function loadTemplate(relativePath) {
  registerPartials();
  if (!templateCache.has(relativePath)) {
    const full = path.join(TEMPLATES_DIR, relativePath);
    templateCache.set(relativePath, Handlebars.compile(fs.readFileSync(full, 'utf8')));
  }
  return templateCache.get(relativePath);
}

/**
 * @param {object} answers
 * @param {{ dryRun?: boolean, force?: boolean }} [options]
 */
async function scaffold(answers, options = {}) {
  const { dryRun = false, force = false } = options;
  const outputDir = path.resolve(answers.outputDir || '.');
  const theme = answers.theme || 'phoenix';
  const targets = normalizeTargets(answers.targets || 'both');
  const commandDirs = resolveCommandDirs(targets, outputDir);

  validateCustomRoles(answers.customRoles || []);

  const stack = resolveStack(answers);
  const conditionalAgents = resolveConditionalAgents(answers);
  const allAgents = resolveAllAgents(answers, theme);

  const baseContext = {
    projectName: answers.projectName || 'your project',
    projectDescription: answers.projectDescription || '',
    githubRepo: answers.githubRepo || '',
    frontendStack: stack.frontendStack || 'Not specified',
    backendStack: stack.backendStack || 'Not specified',
    domainExpertise: stack.domainExpertise || 'General software engineering',
    hasFrontend: stack.hasFrontend,
    hasBackend: stack.hasBackend,
    hasDomain: stack.hasDomain,
    theme,
    isProfessional: theme === 'professional',
    teamAgents: allAgents,
    allAgents,
    commandDirs: commandDirs.map((d) => path.relative(outputDir, d).replace(/\\/g, '/')),
  };

  const agentDir = path.join(outputDir, '.agent');
  const manifestPath = path.join(outputDir, MANIFEST_FILENAME);

  if (!dryRun && !force) {
    const exists = await fs.pathExists(agentDir);
    if (exists) {
      throw new Error(
        `${agentDir} already exists. Re-run with --force to merge/update, or choose a different --output-dir.`
      );
    }
  }

  const planned = {
    commandDirs,
    agentDir,
    manifestPath,
    agents: allAgents.length,
    commandFiles: countCommandFiles(allAgents) * commandDirs.length + commandDirs.length * 2,
  };

  if (dryRun) {
    return {
      dryRun: true,
      planned: { ...planned, outputDir },
      allAgents,
      conditionalAgents,
      outputDir,
      commandDirs,
      agentCount: countAgents(allAgents),
      theme,
    };
  }

  const statusDir = path.join(agentDir, 'status');
  const messagesDir = path.join(agentDir, 'messages');
  const backlogDir = path.join(agentDir, 'backlog');
  const reportsDir = path.join(agentDir, 'reports');
  const docsWikiDir = path.join(outputDir, 'docs', 'wiki');
  const docsAdrDir = path.join(outputDir, 'docs', 'adr');
  const docsRunbooksDir = path.join(outputDir, 'docs', 'runbooks');

  await Promise.all([
    ...commandDirs.map((d) => fs.ensureDir(d)),
    fs.ensureDir(statusDir),
    fs.ensureDir(messagesDir),
    fs.ensureDir(backlogDir),
    fs.ensureDir(reportsDir),
    fs.ensureDir(docsWikiDir),
    fs.ensureDir(docsAdrDir),
    fs.ensureDir(docsRunbooksDir),
  ]);

  for (const commandsDir of commandDirs) {
    const commandsRelativePath = path.relative(outputDir, commandsDir).replace(/\\/g, '/');

    for (const agent of allAgents) {
      const tplPath = templatePathForAgent(agent);
      const tpl = loadTemplate(tplPath);
      const ctx = {
        ...baseContext,
        characterName: agent.character,
        characterTrait: agent.trait,
        characterWhy: agent.why,
        role: agent.role,
        roleName: agent.role,
        description: agent.why,
        file: agent.file,
        customDomainLabel: agent.customDomainLabel,
        domainExpertise: agent.customDomainLabel || baseContext.domainExpertise,
      };
      const rendered = tpl(ctx);
      await fs.writeFile(path.join(commandsDir, `${agent.file}.md`), rendered);

      if (agent.command && agent.command !== agent.file) {
        const aliasTpl = loadTemplate('commands/alias.md.hbs');
        const aliasContent = aliasTpl({
          aliasCommand: agent.command,
          canonicalFile: agent.file,
          role: agent.role,
          aliasDescription: `${agent.role} (alias for /${agent.file})`,
          commandsRelativePath,
        });
        await fs.writeFile(path.join(commandsDir, `${agent.command}.md`), aliasContent);
      }

      const relLabel = path.relative(outputDir, commandsDir).replace(/\\/g, '/');
      process.stdout.write(
        chalk.green('  ✓ ') +
          chalk.dim(`${relLabel}/${agent.file}.md`) +
          chalk.cyan(`  (${agent.character})\n`)
      );
    }

    const setupTpl = loadTemplate('commands/setup.md.hbs');
    await fs.writeFile(path.join(commandsDir, 'setup.md'), setupTpl(baseContext));

    const catalogCmd = catalogCommandForTheme(theme);
    const catalogTpl = loadTemplate(`commands/${catalogCmd}.md.hbs`);
    const catalogCtx = {
      ...baseContext,
      defaultAgents: DEFAULT_AGENTS.map((a) => applyTheme(a, theme)),
      conditionalAgents: conditionalAgents.map((a) => applyTheme(a, theme)),
      customRoles: answers.customRoles || [],
      hasConditionalAgents: conditionalAgents.length > 0,
      hasCustomRoles: (answers.customRoles || []).length > 0,
    };
    await fs.writeFile(path.join(commandsDir, `${catalogCmd}.md`), catalogTpl(catalogCtx));

    const staleCatalog = catalogCmd === 'help' ? 'lumos.md' : 'help.md';
    const stalePath = path.join(commandsDir, staleCatalog);
    if (await fs.pathExists(stalePath)) {
      await fs.remove(stalePath);
    }
  }

  for (const agent of allAgents) {
    const statusFile = path.join(statusDir, `${agent.file}.md`);
    const messageFile = path.join(messagesDir, `${agent.file}.md`);
    if (!(await fs.pathExists(statusFile))) {
      await fs.writeFile(statusFile, `---\nagent: ${agent.file}\nstatus: Idle\n---\n`);
    }
    if (!(await fs.pathExists(messageFile))) {
      await fs.writeFile(messageFile, `---\n---\n`);
    }
  }

  const agentReadmeTpl = loadTemplate('agent/README.md.hbs');
  await fs.writeFile(path.join(agentDir, 'README.md'), agentReadmeTpl({ ...baseContext, agents: allAgents }));

  const tasksTpl = loadTemplate('agent/tasks.md.hbs');
  const tasksPath = path.join(backlogDir, 'tasks.md');
  if (!(await fs.pathExists(tasksPath)) || force) {
    await fs.writeFile(tasksPath, tasksTpl(baseContext));
  }

  const heartbeatPath = path.join(reportsDir, 'heartbeat.md');
  if (!(await fs.pathExists(heartbeatPath))) {
    await fs.writeFile(heartbeatPath, `---\nupdated: never\n---\n\n# Team heartbeat\n\n*(Manager updates this on each check-in.)*\n`);
  }

  await fs.writeFile(path.join(reportsDir, '.gitkeep'), '');

  const troubleshootingTpl = loadTemplate('docs/troubleshooting.md.hbs');
  const wikiPath = path.join(docsWikiDir, '11-troubleshooting.md');
  if (!(await fs.pathExists(wikiPath)) || force) {
    await fs.writeFile(wikiPath, troubleshootingTpl(baseContext));
  }

  const adrTpl = loadTemplate('docs/adr-template.md.hbs');
  const adrPath = path.join(docsAdrDir, 'template.md');
  if (!(await fs.pathExists(adrPath)) || force) {
    await fs.writeFile(adrPath, adrTpl(baseContext));
  }

  await fs.writeFile(path.join(docsRunbooksDir, '.gitkeep'), '');

  const manifest = {
    packageVersion: PACKAGE_VERSION,
    scaffoldedAt: new Date().toISOString(),
    theme,
    catalogCommand: catalogCommandForTheme(theme),
    targets,
    project: {
      name: baseContext.projectName,
      description: baseContext.projectDescription,
      githubRepo: baseContext.githubRepo,
    },
    stacks: {
      frontend: answers.frontend,
      backend: answers.backend,
      domains: stack.domainKeys,
    },
    agents: allAgents.map((a) => ({
      file: a.file,
      role: a.role,
      command: a.command || null,
      character: a.character,
    })),
    customRoles: (answers.customRoles || []).map((r) => ({
      file: r.file,
      name: r.name,
      command: r.command || null,
      character: r.character,
      description: r.description,
      trait: r.trait,
    })),
    commandDirs: baseContext.commandDirs,
  };
  await fs.writeJson(manifestPath, manifest, { spaces: 2 });

  return {
    commandDirs,
    agentDir,
    allAgents,
    outputDir,
    conditionalAgents,
    manifestPath,
    agentCount: countAgents(allAgents),
    commandFileCount: countCommandFiles(allAgents),
    theme,
  };
}

function printManifest(answers, result) {
  const { allAgents, commandDirs, agentCount } = result;
  const theme = result.theme ?? answers.theme ?? 'phoenix';
  const customRoles = answers.customRoles || [];
  const isProfessional = theme === 'professional';

  const defaultFiles = new Set(DEFAULT_AGENTS.map((a) => a.file));
  const customFiles = new Set(customRoles.map((r) => r.file));
  const coreAgents = allAgents.filter((a) => defaultFiles.has(a.file));
  const stackAgents = allAgents.filter((a) => !defaultFiles.has(a.file) && !customFiles.has(a.file));

  console.log('\n' + chalk.bold.green('  Your engineering team is assembled:\n'));
  if (isProfessional) {
    console.log(chalk.dim('  Theme: professional (role-based commands only)\n'));
  }

  console.log(chalk.dim('  ── Always included ─────────────────────────────────────────'));
  printAgentRows(coreAgents, isProfessional);

  if (stackAgents.length > 0) {
    console.log(chalk.dim('\n  ── Added for your stack ────────────────────────────────────'));
    printAgentRows(stackAgents, isProfessional);
  }

  if (customRoles.length > 0) {
    console.log(chalk.dim('\n  ── Your custom roles ───────────────────────────────────────'));
    for (const r of customRoles) {
      const label = isProfessional ? r.name : r.character || r.name;
      if (isProfessional) {
        console.log('  ' + chalk.cyan(label.padEnd(28)) + chalk.white(`/${r.file}`));
      } else {
        const cmd = r.command || r.file;
        console.log(
          '  ' +
            chalk.cyan(label.padEnd(24)) +
            chalk.white(('/' + cmd).padEnd(maxCmdPad(cmd, r.file) + 3)) +
            chalk.dim('or  ') +
            chalk.dim(`/${r.file}`)
        );
      }
    }
  }

  console.log(
    '\n  ' +
      chalk.dim(`Agents: ${agentCount} · Command dirs: `) +
      commandDirs.map((d) => chalk.white(path.relative(result.outputDir, d))).join(chalk.dim(', '))
  );
  const catalogSlash = `/${catalogCommandForTheme(theme)}`;
  console.log(
    '\n  ' +
      chalk.dim('Utilities: ') +
      chalk.white('/setup') +
      chalk.dim(' — bootstrap   ') +
      chalk.white(catalogSlash) +
      chalk.dim(' — show all commands')
  );
  const startCmd = isProfessional ? '/manager' : '/dumbledore';
  console.log(
    '\n  ' +
      chalk.bold.yellow('✨ Ready.') +
      chalk.dim(' Open your agentic IDE and run ') +
      chalk.white(startCmd) +
      chalk.dim(' to begin.\n') +
      '  ' +
      chalk.dim('Run ') +
      chalk.white(catalogSlash) +
      chalk.dim(' to list every command.\n')
  );
}

function maxCmdPad(command, file) {
  return Math.max(command.length, file.length);
}

function printAgentRows(agents, professional) {
  const maxChar = Math.max(...agents.map((a) => (professional ? a.role : a.character).length));
  const maxCmd = Math.max(
    ...agents.map((a) => (professional ? a.file : maxCmdPad(a.command || a.file, a.file)).length)
  );
  for (const a of agents) {
    const label = professional ? a.role : a.character;
    if (professional) {
      console.log(
        '  ' + chalk.cyan(label.padEnd(maxChar + 2)) + chalk.white(`/${a.file}`)
      );
      continue;
    }
    const cmd = a.command || a.file;
    console.log(
      '  ' +
        chalk.cyan(label.padEnd(maxChar + 2)) +
        chalk.white(('/' + cmd).padEnd(maxCmd + 3)) +
        chalk.dim('or  ') +
        chalk.dim(`/${a.file}`) +
        chalk.dim(`  (${a.role})`)
    );
  }
}

module.exports = { scaffold, printManifest, loadTemplate };
