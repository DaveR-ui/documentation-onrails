'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('node:child_process');
const { validate } = require('./validate-consumer');
const SCRIPT = path.join(__dirname, 'validate-consumer.js');
const SECTIONS = ['Overview', 'Technology Stack', 'Slices', 'Commands', 'Repository Structure',
  'Key Conventions', 'Domain Entities', 'Context Index', 'Common Lookups'];
const CONTEXT = '---\nlast_updated: 2026-10-07\nstatus: active\ndescription: Fixture context\ntags: []\nversion: 1.0\n';
const NOTE = '---\nid: test-procedure\ncategory: protocols\ntags: []\naliases: []\nrelated: []\nversion: 1.0\nstatus: active\n---\n# Procedure\n';

function fixture(t, full = true) {
  const root = fs.mkdtempSync(path.join(__dirname, '.validator-test-temp-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true })); // only this test's own fixture
  const put = (rel, content) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), content);
  };
  const project = CONTEXT + 'doc_language: english\n---\n# Fixture Project\n' + SECTIONS.map((section) => {
    let content = '';
    if (section === 'Slices') content = '| Slice | Description | Keywords | Entry points | Primary agents |\n|---|---|---|---|---|\n| docs | Documentation | docs | docs/ | documenter |\n';
    if (section === 'Context Index' && full) content = '- [Architecture](context/architecture.md)\n- docs/protocols/test-procedure.md\n';
    return `\n## ${section}\n${content}`;
  }).join('');
  put('docs/project.md', project);
  if (full) {
    put('docs/context/architecture.md', CONTEXT + '---\n# Architecture\n');
    put('docs/protocols/test-procedure.md', NOTE);
  }
  return { root, put, project };
}

const run = (args, cwd = __dirname, script = SCRIPT) => spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' });
const errors = (root) => validate(root).findings.filter((f) => f.severity === 'error');

test('valid consumer uses distinct contracts, bare navigation and optional canonical tag index; no writes', (t) => {
  const { root, put } = fixture(t);
  put('docs/tag-index.md', '# Tag Index\n<!-- BEGIN GENERATED: tags -->\nUnchanged bytes\n<!-- END GENERATED: tags -->\n');
  put('src/unrelated.md', 'malformed metadata [missing](no.md)');
  put('node_modules/irrelevant/readme.md', 'must not be scanned');
  const paths = ['docs/project.md', 'docs/context/architecture.md', 'docs/protocols/test-procedure.md', 'docs/tag-index.md'];
  const before = paths.map((rel) => fs.readFileSync(path.join(root, rel)));
  const result = run(['--root', root]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /files scanned: 4/);
  paths.forEach((rel, i) => assert.deepEqual(fs.readFileSync(path.join(root, rel)), before[i]));
});

test('bootstrap may omit context, protocols and tag index, but never project entry', (t) => {
  const { root } = fixture(t, false);
  assert.deepEqual(errors(root), []);
  fs.unlinkSync(path.join(root, 'docs/project.md'));
  assert.ok(errors(root).some((f) => f.name === 'missing-project-entry'));
});

test('missing metadata, wrong contract, invalid dates and malformed/duplicate YAML fail', (t) => {
  const { root, put, project } = fixture(t);
  put('docs/project.md', project.replace('doc_language: english\n', ''));
  put('docs/context/architecture.md', CONTEXT.replace('2026-10-07', '2026-02-30') + 'id: wrong-contract\nstatus: active\nbroken yaml\n---\n# Architecture\n');
  put('docs/protocols/test-procedure.md', NOTE.replace('aliases: []\n', '').replace('tags: []', 'tags: scalar'));
  const findings = errors(root);
  for (const pattern of [/doc_language/, /valid YYYY-MM-DD/, /not part/, /duplicate key/, /malformed/, /aliases/, /must be a nonblank list/]) {
    assert.ok(findings.some((f) => pattern.test(f.message)), String(pattern));
  }
});

test('fixed project H2 section names and order are checked outside fences', (t) => {
  const { root, put, project } = fixture(t);
  put('docs/project.md', project.replace('## Commands', '## Usage'));
  assert.ok(errors(root).some((f) => f.name === 'project-section-contract'));
});

test('missing delimiters, blank optional metadata and wrong lifecycle status fail', (t) => {
  const { root, put } = fixture(t);
  put('docs/context/architecture.md', '# Architecture\n');
  assert.ok(errors(root).some((f) => /missing opening/.test(f.message)));
  put('docs/context/architecture.md', CONTEXT + 'related:\n---\n# Architecture\n');
  assert.ok(errors(root).some((f) => /nonblank list/.test(f.message)));
  put('docs/context/architecture.md', CONTEXT.replace('status: active', 'status: archived') + '---\n# Architecture\n');
  assert.ok(errors(root).some((f) => /invalid lifecycle/.test(f.message)));
  put('docs/context/architecture.md', CONTEXT + '# Architecture\n');
  assert.ok(errors(root).some((f) => /missing closing/.test(f.message)));
});

test('present optional scan roots must have exact casing and expected types', (t) => {
  const { root, put } = fixture(t, false);
  put('docs/Context/architecture.md', CONTEXT + '---\n# Architecture\n');
  put('docs/protocols', 'not a directory');
  assert.ok(errors(root).some((f) => f.rel === 'docs/context' && f.name === 'unsafe-path'));
  assert.ok(errors(root).some((f) => f.rel === 'docs/protocols' && f.name === 'consumer-layout'));
});

test('dangling links fail; fenced links and inline wikilink citations are exempt, inline markdown is not', (t) => {
  const { root, put } = fixture(t);
  put('docs/context/architecture.md', CONTEXT + '---\n# Architecture\n' +
    '```markdown\n[example](missing.md)\n[[missing]]\n~~~\n[still fenced](missing.md)\n```\n' +
    '`[[literal]]` and ``[[another-literal]]``\n[valid](../project.md#unchecked-anchor)\n');
  assert.deepEqual(errors(root), []);
  fs.appendFileSync(path.join(root, 'docs/context/architecture.md'), '`[live](missing.md)`\n[[absent]]\n');
  assert.equal(errors(root).filter((f) => f.name === 'dangling-link').length, 2);
});

test('exact casing, bare paths, slice entry points and entry navigation are checked', (t) => {
  const { root, put, project } = fixture(t);
  put('docs/project.md', project.replace('context/architecture.md', 'context/Architecture.md').replace('docs/protocols/test-procedure.md', 'docs/protocols/missing.md').replace('| docs/ |', '| src/missing/ |'));
  const findings = errors(root);
  assert.equal(findings.filter((f) => f.name === 'dangling-link').length, 3);
  assert.equal(findings.filter((f) => f.name === 'entry-navigation').length, 2);
});

test('related and live wikilinks resolve scanned stems, ids and aliases case-insensitively', (t) => {
  const { root, put } = fixture(t);
  put('docs/protocols/test-procedure.md', NOTE.replace('aliases: []', 'aliases: [Run Tests]').replace('related: []', 'related: [architecture]') + '[[ARCHITECTURE]]\n');
  fs.appendFileSync(path.join(root, 'docs/context/architecture.md'), '[[RUN TESTS]]\n[[test-procedure]]\n');
  assert.deepEqual(errors(root), []);
  put('docs/protocols/test-procedure.md', NOTE.replace('related: []', 'related: [absent]'));
  assert.ok(errors(root).some((f) => f.name === 'dangling-related-target'));
});

test('outside-root and absolute links fail even when targets exist', (t) => {
  const { root, put } = fixture(t);
  const outside = fixture(t, false);
  const relative = path.relative(path.join(root, 'docs/context'), path.join(outside.root, 'docs/project.md')).split(path.sep).join('/');
  put('docs/context/architecture.md', CONTEXT + `---\n# Architecture\n[outside](${relative})\n[absolute](${path.join(outside.root, 'docs/project.md').split(path.sep).join('/')})\n`);
  const findings = errors(root).filter((f) => f.name === 'dangling-link');
  assert.equal(findings.length, 2);
  assert.ok(findings.some((f) => /escapes consumer root/.test(f.message)));
});

test('symlink escapes are rejected without scanning the external tree', (t) => {
  const { root } = fixture(t), outside = fixture(t, false);
  // Directory junctions work without Windows symlink privileges.
  fs.symlinkSync(outside.root, path.join(root, 'escape'), process.platform === 'win32' ? 'junction' : 'dir');
  fs.appendFileSync(path.join(root, 'docs/context/architecture.md'), '[escape](../../escape/docs/project.md)\n');
  assert.ok(errors(root).some((f) => /symlink target escapes/.test(f.message)));
  fs.symlinkSync(outside.root, path.join(root, 'docs/context/linked'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.ok(errors(root).some((f) => f.name === 'unsafe-path'));
});

test('CLI root selection is explicit and independent of cwd; unknown/write arguments fail read-only', (t) => {
  const { root } = fixture(t), other = fixture(t, false);
  assert.equal(run(['--root', path.relative(other.root, root)], other.root).status, 0);
  const before = fs.readFileSync(path.join(root, 'docs/project.md'));
  for (const args of [[], ['--root'], ['--write'], ['--unknown'], ['--root', root, '--write'], ['--root', root, '--root', other.root]]) {
    const result = run(args);
    assert.equal(result.status, 2, JSON.stringify(args));
    assert.match(result.stderr, /Usage:/);
  }
  assert.equal(run(['--root', path.join(root, 'absent')]).status, 1);
  assert.deepEqual(fs.readFileSync(path.join(root, 'docs/project.md')), before);
});

test('methodology CLI refuses --root, unknown flags and mixed --write before changing generated files', (t) => {
  const { root } = fixture(t);
  const paths = ['index.md', 'tag-index.md'];
  const before = paths.map((rel) => fs.readFileSync(path.join(__dirname, rel)));
  for (const args of [['--root', root], ['--unknown'], ['--write', '--root', root], ['--write', '--write']]) {
    const result = run(args, root, path.join(__dirname, 'validate.js'));
    assert.equal(result.status, 2);
    assert.match(result.stderr, /methodology-reference corpus/);
  }
  paths.forEach((rel, i) => assert.deepEqual(fs.readFileSync(path.join(__dirname, rel)), before[i]));
});
