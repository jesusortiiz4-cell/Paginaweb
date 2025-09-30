const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const {
  CLIENT_ID,
  CLIENT_SECRET,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  AUTH0_DOMAIN,
  REDIRECT_URI
} = process.env;

// Ruta para iniciar el proceso OAuth
app.get('/auth', async (req, res) => {
  // Aquí podrías redirigir al usuario a Auth0 login si aún no lo está
  const returnTo = req.query.returnTo || '/admin/';
  const authorizeUrl = `https://${AUTH0_DOMAIN}/authorize?` +
    `response_type=code&client_id=${AUTH0_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&state=${encodeURIComponent(returnTo)}`;
  res.redirect(authorizeUrl);
});

// Ruta de callback de Auth0 → intercambiar código por token
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  const state = req.query.state || '/admin/';

  if (!code) {
    return res.status(400).send('Missing code in callback');
  }

  // Intercambiar código por token en Auth0
  const tokenResponse = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      code: code,
      redirect_uri: REDIRECT_URI
    })
  });

  const tokenData = await tokenResponse.json();
  if (tokenData.error) {
    return res.status(500).json(tokenData);
  }

  // Ahora tienes token de Auth0 (id_token, access_token)
  const idToken = tokenData.id_token;

  // Puedes verificar el idToken, extraer datos de usuario, etc.

  // Generar un JWT propio para mandar al frontend (CMS)
  const jwtPayload = {
    sub: "user:" + Date.now(),  // puedes usar algo más real
    auth0: tokenData
  };
  const cmsToken = jwt.sign(jwtPayload, CLIENT_SECRET, { expiresIn: '1h' });

  // Redirigir al frontend CMS con ese token en fragmento o query
  // Por ejemplo, redirigir a `/admin/?token=...`
  res.redirect(`${state}?token=${cmsToken}`);
});

// Ruta para que CMS intercambie token por credenciales de GitHub
app.post('/token', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, CLIENT_SECRET);
    // Aquí podrías verificar que el usuario está autorizado

    // Luego intercambiar por credenciales de GitHub (o firma)
    // **Este paso depende del proveedor OAuth de GitHub** y cómo lo quieras hacer.
    // Para ejemplo simple:
    const githubAccessToken = "SIMULATED_GITHUB_TOKEN";

    return res.json({
      token: githubAccessToken,
      repo_full_name: "TU_USUARIO/TU_REPO_WEB"
    });
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`OAuth server running at http://localhost:${port}`);
});

