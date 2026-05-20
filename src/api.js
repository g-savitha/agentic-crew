const { scaffold, printManifest, loadTemplate, previewCommandFiles } = require('./scaffolder');
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
const { validateManifestSchema } = require('./manifest-schema-validator');
const { pruneStaleFiles } = require('./prune');
const { validateHeartbeatContent } = require('./heartbeat');
const { validateStatusContent } = require('./status');
const { validateCatalogContent } = require('./catalog');
const { resolveCatalogAgentGroups, documentationInboxFor } = require('./agents');
const { writeStarterRunbooks, RUNBOOK_SPECS } = require('./runbooks');
const { PRESETS, PRESET_KEYS, resolvePreset, applyPresetFilter } = require('./presets');
const { loadProjectConfig, mergeConfigWithOptions, configExampleYaml } = require('./config');
const { getThemePack, applyThemePack, THEME_PACKS, PHOENIX } = require('./themes');
const { runManifestMigrations } = require('./migrations');
const { planUpdateChanges } = require('./plan-update');
const { appendGitignoreRecommendations } = require('./gitignore');

module.exports = {
  scaffold,
  printManifest,
  loadTemplate,
  previewCommandFiles,
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
  validateManifestSchema,
  pruneStaleFiles,
  validateHeartbeatContent,
  validateStatusContent,
  validateCatalogContent,
  resolveCatalogAgentGroups,
  documentationInboxFor,
  writeStarterRunbooks,
  RUNBOOK_SPECS,
  resolvePreset,
  applyPresetFilter,
  loadProjectConfig,
  mergeConfigWithOptions,
  configExampleYaml,
  getThemePack,
  applyThemePack,
  THEME_PACKS,
  PHOENIX,
  runManifestMigrations,
  planUpdateChanges,
  appendGitignoreRecommendations,
  PACKAGE_VERSION,
  SCHEMA_VERSION,
  MANIFEST_FILENAME,
  THEMES,
  IDE_TARGETS,
  PRESETS,
  PRESET_KEYS,
  catalogCommandForTheme,
};
