# Proyecto con Netlify CMS + Auth0 protector (preparado)

He añadido una interfaz de administración ligera usando **Netlify CMS** y un protector de acceso con **Auth0**.
El admin está en `/admin/` y carga Netlify CMS solo si el usuario se ha autenticado con Auth0.

### Qué incluye
- `/admin/index.html` - página de entrada que verifica sesión con Auth0 y luego carga Netlify CMS.
- `/admin/config.yml` - configuración básica de Netlify CMS (usa backend `github`).
- `content/` - carpetas `pages` y `posts` donde Netlify CMS guardará los archivos.
- `static/uploads/` - carpeta donde irán los archivos subidos por el CMS.
- `vercel.json` - rewrites para servir `/admin` desde `/admin/index.html`.

### Pasos para dejarlo completamente listo (lo más importante)
1. **Sube este repo a GitHub** (por ejemplo `tu-usuario/tu-repo`).
2. **Crea una GitHub OAuth App**:
   - En GitHub: Settings → Developer settings → OAuth Apps → New OAuth App.
   - `Application name`: Netlify CMS for <tu-repo>
   - `Homepage URL`: https://<your-vercel-domain>/
   - `Authorization callback URL`: https://<your-vercel-domain>/admin/
   - Anota el **Client ID** (lo usarás en `admin/config.yml` como `app_id`) y el **Client Secret** (no lo metas en el repositorio).
3. Edita `admin/config.yml`:
   - Reemplaza `repo` por `tu-usuario/tu-repo`.
   - Reemplaza `app_id` por el Client ID de la OAuth App de GitHub.
4. **Variables de entorno en Vercel** (ir a la configuración del proyecto en Vercel → Environment Variables):
   - `AUTH0_DOMAIN` = `dev-c81j6a8i02bxmujj.us.auth0.com` (ya usado en admin/index.html)
   - `AUTH0_CLIENT_ID` = `EQbZuhjaOe3pS53iVJdL9cq3pHJHNBej`
   - **(Opcional/seguro)** No pongas el Auth0 Client Secret en el frontend; úsalo sólo en servidores si necesitas flows que lo requieran.
   - `GITHUB_OAUTH_APP_ID` = (Client ID from GitHub OAuth App)
5. **Deploy en Vercel**
   - Conecta el repo con Vercel y despliega.
   - En Vercel, asegúrate de añadir las variables de entorno indicadas.
6. **Permisos en GitHub**
   - Asegúrate de que la OAuth App tenga permisos para `repo` si quieres que Netlify CMS haga commits directos.
7. **Uso**
   - Accede a `https://<your-vercel-domain>/admin/`.
   - Haz login con Auth0. Si tu cuenta Auth0 está permitida (o si configuras reglas en Auth0 para permitir tu email), verás el panel de Netlify CMS.
   - El CMS hace commits al repo (por eso necesitas configurar la OAuth app y permisos).

### Notas de seguridad
- Evita poner `AUTH0_CLIENT_SECRET` en archivos dentro del repo. Usa variables de entorno en Vercel.
- El flujo actual protege la UI de administración con Auth0, pero Netlify CMS aún requiere un backend GitHub configurado (OAuth App) para escribir en el repo.

Si quieres, puedo:
- Agregar un script que preconfigure `admin/config.yml` automáticamente con tu repo.
- Integrar un "sign-in" especial que permita solo usuarios específicos desde Auth0 (por ejemplo mediante reglas).
- Ayudarte a crear la GitHub OAuth App (te doy los pasos exactos para copiar/pegar).
