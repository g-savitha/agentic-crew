const path = require('path');
const fs = require('fs-extra');
const { catalogCommandForTheme } = require('./constants');

/**
 * Build the set of command filenames that should exist for the current roster.
 * @param {import('./agents').AgentDefinition[]} allAgents
 * @param {string} theme
 * @param {string} [catalogCommand] manifest catalog command (lumos, help, or external)
 * @returns {Set<string>}
 */
function expectedCommandFilenames(allAgents, theme, catalogCommand) {
  const catalogCmd = catalogCommand || catalogCommandForTheme(theme);
  const expected = new Set([`setup.md`, `${catalogCmd}.md`]);
  for (const agent of allAgents) {
    expected.add(`${agent.file}.md`);
    if (agent.command && agent.command !== agent.file) {
      expected.add(`${agent.command}.md`);
    }
  }
  return expected;
}

/**
 * Remove command skill files and agent state files no longer in the manifest roster.
 * @param {object} params
 * @param {string} params.outputDir
 * @param {string[]} params.commandDirs
 * @param {import('./agents').AgentDefinition[]} params.allAgents
 * @param {string} params.theme
 * @param {string} [params.catalogCommand]
 * @param {string} params.agentDir
 * @param {boolean} [params.dryRun]
 * @returns {Promise<string[]>} relative paths removed (or would be removed)
 */
async function pruneStaleFiles({
  outputDir,
  commandDirs,
  allAgents,
  theme,
  catalogCommand,
  agentDir,
  dryRun = false,
}) {
  const expected = expectedCommandFilenames(allAgents, theme, catalogCommand);
  expected.add('team.md');
  const expectedAgentSlugs = new Set(allAgents.map((a) => a.file));
  const removed = [];

  for (const commandsDir of commandDirs) {
    if (!(await fs.pathExists(commandsDir))) continue;
    for (const entry of await fs.readdir(commandsDir)) {
      if (!entry.endsWith('.md')) continue;
      if (expected.has(entry)) continue;
      const rel = path.relative(outputDir, path.join(commandsDir, entry)).replace(/\\/g, '/');
      removed.push(rel);
      if (!dryRun) {
        await fs.remove(path.join(commandsDir, entry));
      }
    }
  }

  for (const sub of ['status', 'messages']) {
    const dir = path.join(agentDir, sub);
    if (!(await fs.pathExists(dir))) continue;
    for (const entry of await fs.readdir(dir)) {
      if (!entry.endsWith('.md')) continue;
      const slug = entry.replace(/\.md$/, '');
      if (expectedAgentSlugs.has(slug)) continue;
      const rel = path.relative(outputDir, path.join(dir, entry)).replace(/\\/g, '/');
      removed.push(rel);
      if (!dryRun) {
        await fs.remove(path.join(dir, entry));
      }
    }
  }

  return removed;
}

module.exports = { expectedCommandFilenames, pruneStaleFiles };
