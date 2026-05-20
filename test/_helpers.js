/**
 * Shared options for tests that invoke scaffold/update (keeps stdout clean for node:test IPC).
 * @param {object} [extra]
 * @returns {object}
 */
function testScaffoldOpts(extra = {}) {
  return { quiet: true, ...extra };
}

module.exports = { testScaffoldOpts };
