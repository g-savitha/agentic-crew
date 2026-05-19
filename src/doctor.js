const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { MANIFEST_FILENAME, PACKAGE_VERSION } = require('./constants');
const { resolveCommandDirs } = require('./utils');

/**
 * @param {string} [projectDir]
 */
async function runDoctor(projectDir = '.') {
  const root = path.resolve(projectDir);
  const manifestPath = path.join(root, MANIFEST_FILENAME);
  const issues = [];
  const ok = [];
  const warnings = [];

  if (!(await fs.pathExists(manifestPath))) {
    issues.push(`Missing ${MANIFEST_FILENAME} — run \`agentic-crew init\` in this directory.`);
    printReport(ok, warnings, issues);
    return { ok: false, issues };
  }

  const manifest = await fs.readJson(manifestPath);
  ok.push(`Found ${MANIFEST_FILENAME} (package ${manifest.packageVersion || 'unknown'})`);

  if (manifest.packageVersion && manifest.packageVersion !== PACKAGE_VERSION) {
    warnings.push(
      `Manifest version ${manifest.packageVersion} differs from installed CLI ${PACKAGE_VERSION} — run \`agentic-crew update\``
    );
  } else if (manifest.packageVersion === PACKAGE_VERSION) {
    ok.push(`CLI version matches manifest (${PACKAGE_VERSION})`);
  }

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

      if (agent.command && agent.command !== agent.file) {
        const aliasFile = path.join(commandsDir, `${agent.command}.md`);
        if (!(await fs.pathExists(aliasFile))) {
          issues.push(`Missing alias stub: ${path.relative(root, aliasFile)}`);
        } else {
          const aliasContent = await fs.readFile(aliasFile, 'utf8');
          if (!aliasContent.includes(`alias-of: ${agent.file}`)) {
            issues.push(
              `Invalid alias stub ${path.relative(root, aliasFile)} — expected alias-of: ${agent.file}`
            );
          } else {
            ok.push(`Alias /${agent.command} → /${agent.file} (${path.relative(root, commandsDir)})`);
          }
        }
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
    for (const commandsDir of commandDirs) {
      const skillFile = path.join(commandsDir, `${role.file}.md`);
      if (!(await fs.pathExists(skillFile))) {
        issues.push(`Missing custom role skill: ${path.relative(root, skillFile)}`);
      }
    }
  }

  if (manifest.withSecurityCi) {
    const workflow = path.join(root, '.github', 'workflows', 'security.yml');
    if (!(await fs.pathExists(workflow))) {
      warnings.push('Manifest expects security CI but .github/workflows/security.yml is missing');
    } else {
      ok.push('security.yml workflow present');
    }
  }

  printReport(ok, warnings, issues);
  return { ok: issues.length === 0, issues, warnings, manifest };
}

function printReport(ok, warnings, issues) {
  console.log('\n' + chalk.bold('  agentic-crew doctor\n'));
  for (const line of ok) {
    console.log(chalk.green('  ✓ ') + line);
  }
  for (const line of warnings) {
    console.log(chalk.yellow('  ⚠ ') + line);
  }
  for (const line of issues) {
    console.log(chalk.red('  ✗ ') + line);
  }
  if (issues.length === 0) {
    console.log('\n' + chalk.green.bold('  All checks passed.\n'));
  } else {
    console.log(
      '\n' +
        chalk.yellow(`  ${issues.length} issue(s) found. Run \`agentic-crew init --force\` or \`/setup\` to repair.\n`)
    );
  }
}

module.exports = { runDoctor };
