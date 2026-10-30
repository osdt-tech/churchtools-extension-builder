# ChurchTools Extension Builder

Lässt Claude eigene Erweiterungen (Custom Modules) für **jede ChurchTools-Instanz** bauen – vom Vite-Projekt über die fertige ZIP bis zur Installation.

## Was das Plugin kann
- Fragt Instanz-URL, Kürzel, Zweck und Design der Gemeinde ab
- Legt ein schlankes Vite-Projekt mit korrektem `base`-Pfad an
- Nutzt die ChurchTools-REST-API mit der Session des angemeldeten Benutzers (keine Passwörter im Code)
- Baut und prüft die ZIP (richtige Struktur für den Upload)
- Installiert/aktualisiert die Erweiterung wahlweise manuell oder – mit Browser-Zugriff (z. B. Claude in Chrome) – automatisch per API
- Prüft das Ergebnis und hilft bei typischen Fehlern (leere Seite, fehlende Rechte)

## Voraussetzungen
- ChurchTools-Instanz mit aktivierten Erweiterungen
- Admin-Rechte für Erweiterungen zum Hochladen (sonst übernimmt ein Admin den Upload)
- Für den automatischen Upload: Browser-Werkzeug, in dem der Benutzer bei ChurchTools angemeldet ist

## Beispiele
- „Bau mir eine ChurchTools-Erweiterung, die meine Dienste der nächsten 4 Wochen zeigt.“
- „Erweiterung für unsere Instanz gemeinde.church.tools: Geburtstagsliste meiner Gruppen.“
- „Aktualisiere die Erweiterung ‚dienstplan‘ mit der neuen Version.“

## Was das Plugin ausführt, sendet und abruft
Das Plugin besteht nur aus einem Skill (Anweisungen für Claude). Es enthält keine Hooks, keine MCP-Server und keinen ausführbaren Code. Bei der Nutzung kann Claude:
- **lokal ausführen:** `npm init`, `npm i -D vite@5.4.10` (aus der öffentlichen npm-Registry), `npx vite build`, `zip`/`unzip`, `base64` – nur im Arbeitsverzeichnis des Projekts.
- **abrufen und senden:** ausschließlich Aufrufe an die ChurchTools-Instanz, die der Benutzer selbst angibt (`<INSTANZ>/api/...`), mit der bestehenden Browser-Session des Benutzers. Schreibende Aufrufe (Erweiterung anlegen, ZIP hochladen) nur nach ausdrücklicher Zustimmung.
- **nicht:** Daten an Dritte oder an den Autor senden, Zugangsdaten speichern oder Einstellungen von Claude ändern.

## Datenschutz
- Das Plugin selbst erhebt, speichert und überträgt keine Daten.
- Die gebaute Erweiterung läuft in ChurchTools und sieht nur Daten, die der angemeldete Benutzer dort sehen darf. Für den Umgang mit personenbezogenen Daten (DSGVO) ist die Gemeinde als Betreiberin der Instanz verantwortlich.
- Fragen und Fehlermeldungen: über die Issues dieses GitHub-Repositorys.

## Hinweis
Die Upload-Endpunkte für Erweiterungen sind von ChurchTools nicht offiziell dokumentiert und können sich ändern. Der manuelle Upload funktioniert immer.

Kein offizielles ChurchTools-Produkt; nicht mit dem Hersteller von ChurchTools verbunden.

## Lizenz
MIT
