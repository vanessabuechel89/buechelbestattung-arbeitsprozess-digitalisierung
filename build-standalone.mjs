import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");
const outputFile = path.resolve("BESTATTUNGS-APP.html");
const indexHtml = await readFile(path.join(distDir, "index.html"), "utf8");

const scriptMatch = indexHtml.match(/<script[^>]+src="\.\/([^"]+)"[^>]*><\/script>/);
const cssMatch = indexHtml.match(/<link[^>]+href="\.\/([^"]+)"[^>]*>/);

if (!scriptMatch || !cssMatch) {
  throw new Error("Build-Dateien nicht gefunden. Bitte zuerst pnpm run build ausfuehren.");
}

const js = await readFile(path.join(distDir, scriptMatch[1]), "utf8");
const css = await readFile(path.join(distDir, cssMatch[1]), "utf8");

const html = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Buechel Bestattungen - Arbeitsprozess</title>
    <style>${css}</style>
  </head>
  <body>
    <div id="root">
      <main style="max-width:760px;margin:48px auto;padding:24px;font-family:Arial,sans-serif;background:#fff;border:1px solid #dedbd2;border-radius:10px">
        <p style="color:#8b6f42;font-weight:800;text-transform:uppercase">Büchel Bestattungen</p>
        <h1>App wird geladen...</h1>
        <p>Falls diese Meldung bleibt, laden Sie die Seite mit Strg + F5 neu.</p>
      </main>
    </div>
    <script>
      window.addEventListener("error", function(event) {
        var root = document.getElementById("root");
        if (!root) return;
        root.innerHTML =
          '<main style="max-width:760px;margin:48px auto;padding:24px;font-family:Arial,sans-serif;background:#fff;border:1px solid #dedbd2;border-radius:10px">' +
          '<p style="color:#8b6f42;font-weight:800;text-transform:uppercase">Büchel Bestattungen</p>' +
          '<h1>Startfehler</h1>' +
          '<p>Die App wurde nicht gestartet. Bitte senden Sie mir diese Meldung:</p>' +
          '<pre style="white-space:pre-wrap;background:#f8f7f3;padding:12px;border-radius:8px;color:#a5483f">' +
          String(event.message || event.error || "Unbekannter Fehler").replace(/[&<>]/g, function(c) { return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c]; }) +
          '</pre>' +
          '<button onclick="localStorage.removeItem(\\'buechel-bestattungen.cases.v1\\'); window.location.reload();" style="background:#b6945c;color:white;border:0;border-radius:8px;padding:10px 14px;font-weight:700">Lokale Testdaten löschen und neu laden</button>' +
          '</main>';
      });
      window.addEventListener("unhandledrejection", function(event) {
        window.dispatchEvent(new ErrorEvent("error", { message: String(event.reason || "Unhandled Promise rejection") }));
      });
    </script>
    <script>${js.replace(/<\/script/gi, "<\\/script")}</script>
  </body>
</html>
`;

await writeFile(outputFile, html, "utf8");
console.log(`Erstellt: ${outputFile}`);
