const {
  intro,
  text,
  select,
  multiselect,
  confirm,
  group,
  cancel,
  isCancel,
} = require('@clack/prompts');
const chalk = require('chalk');
const { FRONTEND_STACKS, BACKEND_STACKS, DOMAINS } = require('./stacks');
const {
  DEFAULT_AGENTS,
  OPTIONAL_AGENTS,
  OPTIONAL_ROLE_KEYS,
  RESERVE_CHARACTERS,
  resolveConditionalAgents,
  resolveOptionalAgents,
  resolveAllAgents,
  buildReservedSlugs,
  validateCustomRoles,
} = require('./agents');
const { countAgents, assertNoCollision, slugify } = require('./utils');
const { THEMES } = require('./constants');

async function runQuestionnaire() {
  intro(
    chalk.bold('\n  agentic-crew') +
      chalk.dim(' — your AI engineering team, assembled in 60 seconds\n') +
      chalk.dim('  Works with Claude Code, Cursor, and other agentic IDEs\n')
  );

  const project = await group(
    {
      name: () =>
        text({
          message: 'What is your project name?',
          placeholder: 'my-app',
          validate: (v) => (!v.trim() ? 'Project name is required.' : undefined),
        }),
      description: () =>
        text({
          message: 'One-line description of your project?',
          placeholder: 'A high-performance real-time collaboration tool',
        }),
      repo: () =>
        text({
          message: 'GitHub repository URL?',
          placeholder: 'https://github.com/you/my-app  (press Enter to skip)',
        }),
    },
    { onCancel: () => { cancel('Cancelled.'); process.exit(0); } }
  );

  const frontend = await select({
    message: 'Frontend stack?',
    options: FRONTEND_STACKS.map((s) => ({ value: s.value, label: s.label, hint: s.hint })),
  });
  if (isCancel(frontend)) { cancel('Cancelled.'); process.exit(0); }

  let frontendResolved = frontend;
  if (frontend === 'other') {
    const custom = await text({ message: 'Describe your frontend stack:' });
    if (isCancel(custom)) { cancel('Cancelled.'); process.exit(0); }
    frontendResolved = custom.trim();
  }

  const backend = await select({
    message: 'Backend stack?',
    options: BACKEND_STACKS.map((s) => ({ value: s.value, label: s.label, hint: s.hint })),
  });
  if (isCancel(backend)) { cancel('Cancelled.'); process.exit(0); }

  let backendResolved = backend;
  if (backend === 'other') {
    const custom = await text({ message: 'Describe your backend stack:' });
    if (isCancel(custom)) { cancel('Cancelled.'); process.exit(0); }
    backendResolved = custom.trim();
  }

  const domainChoices = await multiselect({
    message: 'Specialized technical domains? (Space to toggle, Enter to confirm)',
    options: [
      ...DOMAINS.map((d) => ({ value: d.value, label: d.label, hint: d.hint })),
    ],
    required: false,
  });
  if (isCancel(domainChoices)) { cancel('Cancelled.'); process.exit(0); }

  const domains = [...(domainChoices || [])];
  if (domains.includes('other')) {
    const custom = await text({ message: 'Describe your technical domain:' });
    if (isCancel(custom)) { cancel('Cancelled.'); process.exit(0); }
    domains.splice(domains.indexOf('other'), 1, custom.trim());
  }

  const theme = await select({
    message: 'Persona theme?',
    options: [
      { value: 'phoenix', label: 'Order of the Phoenix', hint: 'Harry Potter character names + role aliases' },
      { value: 'professional', label: 'Professional', hint: 'Role-based commands only (enterprise-friendly)' },
    ],
  });
  if (isCancel(theme)) { cancel('Cancelled.'); process.exit(0); }
  if (!THEMES.includes(theme)) { cancel('Cancelled.'); process.exit(0); }

  const target = await select({
    message: 'IDE command directories?',
    options: [
      { value: 'both', label: 'Claude + Cursor', hint: '.claude/commands and .cursor/commands' },
      { value: 'claude', label: 'Claude Code only' },
      { value: 'cursor', label: 'Cursor only' },
    ],
  });
  if (isCancel(target)) { cancel('Cancelled.'); process.exit(0); }

  const optionalChoices = await multiselect({
    message: 'Optional roles to include? (Space to toggle, Enter to confirm)',
    options: OPTIONAL_ROLE_KEYS.map((key) => {
      const meta = OPTIONAL_AGENTS[key];
      return {
        value: key,
        label: meta.role,
        hint: `/${meta.file}${meta.command && meta.command !== meta.file ? ` or /${meta.command}` : ''}`,
      };
    }),
    required: false,
  });
  if (isCancel(optionalChoices)) { cancel('Cancelled.'); process.exit(0); }

  const optionalRoles = [...(optionalChoices || [])];

  const draftAnswers = {
    frontend: frontendResolved,
    backend: backendResolved,
    domains,
    theme,
    optionalRoles,
    customRoles: [],
  };
  const conditionalAgents = resolveConditionalAgents(draftAnswers);
  const optionalAgents = resolveOptionalAgents(draftAnswers);
  const previewAgents = resolveAllAgents(draftAnswers, theme);

  console.log('\n' + chalk.bold(`  Your team — ${countAgents(previewAgents)} agents:\n`));
  printPreview(DEFAULT_AGENTS, theme);
  if (conditionalAgents.length > 0) {
    console.log(chalk.dim('\n  Added for your stack:\n'));
    printPreview(conditionalAgents, theme);
  }
  if (optionalAgents.length > 0) {
    console.log(chalk.dim('\n  Optional roles selected:\n'));
    printPreview(optionalAgents, theme);
  }
  console.log();

  const customRoles = [];
  const reservePool = [...RESERVE_CHARACTERS].sort(() => Math.random() - 0.5);
  const reserved = buildReservedSlugs();

  let addMore = await confirm({ message: 'Add a custom role on top of these?' });
  if (isCancel(addMore)) { cancel('Cancelled.'); process.exit(0); }

  while (addMore) {
    const roleName = await text({
      message: 'Role name? (e.g., "Data Engineer")',
      validate: (v) => (!v.trim() ? 'Role name is required.' : undefined),
    });
    if (isCancel(roleName)) { cancel('Cancelled.'); process.exit(0); }

    const roleDescription = await text({
      message: 'One-line description of what this role does?',
      validate: (v) => (!v.trim() ? 'Description is required.' : undefined),
    });
    if (isCancel(roleDescription)) { cancel('Cancelled.'); process.exit(0); }

    const fileSlug = slugify(roleName);
    try {
      assertNoCollision(reserved, fileSlug, undefined, `Custom role "${roleName}"`);
    } catch (err) {
      console.log(chalk.red(`  ${err.message}`));
      continue;
    }

    if (reservePool.length === 0) {
      reservePool.push(...RESERVE_CHARACTERS.sort(() => Math.random() - 0.5));
    }
    const suggested = reservePool.shift();

    let character = suggested.character;
    let trait = suggested.trait;
    let command = suggested.command;

    if (theme === 'phoenix') {
      const useCharacter = await confirm({
        message: `Assign ${chalk.bold(suggested.character)} as the persona for ${chalk.bold(roleName)}?`,
      });
      if (isCancel(useCharacter)) { cancel('Cancelled.'); process.exit(0); }

      if (!useCharacter) {
        character = await text({ message: 'Custom persona name for this role?' });
        if (isCancel(character)) { cancel('Cancelled.'); process.exit(0); }
        trait = 'Custom';
        command = slugify(character.split(/\s+/)[0]);
      }
      try {
        assertNoCollision(reserved, fileSlug, command, `Custom role "${roleName}"`);
      } catch (err) {
        console.log(chalk.red(`  ${err.message}`));
        continue;
      }
    } else {
      character = roleName;
      command = undefined;
      trait = `${roleName} — specialist`;
    }

    customRoles.push({
      name: roleName,
      description: roleDescription,
      character,
      trait,
      command,
      file: fileSlug,
    });

    addMore = await confirm({ message: 'Add another custom role?' });
    if (isCancel(addMore)) { cancel('Cancelled.'); process.exit(0); }
  }

  validateCustomRoles(customRoles);

  const outputDir = await text({
    message: 'Scaffold into which directory?',
    placeholder: '. (current directory)',
    defaultValue: '.',
  });
  if (isCancel(outputDir)) { cancel('Cancelled.'); process.exit(0); }

  const finalAnswers = {
    projectName: (project.name || '').trim(),
    projectDescription: (project.description || '').trim(),
    githubRepo: (project.repo || '').trim(),
    frontend: frontendResolved,
    backend: backendResolved,
    domains,
    domain: domains[0] || 'none',
    customRoles,
    optionalRoles,
    outputDir: (outputDir || '.').trim() || '.',
    theme,
    targets: target,
  };

  const totalAgents = countAgents(resolveAllAgents(finalAnswers, theme));

  const withSecurityCi = await confirm({
    message: 'Add GitHub security workflow (.github/workflows/security.yml)?',
    initialValue: false,
  });
  if (isCancel(withSecurityCi)) { cancel('Cancelled.'); process.exit(0); }

  const proceed = await confirm({
    message: `Ready to scaffold ${chalk.bold(finalAnswers.projectName)} with ${totalAgents} agents. Proceed?`,
  });
  if (isCancel(proceed) || !proceed) { cancel('Cancelled.'); process.exit(0); }

  return { ...finalAnswers, withSecurityCi: Boolean(withSecurityCi) };
}

function printPreview(agents, theme) {
  const maxChar = Math.max(...agents.map((a) => (theme === 'professional' ? a.role : a.character).length));
  const maxRole = Math.max(...agents.map((a) => a.role.length));
  const maxCmd = Math.max(...agents.map((a) => ((theme === 'professional' ? a.file : a.command) || a.file).length));
  for (const a of agents) {
    const label = theme === 'professional' ? a.role : a.character;
    const cmd = theme === 'professional' ? a.file : a.command || a.file;
    console.log(
      '  ' +
        chalk.cyan(label.padEnd(maxChar + 2)) +
        chalk.dim(a.role.padEnd(maxRole + 2)) +
        chalk.white(('/' + cmd).padEnd(maxCmd + 3)) +
        chalk.dim(`or /${a.file}`)
    );
  }
}

module.exports = { runQuestionnaire };
