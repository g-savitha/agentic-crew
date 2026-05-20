const { scaffold, printManifest, loadTemplate } = require('./scaffolder');
const { runDoctor } = require('./doctor');
const { runUpdate } = require('./update');
const { runUninstall } = require('./uninstall');
const { resolveAllAgents, validateCustomRoles } = require('./agents');
const { answersFromOptions } = require('./options');
const { runQuestionnaire } = require('./questionnaire');
const {
  PACKAGE_VERSION,
  MANIFEST_FILENAME,
  THEMES,
  IDE_TARGETS,
  catalogCommandForTheme,
} = require('./constants');
const { migrateManifest, buildManifest, validateManifestStructure, SCHEMA_VERSION } = require('./manifest');
const { pruneStaleFiles } = require('./prune');
const { PRESETS, PRESET_KEYS, resolvePreset, applyPresetFilter } = require('./presets');

module.exports = {
  scaffold,
  printManifest,
  loadTemplate,
  runDoctor,
  runUpdate,
  runUninstall,
  runQuestionnaire,
  answersFromOptions,
  resolveAllAgents,
  validateCustomRoles,
  migrateManifest,
  buildManifest,
  validateManifestStructure,
  pruneStaleFiles,
  resolvePreset,
  applyPresetFilter,
  PACKAGE_VERSION,
  SCHEMA_VERSION,
  MANIFEST_FILENAME,
  THEMES,
  IDE_TARGETS,
  PRESETS,
  PRESET_KEYS,
  catalogCommandForTheme,
};
