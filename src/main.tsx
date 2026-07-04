import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

class StartupErrorBoundary extends React.Component<React.PropsWithChildren, { error: unknown }> {
  state = { error: null as unknown };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <StartupError error={this.state.error} />;
    }

    return this.props.children;
  }
}

function StartupError({ error }: { error: unknown }) {
  return (
    <main className="startup-error">
      <p className="eyebrow">Büchel Bestattungen</p>
      <h1>Die App konnte nicht gestartet werden</h1>
      <p>
        Bitte laden Sie die Seite mit <strong>Strg + F5</strong> neu. Falls das nicht hilft, können alte lokale
        Browserdaten gelöscht werden.
      </p>
      <button
        className="button primary"
        onClick={() => {
          localStorage.removeItem("buechel-bestattungen.cases.v1");
          window.location.reload();
        }}
      >
        Lokale Testdaten löschen und neu laden
      </button>
      <pre>{String(error)}</pre>
    </main>
  );
}

try {
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <StartupErrorBoundary>
        <App />
      </StartupErrorBoundary>
    </React.StrictMode>,
  );
} catch (error) {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <main style="max-width:760px;margin:48px auto;padding:24px;font-family:Arial,sans-serif;background:#fff;border:1px solid #dedbd2;border-radius:10px">
        <p style="color:#8b6f42;font-weight:800;text-transform:uppercase">Büchel Bestattungen</p>
        <h1>Die App konnte nicht gestartet werden</h1>
        <p>Bitte laden Sie die Seite mit <strong>Strg + F5</strong> neu. Falls das nicht hilft, löschen Sie die lokalen Testdaten.</p>
        <button onclick="localStorage.removeItem('buechel-bestattungen.cases.v1'); window.location.reload();" style="background:#b6945c;color:white;border:0;border-radius:8px;padding:10px 14px;font-weight:700">Lokale Testdaten löschen und neu laden</button>
        <pre style="white-space:pre-wrap;background:#f8f7f3;padding:12px;border-radius:8px">${String(error)}</pre>
      </main>
    `;
  }
}
