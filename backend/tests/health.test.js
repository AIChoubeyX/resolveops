import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

test('GET /api/health returns 200 with status ok and service name', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'resolveops-api');
    assert.ok(body.timestamp, 'Health response must include a timestamp');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /api/unknown-route returns 404 with standard error JSON', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/unknown-route`);
    assert.equal(res.status, 404);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'NOT_FOUND');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
