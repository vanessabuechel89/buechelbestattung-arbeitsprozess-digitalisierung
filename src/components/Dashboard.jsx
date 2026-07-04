import { Download, FolderOpen, Plus, Trash2 } from "lucide-react";
import { calculateOfferTotals, formatCurrency, formatDate } from "../utils.js";

export function Dashboard({ cases, onCreate, onOpen, onDelete, onExport }) {
  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Interne Web-App</p>
          <h1>Bestattungsfälle</h1>
          <p className="intro">Fallaufnahme, Gesprächsofferte, interne Rechnungsgrundlage und Einsatzplanung an einem Ort.</p>
        </div>
        <div className="header-actions">
          <button className="button secondary" onClick={onExport} disabled={!cases.length}>
            <Download size={18} aria-hidden="true" /> Alle exportieren
          </button>
          <button className="button primary" onClick={onCreate}>
            <Plus size={18} aria-hidden="true" /> Neuer Todesfall
          </button>
        </div>
      </header>

      <section className="table-panel" aria-label="Gespeicherte Todesfälle">
        <div className="table-toolbar">
          <h2>Gespeicherte Fälle</h2>
          <span>{cases.length} Fall{cases.length === 1 ? "" : "e"}</span>
        </div>
        {cases.length === 0 ? (
          <div className="empty-state">
            <h2>Noch keine Todesfälle erfasst</h2>
            <p>Beginnen Sie mit einem neuen Fall. Die Daten werden automatisch lokal im Browser gespeichert.</p>
            <button className="button primary" onClick={onCreate}>
              <Plus size={18} aria-hidden="true" /> Neuer Todesfall
            </button>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Verstorbene Person</th>
                  <th>Kontaktperson</th>
                  <th>Datum Todesfall</th>
                  <th>Status</th>
                  <th className="align-right">Offertsumme</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((caseFile) => {
                  const fullName = `${caseFile.masterData.firstName} ${caseFile.masterData.lastName}`.trim() || "Ohne Namen";
                  const total = calculateOfferTotals(caseFile.offer).total;
                  return (
                    <tr key={caseFile.id}>
                      <td>
                        <strong>{fullName}</strong>
                        <small>Zuletzt geändert: {formatDate(caseFile.updatedAt)}</small>
                      </td>
                      <td>{caseFile.masterData.contactPerson || "-"}</td>
                      <td>{formatDate(caseFile.masterData.deathDate)}</td>
                      <td><span className="status-pill">{caseFile.status}</span></td>
                      <td className="align-right">{formatCurrency(total)}</td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-button" onClick={() => onOpen(caseFile.id)} title="Öffnen">
                            <FolderOpen size={18} aria-hidden="true" />
                          </button>
                          <button className="icon-button danger" onClick={() => onDelete(caseFile.id)} title="Löschen">
                            <Trash2 size={18} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
