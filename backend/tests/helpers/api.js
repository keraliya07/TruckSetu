const app = require('../../src/app');

async function startTestServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const port = server.address().port;
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${port}/api`,
        close: () =>
          new Promise((closeResolve, closeReject) => {
            server.close((error) => {
              if (error) {
                closeReject(error);
                return;
              }

              closeResolve();
            });
          }),
      });
    });
  });
}

async function readJson(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function createClient(baseUrl) {
  return {
    baseUrl,
    token: null,
    cookie: null,
    async request(path, options = {}) {
      const headers = {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      };

      if (this.token && !headers.Authorization) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      if (this.cookie && !headers.Cookie) {
        headers.Cookie = this.cookie;
      }

      const response = await fetch(`${baseUrl}${path}`, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const body = await readJson(response);
      const setCookie = response.headers.get('set-cookie');

      if (setCookie) {
        this.cookie = setCookie;
      }

      return { response, body };
    },
    async login(email, password) {
      const { response, body } = await this.request('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      if (response.ok && body?.token) {
        this.token = body.token;
      }

      return { response, body };
    },
  };
}

module.exports = {
  createClient,
  startTestServer,
};
