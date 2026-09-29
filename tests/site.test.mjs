import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const read = (name) => {
  const url = new URL(name, root);
  assert.ok(existsSync(url), `${name} should be published`);
  return readFileSync(url, 'utf8');
};

test('landing page links to the approved release, install guide, and privacy policy', () => {
  const html = read('index.html');
  assert.match(html, /https:\/\/github\.com\/codes4free\/clippoint-download\/releases\/latest/);
  assert.match(html, /href="\.\/instalacao\.html"/);
  assert.match(html, /href="\.\/privacidade\.html"/);
});

test('public copy describes the actual caption-only and BYOK limits', () => {
  const html = read('index.html');
  assert.match(html, /legendas nativas públicas/i);
  assert.match(html, /não transcreve áudio/i);
  assert.match(html, /OpenAI e Supadata/i);
  assert.match(html, /comentários públicos recentes/i);
});

test('installation guide is explicit about manual installation and updates', () => {
  const html = read('instalacao.html');
  assert.match(html, /chrome:\/\/extensions/);
  assert.match(html, /Carregar sem compactação/);
  assert.match(html, /atualização automática/i);
  assert.match(html, /fora da Chrome Web Store/i);
});

test('download repository does not contain the extension source or worker code', () => {
  for (const forbidden of ['src', 'worker', 'tests/extension']) {
    assert.equal(existsSync(new URL(forbidden, root)), false, `${forbidden} must not be published`);
  }
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
  const files = walk(fileURLToPath(root));
  assert.equal(files.some((path) => /\.(?:ts|tsx|map|pem|key)$/i.test(path)), false);
});
