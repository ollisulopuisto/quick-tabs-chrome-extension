'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const CenteredWindow = require('../quick-tabs/js/centered-window.js');

const HOST = { left: 100, top: 50, width: 1440, height: 900 };

test('centers horizontally inside the host window', () => {
  const b = CenteredWindow.computeBounds(HOST, 640, 520);
  assert.equal(b.left, 100 + (1440 - 640) / 2);
  assert.equal(b.width, 640);
  assert.equal(b.height, 520);
});

test('sits above the optical center, Alfred-style (~22% from the top)', () => {
  const b = CenteredWindow.computeBounds(HOST, 640, 520);
  assert.equal(b.top, Math.round(50 + (900 - 520) * 0.22));
});

test('clamps to a host window smaller than the requested size', () => {
  const b = CenteredWindow.computeBounds({ left: 0, top: 0, width: 500, height: 400 }, 640, 520);
  assert.equal(b.width, 500);
  assert.equal(b.height, 400);
  assert.equal(b.left, 0);
  assert.equal(b.top, 0);
});

test('never places the window off-screen', () => {
  const b = CenteredWindow.computeBounds(HOST, 640, 520);
  assert.ok(b.left >= HOST.left);
  assert.ok(b.top >= HOST.top);
  assert.ok(b.left + b.width <= HOST.left + HOST.width);
  assert.ok(b.top + b.height <= HOST.top + HOST.height);
});

test('uses defaults when size is omitted', () => {
  const b = CenteredWindow.computeBounds(HOST);
  assert.equal(b.width, CenteredWindow.DEFAULT_WIDTH);
  assert.equal(b.height, CenteredWindow.DEFAULT_HEIGHT);
});

test('handles multi-monitor negative origins', () => {
  const b = CenteredWindow.computeBounds({ left: -1440, top: 0, width: 1440, height: 900 }, 640, 520);
  assert.equal(b.left, -1440 + (1440 - 640) / 2);
  assert.ok(b.left < 0);
});
