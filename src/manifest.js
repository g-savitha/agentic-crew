const { PACKAGE_VERSION } = require('./constants');

const SCHEMA_VERSION = 1;

/**
 * Apply forward-compatible defaults to a manifest read from disk.
 * @param {object} manifest
 * @returns {object}
 */
function migrateManifest(manifest) {
  const migrated = { ...manifest };
  if (migrated.schemaVersion == null) {
    migrated.schemaVersion = 1;
  }
  if (!migrated.commandHashes) {
    migrated.commandHashes = {};
  }
  if (!migrated.commandDirs && migrated.targets) {
    migrated.commandDirs = [];
  }
  return migrated;
}

/**
 * @param {object} base
 * @returns {object}
 */
function buildManifest(base) {
  return {
    schemaVersion: SCHEMA_VERSION,
    packageVersion: PACKAGE_VERSION,
    ...base,
  };
}

/**
 * Lightweight manifest validation (structural checks only).
 * @param {object} manifest
 * @returns {string[]} issues
 */
function validateManifestStructure(manifest) {
  const issues = [];
  if (!manifest || typeof manifest !== 'object') {
    issues.push('Manifest is not a valid object.');
    return issues;
  }
  if (!Array.isArray(manifest.agents) || manifest.agents.length === 0) {
    issues.push('Manifest missing agents array.');
  }
  if (!manifest.project?.name) {
    issues.push('Manifest missing project.name.');
  }
  if (manifest.schemaVersion != null && manifest.schemaVersion > SCHEMA_VERSION) {
    issues.push(
      `Manifest schemaVersion ${manifest.schemaVersion} is newer than CLI supports (${SCHEMA_VERSION}).`
    );
  }
  return issues;
}

module.exports = {
  SCHEMA_VERSION,
  migrateManifest,
  buildManifest,
  validateManifestStructure,
};
