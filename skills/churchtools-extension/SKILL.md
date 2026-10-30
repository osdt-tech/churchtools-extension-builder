---
name: churchtools-extension
description: "Nutzen, wenn jemand eine eigene ChurchTools-Erweiterung (Custom Module unter /ccm/...) für seine ChurchTools-Instanz bauen, ändern, als ZIP packen oder hochladen will – z. B. „bau mir eine ChurchTools-Erweiterung“, „Extension für ChurchTools“, „Custom Module hochladen“, „Seite in ChurchTools mit eigener App“."
---

# ChurchTools-Erweiterung bauen und installieren

Funktioniert mit jeder ChurchTools-Instanz (`https://<gemeinde>.church.tools` oder eigene Domain).

## 1. Instanz und Rahmen klären

Vor dem Bauen festlegen (fehlendes in **einer** Rückfrage klären):

1. **Instanz-URL** (`<INSTANZ>`): Ist ein Browser-Tab mit ChurchTools offen, die URL daraus übernehmen. Sonst nachfragen.
2. **Kürzel** (`<kuerzel>`): kurz, nur Kleinbuchstaben/Ziffern/Bindestrich, z. B. `dienstplan`. Vor dem Anlegen mit `GET /api/custommodules` prüfen, dass es noch frei ist.
3. **Zweck und Daten**: Was soll die Erweiterung zeigen oder tun, welche Gruppen/Personen/Termine betrifft sie, wer nutzt sie?
4. **Design**: Farben und Schrift der Gemeinde (Hex-Werte, Logo-Stil). Ohne Angabe: neutrales Design aus `references/design.md`.

Rechte: Erweiterungen anlegen und hochladen erfordert Admin-Rechte in ChurchTools. Hat der Benutzer sie nicht, nur die ZIP liefern und erklären, dass ein Admin sie unter *Admin-Einstellungen → Erweiterungen* hochlädt.

## 2. Wie Erweiterungen funktionieren

- Eine Erweiterung ist eine statische Web-App (`index.html` + `assets/`), hochgeladen als ZIP (max. ca. 10 MB).
- Im ZIP liegen `index.html` und `assets/` **direkt im Wurzelverzeichnis** (kein Unterordner).
- ChurchTools liefert sie unter `<INSTANZ>/ccm/<kuerzel>/` aus, innerhalb des normalen ChurchTools-Rahmens. Die App rendert in `<div id="app">`.
- Alle Asset-Pfade beginnen absolut mit `/ccm/<kuerzel>/` → in Vite `base: '/ccm/<kuerzel>/'`.
- **Kürzel (shorty) und `base` müssen exakt übereinstimmen** (inkl. Groß-/Kleinschreibung), sonst bleibt die Seite leer.
- Anmeldung: Die App läuft auf derselben Domain und nutzt die Session des angemeldeten Benutzers. `fetch('/api/...')` reicht. `@churchtools/churchtools-client` ist optional (Basis-URL aus `window.settings.base_url`), vergrößert das Bundle aber um ca. 100 KB.
- Die App sieht nur, was der angemeldete Benutzer in ChurchTools sehen darf. Fehlende Rechte führen zu 401/403 – in der Oberfläche freundlich abfangen.

## 3. Projekt anlegen

Im Arbeitsverzeichnis (nicht im Ordner des Benutzers, außer er will den Quellcode dort haben):

```bash
mkdir -p <kuerzel> && cd <kuerzel>
npm init -y
npm i -D vite@5.4.10
```

`vite.config.js`:
```js
export default { base: '/ccm/<kuerzel>/', build: { outDir: 'dist', emptyOutDir: true } };
```

`index.html`:
```html
<!doctype html>
<html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Titel</title></head>
<body><div id="app"></div><script type="module" src="/src/main.js"></script></body></html>
```

`src/main.js` – Grundgerüst:
```js
import './style.css';
const api = async (path, opts = {}) => {
  const r = await fetch('/api' + path, { credentials: 'same-origin', ...opts });
  if (!r.ok) throw new Error('API ' + r.status + ' ' + path);
  return r.status === 204 ? null : (await r.json()).data;
};
const csrf = async () => (await api('/csrftoken'));
const app = document.querySelector('#app');
// Beispiel: const me = await api('/whoami');
```

Regeln für den Code:
- Schreibende Aufrufe (POST/PUT/PATCH/DELETE) brauchen den Header `CSRF-Token` mit dem Wert aus `GET /api/csrftoken`.
- Alle Benutzerdaten vor der Ausgabe HTML-escapen.
- CSS unter einer eigenen Wurzelklasse (z. B. `.ct-ext`) kapseln, damit das ChurchTools-Layout unverändert bleibt.
- Keine instanzspezifischen IDs (Gruppen-, Personen-, Kalender-IDs) hart codieren, wenn sie sich ermitteln lassen; sonst als Konstanten oben in `main.js` sammeln und dem Benutzer nennen.
- Mobil nutzbar bauen (ChurchTools wird oft am Handy geöffnet).

Wichtige Endpunkte: `references/api.md`. Bei Unsicherheit die OpenAPI-Doku der Instanz prüfen unter `<INSTANZ>/api`.

## 4. Bauen und packen

```bash
npx vite build
cd dist && zip -qr ../<kuerzel>-extension.zip . && cd ..
unzip -l <kuerzel>-extension.zip   # prüfen: index.html + assets/ im Wurzelverzeichnis
```

Die ZIP dem Benutzer als Datei übergeben (in Cowork per Datei-Freigabe, in Claude Code den Pfad nennen).

## 5. Installieren

Zwei Wege – den Benutzer wählen lassen, wenn unklar:

**A. Manuell (immer möglich):** Benutzer öffnet `<INSTANZ>/custom/modules/overview` → „Erweiterung hinzufügen“ → Name, Kürzel (= `<kuerzel>`), ggf. „im Menü anzeigen“ → ZIP hochladen. Bei Updates dieselbe Erweiterung öffnen und die neue ZIP hochladen.

**B. Per API im angemeldeten Browser-Tab** (wenn ein Browser-Werkzeug wie Claude in Chrome verfügbar ist): siehe `references/install-api.md`. Neues Anlegen ist eine Admin-Änderung – nur nach ausdrücklicher Zustimmung. Ein Update einer Erweiterung, an der gerade gearbeitet wird, ist nach einmaliger Zustimmung in Ordnung.

## 6. Prüfen

1. `<INSTANZ>/ccm/<kuerzel>` öffnen (bei Browser-Zugriff selbst, sonst den Benutzer bitten).
2. Screenshot ansehen und Konsolenfehler lesen.
3. Leere Seite → Kürzel vs. `base` vergleichen, ZIP-Struktur prüfen, Browser-Cache leeren (Strg+Shift+R).
4. 401/403 → Rechte des Benutzers in ChurchTools prüfen.

## Sicherheit

- Keine Passwörter, Login-Tokens oder Bankdaten in den Code schreiben – die Erweiterung nutzt immer die bestehende Session.
- Schreibende API-Aufrufe nur, wenn der Benutzer sie ausdrücklich will; Löschfunktionen in der Erweiterung mit Bestätigungsdialog bauen.
- Personenbezogene Daten (Datenschutz/DSGVO) nur anzeigen, wenn es für den Zweck nötig ist.
