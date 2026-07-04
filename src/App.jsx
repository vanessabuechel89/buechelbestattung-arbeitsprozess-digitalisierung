import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  Plus,
  Printer,
  Save,
  Trash2,
} from "lucide-react";
import { Dashboard } from "./components/Dashboard.jsx";
import { CaseForm } from "./components/CaseForm.jsx";
import { OfferSection } from "./components/OfferSection.jsx";
import { InternalBillingSection } from "./components/InternalBillingSection.jsx";
import { ChecklistSection } from "./components/ChecklistSection.jsx";
import { WorkScheduleSection } from "./components/WorkScheduleSection.jsx";
import { CASE_STATUS } from "./data/defaults.js";
import { createEmptyCase, exportCases, readCases, writeCases } from "./storage/caseRepository.js";

const emptySelection = { view: "dashboard", caseId: null };

export default function App() {
  const [cases, setCases] = useState(() => readCases());
  const [selection, setSelection] = useState(emptySelection);
  const activeCase = useMemo(
    () => cases.find((caseFile) => caseFile.id === selection.caseId),
    [cases, selection.caseId],
  );

  useEffect(() => {
    writeCases(cases);
  }, [cases]);

  function createCase() {
    const newCase = createEmptyCase();
    setCases((current) => [newCase, ...current]);
    setSelection({ view: "case", caseId: newCase.id });
  }

  function updateCase(nextCase) {
    const stampedCase = { ...nextCase, updatedAt: new Date().toISOString() };
    setCases((current) => current.map((caseFile) => (caseFile.id === stampedCase.id ? stampedCase : caseFile)));
  }

  function deleteCase(caseId) {
    const caseFile = cases.find((item) => item.id === caseId);
    const label = caseFile ? `${caseFile.masterData.firstName} ${caseFile.masterData.lastName}`.trim() : "diesen Fall";
    if (!window.confirm(`Soll ${label || "dieser Fall"} wirklich gelöscht werden?`)) return;
    setCases((current) => current.filter((item) => item.id !== caseId));
    if (selection.caseId === caseId) setSelection(emptySelection);
  }

  if (!activeCase) {
    return (
      <Dashboard
        cases={cases}
        onCreate={createCase}
        onOpen={(caseId) => setSelection({ view: "case", caseId })}
        onDelete={deleteCase}
        onExport={() => exportCases(cases)}
      />
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar print-hidden">
        <button className="button ghost" onClick={() => setSelection(emptySelection)}>
          <ArrowLeft size={18} aria-hidden="true" /> Dashboard
        </button>
        <div>
          <p className="eyebrow">Todesfall</p>
          <h1>{caseTitle(activeCase)}</h1>
        </div>
        <div className="topbar-actions">
          <label className="status-control">
            Status
            <select value={activeCase.status} onChange={(event) => updateCase({ ...activeCase, status: event.target.value })}>
              {CASE_STATUS.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <button className="button secondary" onClick={() => exportCases([activeCase])}>
            <Download size={18} aria-hidden="true" /> JSON
          </button>
          <button className="button secondary" onClick={() => window.print()}>
            <Printer size={18} aria-hidden="true" /> Drucken
          </button>
          <span className="save-indicator">
            <Save size={16} aria-hidden="true" /> Automatisch gespeichert
          </span>
        </div>
      </header>

      <main className="case-layout">
        <aside className="case-nav print-hidden" aria-label="Fallbereiche">
          {[
            ["case", "Stammdaten"],
            ["offer", "Trauergespräch"],
            ["billing", "Interne Rechnung"],
            ["checklist", "Checkliste"],
            ["schedule", "Arbeitsplanung"],
          ].map(([view, label]) => (
            <button
              key={view}
              className={selection.view === view ? "nav-button active" : "nav-button"}
              onClick={() => setSelection({ view, caseId: activeCase.id })}
            >
              <FileText size={16} aria-hidden="true" /> {label}
            </button>
          ))}
          <button className="nav-button danger" onClick={() => deleteCase(activeCase.id)}>
            <Trash2 size={16} aria-hidden="true" /> Fall löschen
          </button>
        </aside>

        <section className="case-content">
          {selection.view === "case" && <CaseForm caseFile={activeCase} onChange={updateCase} />}
          {selection.view === "offer" && <OfferSection caseFile={activeCase} onChange={updateCase} />}
          {selection.view === "billing" && <InternalBillingSection caseFile={activeCase} onChange={updateCase} />}
          {selection.view === "checklist" && <ChecklistSection caseFile={activeCase} onChange={updateCase} />}
          {selection.view === "schedule" && <WorkScheduleSection caseFile={activeCase} onChange={updateCase} />}
        </section>
      </main>

      <button className="floating-add print-hidden" onClick={createCase} title="Neuer Todesfall">
        <Plus size={20} aria-hidden="true" />
      </button>
    </div>
  );
}

function caseTitle(caseFile) {
  const fullName = `${caseFile.masterData.firstName} ${caseFile.masterData.lastName}`.trim();
  return fullName || "Neuer Todesfall";
}
