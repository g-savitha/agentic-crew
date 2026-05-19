const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { scaffold } = require('./scaffolder');
const { MANIFEST_FILENAME } = require('./constants');

/**
 * Refresh agent command templates from the installed package without wiping .agent state.
 * @param {string} [projectDir]
 * @param {{ force?: boolean }} [options]
 */
async function runUpdate(projectDir = '.', options = {}) {
  const root = path.resolve(projectDir);
  const manifestPath = path.join(root, MANIFEST_FILENAME);

  if (!(await fs.pathExists(manifestPath))) {
    throw new Error(`No ${MANIFEST_FILENAME} found. Run \`agentic-crew init\` first.`);
  }

  const manifest = await fs.readJson(manifestPath);

  const answers = {
    projectName: manifest.project?.name || 'your project',
    projectDescription: manifest.project?.description || '',
    githubRepo: manifest.project?.githubRepo || '',
    frontend: manifest.stacks?.frontend || 'none',
    backend: manifest.stacks?.backend || 'none',
    domains: manifest.stacks?.domains || [],
    domain: (manifest.stacks?.domains || [])[0] || 'none',
    optionalRoles: manifest.optionalRoles || [],
    customRoles: (manifest.customRoles || []).map((r) => ({
      name: r.name || r.file,
      file: r.file,
      command: r.command,
      character: r.character || r.name,
      trait: 'Custom',
      description: r.description || '',
    })),
    outputDir: root,
    theme: manifest.theme || 'phoenix',
    targets: manifest.targets || 'both',
  };

  console.log(chalk.bold('\n  Updating agent skill files from package templates...\n'));

  await scaffold(answers, { force: true });

  console.log(chalk.green('\n  ✓ Command templates updated.'));
  console.log(chalk.dim('  .agent/messages and status files were preserved (only missing files created).\n'));

  return { manifestPath };
}

module.exports = { runUpdate };
