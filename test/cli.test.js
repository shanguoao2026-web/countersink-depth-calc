const { test } = require('node:test');
const assert = require('node:assert/strict');
const { runInNewContext } = require('node:vm');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const builtCli = readFileSync(path.join(__dirname, '../dist/cli.js'), 'utf8');
const run = (...args) => {
  const result = { status: 0, stdout: '', stderr: '' };
  const process = {
    argv: ['node', 'cli.js', ...args.map(String)],
    stdout: { write: text => { result.stdout += text; } },
    set exitCode(value) { result.status = value; }
  };
  runInNewContext(builtCli, {
    process,
    console: {
      log: text => { result.stdout += text + '\n'; },
      error: text => { result.stderr += text + '\n'; }
    }
  });
  return result;
};

test('required reference geometry in readable output', () => {
  for (const [args, expected] of [
    [['--angle', 90, '--hole', 10, '--diameter', 20], ['Depth: 5.0000 mm', 'Chamfer leg length: 7.0711 mm']],
    [['--angle', 82, '--hole', 0, '--diameter', 18], ['Depth: 10.3533 mm']],
    [['--angle', 120, '--hole', 6.6, '--diameter', 12], ['Depth: 1.5588 mm']],
    [['--angle', 90, '--hole', 10, '--depth', 3], ['Countersink diameter: 16.0000 mm']]
  ]) {
    const result = run(...args);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, '');
    for (const text of expected) assert.ok(result.stdout.includes(text), result.stdout);
  }
});

test('JSON has rounded numeric results and defaults to a sharp tip', () => {
  const result = run('--angle', 90, '--diameter', 20, '--decimals', 2, '--json');
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), { angle: 90, hole: 0, diameter: 20, depth: 10, leg: 14.14 });
});

test('precision endpoints', () => {
  for (const decimals of [0, 6]) {
    const result = run('--angle', 90, '--depth', 3, '--decimals', decimals);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.includes(`Depth: ${(3).toFixed(decimals)} mm`));
  }
});

test('invalid inputs fail on stderr with exit 1', () => {
  const invalid = [
    ['--angle', 0, '--diameter', 20], ['--angle', 180, '--diameter', 20],
    ['--angle', 90, '--hole', -1, '--diameter', 20],
    ['--angle', 90, '--hole', 10, '--diameter', 10],
    ['--angle', 90, '--depth', 0], ['--angle', 90, '--depth', -1],
    ['--angle', 90, '--diameter', 20, '--depth', 3], ['--angle', 90],
    ['--angle', 90, '--depth', 3, '--decimals', 9],
    ['--angle', 90, '--depth', 3, '--decimals', 1.5],
    ['--angle', 90, '--depth', 3, '--decimals', -1],
    ['--depth', 3], [], ['--angle'], ['--wat'],
    ['--angle', 90, '--angle', 82, '--depth', 3],
    ...['NaN', 'Infinity', '-Infinity', 'abc', ''].map(value => ['--angle', value, '--depth', 3]),
    ...['--hole', '--diameter', '--depth', '--decimals'].map(option => ['--angle', 90, option, 'Infinity'])
  ];
  for (const args of invalid) {
    const result = run(...args);
    assert.equal(result.status, 1, JSON.stringify(args));
    assert.match(result.stderr, /^Error: /);
    assert.equal(result.stdout, '');
  }
});

test('help works without geometry', () => {
  const result = run('--help');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage:/);
  assert.equal(result.stderr, '');
});
