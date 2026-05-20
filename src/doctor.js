const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { MANIFEST_FILENAME, PACKAGE_VERSION, THEMES } = require('./constants');
const { migrateManifest, validateManifestStructure } = require('./manifest');
const { hashContent } = require('./hash');
const { resolveCommandDirs, resolveSafeProjectDir, relativeCommandPath } = require('./utils');
const { scaffold } = require('./scaffolder');
const { resolvePreset } = require('./presets');
const { validateHeartbeatContent } = require('./heartbeat');
const { validateStatusContent } = require('./status');
const { validateCatalogContent } = require('./catalog');
const { catalogCommandForTheme } = require('./constants');
const { RUNBOOK_SPECS } = require('./runbooks');
const { resolveAllAgents } = require('./agents');

/**
 * @param {object} manifest
 * @param {string} root
 */
function manifestToAnswers(manifest, root) {
  const presetDef = resolvePreset(manifest.preset || 'startup');
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
    theme: manifest.theme || 'phoenix',
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
 * @param {{ fix?: boolean, prune?: boolean, strict?: boolean, json?: boolean, quiet?: boolean }} [options]
 */
async function runDoctor(projectDir = '.', options = {}) {
  const { fix = false, prune = false, strict = false, json = false, quiet = false } = options;
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

  if (manifest.theme && !THEMES.includes(manifest.theme)) {
    const msg = `Manifest theme "${manifest.theme}" is not supported. Use: ${THEMES.join(', ')} (custom theme packs ship in a future release)`;
    if (strict) issues.push(msg);
    else warnings.push(msg);
  }

  const expectedAgents = resolveAllAgents(manifestToAnswers(manifest, root));
  const manifestAgentFiles = new Set((manifest.agents || []).map((a) => a.file));
  for (const agent of expectedAgents) {
    if (!manifestAgentFiles.has(agent.file)) {
      const msg = `Manifest missing agent "${agent.file}" for current stacks/preset`;
      if (strict) issues.push(msg);
      else warnings.push(msg);
    }
  }

  const manifestAgents = manifest.agents || [];
  for (const agent of manifestAgents) {
    if (!expectedAgents.some((e) => e.file === agent.file)) {
      const msg = `Manifest lists agent "${agent.file}" not in current stacks/preset roster`;
      if (strict) issues.push(msg);
      else warnings.push(msg);
    }
  }

  for (const agent of expectedAgents) {
    const statusFile = path.join(agentDir, 'status', `${agent.file}.md`);
    const messageFile = path.join(agentDir, 'messages', `${agent.file}.md`);
    if (!(await fs.pathExists(statusFile))) {
      issues.push(`Missing status file: .agent/status/${agent.file}.md`);
    } else if (strict) {
      const statusContent = await fs.readFile(statusFile, 'utf8');
      const st = validateStatusContent(statusContent);
      if (!st.valid) {
        issues.push(`Status file .agent/status/${agent.file}.md invalid: ${st.reason}`);
      }
    }
    if (!(await fs.pathExists(messageFile))) {
      issues.push(`Missing message file: .agent/messages/${agent.file}.md`);
    } else {
      const messageContent = await fs.readFile(messageFile, 'utf8');
      if (messageContent.trim() && !isValidMessageFrontmatter(messageContent)) {
        const msg = `Message file .agent/messages/${agent.file}.md has content without valid frontmatter (from/to/date/subject).`;
        if (strict) issues.push(msg);
        else warnings.push(msg);
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

  const catalogCmd = manifest.catalogCommand || catalogCommandForTheme(manifest.theme || 'phoenix');
  for (const commandsDir of commandDirs) {
    const catalogPath = path.join(commandsDir, `${catalogCmd}.md`);
    if (!(await fs.pathExists(catalogPath))) {
      issues.push(`Missing catalog skill: ${path.relative(root, catalogPath)}`);
      continue;
    }
    const catalogContent = await fs.readFile(catalogPath, 'utf8');
    const catalogIssues = validateCatalogContent(catalogContent, {
      agents: expectedAgents.map((a) => ({ file: a.file, command: a.command || null })),
      catalogCommand: catalogCmd,
    });
    for (const line of catalogIssues) {
      const msg = `Catalog ${path.relative(root, catalogPath)}: ${line}`;
      if (strict) issues.push(msg);
      else warnings.push(msg);
    }
    if (catalogIssues.length === 0) {
      ok.push(`Catalog matches roster (${path.relative(root, catalogPath)})`);
    }
  }

  const retro = path.join(agentDir, 'reports', 'retro.md');
  if (!(await fs.pathExists(retro))) {
    const msg = 'Missing .agent/reports/retro.md';
    if (strict) issues.push(msg);
    else warnings.push(msg);
  } else {
    ok.push('retro.md present');
  }

  const heartbeat = path.join(agentDir, 'reports', 'heartbeat.md');
  if (!(await fs.pathExists(heartbeat))) {
    issues.push('Missing .agent/reports/heartbeat.md');
  } else {
    const heartbeatContent = await fs.readFile(heartbeat, 'utf8');
    const hb = validateHeartbeatContent(heartbeatContent);
    if (hb.valid) {
      ok.push('heartbeat.md present (structured frontmatter)');
    } else {
      const msg = `heartbeat.md invalid: ${hb.reason} — Manager should overwrite with updated/blockers/decisions_needed/accomplishments`;
      if (strict) issues.push(msg);
      else warnings.push(msg);
    }
  }

  for (const spec of RUNBOOK_SPECS) {
    const runbookPath = path.join(root, 'docs', 'runbooks', spec.file);
    if (!(await fs.pathExists(runbookPath))) {
      const msg = `Missing starter runbook: docs/runbooks/${spec.file}`;
      if (strict) issues.push(msg);
      else warnings.push(msg);
    } else {
      ok.push(`Runbook present: docs/runbooks/${spec.file}`);
    }
  }

  const backlog = path.join(agentDir, 'backlog', 'tasks.md');
  if (!(await fs.pathExists(backlog))) {
    issues.push('Missing .agent/backlog/tasks.md');
  } else {
    ok.push('backlog/tasks.md present');
  }

  if (manifest.withSecurityCi) {
    const workflow = path.join(root, '.github', 'workflows', 'security.yml');
    if (!(await fs.pathExists(workflow))) {
      const msg = 'Manifest expects security CI but .github/workflows/security.yml is missing';
      if (strict) issues.push(msg);
      else warnings.push(msg);
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

  if (fix && (issues.length > 0 || prune)) {
    const fixedIssues = [...issues];
    const answers = manifestToAnswers(manifest, root);
    await scaffold(answers, {
      isUpdate: true,
      force: false,
      forceOverwrite: false,
      prune,
      quiet: true,
    });
    const after = await runDoctor(root, { fix: false, json, quiet });
    after.fixed = fixedIssues;
    return after;
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
  console.error('\n' + chalk.bold('  agentic-crew doctor\n'));
  for (const line of ok) {
    console.error(chalk.green('  ✓ ') + line);
  }
  for (const line of warnings) {
    console.error(chalk.yellow('  ⚠ ') + line);
  }
  for (const line of drift) {
    console.error(chalk.yellow('  ⚠ Hash drift: ') + line);
  }
  for (const line of issues) {
    console.error(chalk.red('  ✗ ') + line);
  }
  if (issues.length === 0) {
    console.error('\n' + chalk.green.bold('  All checks passed.\n'));
  } else {
    console.error(
      '\n' +
        chalk.yellow(
          `  ${issues.length} issue(s) found. Run \`agentic-crew doctor --fix\` (add \`--prune\` to remove stale roster files), \`agentic-crew init --force\`, or \`/setup\` to repair.\n`
        )
    );
  }
}

module.exports = { runDoctor, manifestToAnswers, isValidMessageFrontmatter };
