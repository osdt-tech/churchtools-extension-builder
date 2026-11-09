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
