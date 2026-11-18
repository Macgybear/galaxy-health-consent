# Galaxy Health OAuth consent

Static consent page for a personal Galaxy Health project. No sleep records, administrative keys or client secrets are stored in this repository. The publishable Supabase key in the browser bundle identifies the project and confers no private table access.

The page signs in with an email OTP and uses Supabase OAuth APIs to display and approve/deny an authorization request. Browser auth sessions are held in memory only; no analytics or third-party scripts are loaded. Hosting providers can log visit metadata.

Free GitHub Pages deployment: main branch, repository root. Supabase Site URL must point to this Pages URL and OAuth authorization path must be `/index.html`. OAuth server, user/client allowlists and audience validation must be configured separately before private sleep access works.

Source: app-source.js. Build with `npm ci`, then `npx esbuild app-source.js --bundle --format=esm --minify --target=es2022 --outfile=app.js`. Dependencies are pinned in package-lock.json. No secrets are needed to build.
