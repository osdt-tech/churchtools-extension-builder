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

1. ZIP als Base64 erzeugen: `base64 -w0 <kuerzel>-extension.zip > zip.b64` und den Inhalt lesen. Kleine Bundles (ohne churchtools-client) halten das Base64 kurz.
2. Skript ausführen:

```js
const b64 = '<INHALT VON zip.b64>';
const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
const tok = (await fetch('/api/csrftoken').then(r => r.json())).data;
const existing = (await fetch('/api/custommodules').then(r => r.json())).data.find(m => m.shorty === '<kuerzel>');
let id = existing && existing.id;
if (!id) {
  const r = await fetch('/api/custommodules', { method: 'POST', headers: { 'Content-Type': 'application/json', 'CSRF-Token': tok },
    body: JSON.stringify({ name: '<Name>', shorty: '<kuerzel>', sortKey: 0, inMenu: true, description: '<Beschreibung>' }) });
  id = (await r.json()).data.id;
}
const fd = new FormData();
fd.append('files[]', new File([bytes], '<kuerzel>-extension.zip', { type: 'application/zip' }));
const r2 = await fetch('/api/files/custom_module/' + id, { method: 'POST', headers: { 'CSRF-Token': tok }, body: fd });
JSON.stringify({ id, existed: !!existing, upload: r2.status });
```

## Hinweise
- Manche Browser-Werkzeuge blockieren Ausgaben mit URLs, die `?`, `=` oder `&` enthalten. Dann in der Ausgabe `.replace(/[?=&]/g, ' ')` anwenden.
- Ist das Base64 zu groß für einen Aufruf: auf manuellen Upload (Weg A in SKILL.md) ausweichen.
- Bei 403: Der Benutzer hat keine Admin-Rechte für Erweiterungen.
