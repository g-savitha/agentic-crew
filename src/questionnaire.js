const {
  intro,
  outro,
  text,
  select,
  confirm,
  group,
  cancel,
  isCancel,
  spinner,
} = require('@clack/prompts');
const chalk = require('chalk');
const { FRONTEND_STACKS, BACKEND_STACKS, DOMAINS } = require('./stacks');
const { RESERVE_CHARACTERS } = require('./agents');

async function runQuestionnaire() {
  intro(
    chalk.bold('\n  agentic-crew') +
    chalk.dim(' — your AI engineering team, assembled in 60 seconds\n') +
    chalk.dim('  Powered by Claude Code · Demon Slayer Corps Edition\n')
  );

  // ── Project details ──────────────────────────────────────────────
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

  // ── Tech stack ───────────────────────────────────────────────────
  const frontend = await select({
    message: 'Frontend stack?',
    options: FRONTEND_STACKS.map((s) => ({
      value: s.value,
      label: s.label,
      hint: s.hint,
    })),
  });
  if (isCancel(frontend)) { cancel('Cancelled.'); process.exit(0); }

  let frontendCustom = '';
  if (frontend === 'other') {
    frontendCustom = await text({ message: 'Describe your frontend stack:' });
    if (isCancel(frontendCustom)) { cancel('Cancelled.'); process.exit(0); }
  }

  const backend = await select({
    message: 'Backend stack?',
    options: BACKEND_STACKS.map((s) => ({
      value: s.value,
      label: s.label,
      hint: s.hint,
    })),
  });
  if (isCancel(backend)) { cancel('Cancelled.'); process.exit(0); }

  let backendCustom = '';
  if (backend === 'other') {
    backendCustom = await text({ message: 'Describe your backend stack:' });
    if (isCancel(backendCustom)) { cancel('Cancelled.'); process.exit(0); }
  }

  // ── Domain expert ────────────────────────────────────────────────
  const domain = await select({
    message: 'Specialized technical domain? (shapes the /networking agent)',
    options: DOMAINS.map((d) => ({
      value: d.value,
      label: d.label,
      hint: d.hint,
    })),
  });
  if (isCancel(domain)) { cancel('Cancelled.'); process.exit(0); }

  let domainCustom = '';
  if (domain === 'other') {
    domainCustom = await text({ message: 'Describe your technical domain:' });
    if (isCancel(domainCustom)) { cancel('Cancelled.'); process.exit(0); }
  }

  // ── Custom roles ─────────────────────────────────────────────────
  const customRoles = [];
  let reserveIdx = 0;

  // Show the default roster so users know what's already included
  const { AGENTS } = require('./agents');
  console.log('\n' + chalk.bold('  Your default corps (always included):\n'));
  const maxChar = Math.max(...AGENTS.map((a) => a.character.length));
  const maxRole = Math.max(...AGENTS.map((a) => a.role.length));
  for (const a of AGENTS) {
    console.log(
      '  ' + chalk.cyan(a.character.padEnd(maxChar + 2)) +
      chalk.dim(a.role.padEnd(maxRole + 2)) +
      chalk.white(`/${a.file}`)
    );
  }
  console.log();

  let addMore = await confirm({ message: 'Add a custom role on top of these?' });
  if (isCancel(addMore)) { cancel('Cancelled.'); process.exit(0); }

  while (addMore) {
    const roleName = await text({
      message: 'Role name? (e.g., "Data Engineer", "ML Researcher")',
      validate: (v) => (!v.trim() ? 'Role name is required.' : undefined),
    });
    if (isCancel(roleName)) { cancel('Cancelled.'); process.exit(0); }

    const roleDescription = await text({
      message: 'One-line description of what this role does?',
      validate: (v) => (!v.trim() ? 'Description is required.' : undefined),
    });
    if (isCancel(roleDescription)) { cancel('Cancelled.'); process.exit(0); }

    const suggested = RESERVE_CHARACTERS[reserveIdx % RESERVE_CHARACTERS.length];
    reserveIdx++;

    const useCharacter = await confirm({
      message: `Assign ${chalk.bold(suggested.character)} as the persona for ${chalk.bold(roleName)}?`,
    });
    if (isCancel(useCharacter)) { cancel('Cancelled.'); process.exit(0); }

    let character = suggested.character;
    let breathing = suggested.breathing;

    if (!useCharacter) {
      character = await text({ message: 'Custom persona name for this role?' });
      if (isCancel(character)) { cancel('Cancelled.'); process.exit(0); }
      breathing = 'Custom';
    }

    const fileSlug = roleName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    customRoles.push({ name: roleName, description: roleDescription, character, breathing, file: fileSlug });

    addMore = await confirm({ message: 'Add another custom role?' });
    if (isCancel(addMore)) { cancel('Cancelled.'); process.exit(0); }
  }

  // ── Output directory ─────────────────────────────────────────────
  const outputDir = await text({
    message: 'Scaffold into which directory?',
    placeholder: '. (current directory)',
    defaultValue: '.',
  });
  if (isCancel(outputDir)) { cancel('Cancelled.'); process.exit(0); }

  // ── Confirm ───────────────────────────────────────────────────────
  const proceed = await confirm({
    message: `Ready to scaffold ${chalk.bold(project.name || 'your project')} with ${18 + customRoles.length} agents. Proceed?`,
  });
  if (isCancel(proceed) || !proceed) { cancel('Cancelled.'); process.exit(0); }

  return {
    projectName: (project.name || '').trim(),
    projectDescription: (project.description || '').trim(),
    githubRepo: (project.repo || '').trim(),
    frontend: frontend === 'other' ? frontendCustom : frontend,
    backend: backend === 'other' ? backendCustom : backend,
    domain: domain === 'other' ? domainCustom : domain,
    customRoles,
    outputDir: (outputDir || '.').trim() || '.',
  };
}

module.exports = { runQuestionnaire };
