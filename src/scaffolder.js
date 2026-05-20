const path = require('path');
const fs = require('fs-extra');
const Handlebars = require('handlebars');
const chalk = require('chalk');
const {
  sanitizeUserText,
  escapeMarkdownCell,
  MAX_PROJECT_NAME,
  MAX_DESCRIPTION,
  MAX_CUSTOM_ROLE_DESC,
} = require('./sanitize');
const { writeTrackedCommandFile } = require('./command-writer');
const { securityWorkflowYaml } = require('./security-workflow');
const {
  DEFAULT_AGENTS,
  OPTIONAL_AGENTS,
  applyTheme,
  resolveConditionalAgents,
  resolveOptionalAgents,
  resolveAllAgents,
  templatePathForAgent,
  validateCustomRoles,
} = require('./agents');

const OPTIONAL_FILES = new Set(Object.values(OPTIONAL_AGENTS).map((a) => a.file));
const { resolveStack } = require('./stacks');
const { PACKAGE_VERSION, MANIFEST_FILENAME, catalogCommandForTheme } = require('./constants');
const { buildManifest } = require('./manifest');
const { pruneStaleFiles } = require('./prune');
const {
  countAgents,
  countCommandFiles,
  resolveCommandDirs,
  resolveSupplementaryPaths,
  serializeTargets,
  resolveSafeOutputDir,
} = require('./utils');
const { writeSupplementaryOutputs, writeTeamRouter } = require('./supplementary');
const { getThemePack } = require('./themes');

const TEMPLATES_DIR = path.join(__dirname, 'templates');
const templateCache = new Map();
let partialsRegistered = false;

function registerPartials() {
  if (partialsRegistered) return;
  const introPath = path.join(TEMPLATES_DIR, 'partials', 'agent-intro.md.hbs');
  Handlebars.registerPartial('agent-intro', fs.readFileSync(introPath, 'utf8'));
  Handlebars.registerHelper('md', (value) => escapeMarkdownCell(value));
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
 * @param {{ dryRun?: boolean, force?: boolean, forceOverwrite?: boolean, backup?: boolean, isUpdate?: boolean, withSecurityCi?: boolean, prune?: boolean, quiet?: boolean }} [options]
 */
async function scaffold(answers, options = {}) {
  const {
    dryRun = false,
    force = false,
    forceOverwrite = false,
    backup = false,
    isUpdate = false,
    withSecurityCi = false,
    prune = false,
    quiet = false,
  } = options;
  const allowExisting = force || isUpdate;
  const overwriteGeneratedDocs = force;
  const scaffoldSecurityCi = withSecurityCi || Boolean(answers.withSecurityCi);
  const outputDir = resolveSafeOutputDir(answers.outputDir || '.');
  const theme = answers.theme || 'phoenix';
  const targetsInput = answers.targets || 'both';
  const commandDirs = resolveCommandDirs(targetsInput, outputDir);
  const supplementary = resolveSupplementaryPaths(targetsInput, outputDir);
  const targets = serializeTargets(targetsInput);

  const sanitizedAnswers = {
    ...answers,
    projectName: sanitizeUserText(answers.projectName || 'your project', MAX_PROJECT_NAME),
    projectDescription: sanitizeUserText(answers.projectDescription || ''),
    githubRepo: sanitizeUserText(answers.githubRepo || '', 500),
    customRoles: (answers.customRoles || []).map((r) => ({
      ...r,
      name: sanitizeUserText(r.name, MAX_PROJECT_NAME),
      description: sanitizeUserText(r.description, MAX_CUSTOM_ROLE_DESC),
      character: sanitizeUserText(r.character, MAX_PROJECT_NAME),
      trait: sanitizeUserText(r.trait, MAX_DESCRIPTION),
    })),
  };

  validateCustomRoles(sanitizedAnswers.customRoles);

  const stack = resolveStack(sanitizedAnswers);
  const conditionalAgents = resolveConditionalAgents(sanitizedAnswers);
  const optionalAgents = resolveOptionalAgents(sanitizedAnswers);
  const allAgents = resolveAllAgents(sanitizedAnswers, theme);
  const sanitizedCustomRoles = sanitizedAnswers.customRoles;

  const baseContext = {
    projectName: sanitizedAnswers.projectName,
    projectDescription: sanitizedAnswers.projectDescription,
    githubRepo: sanitizedAnswers.githubRepo,
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

  const existingManifest = !dryRun && (await fs.pathExists(manifestPath))
    ? await fs.readJson(manifestPath)
    : null;
  const commandHashes = { ...(existingManifest?.commandHashes || {}) };
  const writeOpts = {
    forceOverwrite,
    backup,
    isUpdate: isUpdate || Boolean(existingManifest),
  };
  const skippedFiles = [];

  if (!dryRun && !allowExisting) {
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
    const pruned = prune
      ? await pruneStaleFiles({
          outputDir,
          commandDirs,
          allAgents,
          theme,
          agentDir,
          dryRun: true,
        })
      : [];
    return {
      dryRun: true,
      planned: { ...planned, outputDir },
      allAgents,
      conditionalAgents,
      outputDir,
      commandDirs,
      agentCount: countAgents(allAgents),
      theme,
      pruned,
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

  const writerParams = { outputDir, commandHashes, options: writeOpts, skipped: skippedFiles };

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
        roleLabel: agent.role,
        roleName: agent.role,
        seniorBrief: agent.seniorBrief,
        description: agent.why,
        file: agent.file,
        customDomainLabel: agent.customDomainLabel,
        domainExpertise: agent.customDomainLabel || baseContext.domainExpertise,
      };
      const rendered = tpl(ctx);
      const canonicalPath = path.join(commandsDir, `${agent.file}.md`);
      const { written } = await writeTrackedCommandFile({
        filePath: canonicalPath,
        content: rendered,
        ...writerParams,
      });

      if (agent.command && agent.command !== agent.file) {
        const aliasTpl = loadTemplate('commands/alias.md.hbs');
        const aliasContent = aliasTpl({
          aliasCommand: agent.command,
          canonicalFile: agent.file,
          role: agent.role,
          aliasDescription: `${agent.role} (alias for /${agent.file})`,
          commandsRelativePath,
        });
        await writeTrackedCommandFile({
          filePath: path.join(commandsDir, `${agent.command}.md`),
          content: aliasContent,
          ...writerParams,
        });
      }

      const relLabel = path.relative(outputDir, commandsDir).replace(/\\/g, '/');
      if (!quiet) {
        const mark = written ? chalk.green('  ✓ ') : chalk.yellow('  ↷ ');
        process.stdout.write(
          mark +
            chalk.dim(`${relLabel}/${agent.file}.md`) +
            (written ? chalk.cyan(`  (${agent.character})\n`) : chalk.dim('  (preserved user edits)\n'))
        );
      }
    }

    const setupTpl = loadTemplate('commands/setup.md.hbs');
    await writeTrackedCommandFile({
      filePath: path.join(commandsDir, 'setup.md'),
      content: setupTpl({ ...baseContext, allAgents }),
      ...writerParams,
    });

    const catalogCmd = catalogCommandForTheme(theme);
    const catalogTpl = loadTemplate(`commands/${catalogCmd}.md.hbs`);
    const catalogCtx = {
      ...baseContext,
      defaultAgents: DEFAULT_AGENTS.map((a) => applyTheme(a, theme)),
      conditionalAgents: conditionalAgents.map((a) => applyTheme(a, theme)),
      optionalAgents: optionalAgents.map((a) => applyTheme(a, theme)),
      customRoles: sanitizedCustomRoles,
      hasConditionalAgents: conditionalAgents.length > 0,
      hasOptionalAgents: optionalAgents.length > 0,
      hasCustomRoles: sanitizedCustomRoles.length > 0,
    };
    await writeTrackedCommandFile({
      filePath: path.join(commandsDir, `${catalogCmd}.md`),
      content: catalogTpl(catalogCtx),
      ...writerParams,
    });

    const staleCatalog = catalogCmd === 'help' ? 'lumos.md' : 'help.md';
    const stalePath = path.join(commandsDir, staleCatalog);
    if (await fs.pathExists(stalePath)) {
      await fs.remove(stalePath);
    }

    await writeTeamRouter({
      commandDirs: [commandsDir],
      baseContext,
      allAgents,
      theme,
      loadTemplate,
      writerParams,
    });
  }

  const supplementaryWritten = await writeSupplementaryOutputs({
    outputDir,
    supplementary,
    baseContext,
    allAgents,
    theme,
    loadTemplate,
    writerParams,
    overwriteGeneratedDocs,
  });

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
  if (!(await fs.pathExists(tasksPath)) || overwriteGeneratedDocs) {
    await fs.writeFile(tasksPath, tasksTpl(baseContext));
  }

  const heartbeatTpl = loadTemplate('agent/heartbeat.md.hbs');
  const heartbeatPath = path.join(reportsDir, 'heartbeat.md');
  if (!(await fs.pathExists(heartbeatPath)) || overwriteGeneratedDocs) {
    await fs.writeFile(heartbeatPath, heartbeatTpl(baseContext));
  }

  await fs.writeFile(path.join(reportsDir, '.gitkeep'), '');

  const troubleshootingTpl = loadTemplate('docs/troubleshooting.md.hbs');
  const wikiPath = path.join(docsWikiDir, '11-troubleshooting.md');
  if (!(await fs.pathExists(wikiPath)) || overwriteGeneratedDocs) {
    await fs.writeFile(wikiPath, troubleshootingTpl(baseContext));
  }

  const adrTpl = loadTemplate('docs/adr-template.md.hbs');
  const adrPath = path.join(docsAdrDir, 'template.md');
  if (!(await fs.pathExists(adrPath)) || overwriteGeneratedDocs) {
    await fs.writeFile(adrPath, adrTpl(baseContext));
  }

  await fs.writeFile(path.join(docsRunbooksDir, '.gitkeep'), '');

  let pruned = [];
  if (prune) {
    pruned = await pruneStaleFiles({
      outputDir,
      commandDirs,
      allAgents,
      theme,
      agentDir,
      dryRun: false,
    });
  }

  const manifest = buildManifest({
    scaffoldedAt: new Date().toISOString(),
    theme,
    catalogCommand: catalogCommandForTheme(theme),
    targets,
    preset: answers.preset || 'full',
    project: {
      name: baseContext.projectName,
      description: baseContext.projectDescription,
      githubRepo: baseContext.githubRepo,
    },
    stacks: {
      frontend: sanitizedAnswers.frontend,
      backend: sanitizedAnswers.backend,
      domains: stack.domainKeys,
    },
    optionalRoles: sanitizedAnswers.optionalRoles || [],
    agents: allAgents.map((a) => ({
      file: a.file,
      role: a.role,
      command: a.command || null,
      character: a.character,
    })),
    customRoles: sanitizedCustomRoles.map((r) => ({
      file: r.file,
      name: r.name,
      command: r.command || null,
      character: r.character,
      description: r.description,
      trait: r.trait,
    })),
    commandDirs: baseContext.commandDirs,
    supplementaryFiles: supplementaryWritten,
    commandHashes,
    withSecurityCi: Boolean(scaffoldSecurityCi),
  });
  await fs.writeJson(manifestPath, manifest, { spaces: 2 });

  if (scaffoldSecurityCi) {
    const workflowDir = path.join(outputDir, '.github', 'workflows');
    await fs.ensureDir(workflowDir);
    const workflowPath = path.join(workflowDir, 'security.yml');
    await fs.writeFile(workflowPath, securityWorkflowYaml(sanitizedAnswers.backend));
    if (!quiet) {
      console.log(chalk.green('  ✓ ') + chalk.dim('.github/workflows/security.yml'));
    }
  }

  if (!quiet && skippedFiles.length > 0) {
    console.log(
      chalk.yellow(`\n  ↷ Preserved ${skippedFiles.length} user-edited command file(s).`) +
        chalk.dim(' Use --force-overwrite to replace them.\n')
    );
  }

  if (!quiet && pruned.length > 0) {
    console.log(
      chalk.dim(`\n  🧹 Removed ${pruned.length} stale file(s) no longer in the roster.\n`)
    );
  }

  return {
    commandDirs,
    agentDir,
    allAgents,
    outputDir,
    conditionalAgents,
    optionalAgents,
    manifestPath,
    agentCount: countAgents(allAgents),
    commandFileCount: countCommandFiles(allAgents),
    theme,
    skippedFiles,
    pruned,
    supplementaryWritten,
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
  const extraAgents = allAgents.filter((a) => !defaultFiles.has(a.file) && !customFiles.has(a.file));
  const optionalIncluded = extraAgents.filter((a) => OPTIONAL_FILES.has(a.file));
  const stackAgents = extraAgents.filter((a) => !OPTIONAL_FILES.has(a.file));

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

  if (optionalIncluded.length > 0) {
    console.log(chalk.dim('\n  ── Optional roles selected ─────────────────────────────────'));
    printAgentRows(optionalIncluded, isProfessional);
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
      chalk.white('/team') +
      chalk.dim(' — router   ') +
      chalk.white('/setup') +
      chalk.dim(' — bootstrap   ') +
      chalk.white(catalogSlash) +
      chalk.dim(' — show all commands')
  );
  const startCmd = `/${getThemePack(theme).startCommand}`;
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
