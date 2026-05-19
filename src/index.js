const { Command } = require('commander');
const { runQuestionnaire } = require('./questionnaire');
const { scaffold, printManifest } = require('./scaffolder');
const { spinner } = require('@clack/prompts');
const chalk = require('chalk');

const program = new Command();

program
  .name('agentic-crew')
  .description('Scaffold a full AI engineering team into any Claude Code project')
  .version('0.1.0');

program
  .command('init')
  .description('Run the interactive setup and scaffold your agent team')
  .action(async () => {
    try {
      const answers = await runQuestionnaire();

      console.log('\n' + chalk.bold('  Assembling your order...\n'));

      const result = await scaffold(answers);

      console.log(
        '\n' + chalk.green('  ✓ ') + chalk.bold(`${18 + (answers.customRoles?.length || 0)} agent skill files`) +
        chalk.dim(' → .claude/commands/')
      );
      console.log(chalk.green('  ✓ ') + chalk.bold('.agent/ structure') + chalk.dim(' (status / messages / backlog / reports)'));
      console.log(chalk.green('  ✓ ') + chalk.bold('docs/ structure') + chalk.dim(' (wiki / adr / runbooks)'));

      printManifest(answers, result);
    } catch (err) {
      console.error(chalk.red('\n  Error: ') + err.message);
      process.exit(1);
    }
  });

// Default: run init when called with no subcommand
program.addHelpText('afterAll', '\n  Quick start: agentic-crew init\n');

module.exports = program;
