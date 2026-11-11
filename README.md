# ChurchTools Extension Builder

Lässt Claude eigene Erweiterungen (Custom Modules) für **jede ChurchTools-Instanz** bauen – vom Vite-Projekt über die fertige ZIP bis zur Installation.

## Was das Plugin kann
- Fragt Instanz-URL, Kürzel, Zweck und Design der Gemeinde ab
- Legt aus einer mitgelieferten Vorlage ein schlankes Vite-Projekt mit korrektem `base`-Pfad an
- Speichert Daten bei Bedarf im Datenspeicher der Erweiterung in ChurchTools (kein eigener Server)
- Nutzt die ChurchTools-REST-API mit der Session des angemeldeten Benutzers (keine Passwörter im Code)
- Baut und prüft die ZIP (richtige Struktur für den Upload)
- Installiert/aktualisiert die Erweiterung wahlweise manuell oder – mit Browser-Zugriff (z. B. Claude in Chrome) – automatisch per API
- Prüft das Ergebnis und hilft bei typischen Fehlern (leere Seite, fehlende Rechte)

## Installation
In Claude Code:

```
/plugin marketplace add osdt-tech/churchtools-extension-builder
/plugin install churchtools-extension-builder@osdt
```

Danach einfach beschreiben, was die Erweiterung können soll (siehe Beispiele). Für Updates: `/plugin marketplace update osdt`.

## Voraussetzungen
- Node.js (mit `npm`) auf dem Rechner bzw. in der Umgebung, in der Claude arbeitet
- ChurchTools-Instanz mit aktivierten Erweiterungen
- Admin-Rechte für Erweiterungen zum Hochladen (sonst übernimmt ein Admin den Upload)
- Für den automatischen Upload: Browser-Werkzeug, in dem der Benutzer bei ChurchTools angemeldet ist

## Beispiele
- „Bau mir eine ChurchTools-Erweiterung, die meine Dienste der nächsten 4 Wochen zeigt.“
- „Erweiterung für unsere Instanz gemeinde.church.tools: Geburtstagsliste meiner Gruppen.“
- „Aktualisiere die Erweiterung ‚dienstplan‘ mit der neuen Version.“

## Was das Plugin ausführt, sendet und abruft
Das Plugin besteht nur aus einem Skill (Anweisungen für Claude) und einer Projektvorlage als Markdown-Referenz (`references/template.md`), aus der Claude die Projektdateien der Erweiterung anlegt. Es enthält ausschließlich Markdown-, JSON- und Bilddateien, keine Hooks, keine MCP-Server und keine Skripte, die das Plugin selbst ausführt. Bei der Nutzung kann Claude:
- **lokal ausführen:** `npm install` (lädt Vite 5.4.21 aus der öffentlichen npm-Registry), `npx vite build`, `zip`/`unzip` bzw. `tar`, `base64` – nur im Arbeitsverzeichnis des Projekts.
- **abrufen und senden:** ausschließlich Aufrufe an die ChurchTools-Instanz, die der Benutzer selbst angibt (`<INSTANZ>/api/...`), mit der bestehenden Browser-Session des Benutzers. Schreibende Aufrufe (Erweiterung anlegen, ZIP hochladen) nur nach ausdrücklicher Zustimmung.
- **nicht:** Daten an Dritte oder an den Autor senden, Zugangsdaten speichern oder Einstellungen von Claude ändern.

## Datenschutz
- Das Plugin selbst erhebt, speichert und überträgt keine Daten.
- Die gebaute Erweiterung läuft in ChurchTools und sieht nur Daten, die der angemeldete Benutzer dort sehen darf. Für den Umgang mit personenbezogenen Daten (DSGVO) ist die Gemeinde als Betreiberin der Instanz verantwortlich.
- Fragen und Fehlermeldungen: über die Issues dieses GitHub-Repositorys.

## Hinweis
Die Endpunkte zum Anlegen von Erweiterungen und für ihren Datenspeicher sind von ChurchTools nicht offiziell dokumentiert und können sich ändern. Der manuelle Upload funktioniert immer.

Kein offizielles ChurchTools-Produkt; nicht mit dem Hersteller von ChurchTools verbunden.

## Lizenz
MIT
