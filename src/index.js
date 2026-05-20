const { Command } = require('commander');
const chalk = require('chalk');
const { runQuestionnaire } = require('./questionnaire');
const { scaffold, printManifest } = require('./scaffolder');
const { runDoctor } = require('./doctor');
const { runUpdate } = require('./update');
const { runUninstall } = require('./uninstall');
const { answersFromOptions } = require('./options');
const { countAgents, countCommandFiles } = require('./utils');
const { resolveAllAgents } = require('./agents');
const { PACKAGE_VERSION } = require('./constants');
const { PRESET_KEYS } = require('./presets');

const program = new Command();

program
  .name('agentic-crew')
  .description('Scaffold a full AI engineering team into any project')
  .version(PACKAGE_VERSION);

function addInitOptions(cmd) {
  return cmd
    .option('--name <name>', 'Project name (non-interactive)')
    .option('--description <text>', 'Project description')
    .option('--repo <url>', 'GitHub repository URL')
    .option('--frontend <stack>', 'Frontend stack key or custom text')
    .option('--backend <stack>', 'Backend stack key or custom text')
    .option('--domain <domains>', 'Comma-separated domain keys or custom labels')
    .option('--domain-other <text>', 'Custom domain label (appended to --domain)')
    .option('--optional <roles>', 'Comma-separated optional roles: sre, tpm')
    .option('--preset <preset>', `Roster preset: ${PRESET_KEYS.join(', ')}`, 'full')
    .option('--theme <theme>', 'phoenix | professional', 'phoenix')
    .option('--target <target>', 'claude | cursor | both', 'both')
    .option('--output-dir <dir>', 'Output directory', '.')
    .option('--yes', 'Skip questionnaire when --name is set')
    .option('--dry-run', 'Print what would be created without writing files')
    .option('--force', 'Allow scaffolding into an existing .agent/ directory')
    .option(
      '--custom-role <spec>',
      'Custom role as Name|Description (repeatable)',
      (value, previous) => [...previous, value],
      []
    )
    .option('--with-security-ci', 'Scaffold .github/workflows/security.yml in the target project')
    .option('--force-overwrite', 'Replace user-edited command skill files')
    .option('--json', 'Output machine-readable JSON');
}

addInitOptions(
  program
    .command('init', { isDefault: true })
    .description('Run setup and scaffold your agent team')
    .action(async function initAction() {
      try {
        const cmd = this;
        const json = Boolean(cmd.opts().json);
        let answers = answersFromOptions(cmd);
        if (!answers) {
          answers = await runQuestionnaire();
        }

        if (cmd.opts().dryRun) {
          const result = await scaffold(answers, {
            dryRun: true,
            withSecurityCi: answers.withSecurityCi,
            prune: Boolean(cmd.opts().force),
          });
          if (json) {
            console.log(JSON.stringify({ dryRun: true, ...result }, null, 2));
          } else {
            printDryRun(result, answers);
          }
          return;
        }

        if (!json) {
          console.log('\n' + chalk.bold('  Assembling your team...\n'));
        }

        const result = await scaffold(answers, {
          force: cmd.opts().force,
          forceOverwrite: cmd.opts().forceOverwrite,
          withSecurityCi: answers.withSecurityCi,
          prune: Boolean(cmd.opts().force),
          quiet: json,
        });
        const agents = resolveAllAgents(answers, answers.theme);
        const filesPerDir = countCommandFiles(agents) + 2;

        if (json) {
          console.log(
            JSON.stringify(
              {
                ok: true,
                command: 'init',
                manifestPath: result.manifestPath,
                agentCount: countAgents(agents),
                commandFileCount: filesPerDir,
                pruned: result.pruned || [],
                skippedFiles: result.skippedFiles || [],
              },
              null,
              2
            )
          );
          return;
        }

        console.log(
          '\n' +
            chalk.green('  ✓ ') +
            chalk.bold(`${countAgents(agents)} agents`) +
            chalk.dim(` · ~${filesPerDir} skill files per IDE directory`)
        );
        console.log(chalk.green('  ✓ ') + chalk.bold('.agent/ structure') + chalk.dim(' (status / messages / backlog / reports)'));
        console.log(
          chalk.green('  ✓ ') +
            chalk.bold('.agentic-crew.json') +
            chalk.dim(` → ${result.manifestPath}`)
        );
        console.log(chalk.green('  ✓ ') + chalk.bold('docs/ structure') + chalk.dim(' (wiki / adr / runbooks)'));

        printManifest(answers, result);
      } catch (err) {
        console.error(chalk.red('\n  Error: ') + err.message);
        process.exit(1);
      }
    })
);

program
  .command('doctor')
  .description('Validate agent team structure against the manifest')
  .option('--dir <path>', 'Project directory', '.')
  .option('--fix', 'Repair missing files and prune stale roster entries')
  .option('--json', 'Output machine-readable JSON')
  .action(async (opts) => {
    const { ok } = await runDoctor(opts.dir, { fix: opts.fix, json: opts.json });
    process.exit(ok ? 0 : 1);
  });

program
  .command('update')
  .description('Refresh agent command templates from the installed package')
  .option('--dir <path>', 'Project directory', '.')
  .option('--force', 'Overwrite generated docs/backlog if present')
  .option('--force-overwrite', 'Replace user-edited command skill files')
  .option('--backup', 'Backup command files to .agentic-crew.bak/ before updating')
  .option('--dry-run', 'Show planned changes without writing files')
  .option('--json', 'Output machine-readable JSON')
  .action(async (opts) => {
    try {
      await runUpdate(opts.dir, {
        force: opts.force,
        forceOverwrite: opts.forceOverwrite,
        backup: opts.backup,
        dryRun: opts.dryRun,
        json: opts.json,
      });
    } catch (err) {
      if (opts.json) {
        console.log(JSON.stringify({ ok: false, error: err.message }, null, 2));
      } else {
        console.error(chalk.red('\n  Error: ') + err.message);
      }
      process.exit(1);
    }
  });

program
  .command('uninstall')
  .description('Remove agentic-crew scaffold artifacts from a project')
  .option('--dir <path>', 'Project directory', '.')
  .option('--keep-state', 'Keep .agent/ directory (status, messages, backlog)')
  .option('--dry-run', 'Show what would be removed without deleting')
  .option('--json', 'Output machine-readable JSON')
  .action(async (opts) => {
    try {
      const result = await runUninstall(opts.dir, {
        keepState: opts.keepState,
        dryRun: opts.dryRun,
      });
      if (opts.json) {
        console.log(JSON.stringify({ ok: true, command: 'uninstall', ...result }, null, 2));
        return;
      }
      console.log('\n' + chalk.bold('  agentic-crew uninstall\n'));
      if (opts.dryRun) {
        console.log(chalk.dim('  Dry run — no files removed\n'));
      }
      for (const rel of result.removed) {
        console.log(chalk.yellow('  − ') + rel);
      }
      if (result.keepState) {
        console.log(chalk.dim('\n  .agent/ preserved (--keep-state).\n'));
      } else {
        console.log(chalk.dim('\n  .agent/ removed.\n'));
      }
    } catch (err) {
      if (opts.json) {
        console.log(JSON.stringify({ ok: false, error: err.message }, null, 2));
      } else {
        console.error(chalk.red('\n  Error: ') + err.message);
      }
      process.exit(1);
    }
  });

program.addHelpText('afterAll', '\n  Quick start: agentic-crew init\n');

function printDryRun(result, answers) {
  const { planned, allAgents, commandDirs } = result;
  console.log('\n' + chalk.bold('  Dry run — no files written\n'));
  console.log(chalk.dim(`  Output: ${planned.outputDir || result.outputDir}`));
  console.log(chalk.dim(`  Agents: ${planned.agents}`));
  console.log(chalk.dim(`  Command directories:`));
  for (const d of commandDirs) {
    console.log('    ' + d);
  }
  if (result.pruned?.length) {
    console.log(chalk.dim('\n  Would prune stale files:'));
    for (const f of result.pruned) {
      console.log('    ' + f);
    }
  }
  console.log(chalk.dim('\n  Agent roster:'));
  for (const a of allAgents) {
    const alias = a.command && a.command !== a.file ? ` (+ /${a.command} alias)` : '';
    console.log(`    ${a.file} — ${a.role}${alias}`);
  }
  console.log('');
}

module.exports = program;
