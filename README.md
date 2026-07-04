# Bestattungs-App

Einfache interne React-Web-App fuer die Fallaufnahme, Live-Offerte, interne Rechnungsgrundlage, Checkliste und Arbeitsplanung bei einem Todesfall.

## Lokal verwenden

Die App funktioniert ohne Backend. Nach dem Build kann sie direkt im Browser geoeffnet werden:

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

Die Faelle werden aktuell im Browser unter dem `localStorage`-Key `bestattungsunternehmen.cases.v1` gespeichert. Die Speicherlogik liegt zentral in `src/storage/caseRepository.js`, damit spaeter Google Drive, Supabase oder Firebase angebunden werden kann, ohne die UI-Komponenten grundlegend umzubauen.

## Druck / PDF

Offerte, interne Rechnungsgrundlage, Checkliste und Arbeitsplan koennen ueber die Druckbuttons oder die Browser-Druckfunktion als PDF ausgegeben werden.
