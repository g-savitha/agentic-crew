const { scaffold, printManifest, loadTemplate } = require('./scaffolder');
const { runDoctor } = require('./doctor');
const { runUpdate } = require('./update');
const { runUninstall } = require('./uninstall');
const { resolveAllAgents, validateCustomRoles } = require('./agents');
const { answersFromOptions } = require('./options');
const { parseCustomRoles } = require('./options-parsers');
const { runQuestionnaire } = require('./questionnaire');
const {
  PACKAGE_VERSION,
  MANIFEST_FILENAME,
  THEMES,
  catalogCommandForTheme,
} = require('./constants');
const { IDE_TARGETS } = require('./targets');
const { migrateManifest, buildManifest, validateManifestStructure, SCHEMA_VERSION } = require('./manifest');
const { pruneStaleFiles } = require('./prune');
const { PRESETS, PRESET_KEYS, resolvePreset, applyPresetFilter } = require('./presets');
const { loadProjectConfig, mergeConfigWithOptions, configExampleYaml } = require('./config');
const { getThemePack, applyThemePack, THEME_PACKS } = require('./themes');

module.exports = {
  scaffold,
  printManifest,
  loadTemplate,
  runDoctor,
  runUpdate,
  runUninstall,
  runQuestionnaire,
  answersFromOptions,
  parseCustomRoles,
  resolveAllAgents,
  validateCustomRoles,
  migrateManifest,
  buildManifest,
  validateManifestStructure,
  pruneStaleFiles,
  resolvePreset,
  applyPresetFilter,
  loadProjectConfig,
  mergeConfigWithOptions,
  configExampleYaml,
  getThemePack,
  applyThemePack,
  THEME_PACKS,
  PACKAGE_VERSION,
  SCHEMA_VERSION,
  MANIFEST_FILENAME,
  THEMES,
  IDE_TARGETS,
  PRESETS,
  PRESET_KEYS,
  catalogCommandForTheme,
};
