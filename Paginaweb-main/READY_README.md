# Paginaweb – Vercel + Decap CMS listo

## Pasos en Vercel
1. Importa este repo.
2. Crea variables:
   - SITE_URL = https://paginaweb-sand-five.vercel.app
   - GITHUB_CLIENT_ID = Iv23li219WgNrf6r2eQT
   - GITHUB_CLIENT_SECRET = e8433ac70fb100c75df91162cf6d116b929de890
   - (opcional) GITHUB_SCOPE = repo,user:email
   - (opcional) GITHUB_REDIRECT_URI = https://<tu-dominio>/api/auth/callback
3. Haz redeploy.
4. Entra a /admin e inicia sesión con GitHub.

## GitHub (OAuth)
En tu OAuth App configura:
- Authorization callback URL: https://<tu-dominio>/api/auth/callback

## Nota
Cambia tus secretos apenas funcione (rotación).
