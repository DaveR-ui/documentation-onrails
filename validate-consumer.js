#!/usr/bin/env node
/*
 * Read-only, zero-dependency consumer-layout checker. Explicit --root required.
 * Scans only docs/project.md, Markdown under docs/context/ and docs/protocols/, and
 * optional docs/tag-index.md. Never writes, generates, or walks source trees.
 * This is a documented subset of guidelines/04, NOT the full corpus validator.
 * Frontmatter supports scalar, inline-list and block-list YAML only; unsupported
 * syntax is reported rather than silently treated as valid YAML.
 * Fences exempt both link kinds; inline code exempts wikilinks only (04).
 * Relative paths must exist with exact casing and remain inside the root,
 * including after symlink resolution. Heading fragments are not validated.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const CONTEXT_REQUIRED = ['last_updated', 'status', 'description', 'tags', 'version'];
const NOTE_REQUIRED = ['id', 'category', 'tags', 'aliases', 'related', 'version', 'status'];
const SECTIONS = ['Overview', 'Technology Stack', 'Slices', 'Commands', 'Repository Structure',
  'Key Conventions', 'Domain Entities', 'Context Index', 'Common Lookups'];
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const posix = (s) => s.split(path.sep).join('/');
const unquote = (s) => /^(['"]).*\1$/.test(s) ? s.slice(1, -1) : s;

function parseFrontmatter(lines, report) {
  if (lines[0] !== '---') { report(1, 'metadata-outside-contract', 'missing opening frontmatter delimiter'); return { entries: new Map(), end: -1 }; }
  const end = lines.findIndex((line, i) => i > 0 && line === '---');
  if (end < 0) { report(1, 'metadata-outside-contract', 'missing closing frontmatter delimiter'); return { entries: new Map(), end: lines.length }; }
  const entries = new Map();
  for (let i = 1; i < end; i++) {
    const text = lines[i].trim();
    if (!text || text.startsWith('#')) continue;
    const match = /^([a-z_]+):\s*(.*)$/.exec(lines[i]);
    if (!match) { report(i + 1, 'metadata-outside-contract', 'unsupported or malformed frontmatter line'); continue; }
    const key = match[1], raw = match[2].trim(), line = i + 1;
    let entry;
    if (!raw) {
      const items = [];
      while (i + 1 < end && /^\s*-\s+/.test(lines[i + 1])) items.push(unquote(lines[++i].trim().replace(/^-\s+/, '')));
      entry = items.length ? { kind: 'list', items, line } : { kind: 'blank', line };
    } else if (raw.startsWith('[') && raw.endsWith(']')) {
      const inner = raw.slice(1, -1).trim();
      entry = { kind: 'list', items: inner ? inner.split(',').map((x) => unquote(x.trim())) : [], line };
    } else {
      if (/^[\[\]{|>&*!]/.test(raw) || (/^['"]/.test(raw) && raw[0] !== raw.at(-1))) {
        report(line, 'metadata-outside-contract', 'unsupported or malformed scalar/list syntax');
      }
      entry = { kind: 'scalar', value: unquote(raw), line };
    }
    if (entries.has(key)) report(line, 'metadata-outside-contract', `duplicate key '${key}'`);
    entries.set(key, entry);
  }
  return { entries, end };
}

function fenceMask(lines) {
  let fence = null;
  return lines.map((line) => {
    const match = /^\s{0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (!fence && match) { fence = match[1]; return true; }
    if (fence && match && match[1][0] === fence[0] && match[1].length >= fence.length && !match[2].trim()) { fence = null; return true; }
    return fence !== null;
  });
}

function checkMetadata(doc, report) {
  if (doc.rel === 'docs/tag-index.md') return;
  const note = doc.rel.startsWith('docs/protocols/');
  const required = note ? NOTE_REQUIRED : [...CONTEXT_REQUIRED, ...(doc.rel === 'docs/project.md' ? ['doc_language'] : [])];
  const optional = note ? ['supersedes', 'expires_at', 'moved_from'] : ['related', 'moved_from'];
  const lists = new Set(['tags', 'aliases', 'related', 'moved_from']);
  for (const key of required) if (!doc.fm.entries.has(key)) report(1, 'metadata-outside-contract', `required key '${key}' is missing`);
  for (const [key, entry] of doc.fm.entries) {
    if (!required.includes(key) && !optional.includes(key)) report(entry.line, 'metadata-outside-contract', `key '${key}' is not part of this document's contract`);
    if (entry.kind !== (lists.has(key) ? 'list' : 'scalar') || (entry.kind === 'scalar' && !entry.value.trim())) {
      report(entry.line, 'metadata-outside-contract', `key '${key}' must be a nonblank ${lists.has(key) ? 'list (empty list allowed)' : 'scalar'}`);
      continue;
    }
    if (entry.kind === 'list') {
      if (entry.items.some((item) => !item.trim())) report(entry.line, 'metadata-outside-contract', `key '${key}' contains a blank item`);
      continue;
    }
    const value = entry.value;
    if (key === 'status' && !['draft', 'active', 'superseded', 'expired'].includes(value)) report(entry.line, 'metadata-outside-contract', 'invalid lifecycle status');
    if (key === 'version' && !/^\d+(\.\d+){0,2}$/.test(value)) report(entry.line, 'metadata-outside-contract', 'version must be MAJOR[.MINOR[.PATCH]]');
    if (key === 'id' && !SLUG.test(value)) report(entry.line, 'metadata-outside-contract', 'id must be a lowercase kebab-case slug');
    if (key === 'last_updated' || key === 'expires_at') {
      const date = new Date(`${value}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) report(entry.line, 'metadata-outside-contract', `${key} must be a valid YYYY-MM-DD date`);
    }
  }
}

function validate(root) {
  root = fs.realpathSync(root);
  if (!fs.statSync(root).isDirectory()) throw new Error('consumer root must be a directory');
  const findings = [], docs = [];
  const reportFor = (rel) => (line, name, message, severity = 'error') => findings.push({ rel, line, name, message, severity });
  const inside = (abs) => {
    const rel = path.relative(root, abs);
    return rel !== '..' && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel);
  };
  // Walk path components, not directory subtrees. This also catches case mistakes
  // on case-insensitive filesystems and rejects an escaping intermediate symlink.
  function exactPath(target, base = root) {
    if (path.isAbsolute(target) || /^[a-z]:/i.test(target) || target.startsWith('\\') || target.includes('\\')) return { error: 'absolute or non-POSIX path is not allowed' };
    const abs = path.resolve(base, target);
    if (!inside(abs)) return { error: 'path escapes consumer root' };
    let cursor = root;
    for (const part of path.relative(root, abs).split(path.sep).filter(Boolean)) {
      if (!fs.statSync(cursor).isDirectory()) return { error: 'path parent is not a directory' };
      const names = fs.readdirSync(cursor);
      if (!names.includes(part)) return {
        error: 'target missing or casing is not exact',
        missing: !names.some((name) => name.toLowerCase() === part.toLowerCase()),
      };
      cursor = path.join(cursor, part);
      if (!inside(fs.realpathSync(cursor))) return { error: 'symlink target escapes consumer root' };
    }
    return { abs, rel: posix(path.relative(root, abs)) };
  }
  function load(rel) {
    const lines = fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/);
    const report = reportFor(rel);
    const fm = rel === 'docs/tag-index.md' ? { entries: new Map(), end: -1 } : parseFrontmatter(lines, report);
    const doc = { rel, lines, fm, mask: fenceMask(lines) };
    docs.push(doc);
    checkMetadata(doc, report);
  }
  const project = exactPath('docs/project.md');
  if (project.error || !fs.statSync(project.abs).isFile()) reportFor('docs/project.md')(1, 'missing-project-entry', project.error || 'entry must be a file');
  else load(project.rel);
  function collect(rel) {
    for (const entry of fs.readdirSync(path.join(root, rel), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      const child = `${rel}/${entry.name}`;
      if (entry.isSymbolicLink()) { reportFor(child)(1, 'unsafe-path', 'symlink in scanned documentation tree is not traversed'); continue; }
      if (entry.isDirectory()) collect(child);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) load(child);
    }
  }
  for (const rel of ['docs/context', 'docs/protocols', 'docs/tag-index.md']) {
    const hit = exactPath(rel);
    // Absence is allowed at bootstrap; a present unsafe/miscased path is not.
    if (hit.error) {
      if (!hit.missing) reportFor(rel)(1, 'unsafe-path', hit.error);
      continue;
    }
    const stat = fs.lstatSync(hit.abs);
    if (stat.isSymbolicLink()) { reportFor(rel)(1, 'unsafe-path', 'documentation scan roots must not be symlinks'); continue; }
    if (rel.endsWith('.md') && stat.isFile()) load(rel);
    else if (!rel.endsWith('.md') && stat.isDirectory()) collect(rel);
    else reportFor(rel)(1, 'consumer-layout', 'unexpected file/directory type');
  }
  const tokens = new Map();
  for (const doc of docs) {
    const add = (value) => { const key = value.trim().toLowerCase().replace(/\.md$/, ''); if (!tokens.has(key)) tokens.set(key, doc.rel); };
    add(doc.rel); add(path.basename(doc.rel, '.md'));
    const id = doc.fm.entries.get('id'), aliases = doc.fm.entries.get('aliases');
    if (id && id.kind === 'scalar') add(id.value);
    if (aliases && aliases.kind === 'list') aliases.items.forEach(add);
  }
  const reachable = new Set();
  for (const doc of docs) {
    const report = reportFor(doc.rel), headings = [];
    let h1 = false;
    const linkPath = (target, line, base) => {
      if (!target || target.startsWith('#') || /^(https?:|mailto:|data:|ftp:)/i.test(target)) return;
      let decoded;
      try { decoded = decodeURIComponent(target.split(/[?#]/)[0]); }
      catch { report(line, 'dangling-link', 'invalid percent-encoded path'); return; }
      const hit = exactPath(decoded, base);
      if (hit.error) report(line, 'dangling-link', `${hit.error}: '${target}'`);
      else if (doc.rel === 'docs/project.md') reachable.add(hit.rel);
    };
    const related = doc.fm.entries.get('related');
    if (related && related.kind === 'list') for (const item of related.items) {
      if (!tokens.has(item.toLowerCase().replace(/\.md$/, ''))) report(related.line, 'dangling-related-target', `unresolved related target '${item}' in scanned docs`);
    }
    for (let i = doc.fm.end + 1; i < doc.lines.length; i++) {
      if (doc.mask[i]) continue;
      const line = doc.lines[i];
      if (/^#\s+\S/.test(line)) h1 = true;
      const heading = /^##\s+(.+?)\s*$/.exec(line);
      if (heading) headings.push(heading[1]);
      const spans = [...line.matchAll(/(`+)(.*?)\1/g)].map((m) => [m.index, m.index + m[0].length]);
      for (const match of line.matchAll(/\[\[([^\[\]|\n]+)(?:\|[^\[\]\n]*)?\]\]/g)) {
        if (spans.some(([a, b]) => a <= match.index && match.index + match[0].length <= b)) continue;
        const hit = tokens.get(match[1].trim().toLowerCase().replace(/\.md$/, ''));
        if (!hit) report(i + 1, 'dangling-link', `unresolved wikilink '${match[1]}' in scanned docs`);
        else if (doc.rel === 'docs/project.md') reachable.add(hit);
      }
      for (const match of line.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) linkPath(match[1], i + 1, path.dirname(path.join(root, doc.rel)));
      if (doc.rel !== 'docs/project.md') continue;
      // Bare root-relative paths are intentional navigation in 06's entry tables.
      const section = headings.at(-1);
      if (section === 'Context Index' || section === 'Common Lookups') {
        for (const match of line.matchAll(/(?:^|[\s`])(docs\/[^\s`<>|,)]+)/g)) linkPath(match[1], i + 1, root);
      }
      if (section === 'Slices' && line.trim().startsWith('|')) {
        const cells = line.split('|').slice(1, -1).map((x) => x.trim());
        if (cells.length === 5 && cells[0] !== 'Slice' && !/^:?-+:?$/.test(cells[0])) {
          for (const target of cells[3].replace(/`/g, '').split(/[,\s]+/).filter(Boolean)) linkPath(target, i + 1, root);
        }
      }
    }
    if (!h1) report(1, 'no-h1', 'document has no H1 outside fences', 'warning');
    if (doc.rel === 'docs/project.md' && JSON.stringify(headings) !== JSON.stringify(SECTIONS)) report(1, 'project-section-contract', 'expected the nine fixed H2 sections in methodology order');
  }
  for (const doc of docs) {
    if (/^docs\/(context|protocols)\//.test(doc.rel) && !reachable.has(doc.rel)) reportFor(doc.rel)(1, 'entry-navigation', 'not linked by docs/project.md Context Index/navigation');
  }
  findings.sort((a, b) => a.rel.localeCompare(b.rel) || a.line - b.line || a.name.localeCompare(b.name));
  return { findings, filesScanned: docs.length };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args[0] !== '--root' || !args[1] || args[1].startsWith('--')) {
    process.stderr.write('Usage: node validate-consumer.js --root <consumer-repository>\nRead-only subset checker; no --write or other options.\n');
    process.exitCode = 2;
    return;
  }
  try {
    const { findings, filesScanned } = validate(path.resolve(args[1]));
    for (const f of findings) process.stdout.write(`${f.rel}:${f.line} — ${f.name}: ${f.message}\n`);
    const errors = findings.filter((f) => f.severity === 'error').length;
    process.stdout.write(`${errors} error(s), ${findings.length - errors} warning(s) — files scanned: ${filesScanned}\n`);
    process.exitCode = errors ? 1 : 0;
  } catch (error) {
    process.stderr.write(`consumer-validation-failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();
module.exports = { validate };
