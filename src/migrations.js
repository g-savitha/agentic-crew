const { SCHEMA_VERSION } = require('./manifest');

/**
 * Apply structural manifest migrations (never changes agent roster).
 * @param {object} manifest
 * @returns {{ manifest: object, applied: string[] }}
 */
function runManifestMigrations(manifest) {
  const applied = [];
  const next = { ...manifest };

  if (next.schemaVersion == null) {
    next.schemaVersion = 1;
    applied.push('set schemaVersion=1');
  }

  if (!next.commandHashes) {
    next.commandHashes = {};
    applied.push('init commandHashes');
  }

  if (!next.preset) {
    next.preset = 'full';
    applied.push('set preset=full');
  }

  if (!next.supplementaryFiles) {
    next.supplementaryFiles = [];
    applied.push('init supplementaryFiles');
  }

  if (!next.commandDirs && next.targets) {
    next.commandDirs = [];
    applied.push('init commandDirs');
  }

  if (next.schemaVersion < SCHEMA_VERSION) {
    next.schemaVersion = SCHEMA_VERSION;
    applied.push(`bump schemaVersion to ${SCHEMA_VERSION}`);
  }

  return { manifest: next, applied };
}

module.exports = { runManifestMigrations };
