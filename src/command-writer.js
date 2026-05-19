const path = require('path');
const fs = require('fs-extra');
const { hashContent } = require('./hash');
const { relativeCommandPath } = require('./utils');

/**
 * @param {string} filePath
 * @param {string} outputDir
 */
async function backupCommandFile(filePath, outputDir) {
  const rel = relativeCommandPath(filePath, outputDir);
  const backupRoot = path.join(outputDir, '.agentic-crew.bak', 'commands');
  const dest = path.join(backupRoot, rel);
  await fs.ensureDir(path.dirname(dest));
  await fs.copy(filePath, dest, { overwrite: true });
}

/**
 * Write a command skill file, preserving user edits on update when hashes differ.
 * @param {object} params
 * @param {string} params.filePath
 * @param {string} params.content
 * @param {string} params.outputDir
 * @param {Record<string, string>} params.commandHashes
 * @param {{ forceOverwrite?: boolean, backup?: boolean, isUpdate?: boolean }} params.options
 * @param {string[]} params.skipped
 * @returns {Promise<{ written: boolean, rel: string }>}
 */
async function writeTrackedCommandFile({ filePath, content, outputDir, commandHashes, options, skipped }) {
  const rel = relativeCommandPath(filePath, outputDir);
  const newHash = hashContent(content);
  const { forceOverwrite = false, backup = false, isUpdate = false } = options;

  if (await fs.pathExists(filePath)) {
    const existing = await fs.readFile(filePath, 'utf8');
    const existingHash = hashContent(existing);
    const storedHash = commandHashes[rel];

    if (isUpdate && !forceOverwrite) {
      if (storedHash && existingHash !== storedHash) {
        skipped.push(rel);
        return { written: false, rel };
      }
      if (!storedHash && existingHash !== newHash) {
        skipped.push(rel);
        return { written: false, rel };
      }
    }

    if (backup) {
      await backupCommandFile(filePath, outputDir);
    }
  }

  await fs.writeFile(filePath, content);
  commandHashes[rel] = newHash;
  return { written: true, rel };
}

module.exports = { writeTrackedCommandFile, backupCommandFile };
