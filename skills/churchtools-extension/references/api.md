# Häufig genutzte ChurchTools-API-Endpunkte

Abgeglichen mit der OpenAPI-Spezifikation von ChurchTools 3.138.1. Alle Pfade sind relativ zu `<INSTANZ>/api`. Antworten haben die Form `{ data: ..., meta: ... }`.

Paginierung gibt es nur bei einzelnen Listen (`?page=1&limit=100`, Infos in `meta.pagination`), z. B. bei `/groups` und `/groups/{id}/members`. Stammdatenlisten wie `/services`, `/servicegroups`, `/group/grouptypes`, `/group/roles`, `/calendars` und `/htmltemplates` liefern dagegen alles auf einmal; dort steht in `meta.count` die Anzahl.

## Allgemein
- `GET /whoami` – angemeldete Person. Ohne Anmeldung kommt die anonyme Person zurück (`id` = -1) und kein Fehler. `?only_allow_authenticated=true` erzwingt stattdessen 401.
- `GET /csrftoken` – Token für schreibende Aufrufe (Header `CSRF-Token`). Ohne Session antwortet die Instanz mit 401 „Session expired“; die Spec nennt `data: null`, also beides abfangen.
- `GET /custommodules` – installierte Erweiterungen und ihre Kürzel (nicht in der OpenAPI-Doku, siehe `install-api.md`)

## Personen und Gruppen
- `GET /persons/{id}` – Person
- `GET /persons/{id}/groups` – Gruppen einer Person. Archivierte Gruppen und Mitgliedschaften mit Status „angefragt“, „wartend“ oder „zu löschen“ kommen nur mit `show_inactive_groups=true`, `show_requested_or_waiting_memberships=true` bzw. `show_to_delete_memberships=true`.
- `GET /groups?query=...` – sichtbare Gruppen suchen. Weitere Filter sind z. B. `group_type_ids[]`, `campus_ids[]`, `only_my_groups=true`, `include[]=roles`.
- `GET /groups/{id}` – Gruppe
- `GET /groups/{id}/members` – Mitgliedschaften (paginiert). Zusätzliche Personenfelder kommen nur mit `personFields[]=...`. Filter sind `role_ids[]` und `group_member_statuses[]`. `meta.pagination.total` zählt alle Treffer, `meta.count` nur die aktuelle Seite.
- `GET /group/grouptypes` – Gruppentypen (nicht `/grouptypes`)
- `GET /group/roles?group_type_id=...` – Rollen eines Gruppentyps; ohne Parameter für alle Typen. Rollen einer konkreten Gruppe: `GET /groups/{id}/roles`.

## Termine und Dienste
- `GET /calendars` – Kalender, für die der Benutzer Leserechte hat
- `GET /calendars/appointments?calendar_ids[]=1&from=YYYY-MM-DD&to=YYYY-MM-DD` – Termine. `calendar_ids[]` ist Pflicht. Serien kommen als einzelne Vorkommen zurück: `appointment.base` ist die gespeicherte Serie, `appointment.calculated` das angezeigte Datum. Optional `include[]=event` / `group` / `tags`.
- `GET /events?from=YYYY-MM-DD&to=YYYY-MM-DD` – Events (Dienstplanung), im Datumsmodus nicht paginiert. Dienste direkt mitladen mit `include=eventServices`. Abgesagte Events kommen nur mit `canceled=true`. `to` meint Mitternacht dieses Tages, spätere Events am selben Tag fehlen also: einen Tag weiter abfragen. Die Liste ist nicht garantiert sortiert, daher clientseitig nach `startDate` sortieren.
- `GET /events/{id}` – Event inkl. Dienste (`eventServices`, immer vorhanden, ggf. leer). Personen können je nach Rechten verborgen sein.
- `GET /services`, `GET /servicegroups` – Dienste und Dienstgruppen

## Vorlagen
- `GET /htmltemplates?domain_type=groupmember-document` – Bescheinigungsvorlagen. `domain_type` ist Pflicht und hat keinen Standardwert. Die Antwort enthält nur Metadaten und Datei-IDs; den Quelltext liefern `GET /htmltemplates/{id}/html` und `.../mjml`.
- `PATCH /htmltemplates/{id}` mit `{html, mjml}` + Header `CSRF-Token` – Vorlage speichern. Weggelassene oder `null`-Felder bleiben unverändert. `mjml` ist ein GrapesJS-Projekt-JSON; `components` des Wrappers darf ein HTML-String sein. Dafür braucht der Benutzer das Recht, Vorlagen zu bearbeiten, und bei globalen Vorlagen zusätzlich das Admin-Recht für globale Vorlagen.
- Platzhalter: `GET /placeholders/group/{gruppenId}` liefert die verfügbaren Platzhalter als Menübaum. Den Ausdruck aus `placeholder` unverändert einsetzen. Normale Werte stehen in dreifachen Klammern, z. B. `{{{person.firstName}}}`, Block-Helfer in doppelten. Welche Felder es gibt, hängt von der Konfiguration ab; daher nicht raten, sondern über diesen Endpunkt ermitteln.

## Hinweise
- Endpunkte und Felder können sich zwischen ChurchTools-Versionen ändern. Im Zweifel die OpenAPI-Doku der Instanz prüfen: `<INSTANZ>/api` (Oberfläche) bzw. `<INSTANZ>/system/runtime/swagger/openapi-ui.json` (vollständige Spec). Die Beschreibungen nennen seit 3.138 auch die nötigen Rechte.
- Welche Daten zurückkommen, hängt von den Rechten des angemeldeten Benutzers ab.
