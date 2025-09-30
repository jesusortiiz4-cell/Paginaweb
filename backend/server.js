const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Variables de entorno
const {
  CLIENT_ID,
  CLIENT_SECRET,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  AUTH0_DOMAIN,
  REDIRECT_URI
} = process.env;

if (!CLIENT_ID || !CLIENT_SECRET || !AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET || !AUTH0_DOMAIN || !REDIRECT_URI) {
  console.error("Faltan variables de entorno. Asegúrate de configurar .env correctamente.");
  process.exit(1);
}

/**
 * /auth
 * Redirige al usuario a Auth0 para que inicie sesión
 * El CMS redirige al backend con query param `returnTo` opcional.
 */
app.get('/auth', (req, res) => {
  const returnTo = req.query.returnTo || '/admin/';
  const authorizeUrl = `https://${AUTH0_DOMAIN}/authorize?` +
    `response_type=code&client_id=${AUTH0_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&state=${encodeURIComponent(returnTo)}`;
  res.redirect(authorizeUrl);
});

/**
 * /callback
 * Auth0 redirige aquí luego del login con un `code`
 * Aquí intercambiamos ese código por tokens en Auth0
 * Luego generamos un JWT propio y redirigimos al CMS con ese JWT
 */
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  const state = req.query.state || '/admin/';

  if (!code) {
    return res.status(400).send("Falta el código en la callback de Auth0");
  }

  try {
    // Intercambio de código por tokens en Auth0
    const tokenResponse = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
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
      console.error("Error al obtener tokens de Auth0:", tokenData);
      return res.status(500).json(tokenData);
    }

    // Podrías verificar el id_token, por ejemplo con jwt.verify()
    // Ahora construimos un payload para tu JWT interno
    const jwtPayload = {
      auth0: tokenData,  // puedes extraer sólo lo que necesites
      // puedes agregar info extra como “user”, roles, permisos, etc.
    };

    // Firmamos el token con CLIENT_SECRET
    const cmsToken = jwt.sign(jwtPayload, CLIENT_SECRET, { expiresIn: '1h' });

    // Redirigimos de nuevo al CMS con el token
    res.redirect(`${state}?token=${cmsToken}`);
  } catch (err) {
    console.error("Error en /callback:", err);
    res.status(500).send("Error en el callback de autenticación");
  }
});

/**
 * /token
 * El CMS (frontend) llama aquí con el JWT interno para obtener acceso a GitHub
 */
app.post('/token', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "No se proporcionó token" });
  }

  try {
    // Verificamos el JWT que generaste anteriormente
    const decoded = jwt.verify(token, CLIENT_SECRET);

    // Aquí podrías verificar que el usuario tenga permisos, etc.
    // Luego, necesitas intercambiar con GitHub o firmar peticiones
    // para que CMS pueda modificar el repositorio.

    // Para ejemplo simple, devolvemos un token simulado:
    const githubAccessToken = "TOKEN_DE_GITHUB_REAL";  // Aquí implementa el intercambio real

    // También se necesita el nombre completo del repo
    const repo_full_name = "TU_USUARIO/TU_REPO_WEB";

    return res.json({
      token: githubAccessToken,
      repo_full_name
    });
  } catch (error) {
    console.error("Token inválido o expirado:", error);
    return res.status(403).json({ error: "Token inválido" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`OAuth backend corriendo en puerto ${port}`);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`OAuth server running at http://localhost:${port}`);
});

