const app = require('../src/app');

const jsonHeaders = {
  'Content-Type': 'application/json',
};

async function main() {
const email = `phase2.${Date.now()}@trucksetu.dev`;
  const originalPassword = 'Phase2Pass123';
  const nextPassword = 'Phase2Pass456';

  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}/api`;

    try {
      const registerResponse = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({
          name: 'Phase 2 Smoke User',
          email,
          password: originalPassword,
          phone: '9876543211',
          role: 'WAREHOUSE',
        }),
      });
      const registerBody = await registerResponse.json();

      if (!registerResponse.ok || !registerBody.token || !registerBody.verification?.devToken) {
        throw new Error(`register failed: ${registerResponse.status} ${JSON.stringify(registerBody)}`);
      }

      const verifyResponse = await fetch(`${baseUrl}/auth/verify-email`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ token: registerBody.verification.devToken }),
      });
      const verifyBody = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(`verify failed: ${verifyResponse.status} ${JSON.stringify(verifyBody)}`);
      }

      const loginResponse = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({
          email,
          password: originalPassword,
        }),
      });
      const loginBody = await loginResponse.json();
      const loginCookie = loginResponse.headers.get('set-cookie');

      if (!loginResponse.ok || !loginBody.token || !loginCookie) {
        throw new Error(`login failed: ${loginResponse.status} ${JSON.stringify(loginBody)}`);
      }

      const forgotResponse = await fetch(`${baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ email }),
      });
      const forgotBody = await forgotResponse.json();

      if (!forgotResponse.ok || !forgotBody.devToken) {
        throw new Error(`forgot password failed: ${forgotResponse.status} ${JSON.stringify(forgotBody)}`);
      }

      const resetResponse = await fetch(`${baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({
          token: forgotBody.devToken,
          password: nextPassword,
        }),
      });
      const resetBody = await resetResponse.json();

      if (!resetResponse.ok) {
        throw new Error(`reset failed: ${resetResponse.status} ${JSON.stringify(resetBody)}`);
      }

      const reloginResponse = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({
          email,
          password: nextPassword,
        }),
      });
      const reloginBody = await reloginResponse.json();

      if (!reloginResponse.ok || !reloginBody.token) {
        throw new Error(`relogin failed: ${reloginResponse.status} ${JSON.stringify(reloginBody)}`);
      }

      const logoutResponse = await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          Cookie: loginCookie,
        },
      });
      const logoutBody = await logoutResponse.json();

      if (!logoutResponse.ok || !logoutBody.success) {
        throw new Error(`logout failed: ${logoutResponse.status} ${JSON.stringify(logoutBody)}`);
      }

      console.log(
        JSON.stringify({
          register: registerResponse.status,
          verify: verifyResponse.status,
          login: loginResponse.status,
          forgotPassword: forgotResponse.status,
          resetPassword: resetResponse.status,
          relogin: reloginResponse.status,
          logout: logoutResponse.status,
          email,
        })
      );
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      server.close();
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
