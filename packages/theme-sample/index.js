/**
 * Sample external theme for agentic-crew.
 * Install: npm install -D @agentic-crew/theme-sample
 * Init:    npx agentic-crew init --theme sample --yes --name my-app ...
 */
module.exports = {
  id: 'sample',
  label: 'Sample Theme',
  catalogCommand: 'help',
  catalogTitle: 'Agent Commands',
  useCharacterAliases: false,
  startCommand: 'manager',

  /**
   * @param {import('agentic-crew').AgentDefinition} agent
   */
  applyThemePack(agent) {
    return {
      ...agent,
      character: agent.role,
      command: undefined,
      trait: agent.trait || '',
      why: agent.why || `Owns ${agent.role} responsibilities for the team.`,
    };
  },

  agentOverrides: {
    manager: {
      character: 'Team Lead',
      trait: 'Coordinates delivery and reports to the CEO',
    },
    qa: {
      character: 'Quality Guardian',
      trait: 'Finds defects before users do',
    },
  },
};
