export default async function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || `${process.env.SITE_URL || ''}/api/auth/callback`;
  const scope = process.env.GITHUB_SCOPE || 'repo,user:email';
  const state = Math.random().toString(36).slice(2);

  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('scope', scope);
  authorizeUrl.searchParams.set('state', state);
  res.setHeader('Cache-Control', 'no-store');
  res.writeHead(302, { Location: authorizeUrl.toString() });
  res.end();
}
