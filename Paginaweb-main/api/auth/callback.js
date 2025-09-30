  export default async function handler(req, res) {
    try {
      const code = req.query.code;
      if (!code) {
        res.status(400).json({ error: 'Missing code' });
        return;
      }
      const params = new URLSearchParams();
      params.append('client_id', process.env.GITHUB_CLIENT_ID);
      params.append('client_secret', process.env.GITHUB_CLIENT_SECRET);
      params.append('code', code);

      const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: params
      });
      const data = await tokenResp.json();

      const token = data.access_token;
      if (!token) {
        res.status(500).json({ error: 'No token from GitHub', details: data });
        return;
      }

      const html = `<!doctype html>
<html><body>
<script>
  (function() {
    function receiveMessage(e) {
      if (e.origin !== window.location.origin) return;
      window.opener.postMessage('authorization:github:success:' + ${JSON.stringify("TOKEN_PLACEHOLDER")}, e.origin);
      window.close();
    }
    window.addEventListener('message', receiveMessage, false);
    window.opener.postMessage('authorizing:github', window.location.origin);
  })();
</script>
<p>Autenticando… Puedes cerrar esta ventana.</p>
</body></html>`;

      // inject token safely
      const safeHtml = html.replace("TOKEN_PLACEHOLDER", token);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(safeHtml);
    } catch (err) {
      res.status(500).json({ error: 'OAuth error', message: err?.message || String(err) });
    }
  }
