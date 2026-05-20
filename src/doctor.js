const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { MANIFEST_FILENAME, PACKAGE_VERSION } = require('./constants');
const { migrateManifest, validateManifestStructure } = require('./manifest');
const { hashContent } = require('./hash');
const { resolveCommandDirs, resolveSafeProjectDir, relativeCommandPath } = require('./utils');
const { scaffold } = require('./scaffolder');
const { resolvePreset } = require('./presets');

/**
 * @param {object} manifest
 * @param {string} root
 */
function manifestToAnswers(manifest, root) {
  const presetDef = resolvePreset(manifest.preset || 'full');
  return {
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
      trait: r.trait || 'Custom',
      description: r.description || '',
    })),
    outputDir: root,
    theme: manifest.theme || presetDef.theme || 'phoenix',
    targets: manifest.targets || 'both',
    preset: presetDef.key,
    presetExcludeFiles: presetDef.excludeFiles,
  };
}

/**
 * @param {string} content
 * @returns {boolean}
 */
function isValidMessageFrontmatter(content) {
  if (!content || !content.trim()) return true;
  if (/^---\n---\n?$/.test(content)) return true;
  if (!content.startsWith('---\n')) return true;
  const end = content.indexOf('\n---\n', 4);
  if (end === -1) return false;
  const block = content.slice(4, end);
  if (!block.trim()) return true;
  const required = ['from', 'to', 'date', 'subject'];
  return required.every((key) => new RegExp(`^${key}:`, 'm').test(block));
}

/**
 * @param {string} [projectDir]
 * @param {{ fix?: boolean, json?: boolean, quiet?: boolean }} [options]
 */
async function runDoctor(projectDir = '.', options = {}) {
  const { fix = false, json = false, quiet = false } = options;
  const root = resolveSafeProjectDir(projectDir);
  const manifestPath = path.join(root, MANIFEST_FILENAME);
  const issues = [];
  const ok = [];
  const warnings = [];
  const drift = [];

  if (!(await fs.pathExists(manifestPath))) {
    issues.push(`Missing ${MANIFEST_FILENAME} — run \`agentic-crew init\` in this directory.`);
    const result = { ok: false, issues, warnings, drift, fixed: [] };
    if (json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      printReport(ok, warnings, issues, drift, quiet);
    }
    return result;
  }

  const raw = await fs.readJson(manifestPath);
  const manifest = migrateManifest(raw);
  ok.push(`Found ${MANIFEST_FILENAME} (schema v${manifest.schemaVersion}, package ${manifest.packageVersion || 'unknown'})`);

  for (const line of validateManifestStructure(manifest)) {
    issues.push(line);
  }

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

  const commandDirs = manifest.commandDirs?.length
    ? manifest.commandDirs.map((d) => path.join(root, d))
    : resolveCommandDirs(manifest.targets || 'both', root);

  const commandHashes = manifest.commandHashes || {};

  for (const agent of manifest.agents || []) {
    const statusFile = path.join(agentDir, 'status', `${agent.file}.md`);
    const messageFile = path.join(agentDir, 'messages', `${agent.file}.md`);
    if (!(await fs.pathExists(statusFile))) {
      issues.push(`Missing status file: .agent/status/${agent.file}.md`);
    }
    if (!(await fs.pathExists(messageFile))) {
      issues.push(`Missing message file: .agent/messages/${agent.file}.md`);
    } else {
      const messageContent = await fs.readFile(messageFile, 'utf8');
      if (messageContent.trim() && !isValidMessageFrontmatter(messageContent)) {
        warnings.push(
          `Message file .agent/messages/${agent.file}.md has content without valid frontmatter (from/to/date/subject).`
        );
      }
    }
    for (const commandsDir of commandDirs) {
      const skillFile = path.join(commandsDir, `${agent.file}.md`);
      if (!(await fs.pathExists(skillFile))) {
        issues.push(`Missing skill file: ${path.relative(root, skillFile)}`);
      } else {
        const rel = relativeCommandPath(skillFile, root);
        const stored = commandHashes[rel];
        if (stored) {
          const current = hashContent(await fs.readFile(skillFile, 'utf8'));
          if (current !== stored) {
            drift.push(`${rel} (hash drift — file changed since last scaffold/update)`);
          }
        }
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

  for (const commandsDir of commandDirs) {
    const teamFile = path.join(commandsDir, 'team.md');
    if (!(await fs.pathExists(teamFile))) {
      issues.push(`Missing team router: ${path.relative(root, teamFile)}`);
    } else {
      ok.push(`team.md present (${path.relative(root, commandsDir)})`);
    }
  }

  for (const rel of manifest.supplementaryFiles || []) {
    const full = path.join(root, rel);
    if (!(await fs.pathExists(full))) {
      issues.push(`Missing supplementary file: ${rel}`);
    } else {
      ok.push(`Supplementary file present: ${rel}`);
    }
  }

  if (fix && issues.length > 0) {
    const answers = manifestToAnswers(manifest, root);
    await scaffold(answers, {
      isUpdate: true,
      force: false,
      forceOverwrite: false,
      prune: true,
      quiet: true,
    });
    return runDoctor(root, { fix: false, json, quiet });
  }

  const result = {
    ok: issues.length === 0,
    issues,
    warnings,
    drift,
    fixed: fix ? [] : [],
    manifest,
    root,
  };

  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printReport(ok, warnings, issues, drift, quiet);
  }

  return result;
}

function printReport(ok, warnings, issues, drift, quiet) {
  if (quiet) return;
  console.log('\n' + chalk.bold('  agentic-crew doctor\n'));
  for (const line of ok) {
    console.log(chalk.green('  ✓ ') + line);
  }
  for (const line of warnings) {
    console.log(chalk.yellow('  ⚠ ') + line);
  }
  for (const line of drift) {
    console.log(chalk.yellow('  ⚠ Hash drift: ') + line);
  }
  for (const line of issues) {
    console.log(chalk.red('  ✗ ') + line);
  }
  if (issues.length === 0) {
    console.log('\n' + chalk.green.bold('  All checks passed.\n'));
  } else {
    console.log(
      '\n' +
        chalk.yellow(
          `  ${issues.length} issue(s) found. Run \`agentic-crew doctor --fix\`, \`agentic-crew init --force\`, or \`/setup\` to repair.\n`
        )
    );
  }
}

module.exports = { runDoctor, manifestToAnswers, isValidMessageFrontmatter };
