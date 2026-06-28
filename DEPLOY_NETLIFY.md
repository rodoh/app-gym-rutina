# Deploy en Netlify

Esta app esta lista para alojarse en Netlify como proyecto Next.js.

## Configuracion incluida

- `netlify.toml`: comando de build, publish directory y variables no sensibles.
- `.nvmrc`: Node 22.
- `package.json`: `packageManager` con pnpm y `engines.node`.
- `.gitignore`: excluye `.env.local`, `.next/` y `node_modules/`.

## Variables de entorno en Netlify

En Netlify, ir a:

`Project configuration` -> `Environment variables`

Agregar estas variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://zfbhuxffmfiknslcncss.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
NEXT_PUBLIC_TRAINING_OWNER_ID=rodri
```

La anon key de Supabase es una clave publica de cliente, pero debe estar configurada en Netlify para que el build la incluya en la app.

## Deploy desde GitHub

1. Subir el proyecto a GitHub.
2. En Netlify, elegir `Add new project` -> `Import an existing project`.
3. Seleccionar el repositorio.
4. Netlify deberia detectar Next.js automaticamente.
5. Confirmar:

```bash
Build command: pnpm build
Publish directory: .next
Node version: 22
```

6. Cargar las variables de entorno anteriores.
7. Ejecutar `Deploy`.

## Deploy con Netlify CLI

Instalar y autenticar:

```bash
npm install -g netlify-cli
netlify login
```

Crear o linkear el sitio:

```bash
netlify init
```

Deploy de prueba:

```bash
netlify deploy
```

Deploy productivo:

```bash
netlify deploy --prod
```

## Verificacion despues del deploy

1. Abrir la URL de Netlify.
2. Entrar a la app.
3. Crear una sesion de entrenamiento de prueba.
4. Confirmar en Supabase que `public.training_state.sessions` aumenta.

## Nota sobre Supabase

La base ya esta preparada con `public.training_state`. Si recreas el proyecto Supabase, ejecutar nuevamente:

```sql
-- contenido de supabase/schema.sql
```
