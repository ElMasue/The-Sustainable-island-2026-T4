# Frontend – React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Mapbox token (for the map)

To show the map locally:

1. **Create the file in the right place**  
   Create `Frontend/.env.local` (inside the **Frontend** folder, next to `package.json`). Not in the project root.

2. **Put exactly this in it** (with your real token):
   ```bash
   VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoi...
   ```
   - No spaces around `=`
   - No quotes unless the token contains spaces
   - Replace `pk.eyJ1Ijoi...` with your token from [account.mapbox.com/access-tokens](https://account.mapbox.com/access-tokens/)

3. **Restart the dev server**  
   Vite only reads `.env.local` when it starts:
   - Stop the server (Ctrl+C in the terminal where `npm run dev` is running)
   - Start again: `cd Frontend && npm run dev`

4. Reload the app in the browser; the map should load if the token is valid.

**Keeping the key off GitHub**

- Put your real token **only** in `Frontend/.env.local`.
- `.env.local` is in `.gitignore`, so Git will **never** commit it. Your token stays only on your machine.
- Never put the real token in `.env.example` or any other file that gets committed.
- Before your first push, you can check: run `git status` in the Frontend folder — `.env.local` should **not** appear. If it does, do **not** run `git add .env.local`.
- For deployed/preview sites (e.g. Vercel, Netlify): do **not** add `VITE_MAPBOX_ACCESS_TOKEN` in the host’s environment settings if you want to avoid using Mapbox quota there.

For online/preview deployments, leave the token unset so the app doesn’t use your Mapbox quota.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
