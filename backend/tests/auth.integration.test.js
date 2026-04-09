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

test('auth flow supports register, verify, reset, relogin, and logout', async () => {
const email = `backend.auth.${Date.now()}@trucksetu.dev`;
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

  const reloginResult = await client.login(email, secondPassword);
  assert.equal(reloginResult.response.status, 200);

  const logoutResult = await client.request('/auth/logout', {
    method: 'POST',
  });
  assert.equal(logoutResult.response.status, 200);
  assert.equal(logoutResult.body.success, true);
});

test('demo-domain aliases allow login across legacy and current branding', async () => {
  const localPart = `demo.alias.${Date.now()}`;
  const legacyEmail = `${localPart}@stlos.dev`;
  const currentEmail = `${localPart}@trucksetu.dev`;
  const password = 'TruckSetuAlias123';

  const registerResult = await client.request('/auth/register', {
    method: 'POST',
    body: {
      name: 'Demo Alias Test',
      email: legacyEmail,
      password,
      phone: '9999912345',
      role: 'WAREHOUSE',
    },
  });

  assert.equal(registerResult.response.status, 201);

  const loginResult = await client.login(currentEmail, password);
  assert.equal(loginResult.response.status, 200);
  assert.equal(loginResult.body.user.email, legacyEmail);
});
