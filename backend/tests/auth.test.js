import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

const startServer = () => {
  const server = app.listen(0);
  return { server, port: server.address().port };
};

test('protected auth routes reject requests without a bearer token', async () => {
  const { server, port } = startServer();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/auth/me`);
    assert.equal(response.status, 401);
    const body = await response.json();
    assert.equal(body.error.code, 'UNAUTHORIZED');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('ticket creation rejects requests without authentication', async () => {
  const { server, port } = startServer();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/organizations/1/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Unauthenticated ticket' }),
    });
    assert.equal(response.status, 401);
    const body = await response.json();
    assert.equal(body.error.code, 'UNAUTHORIZED');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('health reports database availability independently from the API', async () => {
  const { server, port } = startServer();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.api.connected, true);
    assert.equal(typeof body.database.connected, 'boolean');
    assert.equal(body.status, body.database.connected ? 'ok' : 'degraded');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
