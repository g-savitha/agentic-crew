const path = require('path');
const fs = require('fs-extra');
const { MANIFEST_FILENAME } = require('./constants');
const { migrateManifest } = require('./manifest');
const { resolveSafeProjectDir } = require('./utils');

/**
 * Remove agentic-crew scaffold artifacts from a project.
 * @param {string} [projectDir]
 * @param {{ keepState?: boolean, dryRun?: boolean }} [options]
 */
async function runUninstall(projectDir = '.', options = {}) {
  const { keepState = false, dryRun = false } = options;
  const root = resolveSafeProjectDir(projectDir);
  const manifestPath = path.join(root, MANIFEST_FILENAME);

  if (!(await fs.pathExists(manifestPath))) {
    throw new Error(`No ${MANIFEST_FILENAME} found in ${root}. Nothing to uninstall.`);
  }

  const raw = await fs.readJson(manifestPath);
  const manifest = migrateManifest(raw);
  const removed = [];

  async function removeTarget(targetPath) {
    const rel = path.relative(root, targetPath).replace(/\\/g, '/');
    if (!(await fs.pathExists(targetPath))) return;
    if (!removed.includes(rel)) removed.push(rel);
    if (!dryRun) {
      await fs.remove(targetPath);
    }
  }

  const commandDirs = (manifest.commandDirs || []).map((d) => path.join(root, d));
  const trackedCommands = new Set(Object.keys(manifest.commandHashes || {}));

  for (const rel of trackedCommands) {
    await removeTarget(path.join(root, rel));
  }

  for (const commandsDir of commandDirs) {
    for (const agent of manifest.agents || []) {
      await removeTarget(path.join(commandsDir, `${agent.file}.md`));
      if (agent.command && agent.command !== agent.file) {
        await removeTarget(path.join(commandsDir, `${agent.command}.md`));
      }
    }
    for (const role of manifest.customRoles || []) {
      await removeTarget(path.join(commandsDir, `${role.file}.md`));
      if (role.command && role.command !== role.file) {
        await removeTarget(path.join(commandsDir, `${role.command}.md`));
      }
    }
    await removeTarget(path.join(commandsDir, 'setup.md'));
    await removeTarget(path.join(commandsDir, 'team.md'));
    const catalog = manifest.catalogCommand || 'lumos';
    await removeTarget(path.join(commandsDir, `${catalog}.md`));
    await removeTarget(path.join(commandsDir, catalog === 'help' ? 'lumos.md' : 'help.md'));
  }

  for (const rel of manifest.supplementaryFiles || []) {
    await removeTarget(path.join(root, rel));
  }

  await removeTarget(path.join(root, 'AGENTS.md'));
  await removeTarget(path.join(root, '.cursor', 'rules', 'agentic-crew.mdc'));
  await removeTarget(path.join(root, '.agentic-crew.yaml'));
  await removeTarget(manifestPath);

  const docsPaths = [
    path.join(root, 'docs', 'wiki', '11-troubleshooting.md'),
    path.join(root, 'docs', 'adr', 'template.md'),
    path.join(root, 'docs', 'runbooks', '.gitkeep'),
    path.join(root, '.agent', 'README.md'),
  ];
  for (const docPath of docsPaths) {
    await removeTarget(docPath);
  }
  for (const sub of ['wiki', 'adr', 'runbooks']) {
    const dir = path.join(root, 'docs', sub);
    if (await fs.pathExists(dir)) {
      const entries = await fs.readdir(dir);
      if (entries.length === 0) {
        await removeTarget(dir);
      }
    }
  }
  const docsDir = path.join(root, 'docs');
  if (await fs.pathExists(docsDir)) {
    const entries = await fs.readdir(docsDir);
    if (entries.length === 0) {
      await removeTarget(docsDir);
    }
  }

  if (manifest.withSecurityCi) {
    await removeTarget(path.join(root, '.github', 'workflows', 'security.yml'));
  }

  if (!keepState) {
    await removeTarget(path.join(root, '.agent'));
  }

  return { removed, keepState, dryRun, root };
}

module.exports = { runUninstall };
