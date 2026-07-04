import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");
const outputFile = path.resolve("BESTATTUNGS-APP.html");
const indexHtml = await readFile(path.join(distDir, "index.html"), "utf8");

const scriptMatch = indexHtml.match(/<script[^>]+src="\.\/([^"]+)"[^>]*><\/script>/);
const cssMatch = indexHtml.match(/<link[^>]+href="\.\/([^"]+)"[^>]*>/);

if (!scriptMatch || !cssMatch) {
  throw new Error("Build-Dateien konnten nicht gefunden werden. Bitte zuerst pnpm run build ausfuehren.");
}

const js = await readFile(path.join(distDir, scriptMatch[1]), "utf8");
const css = await readFile(path.join(distDir, cssMatch[1]), "utf8");

const standaloneHtml = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bestattungs-App</title>
    <style>${css}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">${js}</script>
  </body>
</html>
`;

await writeFile(outputFile, standaloneHtml, "utf8");
console.log(`Erstellt: ${outputFile}`);
