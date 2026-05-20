const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const { spawnSync } = require('node:child_process');

const CLI = path.join(__dirname, '..', 'bin', 'cli.js');

function runCli(args, cwd) {
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, FORCE_COLOR: '0' },
  });
}

describe('CLI end-to-end', () => {
  it('init → doctor → update --dry-run → uninstall lifecycle', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ac-cli-e2e-'));

    const init = runCli(
      [
        'init',
        '--yes',
        '--name',
        'cli-e2e-app',
        '--frontend',
        'none',
        '--backend',
        'go',
        '--target',
        'claude',
        '--theme',
        'professional',
        '--json',
      ],
      tmp
    );
    assert.equal(init.status, 0, init.stderr || init.stdout);
    assert.ok(await fs.pathExists(path.join(tmp, '.agentic-crew.json')));

    const doctor = runCli(['doctor', '--dir', tmp, '--json'], tmp);
    assert.equal(doctor.status, 0, doctor.stderr || doctor.stdout);
    assert.match(doctor.stdout, /"ok":\s*true/);

    const updateDry = runCli(['update', '--dir', tmp, '--dry-run', '--json'], tmp);
    assert.equal(updateDry.status, 0, updateDry.stderr || updateDry.stdout);
    assert.match(updateDry.stdout, /"dryRun":\s*true/);

    const uninstall = runCli(['uninstall', '--dir', tmp, '--keep-state', '--json'], tmp);
    assert.equal(uninstall.status, 0, uninstall.stderr || uninstall.stdout);
    assert.equal(await fs.pathExists(path.join(tmp, '.agentic-crew.json')), false);
    assert.ok(await fs.pathExists(path.join(tmp, '.agent', 'backlog', 'tasks.md')));
    assert.equal(await fs.pathExists(path.join(tmp, '.claude', 'commands', 'manager.md')), false);
    assert.equal(await fs.pathExists(path.join(tmp, 'docs', 'wiki', '11-troubleshooting.md')), false);
  });
});
