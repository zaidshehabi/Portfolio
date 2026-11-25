import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const html = () => read('index.html');

test('sections in order', () => {
  const ids = [...html().matchAll(/<section[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids, ['hero', 'about', 'built', 'teaching', 'contact']);
});

test('languages paired', () => {
  const h = html();
  const en = (h.match(/data-lang="en"/g) || []).length;
  const ar = (h.match(/data-lang="ar"/g) || []).length;
  assert.ok(en > 0, 'no English blocks');
  assert.equal(en, ar);
});

// Zaid chose to show his number for WhatsApp (2026-11-26): every mention must be that one number, reached through wa.me only
test('phone only as WhatsApp', () => {
  const h = html();
  assert.ok(h.includes('href="https://wa.me/963948990111"'));
  assert.ok(!/href="tel:/.test(h));
  const shown = h.match(/\+963[\d ]+/g) || [];
  assert.ok(shown.length > 0 && shown.every((n) => n.replace(/\D/g, '') === '963948990111'));
});

test('default english', () => {
  const tag = html().match(/<html[^>]*>/)[0];
  assert.match(tag, /lang="en"/);
  assert.match(tag, /dir="ltr"/);
});

test('local links exist', () => {
  const refs = [...html().matchAll(/(?:href|src)="((?:assets|css|js)\/[^"#?]+)"/g)].map((m) => m[1]);
  assert.ok(refs.length > 0);
  for (const r of refs) assert.ok(existsSync(join(root, r)), `missing ${r}`);
});

test('no external scripts', () => {
  assert.ok(!/<script[^>]+src="https?:/.test(html()));
});
