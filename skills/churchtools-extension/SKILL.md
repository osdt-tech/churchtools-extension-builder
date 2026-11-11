---
name: churchtools-extension
description: "Nutzen, wenn jemand eine eigene ChurchTools-Erweiterung (Custom Module unter /ccm/...) für seine ChurchTools-Instanz bauen, ändern, als ZIP packen oder hochladen will – z. B. „bau mir eine ChurchTools-Erweiterung“, „Extension für ChurchTools“, „Custom Module hochladen“, „Seite in ChurchTools mit eigener App“."
---

# ChurchTools-Erweiterung bauen und installieren

Funktioniert mit jeder ChurchTools-Instanz (`https://<gemeinde>.church.tools` oder eigene Domain).

## 1. Instanz und Rahmen klären

Vor dem Bauen festlegen (fehlendes in **einer** Rückfrage klären):

1. **Instanz-URL** (`<INSTANZ>`): Ist ein Browser-Tab mit ChurchTools offen, die URL daraus übernehmen. Sonst nachfragen.
2. **Kürzel** (`<kuerzel>`): kurz (2–50 Zeichen), nur Kleinbuchstaben/Ziffern/Bindestrich, z. B. `dienstplan`. Mit Browser-Zugriff vor dem Anlegen per `GET /api/custommodules` prüfen, dass es noch frei ist. Ohne Browser-Zugriff den Benutzer fragen, ob es unter *Erweiterungen* schon eine mit diesem Kürzel gibt; ist es doch vergeben, meldet ChurchTools das beim Anlegen – dann Kürzel und `base` ändern und neu bauen.
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

1. `references/template.md` lesen und die fünf Dateien daraus in `<kuerzel>/` anlegen (`package.json`, `vite.config.js`, `index.html`, `src/main.js`, `src/style.css`) – bis auf die Platzhalter zeichengenau.
2. Dabei in allen Dateien `__KUERZEL__` durch das Kürzel und `__TITEL__` durch den Titel der Erweiterung ersetzen. Den Titel vorher HTML-escapen (`&`, `<`, `>`) und Backticks, Backslashes sowie `${` daraus entfernen.
3. `npm install` im Projektordner ausführen (installiert nur Vite 5.4.21). Meldet `npm` dabei Schwachstellen in Vite/esbuild: Sie betreffen den Entwicklungsserver, den dieser Skill nicht startet. Kein `npm audit fix --force` ausführen und `vite dev`/`vite preview` nicht verwenden.

Die Vorlage bringt mit:
- `vite.config.js` mit `base: '/ccm/<kuerzel>/'`
- `src/main.js` mit den Helfern `api(pfad, { method, body })` (hängt bei schreibenden Aufrufen `CSRF-Token` und `Content-Type` selbst an), `apiAll(pfad)` (lädt alle Seiten paginierter Listen), `esc(wert)` (HTML-Escaping) und einer Fehleranzeige für 401/403
- `src/style.css` mit dem neutralen Design aus `references/design.md`, gekapselt unter `.ct-ext`

Die eigentliche Funktion in `start()` in `src/main.js` einbauen; größere Erweiterungen in weitere Dateien unter `src/` aufteilen.

Regeln für den Code:
- API nur über `api`/`apiAll` aufrufen, nicht mit eigenem `fetch` – sonst fehlt bei POST/PUT/PATCH/DELETE der Header `CSRF-Token`.
- Alle Benutzerdaten vor der Ausgabe mit `esc()` escapen (oder per `textContent` setzen).
- Kein `await` auf oberster Ebene in Modulen (bricht den Build mit dem Standard-Target von Vite); asynchronen Code in Funktionen wie `start()` legen.
- CSS unter der Wurzelklasse `.ct-ext` kapseln, damit das ChurchTools-Layout unverändert bleibt.
- Keine instanzspezifischen IDs (Gruppen-, Personen-, Kalender-IDs) hart codieren, wenn sie sich ermitteln lassen; sonst als Konstanten oben in `main.js` sammeln und dem Benutzer nennen.
- Mobil nutzbar bauen (ChurchTools wird oft am Handy geöffnet).

Soll die Erweiterung etwas **speichern** (Einstellungen, Einträge): den Datenspeicher der Erweiterung nutzen, siehe `references/storage.md`. Keinen externen Dienst dafür anbinden.

Wichtige Endpunkte: `references/api.md`. Bei Unsicherheit die OpenAPI-Doku der Instanz prüfen unter `<INSTANZ>/api` (vollständige Spec: `<INSTANZ>/system/runtime/swagger/openapi-ui.json`, seit 3.138 mit Rechten und Fehlerfällen je Endpunkt).

## 4. Bauen und packen

Alle Befehle im Projektordner `<kuerzel>/` ausführen; dort entsteht auch die ZIP.

macOS/Linux:
```bash
npx vite build
rm -f <kuerzel>-extension.zip   # sonst bleiben alte Assets im Archiv
cd dist && zip -qr ../<kuerzel>-extension.zip . && cd ..
unzip -l <kuerzel>-extension.zip   # prüfen: index.html + assets/ im Wurzelverzeichnis
```

Windows (PowerShell, `zip` fehlt dort meist):
```powershell
npx vite build
Remove-Item <kuerzel>-extension.zip -ErrorAction SilentlyContinue
tar -a -c -f <kuerzel>-extension.zip -C dist index.html assets
tar -t -f <kuerzel>-extension.zip   # prüfen: index.html + assets/... ohne "dist/" davor
```
Liegen in `dist/` weitere Dateien (z. B. aus `public/`), diese im `tar`-Aufruf mit angeben. `Compress-Archive` nur mit PowerShell 7 verwenden; ältere Versionen schreiben Backslashes in die Pfade, und die Erweiterung bleibt dann leer.

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
