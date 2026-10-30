# Häufig genutzte ChurchTools-API-Endpunkte

Alle Pfade relativ zu `<INSTANZ>/api`. Antworten haben die Form `{ data: ..., meta: ... }`. Listen sind paginiert (`?page=1&limit=100`, Infos in `meta.pagination`).

## Allgemein
- `GET /whoami` – angemeldete Person
- `GET /csrftoken` – Token für schreibende Aufrufe (Header `CSRF-Token`)
- `GET /custommodules` – installierte Erweiterungen und ihre Kürzel

## Personen und Gruppen
- `GET /persons/{id}` – Person
- `GET /persons/{id}/groups` – Gruppen einer Person
- `GET /groups?query=...` – Gruppen suchen
- `GET /groups/{id}` – Gruppe
- `GET /groups/{id}/members` – Mitglieder einer Gruppe
- `GET /grouptypes`, `GET /group/roles` – Gruppentypen und Rollen

## Termine und Dienste
- `GET /calendars` – Kalender
- `GET /calendars/appointments?calendar_ids[]=1&from=YYYY-MM-DD&to=YYYY-MM-DD` – Termine
- `GET /events?from=YYYY-MM-DD&to=YYYY-MM-DD` – Events (Dienstplanung)
- `GET /events/{id}` – Event inkl. Dienste (`eventServices`)
- `GET /services`, `GET /servicegroups` – Dienste und Dienstgruppen

## Vorlagen
- `GET /htmltemplates?domain_type=groupmember-document` – Bescheinigungsvorlagen
- `PATCH /htmltemplates/{id}` mit `{id, html, mjml}` + Header `CSRF-Token` – Vorlage speichern. `mjml` ist ein GrapesJS-Projekt-JSON; `components` des Wrappers darf ein HTML-String sein.
- Platzhalter: `{{person.firstName}}`, `{{person.lastName}}`, `{{group.name}}`, `{{groupMember.role}}`, `{{currentDate}}`

## Hinweise
- Endpunkte und Felder können sich zwischen ChurchTools-Versionen ändern. Im Zweifel die OpenAPI-Doku der Instanz prüfen oder die Antwort einmal ausgeben und die Felder ansehen.
- Welche Daten zurückkommen, hängt von den Rechten des angemeldeten Benutzers ab.
