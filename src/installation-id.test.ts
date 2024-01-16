import test from 'ava';
import {type Endpoints} from '@octokit/types';
import {installationId} from './installation-id.js';

type Response = Endpoints['GET /app/installations']['response'];
// Type Data = Response['data'];
type Installation = Response['data'][number];
// Function response(data: Data = []): Response {
//   return {status: 200, headers: {}, url: '', data};
// }

function response(
  installations: 0 | 1 | 3,
  account: 'slug' | 'login' = 'login',
): Response {
  const data: Response['data'] = [];
  if (installations >= 1) {
    data.push({id: 1, account: {[account]: 'bob'}} as unknown as Installation);
  }

  if (installations === 3) {
    data.push(
      {id: 2, account: {[account]: 'bob'}} as unknown as Installation,
      {id: 3, account: {[account]: 'alice'}} as unknown as Installation,
    );
  }

  return {status: 200, headers: {}, url: '', data};
}

test('throws an error when "installations" is empty', (t) => {
  t.throws(() => installationId(response(0)), {
    instanceOf: Error,
    message: 'The GitHub App must have at least one installation',
  });
});

test('throws an error with multiple "installations" no "owner"', (t) => {
  t.throws(() => installationId(response(3)), {
    instanceOf: Error,
    message:
      'Without "owner", the GitHub App must have exactly one installation',
  });
});

test('returns the ID with one "installations" and no "owner"', (t) => {
  t.is(installationId(response(1)), 1);
});

test('throws an error when "owner" is not in "installations"', (t) => {
  t.throws(() => installationId(response(1), 'unknown'), {
    instanceOf: Error,
    message: 'The "owner" must have the GitHub App installed',
  });
});

test('returns the first installation ID matching the "owner" with "login"', (t) => {
  t.is(installationId(response(3), 'bob'), 1);
  t.is(installationId(response(3), 'alice'), 3);
});
test('returns the first installation ID matching the "owner" with "slug"', (t) => {
  t.is(installationId(response(3, 'slug'), 'bob'), 1);
  t.is(installationId(response(3, 'slug'), 'alice'), 3);
});
