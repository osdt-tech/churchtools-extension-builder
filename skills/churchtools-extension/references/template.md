# Projektvorlage

Diese Dateien im Projektordner `<kuerzel>/` genau so anlegen (Pfade relativ zum Projektordner). Dabei überall `__KUERZEL__` durch das Kürzel und `__TITEL__` durch den Titel der Erweiterung ersetzen. Den Titel vorher HTML-escapen (`&`, `<`, `>`) und Backticks, Backslashes sowie `${` daraus entfernen, weil er in `index.html` und im Template-String in `src/main.js` landet.

Inhalt unverändert übernehmen – nichts kürzen, nichts „verbessern“. Die Vite-Version bleibt fest gepinnt.

## `package.json`

```json
{
  "name": "__KUERZEL__",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": "^20.19.0 || >=22.12.0"
  },
  "scripts": {
    "build": "vite build"
  },
  "devDependencies": {
    "vite": "8.3.8"
  }
}
```

## `vite.config.js`

```js
// base muss exakt dem Kürzel der Erweiterung in ChurchTools entsprechen.
export default {
  base: '/ccm/__KUERZEL__/',
  build: { outDir: 'dist', emptyOutDir: true },
};
```

## `index.html`

```html
<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>__TITEL__</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

## `src/main.js`

```js
import './style.css';

// Instanzspezifische IDs (Gruppen, Kalender ...) hier oben sammeln.

let csrfToken;

async function request(path, { method = 'GET', body, headers = {}, ...rest } = {}) {
  const h = { ...headers };
  if (method !== 'GET') {
    csrfToken ??= (await request('/csrftoken')).data;
    h['CSRF-Token'] = csrfToken;
  }
  if (body !== undefined && !(body instanceof FormData)) {
    h['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }
  const r = await fetch('/api' + path, { ...rest, method, headers: h, body, credentials: 'same-origin' });
  if (!r.ok) {
    const err = new Error('API ' + r.status + ' ' + path);
    err.status = r.status;
    throw err;
  }
  return r.status === 204 ? {} : r.json();
}

/** Ein API-Aufruf, gibt `data` zurück. Schreibende Aufrufe: api(pfad, { method: 'POST', body: {...} }). */
export const api = async (path, opts) => (await request(path, opts)).data ?? null;

/** Alle Seiten einer paginierten Liste (z. B. /groups, /groups/{id}/members). */
export async function apiAll(path, limit = 100) {
  const sep = path.includes('?') ? '&' : '?';
  const out = [];
  for (let page = 1; ; page++) {
    const res = await request(`${path}${sep}page=${page}&limit=${limit}`);
    out.push(...(res.data ?? []));
    const last = res.meta?.pagination?.lastPage ?? page;
    if (page >= last) return out;
  }
}

/** Benutzerdaten vor der Ausgabe in HTML immer hiermit escapen. */
export const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function errorText(err) {
  if (err.status === 401) return 'Bitte melde dich in ChurchTools an.';
  if (err.status === 403) return 'Dir fehlt die Berechtigung für diese Daten.';
  return 'Die Daten konnten nicht geladen werden.';
}

const app = document.querySelector('#app');

async function start() {
  app.innerHTML = '<div class="ct-ext"><p class="ct-ext__muted">Lädt …</p></div>';
  try {
    const me = await api('/whoami?only_allow_authenticated=true');
    app.innerHTML = `
      <div class="ct-ext">
        <header class="ct-ext__header"><h1>__TITEL__</h1></header>
        <section class="ct-ext__card">Hallo ${esc(me.firstName)}!</section>
      </div>`;
  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="ct-ext"><p class="ct-ext__error">${esc(errorText(err))}</p></div>`;
  }
}

start();
```

## `src/style.css`

```css
/* Alles unter .ct-ext kapseln, damit das ChurchTools-Layout unverändert bleibt. */
.ct-ext {
  --ct-primary: #2d6a8f;
  --ct-accent: #e0a526;
  --ct-text: #1f2933;
  --ct-muted: #6b7680;
  --ct-bg: #ffffff;
  --ct-surface: #f5f7f9;
  font-family: "Lato", "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: var(--ct-text);
  background: var(--ct-bg);
  max-width: 960px;
  margin: 0 auto;
  padding: 16px;
  box-sizing: border-box;
}
.ct-ext *, .ct-ext *::before, .ct-ext *::after { box-sizing: inherit; }
.ct-ext__header {
  background: var(--ct-primary);
  border-bottom: 3px solid var(--ct-accent);
  border-radius: 8px 8px 0 0;
  padding: 16px 20px;
}
.ct-ext__header h1 { margin: 0; font-size: 1.4rem; color: #fff; }
.ct-ext__card {
  background: var(--ct-surface);
  border: 1px solid #dde3e8;
  border-radius: 8px;
  padding: 20px;
  margin-top: 16px;
}
.ct-ext__muted { color: var(--ct-muted); }
.ct-ext__error {
  border: 1px solid #c0392b;
  border-radius: 8px;
  padding: 16px 20px;
  color: #922b21;
  background: #fdf1ef;
}
.ct-ext button, .ct-ext .ct-ext__button {
  min-height: 40px;
  padding: 0 16px;
  border: 0;
  border-radius: 6px;
  background: var(--ct-accent);
  color: var(--ct-text);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
```
