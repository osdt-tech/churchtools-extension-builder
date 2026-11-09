# Daten speichern (Datenspeicher der Erweiterung)

ChurchTools bringt für jede Erweiterung einen eigenen Datenspeicher mit: **Kategorien** (wie Tabellen) mit **Werten** (wie Zeilen). Damit kann eine Erweiterung Einstellungen oder Einträge speichern, ohne eigenen Server.

Quelle: offizielles Boilerplate `churchtools/extension-boilerplate` (`src/utils/kv-store.ts`, `ct-types.d.ts`). Die Endpunkte stehen wie `/custommodules` selbst nicht in der OpenAPI-Spec (Stand 3.138.1) und können sich ändern. Vor dem ersten Einsatz in einer Erweiterung einmal im Browser gegen die Instanz testen.

## Endpunkte

Alle Pfade relativ zu `<INSTANZ>/api`. `{modulId}` ist die numerische ID der Erweiterung, nicht das Kürzel.

- `GET /custommodules/{kuerzel}` – Erweiterung über ihr Kürzel holen (liefert `id`)
- `GET /custommodules/{modulId}/customdatacategories` – Kategorien
- `POST /custommodules/{modulId}/customdatacategories` – Kategorie anlegen: `{customModuleId, name, shorty, description, data?}`
- `PUT` / `DELETE /custommodules/{modulId}/customdatacategories/{kategorieId}`
- `GET /custommodules/{modulId}/customdatacategories/{kategorieId}/customdatavalues` – Werte
- `POST .../customdatavalues` – Wert anlegen: `{dataCategoryId, value}`
- `PUT` / `DELETE .../customdatavalues/{wertId}`

`value` (und `data` der Kategorie) ist immer ein **String**. Objekte als JSON ablegen (`JSON.stringify`) und beim Lesen wieder parsen.

## Helfer für `main.js`

Baut auf `api` aus der Vorlage auf (setzt CSRF-Token und `Content-Type` selbst):

```js
const SHORTY = '<kuerzel>';
let moduleId;
const modId = async () => (moduleId ??= (await api('/custommodules/' + SHORTY)).id);

/** Kategorie holen oder anlegen. */
export async function category(shorty, name = shorty) {
  const base = `/custommodules/${await modId()}/customdatacategories`;
  const found = (await api(base)).find((c) => c.shorty === shorty);
  return found ?? api(base, { method: 'POST', body: { customModuleId: await modId(), name, shorty, description: '' } });
}

const valuesPath = async (cat) => `/custommodules/${await modId()}/customdatacategories/${cat.id}/customdatavalues`;

/** Alle Einträge einer Kategorie als Objekte mit `id`. */
export async function loadAll(cat) {
  return (await api(await valuesPath(cat))).map((v) => {
    try { return { ...JSON.parse(v.value), id: v.id }; } catch { return { id: v.id, raw: v.value }; }
  });
}
export const add = async (cat, obj) =>
  api(await valuesPath(cat), { method: 'POST', body: { dataCategoryId: cat.id, value: JSON.stringify(obj) } });
export const update = async (cat, id, obj) =>
  api(`${await valuesPath(cat)}/${id}`, { method: 'PUT', body: { id, dataCategoryId: cat.id, value: JSON.stringify(obj) } });
export const remove = async (cat, id) => api(`${await valuesPath(cat)}/${id}`, { method: 'DELETE' });
```

## Regeln

- **Rechte:** Lesen und Schreiben im Datenspeicher wird in ChurchTools je Erweiterung über Berechtigungen gesteuert (ansehen, Kategorien anlegen, Daten je Kategorie ansehen/anlegen/ändern/löschen). Bei 403 braucht der Benutzer das passende Recht; das vergibt ein Admin. Kategorien am besten einmal durch einen Admin anlegen lassen (erster Aufruf der Erweiterung), nicht durch normale Benutzer.
- **Keine Geheimnisse** und keine sensiblen personenbezogenen Daten ablegen: Jeder mit Leserecht auf die Kategorie kann alle Werte über die API abrufen, unabhängig davon, was die Oberfläche zeigt.
- **Pro Benutzer speichern:** Die Personen-ID (`/whoami`) mit in den Wert schreiben und clientseitig filtern. Das ist nur eine Komfortfunktion und kein Zugriffsschutz.
- Der Speicher ist für kleine Datenmengen gedacht (Einstellungen, Listen mit einigen hundert Einträgen). Es gibt keine Suche und keine Filter auf dem Server.
- Nur für das Gerät geltende Kleinigkeiten (zuletzt gewählter Filter) gehören in `localStorage` mit dem Präfix `<kuerzel>:`.
