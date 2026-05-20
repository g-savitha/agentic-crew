/**
 * Theme packs — persona layer separated from core agent protocol.
 * Core agent files (manager, qa, etc.) are shared; themes control aliases and catalog.
 */

const PHOENIX = {
  id: 'phoenix',
  label: 'Order of the Phoenix',
  catalogCommand: 'lumos',
  useCharacterAliases: true,
  startCommand: 'dumbledore',
  catalogTitle: 'Lumos',
};

const PROFESSIONAL = {
  id: 'professional',
  label: 'Professional',
  catalogCommand: 'help',
  useCharacterAliases: false,
  startCommand: 'manager',
  catalogTitle: 'Agent Commands',
};

const THEME_PACKS = {
  phoenix: PHOENIX,
  professional: PROFESSIONAL,
};

const THEMES = Object.keys(THEME_PACKS);

/**
 * @param {'phoenix' | 'professional'} themeId
 */
function getThemePack(themeId) {
  return THEME_PACKS[themeId] || THEME_PACKS.phoenix;
}

/**
 * @param {import('../agents').AgentDefinition} agent
 * @param {'phoenix' | 'professional'} themeId
 */
function applyThemePack(agent, themeId) {
  if (themeId !== 'professional') return { ...agent };
  return {
    ...agent,
    character: agent.role,
    command: undefined,
    trait: '',
    why: `Owns ${agent.role} responsibilities for the team and reports to the CEO.`,
  };
}

module.exports = {
  THEME_PACKS,
  THEMES,
  getThemePack,
  applyThemePack,
};
