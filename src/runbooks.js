const path = require('path');
const fs = require('fs-extra');

const RUNBOOK_SPECS = [
  { file: 'release.md', template: 'docs/runbooks/release.md.hbs' },
  { file: 'on-call.md', template: 'docs/runbooks/on-call.md.hbs' },
  { file: 'incident.md', template: 'docs/runbooks/incident.md.hbs' },
];

/**
 * Write starter runbooks referenced by DevOps/SRE skills.
 * @param {object} params
 * @param {string} params.runbooksDir
 * @param {function(string): HandlebarsTemplateDelegate} params.loadTemplate
 * @param {object} params.baseContext
 * @param {boolean} [params.overwrite]
 * @returns {Promise<string[]>} relative paths written
 */
async function writeStarterRunbooks({ runbooksDir, loadTemplate, baseContext, overwrite = false }) {
  const written = [];
  await fs.ensureDir(runbooksDir);

  for (const spec of RUNBOOK_SPECS) {
    const dest = path.join(runbooksDir, spec.file);
    if (!overwrite && (await fs.pathExists(dest))) continue;
    const tpl = loadTemplate(spec.template);
    await fs.writeFile(dest, tpl(baseContext));
    written.push(`docs/runbooks/${spec.file}`);
  }

  return written;
}

module.exports = { RUNBOOK_SPECS, writeStarterRunbooks };
