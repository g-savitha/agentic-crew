const path = require('path');
const fs = require('fs-extra');

const SNIPPET_MARKER_START = '# >>> agentic-crew >>>';
const SNIPPET_MARKER_END = '# <<< agentic-crew <<<';

const RECOMMENDED_LINES = [
  SNIPPET_MARKER_START,
  '.agentic-crew.bak/',
  '# Uncomment to keep local agent message history out of git:',
  '# .agent/messages/',
  SNIPPET_MARKER_END,
];

/**
 * Append agentic-crew gitignore recommendations if not already present.
 * @param {string} outputDir
 * @returns {Promise<{ appended: boolean, gitignorePath: string }>}
 */
async function appendGitignoreRecommendations(outputDir) {
  const gitignorePath = path.join(outputDir, '.gitignore');
  const snippet = RECOMMENDED_LINES.join('\n') + '\n';

  if (await fs.pathExists(gitignorePath)) {
    const existing = await fs.readFile(gitignorePath, 'utf8');
    if (existing.includes(SNIPPET_MARKER_START)) {
      return { appended: false, gitignorePath };
    }
    await fs.appendFile(gitignorePath, '\n' + snippet);
    return { appended: true, gitignorePath };
  }

  await fs.writeFile(gitignorePath, snippet);
  return { appended: true, gitignorePath };
}

module.exports = { appendGitignoreRecommendations, RECOMMENDED_LINES, SNIPPET_MARKER_START };
