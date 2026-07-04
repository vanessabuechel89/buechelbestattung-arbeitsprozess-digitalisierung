import { Printer } from "lucide-react";
import { CHECKLIST_STATUS } from "../data/defaults.js";

export function ChecklistSection({ caseFile, onChange }) {
  const checklist = caseFile.checklist;

  function updateTask(taskId, status) {
    onChange({
      ...caseFile,
      checklist: checklist.map((item) => (item.id === taskId ? { ...item, status } : item)),
    });
  }

  return (
    <article className="content-section print-area checklist-print">
      <div className="section-heading with-actions">
        <div>
          <p className="eyebrow">Todesfall</p>
          <h2>Checkliste</h2>
        </div>
        <button className="button secondary print-hidden" onClick={() => window.print()}>
          <Printer size={18} aria-hidden="true" /> Checkliste drucken
        </button>
      </div>

      <div className="checklist">
        {checklist.map((item) => (
          <div className="checklist-row" key={item.id}>
            <span>{item.task}</span>
            <select value={item.status} onChange={(event) => updateTask(item.id, event.target.value)}>
              {CHECKLIST_STATUS.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </article>
  );
}
