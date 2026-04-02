const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');

const { createClient, startTestServer } = require('./helpers/api');

let testServer;
let client;

before(async () => {
  testServer = await startTestServer();
  client = createClient(testServer.baseUrl);
});

after(async () => {
  await testServer.close();
});

test('auth flow supports register, verify, sessions, reset, relogin, and logout', async () => {
  const email = `backend.auth.${Date.now()}@stlos.dev`;
  const firstPassword = 'Phase2Auth123';
  const secondPassword = 'Phase2Auth456';

  const registerResult = await client.request('/auth/register', {
    method: 'POST',
    body: {
      name: 'Backend Auth Test',
      email,
      password: firstPassword,
      phone: '9999912345',
      role: 'WAREHOUSE',
    },
  });

  assert.equal(registerResult.response.status, 201);
  assert.ok(registerResult.body.token);
  assert.ok(registerResult.body.verification.devToken);

  const verifyResult = await client.request('/auth/verify-email', {
    method: 'POST',
    body: { token: registerResult.body.verification.devToken },
  });

  assert.equal(verifyResult.response.status, 200);
  assert.equal(verifyResult.body.message, 'Email verified successfully.');

  const loginResult = await client.login(email, firstPassword);
  assert.equal(loginResult.response.status, 200);
  assert.ok(client.cookie);
  assert.ok(client.token);

  const sessionsResult = await client.request('/auth/sessions');
  assert.equal(sessionsResult.response.status, 200);
  assert.ok(Array.isArray(sessionsResult.body.sessions));
  assert.ok(sessionsResult.body.sessions.length >= 1);
  assert.equal(
    sessionsResult.body.sessions.some((session) => session.isCurrent),
    true
  );

  const forgotResult = await client.request('/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });
  assert.equal(forgotResult.response.status, 200);
  assert.ok(forgotResult.body.devToken);

  const resetResult = await client.request('/auth/reset-password', {
    method: 'POST',
    body: {
      token: forgotResult.body.devToken,
      password: secondPassword,
    },
  });
  assert.equal(resetResult.response.status, 200);

  const staleSessionResult = await client.request('/auth/sessions');
  assert.equal(staleSessionResult.response.status, 401);

  const reloginResult = await client.login(email, secondPassword);
  assert.equal(reloginResult.response.status, 200);

  const logoutResult = await client.request('/auth/logout', {
    method: 'POST',
  });
  assert.equal(logoutResult.response.status, 200);
  assert.equal(logoutResult.body.success, true);
});
