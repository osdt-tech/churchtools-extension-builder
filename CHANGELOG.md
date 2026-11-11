# Changelog

## 0.2.1 – 2026-11-11
- Projektvorlage als Markdown-Referenz (`references/template.md`) statt als Dateien unter `assets/template/` – das Plugin enthält damit nur noch Markdown, JSON und das Icon (Vorgabe des Plugin-Verzeichnisses)
- Anleitung nach Testlauf geschärft: Titel-Escaping direkt im Skill, alte ZIP vor dem Packen löschen, Arbeitsverzeichnis fürs Bauen genannt, Umgang mit `npm audit`-Meldungen

## 0.2.0 – 2026-11-09
- Projektvorlage unter `skills/churchtools-extension/assets/template/` statt Inline-Code im Skill
- Vorlage: `api`-Helfer setzt `CSRF-Token` und `Content-Type` selbst, dazu `apiAll` (Paginierung), `esc` (HTML-Escaping) und Fehleranzeige für 401/403
- Neu: `references/storage.md` – Datenspeicher der Erweiterung (Kategorien und Werte)
- Upload-Skript: Fehlerprüfung je Schritt mit Statuscode und Antwort, läuft ohne `await` auf oberster Ebene
- Base64 und ZIP auch für macOS und Windows beschrieben (`base64 -w0` entfernt)
- Kürzel-Prüfung ohne Browser-Zugriff beschrieben
- Vite 5.4.10 → 5.4.21
- Installation per Marketplace (`.claude-plugin/marketplace.json`) und Installationsabschnitt in der README
- Icon auf 512 × 512 verkleinert (800 KB → 52 KB)

## 0.1.0
- Erste Version; API-Referenzen mit der OpenAPI-Spec von ChurchTools 3.138.1 abgeglichen
