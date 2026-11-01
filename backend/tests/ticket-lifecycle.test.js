import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidStatusTransition } from '../src/services/ticket.service.js';
import { hasPermission } from '../src/services/authorization.service.js';

test('ticket lifecycle accepts only explicit transitions', () => {
  const valid = [
    ['open', 'in_progress'],
    ['in_progress', 'pending'],
    ['pending', 'in_progress'],
    ['in_progress', 'resolved'],
    ['resolved', 'in_progress'],
    ['resolved', 'closed'],
  ];
  valid.forEach(([from, to]) => assert.equal(isValidStatusTransition(from, to), true));
  assert.equal(isValidStatusTransition('open', 'resolved'), false);
  assert.equal(isValidStatusTransition('closed', 'in_progress'), false);
});

test('internal notes are restricted to workspace staff', () => {
  assert.equal(hasPermission('admin', 'internal_comment'), true);
  assert.equal(hasPermission('agent', 'internal_comment'), true);
  assert.equal(hasPermission('reporter', 'internal_comment'), false);
  assert.equal(hasPermission('viewer', 'internal_comment'), false);
});
