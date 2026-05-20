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
 * Validate manifest against schema/manifest.schema.json.
 * @param {object} manifest
 * @returns {string[]} issues
 */
function validateManifestStructure(manifest) {
  const { validateManifestSchema } = require('./manifest-schema-validator');
  return validateManifestSchema(manifest);
}

module.exports = {
  SCHEMA_VERSION,
  migrateManifest,
  buildManifest,
  validateManifestStructure,
};
