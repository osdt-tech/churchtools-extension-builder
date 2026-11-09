# Installieren und aktualisieren per API

Stand: abgeglichen mit der OpenAPI-Spezifikation von ChurchTools 3.138.1.

- **Neu anlegen:** `POST /api/custommodules` mit JSON `{name, shorty, sortKey, inMenu, description}`. Die Antwort enthält `data.id`.
- **Metadaten ändern:** `PUT /api/custommodules/{id}` mit denselben Feldern plus `id`
- **ZIP hochladen (neu oder Update):** `POST /api/files/custom_module/{id}` als `multipart/form-data`, Feld `files[]` = ZIP
- Alle schreibenden Aufrufe mit Header `CSRF-Token` aus `GET /api/csrftoken`

Dokumentationsstand:
- Der **Upload** ist offiziell dokumentiert (`POST /files/{domainType}/{domainIdentifier}`, `custom_module` als erlaubter `domainType`, Feld `files[]`). Er erfordert Schreibrechte auf die Erweiterung.
- **`/custommodules` (GET/POST/PUT) steht weiterhin nicht in der Spec.** Das ChurchTools-Frontend („Erweiterung hinzufügen“) nutzt diese Endpunkte selbst, deshalb funktionieren sie. Sie können sich aber ohne Ankündigung ändern. Die Spec enthält nur die Schemas dazu (`CustomModule`, `CustomModuleCreate`):
  - `name`: Pflicht, 1–100 Zeichen
  - `sortKey`: Pflicht, Ganzzahl
  - `inMenu`: Pflicht, Boolean
  - `description`: optional, max. 300 Zeichen
  - `shorty`: Pflicht beim Anlegen, 2–50 Zeichen
- `GET /api/custommodules` kann auch ohne Anmeldung abrufbar sein. Name und Beschreibung einer Erweiterung daher als öffentlich behandeln und keine internen Infos hineinschreiben.

## Ablauf mit Browser-Werkzeug

Im Tab ausführen, in dem der Benutzer bei `<INSTANZ>` angemeldet ist (nur dort liegen die Session-Cookies).

1. ZIP als Base64 in einer Zeile erzeugen und den Inhalt lesen. Kleine Bundles (ohne churchtools-client) halten das Base64 kurz.
   - macOS/Linux: `base64 < <kuerzel>-extension.zip | tr -d '\n' > zip.b64` (nicht `base64 -w0`, das gibt es auf macOS nicht)
   - Windows (PowerShell): `[Convert]::ToBase64String([IO.File]::ReadAllBytes("$PWD\<kuerzel>-extension.zip")) | Set-Content -NoNewline zip.b64`
2. Skript ausführen. `NAME` und `DESCRIPTION` als gültige JS-Strings einsetzen (Anführungszeichen escapen). Das Skript ist bewusst in eine async-Funktion gepackt, weil nicht jedes Browser-Werkzeug `await` auf oberster Ebene ausführt.

```js
(async () => {
  const SHORTY = '<kuerzel>', NAME = '<Name>', DESCRIPTION = '<Beschreibung>';
  const b64 = '<INHALT VON zip.b64>';
  const call = async (step, path, opts = {}) => {
    const r = await fetch('/api' + path, { credentials: 'same-origin', ...opts });
    const text = await r.text();
    if (!r.ok) throw new Error(step + ': HTTP ' + r.status + ' ' + text.slice(0, 300));
    return text ? JSON.parse(text).data : null;
  };
  try {
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const tok = await call('CSRF-Token', '/csrftoken');
    const existing = (await call('Erweiterungen lesen', '/custommodules')).find(m => m.shorty === SHORTY);
    let id = existing && existing.id;
    if (!id) {
      id = (await call('Anlegen', '/custommodules', { method: 'POST', headers: { 'Content-Type': 'application/json', 'CSRF-Token': tok },
        body: JSON.stringify({ name: NAME, shorty: SHORTY, sortKey: 0, inMenu: true, description: DESCRIPTION }) })).id;
    }
    const fd = new FormData();
    fd.append('files[]', new File([bytes], SHORTY + '-extension.zip', { type: 'application/zip' }));
    await call('Upload', '/files/custom_module/' + id, { method: 'POST', headers: { 'CSRF-Token': tok }, body: fd });
    return JSON.stringify({ ok: true, id, existed: !!existing });
  } catch (e) {
    return JSON.stringify({ ok: false, error: String(e.message || e) });
  }
})();
```

3. Ergebnis lesen: Bei `ok: false` nennt `error` den fehlgeschlagenen Schritt samt Statuscode und Antwort von ChurchTools. Nicht blind wiederholen, sondern die Ursache beheben (siehe Hinweise).

## Hinweise
- Manche Browser-Werkzeuge blockieren Ausgaben mit URLs, die `?`, `=` oder `&` enthalten. Dann in der Ausgabe `.replace(/[?=&]/g, ' ')` anwenden.
- Ist das Base64 zu groß für einen Aufruf: auf manuellen Upload (Weg A in SKILL.md) ausweichen.
- `Anlegen: HTTP 403` / `Upload: HTTP 403`: Der Benutzer hat keine Admin-Rechte für Erweiterungen bzw. keine Schreibrechte auf diese Erweiterung.
- `Anlegen: HTTP 400/409/422`: meist ist das Kürzel schon vergeben oder ungültig (2–50 Zeichen). Anderes Kürzel wählen und `base` in `vite.config.js` anpassen, dann neu bauen.
- `CSRF-Token: HTTP 401`: Der Benutzer ist in diesem Tab nicht (mehr) angemeldet.
