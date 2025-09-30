// api/auth.js (para Vercel Functions)

const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

const {
  CLIENT_ID,
  CLIENT_SECRET,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  AUTH0_DOMAIN,
  REDIRECT_URI,
} = process.env;

if (
  !CLIENT_ID ||
  !CLIENT_SECRET ||
  !AUTH0_CLIENT_ID ||
  !AUTH0_CLIENT_SECRET ||
  !AUTH0_DOMAIN ||
  !REDIRECT_URI
) {
  console.error("Faltan variables de entorno necesarias.");
}

// Función para intercambiar código GitHub por access_token
async function exchangeGitHubCode(code) {
  const resp = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
    }),
  });
  const data = await resp.json();
  return data.access_token;
}

module.exports = async (req, res) => {
  const { url, method } = req;

  // Ruta /api/auth/auth  → redirigir a Auth0 login
  if (url.startsWith('/api/auth/auth') && method === 'GET') {
    const returnTo = req.query.returnTo || '/admin/';
    const authorizeUrl =
      `https://${AUTH0_DOMAIN}/authorize?` +
      `response_type=code&client_id=${AUTH0_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&state=${encodeURIComponent(returnTo)}`;
    res.writeHead(302, { Location: authorizeUrl });
    res.end();
    return;
  }

  // Ruta /api/auth/callback  → Auth0 redirect back
  if (url.startsWith('/api/auth/callback') && method === 'GET') {
    const code = req.query.code;
    const state = req.query.state || '/admin/';

    if (!code) {
      res.status(400).send("Missing code in callback");
      return;
    }

    // Intercambio en Auth0
    const tokenResp = await fetch(`https://${dev-c81j6a8i02bxmujj.us.auth0.com}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id:  EQbZuhjaOe3pS53iVJdL9cq3pHJHNBej,
        client_secret: E36TOJT32Z91uxzwmPuHW9MpVkQq2L_PW88gI9C-KMcUFWHcTiR-SO2e7FcaHWZu ,
        code: code,
        redirect_uri: https://stirring-druid-c2726fadmin.netlify.app/admin/,
      }),
    });
    const tokenData = await tokenResp.json();

    if (tokenData.error) {
      res.status(500).json(tokenData);
      return;
    }

    // Construir JWT para CMS
    const jwtPayload = {
      auth0: tokenData,
    };
    const cmsToken = jwt.sign(jwtPayload, CLIENT_SECRET, { expiresIn: '1h' });

    res.writeHead(302, {
      Location: `${state}?token=${cmsToken}`,
    });
    res.end();
    return;
  }

  // Ruta /api/auth/token → el CMS solicita token GitHub
  if (url.startsWith('/api/auth/token') && method === 'POST') {
    try {
      const { token, github_code } = req.body;

      if (!token) {
        res.status(400).json({ error: "No token provided" });
        return;
      }

      const decoded = jwt.verify(token, CLIENT_SECRET);

      if (!github_code) {
        res.status(400).json({ error: "Missing GitHub code" });
        return;
      }

      const githubAccessToken = await exchangeGitHubCode(github_code);
      if (!githubAccessToken) {
        res.status(500).json({ error: "Failed to get GitHub access token" });
        return;
      }

      const repo_full_name = "TU_USUARIO/TU_REPO_WEB";
      res.json({
        token: githubAccessToken,
        repo_full_name,
      });
    } catch (err) {
      console.error("Error en /api/auth/token:", err);
      res.status(403).json({ error: "Invalid token" });
    }
    return;
  }

  // Si no coincide con rutas esperadas
  res.status(404).send("Not found");
};
