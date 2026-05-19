const { Command } = require('commander');
const chalk = require('chalk');
const { runQuestionnaire } = require('./questionnaire');
const { scaffold, printManifest } = require('./scaffolder');
const { runDoctor } = require('./doctor');
const { runUpdate } = require('./update');
const { answersFromOptions } = require('./options');
const { countAgents, countCommandFiles } = require('./utils');
const { resolveAllAgents } = require('./agents');
const { PACKAGE_VERSION } = require('./constants');

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
    .option('--theme <theme>', 'phoenix | professional', 'phoenix')
    .option('--target <target>', 'claude | cursor | both', 'both')
    .option('--output-dir <dir>', 'Output directory', '.')
    .option('--yes', 'Skip questionnaire when --name is set')
    .option('--dry-run', 'Print what would be created without writing files')
    .option('--force', 'Allow scaffolding into an existing .agent/ directory');
}

addInitOptions(
  program
    .command('init', { isDefault: true })
    .description('Run setup and scaffold your agent team')
    .action(async function initAction() {
      try {
        const cmd = this;
        let answers = answersFromOptions(cmd);
        if (!answers) {
          answers = await runQuestionnaire();
        }

        if (cmd.opts().dryRun) {
          const result = await scaffold(answers, { dryRun: true });
          printDryRun(result, answers);
          return;
        }

        console.log('\n' + chalk.bold('  Assembling your team...\n'));

        const result = await scaffold(answers, { force: cmd.opts().force });
        const agents = resolveAllAgents(answers, answers.theme);
        const filesPerDir = countCommandFiles(agents) + 2;

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
  .action(async (opts) => {
    const { ok } = await runDoctor(opts.dir);
    process.exit(ok ? 0 : 1);
  });

program
  .command('update')
  .description('Refresh agent command templates from the installed package')
  .option('--dir <path>', 'Project directory', '.')
  .option('--force', 'Overwrite generated docs/backlog if present')
  .action(async (opts) => {
    try {
      await runUpdate(opts.dir, { force: opts.force });
    } catch (err) {
      console.error(chalk.red('\n  Error: ') + err.message);
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
  console.log(chalk.dim('\n  Agent roster:'));
  for (const a of allAgents) {
    const alias = a.command && a.command !== a.file ? ` (+ /${a.command} alias)` : '';
    console.log(`    ${a.file} — ${a.role}${alias}`);
  }
  console.log('');
}

module.exports = program;
