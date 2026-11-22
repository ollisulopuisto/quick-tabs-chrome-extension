'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const manifest = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'quick-tabs', 'manifest.json'), 'utf8'));

/* The pinned "key" keeps the extension ID stable across install paths, so
   chrome.storage.local (custom CSS, settings, history) survives upgrades. */

test('manifest pins a public key', () => {
  assert.equal(typeof manifest.key, 'string');
  assert.ok(manifest.key.length > 100);
});

test('the pinned key is valid base64 DER of an RSA public key', () => {
  const der = Buffer.from(manifest.key, 'base64');
  assert.equal(der.toString('base64'), manifest.key, 'must be canonical base64');
  const key = crypto.createPublicKey({ key: der, format: 'der', type: 'spki' });
  assert.equal(key.asymmetricKeyType, 'rsa');
});

test('the derived extension ID is a valid 32-char a-p ID', () => {
  const der = Buffer.from(manifest.key, 'base64');
  const digest = crypto.createHash('sha256').update(der).digest();
  let id = '';
  for (const byte of digest.subarray(0, 16)) {
    id += String.fromCharCode(97 + (byte >> 4)) + String.fromCharCode(97 + (byte & 15));
  }
  assert.match(id, /^[a-p]{32}$/);
});
