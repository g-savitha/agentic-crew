const path = require('path');
const fs = require('fs-extra');
const Handlebars = require('handlebars');
const { writeTrackedCommandFile } = require('./command-writer');
const { resolveThemePack } = require('./theme-loader');

/**
 * Write AGENTS.md and Cursor rules that point at the agent team protocol.
 * @param {object} params
 */
async function writeSupplementaryOutputs({
  outputDir,
  supplementary,
  baseContext,
  allAgents,
  theme,
  loadTemplate,
  writerParams,
  overwriteGeneratedDocs,
}) {
  const written = [];

  if (supplementary.agentsMd) {
    const tpl = loadTemplate('supplementary/AGENTS.md.hbs');
    const content = tpl({
      ...baseContext,
      allAgents,
      themePack: resolveThemePack(theme, { cwd: outputDir }),
    });
    if (overwriteGeneratedDocs || !(await fs.pathExists(supplementary.agentsMd))) {
      await fs.writeFile(supplementary.agentsMd, content);
      written.push(path.relative(outputDir, supplementary.agentsMd).replace(/\\/g, '/'));
    }
  }

  if (supplementary.cursorRule) {
    const tpl = loadTemplate('supplementary/cursor-rule.mdc.hbs');
    const content = tpl({
      ...baseContext,
      allAgents,
      themePack: resolveThemePack(theme, { cwd: outputDir }),
    });
    await fs.ensureDir(path.dirname(supplementary.cursorRule));
    if (overwriteGeneratedDocs || !(await fs.pathExists(supplementary.cursorRule))) {
      await fs.writeFile(supplementary.cursorRule, content);
      written.push(path.relative(outputDir, supplementary.cursorRule).replace(/\\/g, '/'));
    }
  }

  return written;
}

/**
 * Write /team router skill to each command directory.
 * @param {object} params
 */
async function writeTeamRouter({ commandDirs, baseContext, allAgents, theme, loadTemplate, writerParams }) {
  const tpl = loadTemplate('commands/team.md.hbs');
  const content = tpl({
    ...baseContext,
    allAgents,
    themePack: resolveThemePack(theme, { cwd: baseContext.outputDir || '.' }),
    startAgent: resolveThemePack(theme, { cwd: baseContext.outputDir || '.' }).startCommand,
  });

  for (const commandsDir of commandDirs) {
    await writeTrackedCommandFile({
      filePath: path.join(commandsDir, 'team.md'),
      content,
      ...writerParams,
    });
  }
}

module.exports = { writeSupplementaryOutputs, writeTeamRouter };
