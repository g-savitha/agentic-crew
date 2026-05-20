const path = require('path');

/** @typedef {'claude' | 'cursor' | 'codex' | 'windsurf'} CommandTarget */

const COMMAND_TARGET_SPECS = {
  claude: { segments: ['.claude', 'commands'] },
  cursor: { segments: ['.cursor', 'commands'] },
  codex: { segments: ['.codex', 'skills'] },
  windsurf: { segments: ['.windsurf', 'workflows'] },
};

const COMMAND_TARGET_KEYS = Object.keys(COMMAND_TARGET_SPECS);

const TARGET_ALIASES = {
  both: ['claude', 'cursor'],
  all: ['claude', 'cursor', 'codex', 'windsurf'],
};

const IDE_TARGETS = ['claude', 'cursor', 'codex', 'windsurf', 'both', 'all'];

/** Options for interactive `select` prompts — keep in sync with CLI `--target`. */
const IDE_TARGET_PROMPT_OPTIONS = [
  {
    value: 'all',
    label: 'All IDEs (recommended)',
    hint: 'Claude, Cursor, Codex, Windsurf + AGENTS.md',
  },
  {
    value: 'both',
    label: 'Claude + Cursor',
    hint: '.claude/commands and .cursor/commands',
  },
  { value: 'claude', label: 'Claude Code only', hint: '.claude/commands' },
  { value: 'cursor', label: 'Cursor only', hint: '.cursor/commands + .cursor/rules' },
  { value: 'codex', label: 'Codex only', hint: '.codex/skills + AGENTS.md' },
  { value: 'windsurf', label: 'Windsurf only', hint: '.windsurf/workflows' },
];

/**
 * @param {string | string[]} targets
 * @param {{ strict?: boolean }} [options]
 * @returns {CommandTarget[]}
 */
function normalizeCommandTargets(targets, options = {}) {
  const raw = Array.isArray(targets) ? targets : String(targets || 'both').split(',');
  const tokens = raw.map((t) => t.trim().toLowerCase()).filter(Boolean);
  const expanded = tokens.flatMap((t) => TARGET_ALIASES[t] || [t]);

  if (options.strict) {
    for (const token of tokens) {
      if (!IDE_TARGETS.includes(token)) {
        throw new Error(`Invalid target "${token}". Use: ${IDE_TARGETS.join(', ')}`);
      }
    }
  }

  const valid = expanded.filter((t) => COMMAND_TARGET_KEYS.includes(t));
  if (options.strict && valid.length === 0 && tokens.length > 0) {
    throw new Error(`Invalid target(s). Use: ${IDE_TARGETS.join(', ')}`);
  }
  return valid.length > 0 ? [...new Set(valid)] : ['claude', 'cursor'];
}

/**
 * Whether to generate root AGENTS.md (Codex / universal agent instructions).
 * @param {string | string[]} targets
 */
function shouldGenerateAgentsMd(targets) {
  const raw = Array.isArray(targets) ? targets : String(targets || '').split(',');
  const normalized = raw.map((t) => t.trim().toLowerCase());
  return normalized.includes('all') || normalized.includes('codex') || normalized.includes('agents-md');
}

/**
 * @param {CommandTarget[]} commandTargets
 * @param {string} outputDir
 * @returns {string[]}
 */
function resolveCommandDirs(commandTargets, outputDir) {
  return commandTargets.map((key) => {
    const spec = COMMAND_TARGET_SPECS[key];
    return path.join(outputDir, ...spec.segments);
  });
}

/**
 * Supplementary files generated outside command directories.
 * @param {string | string[]} targets
 * @param {string} outputDir
 * @returns {{ agentsMd: string | null, cursorRule: string | null }}
 */
function resolveSupplementaryPaths(targets, outputDir) {
  const commandTargets = normalizeCommandTargets(targets, { strict: true });
  return {
    agentsMd: shouldGenerateAgentsMd(targets) ? path.join(outputDir, 'AGENTS.md') : null,
    cursorRule: commandTargets.includes('cursor')
      ? path.join(outputDir, '.cursor', 'rules', 'agentic-crew.mdc')
      : null,
  };
}

/**
 * Serialize targets for manifest storage.
 * @param {string | string[]} targets
 * @returns {string | string[]}
 */
function serializeTargets(targets) {
  const raw = Array.isArray(targets) ? targets.join(',') : String(targets || 'both');
  const lower = raw.trim().toLowerCase();
  if (lower === 'both' || lower === 'all') return lower;
  return normalizeCommandTargets(targets, { strict: true });
}

module.exports = {
  COMMAND_TARGET_SPECS,
  COMMAND_TARGET_KEYS,
  IDE_TARGETS,
  IDE_TARGET_PROMPT_OPTIONS,
  normalizeCommandTargets,
  shouldGenerateAgentsMd,
  resolveCommandDirs,
  resolveSupplementaryPaths,
  serializeTargets,
};
