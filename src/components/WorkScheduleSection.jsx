import { Plus, Printer, Trash2 } from "lucide-react";
import { CHECKLIST_STATUS, EMPLOYEES } from "../data/defaults.js";

export function WorkScheduleSection({ caseFile, onChange }) {
  const schedule = caseFile.schedule;

  function updateSchedule(nextSchedule) {
    onChange({ ...caseFile, schedule: nextSchedule });
  }

  function addEntry() {
    updateSchedule([
      ...schedule,
      {
        id: crypto.randomUUID(),
        date: "",
        time: "",
        task: "",
        place: "",
        employees: [],
        note: "",
        status: "offen",
      },
    ]);
  }

  function updateEntry(entryId, changes) {
    updateSchedule(schedule.map((entry) => (entry.id === entryId ? { ...entry, ...changes } : entry)));
  }

  function toggleEmployee(entry, employee) {
    const employees = entry.employees.includes(employee)
      ? entry.employees.filter((item) => item !== employee)
      : [...entry.employees, employee];
    updateEntry(entry.id, { employees });
  }

  return (
    <article className="content-section print-area schedule-print">
      <div className="section-heading with-actions">
        <div>
          <p className="eyebrow">Einsatzplanung</p>
          <h2>Arbeitsplanung</h2>
        </div>
        <div className="section-actions print-hidden">
          <button className="button primary" onClick={addEntry}>
            <Plus size={18} aria-hidden="true" /> Einsatz
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
              <th>Uhrzeit</th>
              <th>Aufgabe</th>
              <th>Ort</th>
              <th>Mitarbeitende</th>
              <th>Bemerkung</th>
              <th>Status</th>
              <th className="print-hidden">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((entry) => (
              <tr key={entry.id}>
                <td><input type="date" value={entry.date} onChange={(event) => updateEntry(entry.id, { date: event.target.value })} /></td>
                <td><input type="time" value={entry.time} onChange={(event) => updateEntry(entry.id, { time: event.target.value })} /></td>
                <td><input value={entry.task} onChange={(event) => updateEntry(entry.id, { task: event.target.value })} /></td>
                <td><input value={entry.place} onChange={(event) => updateEntry(entry.id, { place: event.target.value })} /></td>
                <td>
                  <div className="employee-picks">
                    {EMPLOYEES.map((employee) => (
                      <label key={employee}>
                        <input type="checkbox" checked={entry.employees.includes(employee)} onChange={() => toggleEmployee(entry, employee)} />
                        {employee}
                      </label>
                    ))}
                  </div>
                </td>
                <td><input value={entry.note} onChange={(event) => updateEntry(entry.id, { note: event.target.value })} /></td>
                <td>
                  <select value={entry.status} onChange={(event) => updateEntry(entry.id, { status: event.target.value })}>
                    {CHECKLIST_STATUS.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td className="print-hidden">
                  <button className="icon-button danger" onClick={() => updateSchedule(schedule.filter((item) => item.id !== entry.id))} title="Einsatz löschen">
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
