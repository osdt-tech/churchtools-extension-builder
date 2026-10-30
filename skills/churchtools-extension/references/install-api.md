# Installieren und aktualisieren per API

Nicht offiziell dokumentiert, aber vom ChurchTools-Frontend („Erweiterung hinzufügen“) selbst genutzt und getestet:

- **Neu anlegen:** `POST /api/custommodules` mit JSON `{name, shorty, sortKey, inMenu, description}` → Antwort `data.id`
- **Metadaten ändern:** `PUT /api/custommodules/{id}` mit denselben Feldern plus `id`
- **ZIP hochladen (neu oder Update):** `POST /api/files/custom_module/{id}` als `multipart/form-data`, Feld `files[]` = ZIP
- Alle schreibenden Aufrufe mit Header `CSRF-Token` aus `GET /api/csrftoken`

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
