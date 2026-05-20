const { PACKAGE_VERSION } = require('./constants');
const { PRESET_KEYS } = require('./presets');
const { IDE_TARGETS, COMMAND_TARGET_KEYS } = require('./targets');

const SCHEMA_VERSION = 1;
const VALID_PRESETS = new Set(PRESET_KEYS);
const VALID_THEMES = new Set(['phoenix', 'professional']);
const VALID_TARGET_TOKENS = new Set([...IDE_TARGETS, ...COMMAND_TARGET_KEYS]);

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
  if (manifest.preset != null && !VALID_PRESETS.has(manifest.preset)) {
    issues.push(`Manifest preset "${manifest.preset}" is invalid. Use: ${[...VALID_PRESETS].join(', ')}`);
  }
  if (manifest.theme != null && !VALID_THEMES.has(manifest.theme)) {
    issues.push(`Manifest theme "${manifest.theme}" is invalid. Use: phoenix, professional`);
  }
  const targets = manifest.targets;
  if (targets != null) {
    const tokens = Array.isArray(targets) ? targets : [targets];
    for (const t of tokens) {
      if (!VALID_TARGET_TOKENS.has(String(t).toLowerCase())) {
        issues.push(`Manifest target "${t}" is invalid. Use: ${IDE_TARGETS.join(', ')}`);
      }
    }
  }
  return issues;
}

module.exports = {
  SCHEMA_VERSION,
  migrateManifest,
  buildManifest,
  validateManifestStructure,
};
