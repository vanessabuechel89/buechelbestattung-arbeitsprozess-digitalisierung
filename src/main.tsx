import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

try {
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} catch (error) {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <main style="max-width:760px;margin:48px auto;padding:24px;font-family:Arial,sans-serif;background:#fff;border:1px solid #dedbd2;border-radius:10px">
        <p style="color:#8b6f42;font-weight:800;text-transform:uppercase">Büchel Bestattungen</p>
        <h1>Die App konnte nicht gestartet werden</h1>
        <p>Bitte laden Sie die Seite mit <strong>Strg + F5</strong> neu. Falls das nicht hilft, löschen Sie die Browserdaten für diese lokale Datei.</p>
        <pre style="white-space:pre-wrap;background:#f8f7f3;padding:12px;border-radius:8px">${String(error)}</pre>
      </main>
    `;
  }
}
