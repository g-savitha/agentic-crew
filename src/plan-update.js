const path = require('path');
const fs = require('fs-extra');
const { hashContent } = require('./hash');
const { relativeCommandPath } = require('./utils');
const { previewCommandFiles } = require('./scaffolder');

/**
 * Plan which command files would change on update without writing.
 * @param {string} root
 * @param {object} answers
 * @param {object} manifest
 * @param {{ forceOverwrite?: boolean }} [options]
 */
async function planUpdateChanges(root, answers, manifest, options = {}) {
  const { forceOverwrite = false } = options;
  const commandHashes = manifest.commandHashes || {};
  const rendered = await previewCommandFiles(answers, { isUpdate: true });

  const wouldUpdate = [];
  const wouldPreserve = [];

  for (const item of rendered) {
    const filePath = path.join(root, item.rel);
    const newHash = hashContent(item.content);

    if (!(await fs.pathExists(filePath))) {
      wouldUpdate.push({ path: item.rel, action: 'create' });
      continue;
    }

    const existing = await fs.readFile(filePath, 'utf8');
    const existingHash = hashContent(existing);
    const storedHash = commandHashes[item.rel];

    if (existingHash === newHash) {
      continue;
    }

    if (forceOverwrite) {
      wouldUpdate.push({ path: item.rel, action: 'update', reason: 'force-overwrite' });
      continue;
    }

    if (storedHash && existingHash !== storedHash) {
      wouldPreserve.push({ path: item.rel, action: 'preserve', reason: 'user-edited' });
      continue;
    }

    if (!storedHash && existingHash !== newHash) {
      wouldPreserve.push({ path: item.rel, action: 'preserve', reason: 'legacy-untracked-edit' });
      continue;
    }

    wouldUpdate.push({ path: item.rel, action: 'update', reason: 'template-changed' });
  }

  return { wouldUpdate, wouldPreserve };
}

module.exports = { planUpdateChanges };
