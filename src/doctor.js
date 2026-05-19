const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { MANIFEST_FILENAME } = require('./constants');
const { resolveCommandDirs } = require('./utils');

/**
 * @param {string} [projectDir]
 */
async function runDoctor(projectDir = '.') {
  const root = path.resolve(projectDir);
  const manifestPath = path.join(root, MANIFEST_FILENAME);
  const issues = [];
  const ok = [];

  if (!(await fs.pathExists(manifestPath))) {
    issues.push(`Missing ${MANIFEST_FILENAME} — run \`agentic-crew init\` in this directory.`);
    printReport(ok, issues);
    return { ok: false, issues };
  }

  const manifest = await fs.readJson(manifestPath);
  ok.push(`Found ${MANIFEST_FILENAME} (package ${manifest.packageVersion || 'unknown'})`);

  const agentDir = path.join(root, '.agent');
  if (!(await fs.pathExists(agentDir))) {
    issues.push('Missing .agent/ directory');
  } else {
    ok.push('.agent/ exists');
  }

  const commandDirs = manifest.commandDirs
    ? manifest.commandDirs.map((d) => path.join(root, d))
    : resolveCommandDirs(manifest.targets || 'both', root);

  for (const agent of manifest.agents || []) {
    const statusFile = path.join(agentDir, 'status', `${agent.file}.md`);
    const messageFile = path.join(agentDir, 'messages', `${agent.file}.md`);
    if (!(await fs.pathExists(statusFile))) {
      issues.push(`Missing status file: .agent/status/${agent.file}.md`);
    }
    if (!(await fs.pathExists(messageFile))) {
      issues.push(`Missing message file: .agent/messages/${agent.file}.md`);
    }
    for (const commandsDir of commandDirs) {
      const skillFile = path.join(commandsDir, `${agent.file}.md`);
      if (!(await fs.pathExists(skillFile))) {
        issues.push(`Missing skill file: ${path.relative(root, skillFile)}`);
      }
    }
  }

  const heartbeat = path.join(agentDir, 'reports', 'heartbeat.md');
  if (!(await fs.pathExists(heartbeat))) {
    issues.push('Missing .agent/reports/heartbeat.md');
  } else {
    ok.push('heartbeat.md present');
  }

  const backlog = path.join(agentDir, 'backlog', 'tasks.md');
  if (!(await fs.pathExists(backlog))) {
    issues.push('Missing .agent/backlog/tasks.md');
  } else {
    ok.push('backlog/tasks.md present');
  }

  for (const role of manifest.customRoles || []) {
    const statusFile = path.join(agentDir, 'status', `${role.file}.md`);
    if (!(await fs.pathExists(statusFile))) {
      issues.push(`Missing custom role status: .agent/status/${role.file}.md`);
    }
  }

  printReport(ok, issues);
  return { ok: issues.length === 0, issues, manifest };
}

function printReport(ok, issues) {
  console.log('\n' + chalk.bold('  agentic-crew doctor\n'));
  for (const line of ok) {
    console.log(chalk.green('  ✓ ') + line);
  }
  for (const line of issues) {
    console.log(chalk.red('  ✗ ') + line);
  }
  if (issues.length === 0) {
    console.log('\n' + chalk.green.bold('  All checks passed.\n'));
  } else {
    console.log('\n' + chalk.yellow(`  ${issues.length} issue(s) found. Run \`agentic-crew init --force\` or \`/setup\` to repair.\n`));
  }
}

module.exports = { runDoctor };
