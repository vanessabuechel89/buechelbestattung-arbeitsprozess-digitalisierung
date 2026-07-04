import { Plus, Printer, Trash2 } from "lucide-react";
import { BILLING_EXAMPLES } from "../data/defaults.js";
import { asNumber, calculateBillingTotal, formatCurrency } from "../utils.js";

export function InternalBillingSection({ caseFile, onChange }) {
  const rows = caseFile.billing.rows;
  const total = calculateBillingTotal(rows);

  function updateRows(nextRows) {
    onChange({ ...caseFile, billing: { ...caseFile.billing, rows: nextRows } });
  }

  function addRow(service = "") {
    updateRows([
      ...rows,
      {
        id: crypto.randomUUID(),
        date: "",
        service,
        people: 1,
        hours: 0,
        rate: 120,
        billable: true,
        note: "",
      },
    ]);
  }

  function updateRow(rowId, changes) {
    updateRows(rows.map((row) => (row.id === rowId ? { ...row, ...changes } : row)));
  }

  return (
    <article className="content-section print-area billing-print">
      <div className="section-heading with-actions">
        <div>
          <p className="eyebrow">Intern</p>
          <h2>Rechnungsgrundlage</h2>
        </div>
        <div className="section-actions print-hidden">
          <select onChange={(event) => event.target.value && addRow(event.target.value)} defaultValue="">
            <option value="">Beispielposition hinzufügen</option>
            {BILLING_EXAMPLES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <button className="button primary" onClick={() => addRow()}>
            <Plus size={18} aria-hidden="true" /> Position
          </button>
          <button className="button secondary" onClick={() => window.print()}>
            <Printer size={18} aria-hidden="true" /> Drucken
          </button>
        </div>
      </div>

      <div className="responsive-table">
        <table className="editable-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Leistung</th>
              <th>Personen</th>
              <th>Stunden</th>
              <th>Ansatz CHF</th>
              <th>Total</th>
              <th>Verrechnen</th>
              <th>Interne Bemerkung</th>
              <th className="print-hidden">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td><input type="date" value={row.date} onChange={(event) => updateRow(row.id, { date: event.target.value })} /></td>
                <td><input value={row.service} onChange={(event) => updateRow(row.id, { service: event.target.value })} /></td>
                <td><input type="number" min="0" value={row.people} onChange={(event) => updateRow(row.id, { people: event.target.value })} /></td>
                <td><input type="number" min="0" step="0.25" value={row.hours} onChange={(event) => updateRow(row.id, { hours: event.target.value })} /></td>
                <td><input type="number" min="0" step="0.05" value={row.rate} onChange={(event) => updateRow(row.id, { rate: event.target.value })} /></td>
                <td>{formatCurrency(asNumber(row.people) * asNumber(row.hours) * asNumber(row.rate))}</td>
                <td><input type="checkbox" checked={row.billable} onChange={(event) => updateRow(row.id, { billable: event.target.checked })} /></td>
                <td><input value={row.note} onChange={(event) => updateRow(row.id, { note: event.target.value })} /></td>
                <td className="print-hidden">
                  <button className="icon-button danger" onClick={() => updateRows(rows.filter((item) => item.id !== row.id))} title="Position löschen">
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="total-footer">
        <span>Internes Rechnungstotal</span>
        <strong>{formatCurrency(total)}</strong>
      </div>
    </article>
  );
}
