import process from 'process';
import cp from 'child_process';
import core from '@actions/core';
import pkg from '../package.json';
import truncateEnv from './truncate-env.js';
import { test, expect, vi } from 'vitest';

vi.setConfig({ testTimeout: 60000 });

// shows how the runner will run a javascript action with env / stdout protocol
test('truncate', (done) => {
  Object.assign(process.env, truncateEnv);

  const main = cp.spawnSync(
    'bash',
    ['--noprofile', '--norc', '-eo', 'pipefail', '-c', `node ${pkg.main}`],
    { env: process.env, encoding: 'utf-8' },
  );

  main.stdout.split('\n').forEach((line) => {
    if (line.startsWith('::save-state name=')) {
      const [name, val] = line.split('\n')[0].split('=').pop().split('::');
      process.env[`STATE_${name}`] = val;
    }
  });

  setTimeout(() => {
    const pid = core.getState('post-run');
    expect(pid).toBeDefined();
    const stdout = core.getState('stdout');
    expect(stdout).toBeDefined();
    const stderr = core.getState('stderr');
    expect(stderr).toBeDefined();
    const reason = core.getState(`reason_${pid}`);
    expect(reason).toEqual('success');

    const post = cp.spawnSync(
      'bash',
      ['--noprofile', '--norc', '-eo', 'pipefail', '-c', 'node post-run.js'],
      { env: process.env, encoding: 'utf-8' },
    );

    // Keep track of what we've seen
    let sawStdOutGroup = false;
    let sawStdErrGroup = false;
    let sawGroupEnd = 0;

    post.stdout.split('\n').forEach((line) => {
      if (line.startsWith('::group::Truncated Error Output:'))
        sawStdErrGroup = true;
      if (line.startsWith('::group::Truncated Output:'))
        sawStdOutGroup = true;
      if (line.startsWith('::endgroup::')) sawGroupEnd++;
    });

    expect(sawGroupEnd).toEqual(2);
    expect(sawStdOutGroup).toEqual(true);
    expect(sawStdErrGroup).toEqual(true);
    done();
  }, 5000);
});
