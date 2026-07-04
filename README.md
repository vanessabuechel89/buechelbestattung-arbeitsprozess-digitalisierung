# Büchel Bestattungen - Arbeitsprozess Todesfall

Moderne interne React/TypeScript-Web-App fuer die digitale Begleitung eines Todesfalls: Stammdaten, Trauergespraech, Live-Offerte, Organisation, Arbeitsrapport, Rechnungsgrundlage und Abschluss.

## Lokal verwenden

Die App funktioniert im MVP ohne Backend mit `localStorage`. Direkt starten:

```powershell
BESTATTUNGS-APP.html
```

Alternativ kann `APP-STARTEN.html` geoeffnet werden. `README.md` ist nur diese Anleitung und keine App-Datei.

Fuer Entwicklung:

```powershell
pnpm install
pnpm run dev
```

Fuer einen neuen Produktionsbuild:

```powershell
pnpm run build
node build-standalone.mjs
```

## Speicherung

Die Faelle werden aktuell im Browser unter dem `localStorage`-Key `buechel-bestattungen.cases.v1` gespeichert. Die Speicherlogik liegt zentral in `src/storage/caseRepository.ts`, damit spaeter Supabase, Firebase oder Google Drive angebunden werden kann, ohne die UI-Komponenten grundlegend umzubauen.

## Architektur

- `src/data/priceList.ts`: zentrale Leistungsliste mit Kategorie, Preis, MwSt. und Bexio-relevanten Flags.
- `src/types.ts`: Datenmodell fuer Todesfall, Offerte, Arbeitsrapport, Checkliste und Bexio-Draft.
- `src/storage/caseRepository.ts`: austauschbare Repository-Schicht.
- `src/App.tsx`: Wizard-Flow und UI-Komponenten.

## Bexio-Vorstufe

Die App erstellt keine Rechnung. Sie erzeugt eine strukturierte Rechnungsgrundlage mit Kontaktdaten, Positionen, MwSt. und Total, die spaeter an die offizielle Bexio API uebergeben werden kann.

## Druck / PDF

Offerte, interne Rechnungsgrundlage, Checkliste und Arbeitsplan koennen ueber die Druckbuttons oder die Browser-Druckfunktion als PDF ausgegeben werden.
