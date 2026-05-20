const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { scaffold } = require('./scaffolder');
const { MANIFEST_FILENAME } = require('./constants');
const { migrateManifest } = require('./manifest');
const { resolveSafeProjectDir } = require('./utils');
const { manifestToAnswers } = require('./doctor');

/**
 * Refresh agent command templates from the installed package without wiping .agent state.
 * @param {string} [projectDir]
 * @param {{ force?: boolean, forceOverwrite?: boolean, backup?: boolean, dryRun?: boolean, json?: boolean }} [options]
 */
async function runUpdate(projectDir = '.', options = {}) {
  const root = resolveSafeProjectDir(projectDir);
  const manifestPath = path.join(root, MANIFEST_FILENAME);

  if (!(await fs.pathExists(manifestPath))) {
    throw new Error(`No ${MANIFEST_FILENAME} found. Run \`agentic-crew init\` first.`);
  }

  const raw = await fs.readJson(manifestPath);
  const manifest = migrateManifest(raw);
  const answers = manifestToAnswers(manifest, root);

  if (options.dryRun) {
    const result = await scaffold(answers, {
      dryRun: true,
      isUpdate: true,
      force: options.force || false,
      prune: true,
    });
    const payload = {
      dryRun: true,
      manifestPath,
      wouldPrune: result.pruned || [],
      agents: result.agentCount,
      commandDirs: result.commandDirs.map((d) => path.relative(root, d)),
      overwriteDocs: Boolean(options.force),
    };
    if (options.json) {
      console.log(JSON.stringify(payload, null, 2));
    } else {
      console.log('\n' + chalk.bold('  Update dry run — no files written\n'));
      console.log(chalk.dim(`  Agents: ${payload.agents}`));
      console.log(chalk.dim(`  Overwrite docs/backlog: ${payload.overwriteDocs ? 'yes (--force)' : 'no'}`));
      if (payload.wouldPrune.length > 0) {
        console.log(chalk.dim('\n  Would remove stale files:'));
        for (const f of payload.wouldPrune) {
          console.log('    ' + f);
        }
      } else {
        console.log(chalk.dim('\n  No stale files to remove.'));
      }
      console.log('');
    }
    return payload;
  }

  if (!options.json) {
    console.log(chalk.bold('\n  Updating agent skill files from package templates...\n'));
  }

  const result = await scaffold(answers, {
    isUpdate: true,
    force: options.force || false,
    forceOverwrite: options.forceOverwrite || false,
    backup: options.backup || false,
    withSecurityCi: manifest.withSecurityCi || false,
    prune: true,
    quiet: Boolean(options.json),
  });

  const payload = {
    manifestPath,
    skippedFiles: result.skippedFiles || [],
    pruned: result.pruned || [],
    overwriteDocs: Boolean(options.force),
  };

  if (options.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(chalk.green('\n  ✓ Command templates updated.'));
    if (result.skippedFiles?.length) {
      console.log(
        chalk.dim(
          `  Preserved ${result.skippedFiles.length} user-edited file(s). Use --force-overwrite to replace.\n`
        )
      );
    } else {
      console.log(chalk.dim('  .agent/messages and status files were preserved (only missing files created).\n'));
    }
    if (result.pruned?.length) {
      console.log(chalk.dim(`  Removed ${result.pruned.length} stale file(s).\n`));
    }
  }

  return payload;
}

module.exports = { runUpdate };
