const UTILITY_COMMANDS = new Set(['setup', 'team', 'lumos', 'help']);

/**
 * Extract slash-command slugs from catalog markdown (`/manager`, etc.).
 * @param {string} content
 * @returns {Set<string>}
 */
function extractCatalogSlugs(content) {
  const slugs = new Set();
  const re = /`\/([a-z][a-z0-9-]*)`/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    slugs.add(match[1]);
  }
  return slugs;
}

/**
 * Validate catalog skill content matches the manifest roster.
 * @param {string} content
 * @param {{ agents: Array<{ file: string, command?: string | null }>, catalogCommand: string }} params
 * @returns {string[]} issues (empty when valid)
 */
function validateCatalogContent(content, { agents, catalogCommand }) {
  const issues = [];
  if (!content || !content.trim()) {
    return ['catalog file is empty'];
  }

  const allowed = new Set([...UTILITY_COMMANDS, catalogCommand]);
  for (const agent of agents) {
    allowed.add(agent.file);
    if (agent.command) allowed.add(agent.command);
  }

  const mentioned = extractCatalogSlugs(content);
  for (const slug of mentioned) {
    if (!allowed.has(slug)) {
      issues.push(`catalog references /${slug} but that command is not in the manifest roster`);
    }
  }

  for (const agent of agents) {
    if (!content.includes(`/${agent.file}`)) {
      issues.push(`catalog missing roster entry for /${agent.file}`);
    }
  }

  return issues;
}

module.exports = { extractCatalogSlugs, validateCatalogContent, UTILITY_COMMANDS };
