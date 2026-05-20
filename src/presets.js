const PRESETS = {
  full: {
    label: 'Full team (default)',
    theme: null,
    excludeFiles: [],
  },
  minimal: {
    label: 'Minimal — core delivery roles only',
    theme: null,
    excludeFiles: ['marketing', 'researcher', 'release-manager', 'perf'],
  },
  enterprise: {
    label: 'Enterprise — professional theme, lean roster',
    theme: 'professional',
    excludeFiles: ['marketing'],
  },
};

const PRESET_KEYS = Object.keys(PRESETS);

/**
 * @param {string | undefined} preset
 * @returns {{ key: string, excludeFiles: Set<string>, theme: string | null }}
 */
function resolvePreset(preset) {
  const key = (preset || 'full').toLowerCase();
  if (!PRESETS[key]) {
    throw new Error(`Invalid --preset "${preset}". Use: ${PRESET_KEYS.join(', ')}`);
  }
  const def = PRESETS[key];
  return {
    key,
    excludeFiles: new Set(def.excludeFiles),
    theme: def.theme,
  };
}

/**
 * @param {import('./agents').AgentDefinition[]} agents
 * @param {Set<string>} excludeFiles
 * @returns {import('./agents').AgentDefinition[]}
 */
function applyPresetFilter(agents, excludeFiles) {
  if (!excludeFiles.size) return agents;
  return agents.filter((a) => !excludeFiles.has(a.file));
}

module.exports = { PRESETS, PRESET_KEYS, resolvePreset, applyPresetFilter };
