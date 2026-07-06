import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Lock,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";
import { caseStatuses, employees, taskStatuses, wizardSteps, workReportExamples } from "./data/constants";
import { exportCases, createEmptyCase, localStorageCaseRepository } from "./storage/caseRepository";
import type {
  CaseStatus,
  Employee,
  FuneralCase,
  GraveType,
  Appointment,
  OfferLine,
  TaskStatus,
  WizardStep,
  WorkReportRow,
} from "./types";
import {
  asNumber,
  buildBexioDraft,
  flexibleFarewellHourlyRate,
  flexibleFarewellTotal,
  formatCurrency,
  formatDate,
  lineNetTotal,
  offerTotals,
  reportLineTotal,
} from "./utils";

const paperLabels: Record<string, string> = {
  deathCertificate: "Todesbescheinigung",
  familyBook: "Familienbüchlein",
  identityDocument: "Ausweis",
  advanceDirective: "Vorsorgeauftrag",
  other: "Andere",
};

export default function App() {
  const [cases, setCases] = useState<FuneralCase[]>(() => localStorageCaseRepository.list());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedCase = useMemo(() => cases.find((item) => item.id === selectedId) ?? null, [cases, selectedId]);

  useEffect(() => {
    localStorageCaseRepository.saveAll(cases);
  }, [cases]);

  function persist(nextCase: FuneralCase) {
    const stamped = { ...nextCase, updatedAt: new Date().toISOString() };
    setCases((current) => current.map((item) => (item.id === stamped.id ? stamped : item)));
  }

  function createCase() {
    const nextCase = createEmptyCase(cases);
    setCases((current) => [nextCase, ...current]);
    setSelectedId(nextCase.id);
  }

  function deleteCase(caseId: string) {
    const match = cases.find((item) => item.id === caseId);
    const label = match ? `${match.caseNumber} ${caseTitle(match)}` : "diesen Fall";
    if (!window.confirm(`${label} wirklich löschen?`)) return;
    setCases((current) => current.filter((item) => item.id !== caseId));
    if (selectedId === caseId) setSelectedId(null);
  }

  if (!selectedCase) {
    return (
      <Dashboard
        cases={cases}
        onCreate={createCase}
        onOpen={setSelectedId}
        onDelete={deleteCase}
        onExport={() => exportCases(cases)}
      />
    );
  }

  return (
    <CaseWorkspace
      caseFile={selectedCase}
      onBack={() => setSelectedId(null)}
      onChange={persist}
      onDelete={() => deleteCase(selectedCase.id)}
      onExport={() => exportCases([selectedCase])}
    />
  );
}

function Dashboard({
  cases,
  onCreate,
  onOpen,
  onDelete,
  onExport,
}: {
  cases: FuneralCase[];
  onCreate: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
}) {
  return (
    <main className="dashboard">
      <header className="hero">
        <div>
          <p className="eyebrow">Büchel Bestattungen</p>
          <h1>Arbeitsprozess Todesfall</h1>
          <p className="lead">
            Beratung, Organisation, Rapport und Rechnungsgrundlage in einem ruhigen digitalen Ablauf.
          </p>
        </div>
        <div className="hero-actions">
          <button className="button secondary" onClick={onExport} disabled={!cases.length}>
            <Download size={18} /> Export
          </button>
          <button className="button primary" onClick={onCreate}>
            <Plus size={18} /> Neuer Todesfall
          </button>
        </div>
      </header>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h2>Alle Todesfälle</h2>
          </div>
          <span className="counter">{cases.length} Fälle</span>
        </div>

        {cases.length === 0 ? (
          <div className="empty">
            <h2>Noch kein Todesfall erfasst</h2>
            <p>Starten Sie mit einem neuen Fall. Die Fallnummer wird automatisch vergeben.</p>
            <button className="button primary" onClick={onCreate}>
              <Plus size={18} /> Neuer Todesfall
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fallnummer</th>
                  <th>Verstorbene Person</th>
                  <th>Status</th>
                  <th>Kontaktperson</th>
                  <th>Todestag</th>
                  <th className="right">Offertsumme</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((caseFile) => (
                  <tr key={caseFile.id}>
                    <td><strong>{caseFile.caseNumber}</strong></td>
                    <td>{caseTitle(caseFile)}</td>
                    <td><span className="status-pill">{caseFile.status}</span></td>
                    <td>{caseFile.relatives.contactPerson || "-"}</td>
                    <td>{formatDate(caseFile.masterData.deathDate)}</td>
                    <td className="right">{formatCurrency(offerTotals(caseFile).total)}</td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-button" onClick={() => onOpen(caseFile.id)} title="Öffnen">
                          <FileText size={18} />
                        </button>
                        <button className="icon-button danger" onClick={() => onDelete(caseFile.id)} title="Löschen">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function CaseWorkspace({
  caseFile,
  onBack,
  onChange,
  onDelete,
  onExport,
}: {
  caseFile: FuneralCase;
  onBack: () => void;
  onChange: (caseFile: FuneralCase) => void;
  onDelete: () => void;
  onExport: () => void;
}) {
  const stepIndex = wizardSteps.findIndex((step) => step.id === caseFile.currentStep);
  const currentStep = wizardSteps[stepIndex] ?? wizardSteps[0];

  function setStep(step: WizardStep) {
    const meta = wizardSteps.find((item) => item.id === step);
    onChange({ ...caseFile, currentStep: step, status: meta?.status ?? caseFile.status });
  }

  function nextStep() {
    const next = wizardSteps[Math.min(stepIndex + 1, wizardSteps.length - 1)];
    setStep(next.id);
  }

  function previousStep() {
    const previous = wizardSteps[Math.max(stepIndex - 1, 0)];
    setStep(previous.id);
  }

  function setStatus(status: CaseStatus) {
    onChange({ ...caseFile, status });
  }

  return (
    <div className="app-shell">
      <header className="topbar no-print">
        <button className="button ghost" onClick={onBack}>
          <ArrowLeft size={18} /> Dashboard
        </button>
        <div className="case-title">
          <p className="eyebrow">{caseFile.caseNumber}</p>
          <h1>{caseTitle(caseFile)}</h1>
        </div>
        <div className="topbar-actions">
          <select value={caseFile.status} onChange={(event) => setStatus(event.target.value as CaseStatus)}>
            {caseStatuses.map((status) => <option key={status}>{status}</option>)}
          </select>
          <button className="button secondary" onClick={onExport}><Download size={18} /> JSON</button>
          <button className="button secondary" onClick={() => window.print()}><Printer size={18} /> Drucken</button>
          <button className="button danger-soft" onClick={onDelete}><Trash2 size={18} /> Löschen</button>
        </div>
      </header>

      <main className="workspace">
        <aside className="wizard no-print">
          {wizardSteps.map((step, index) => (
            <button
              key={step.id}
              className={`wizard-step ${caseFile.currentStep === step.id ? "active" : ""} ${index < stepIndex ? "done" : ""}`}
              onClick={() => setStep(step.id)}
            >
              <span>{index < stepIndex ? <Check size={15} /> : index + 1}</span>
              {step.label}
            </button>
          ))}
        </aside>

        <section className="step-surface">
          <div className="step-header">
            <div>
              <p className="eyebrow">Schritt {stepIndex + 1} von {wizardSteps.length}</p>
              <h2>{currentStep.label}</h2>
            </div>
            {caseFile.consultationLocked && (
              <span className="lock-note"><Lock size={16} /> Kundenteil abgeschlossen</span>
            )}
          </div>

          <StepContent caseFile={caseFile} onChange={onChange} />

          <footer className="step-footer no-print">
            <button className="button secondary" onClick={previousStep} disabled={stepIndex === 0}>
              <ChevronLeft size={18} /> Zurück
            </button>
            <button className="button primary" onClick={nextStep} disabled={stepIndex === wizardSteps.length - 1}>
              Weiter <ChevronRight size={18} />
            </button>
          </footer>
        </section>
      </main>
    </div>
  );
}

function StepContent({ caseFile, onChange }: { caseFile: FuneralCase; onChange: (caseFile: FuneralCase) => void }) {
  switch (caseFile.currentStep) {
    case "consultation":
      return <ConsultationStep caseFile={caseFile} onChange={onChange} />;
    case "offer":
      return <OfferStep caseFile={caseFile} onChange={onChange} />;
    case "internal":
      return <InternalStep caseFile={caseFile} onChange={onChange} />;
    case "workReport":
      return <WorkReportStep caseFile={caseFile} onChange={onChange} />;
    case "invoiceBase":
      return <InvoiceBaseStep caseFile={caseFile} onChange={onChange} />;
    case "close":
      return <CloseStep caseFile={caseFile} onChange={onChange} />;
    default:
      return <MasterDataStep caseFile={caseFile} onChange={onChange} />;
  }
}

function MasterDataStep({ caseFile, onChange }: StepProps) {
  const disabled = caseFile.consultationLocked;
  const master = caseFile.masterData;
  const relatives = caseFile.relatives;

  function updateMaster(key: keyof typeof master, value: unknown) {
    onChange({ ...caseFile, masterData: { ...master, [key]: value } });
  }

  function updateRelative(key: keyof typeof relatives, value: string) {
    onChange({ ...caseFile, relatives: { ...relatives, [key]: value } });
  }

  function updatePaper(key: string, value: boolean) {
    onChange({ ...caseFile, masterData: { ...master, papers: { ...master.papers, [key]: value } } });
  }

  return (
    <div className="stack">
      <section className="subsection">
        <h3>Verstorbene Person</h3>
        <div className="form-grid">
          <Field label="Vorname" value={master.firstName} onChange={(value) => updateMaster("firstName", value)} disabled={disabled} />
          <Field label="Nachname" value={master.lastName} onChange={(value) => updateMaster("lastName", value)} disabled={disabled} />
          <Field type="date" label="Geburtsdatum" value={master.birthDate} onChange={(value) => updateMaster("birthDate", value)} disabled={disabled} />
          <Field type="date" label="Todestag" value={master.deathDate} onChange={(value) => updateMaster("deathDate", value)} disabled={disabled} />
          <Field type="time" label="Todeszeit" value={master.deathTime} onChange={(value) => updateMaster("deathTime", value)} disabled={disabled} />
          <Field label="Adresse" value={master.address} onChange={(value) => updateMaster("address", value)} disabled={disabled} />
          <Field label="Heimatort" value={master.homeTown} onChange={(value) => updateMaster("homeTown", value)} disabled={disabled} />
          <Field label="Beruf" value={master.profession} onChange={(value) => updateMaster("profession", value)} disabled={disabled} />
          <Field label="Ehepartner" value={master.spouse} onChange={(value) => updateMaster("spouse", value)} disabled={disabled} />
          <SelectField label="Konfession" value={master.confession} onChange={(value) => updateMaster("confession", value)} options={["", "Katholisch", "Reformiert", "Konfessionslos", "Andere"]} disabled={disabled} />
          <SelectField label="Sterbeort" value={master.deathPlace} onChange={(value) => updateMaster("deathPlace", value)} options={["", "Spital", "Altersheim", "Zuhause", "Andere"]} disabled={disabled} />
          <label className="field full">
            Bemerkungen
            <textarea value={master.notes} onChange={(event) => updateMaster("notes", event.target.value)} disabled={disabled} />
          </label>
        </div>
      </section>

      <section className="subsection">
        <h3>Papiere vorhanden</h3>
        <div className="check-grid">
          {Object.entries(paperLabels).map(([key, label]) => (
            <label className="check-card" key={key}>
              <input type="checkbox" checked={master.papers[key]} onChange={(event) => updatePaper(key, event.target.checked)} disabled={disabled} />
              {label}
            </label>
          ))}
          <Field label="Andere Papiere" value={master.paperOther} onChange={(value) => updateMaster("paperOther", value)} disabled={disabled} />
        </div>
      </section>

      <section className="subsection">
        <h3>Angehörige</h3>
        <div className="form-grid">
          <Field label="Kontaktperson" value={relatives.contactPerson} onChange={(value) => updateRelative("contactPerson", value)} disabled={disabled} />
          <Field label="Beziehung" value={relatives.relationship} onChange={(value) => updateRelative("relationship", value)} disabled={disabled} />
          <Field label="Telefon" value={relatives.phone} onChange={(value) => updateRelative("phone", value)} disabled={disabled} />
          <Field label="Mobile" value={relatives.mobile} onChange={(value) => updateRelative("mobile", value)} disabled={disabled} />
          <Field type="email" label="E-Mail" value={relatives.email} onChange={(value) => updateRelative("email", value)} disabled={disabled} />
          <Field label="Adresse" value={relatives.address} onChange={(value) => updateRelative("address", value)} disabled={disabled} />
          <label className="field full">
            Rechnungsadresse
            <textarea value={relatives.billingAddress} onChange={(event) => updateRelative("billingAddress", event.target.value)} disabled={disabled} />
          </label>
          <label className="field full">
            Bemerkungen Angehörige
            <textarea value={relatives.notes} onChange={(event) => updateRelative("notes", event.target.value)} disabled={disabled} />
          </label>
        </div>
      </section>
    </div>
  );
}

function ConsultationStep({ caseFile, onChange }: StepProps) {
  const locked = caseFile.consultationLocked;
  const categories = Array.from(new Set(caseFile.offer.lines.map((line) => line.category)));
  const farewellTotal = flexibleFarewellTotal(caseFile.offer.flexibleFarewell);
  const farewellHourlyRate = flexibleFarewellHourlyRate(caseFile.offer.flexibleFarewell);
  const farewellHours = asNumber(caseFile.offer.flexibleFarewell.hours);
  const farewellProfessionalCount = asNumber(caseFile.offer.flexibleFarewell.professionalCount);
  const farewellAssistantCount = asNumber(caseFile.offer.flexibleFarewell.assistantCount);
  const farewellProfessionalRate = asNumber(caseFile.offer.flexibleFarewell.price);
  const farewellAssistantRate = asNumber(caseFile.offer.flexibleFarewell.assistantRate);

  function updateLine(lineId: string, changes: Partial<OfferLine>) {
    onChange({
      ...caseFile,
      offer: {
        ...caseFile.offer,
        lines: caseFile.offer.lines.map((line) => (line.id === lineId ? { ...line, ...changes } : line)),
      },
    });
  }

  function updateFarewell(changes: Partial<typeof caseFile.offer.flexibleFarewell>) {
    onChange({ ...caseFile, offer: { ...caseFile.offer, flexibleFarewell: { ...caseFile.offer.flexibleFarewell, ...changes } } });
  }

  return (
    <div className="consultation-grid">
      <div className="stack">
        {categories.map((category) => (
          <section className="subsection" key={category}>
            <h3>{category}</h3>
            <div className="price-list">
              {caseFile.offer.lines.filter((line) => line.category === category).map((line) => (
                <div className={`price-row ${line.selected ? "selected" : ""}`} key={line.id}>
                  <label className="line-check">
                    <input type="checkbox" checked={line.selected} onChange={(event) => updateLine(line.id, { selected: event.target.checked })} disabled={locked} />
                    <span>
                      <strong>{line.name}</strong>
                      <small>{line.description}</small>
                    </span>
                  </label>
                  <input aria-label="Menge" type="number" min="0" value={line.quantity} onChange={(event) => updateLine(line.id, { quantity: asNumber(event.target.value) })} disabled={locked || !line.editable} />
                  <input aria-label="Preis" type="number" min="0" step="0.05" value={line.price} onChange={(event) => updateLine(line.id, { price: asNumber(event.target.value) })} disabled={locked || !line.editable} />
                  <input aria-label="Bemerkung" value={line.note} placeholder="Bemerkung" onChange={(event) => updateLine(line.id, { note: event.target.value })} disabled={locked} />
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="subsection">
          <h3>Abschied flexibel</h3>
          <div className="form-grid">
            <label className="check-card full">
              <input
                type="checkbox"
                checked={caseFile.offer.flexibleFarewell.enabled}
                onChange={(event) =>
                  updateFarewell({
                    enabled: event.target.checked,
                    price: caseFile.offer.flexibleFarewell.price || 180,
                    professionalCount: caseFile.offer.flexibleFarewell.professionalCount || 1,
                    assistantCount: caseFile.offer.flexibleFarewell.assistantCount || 1,
                    assistantRate: caseFile.offer.flexibleFarewell.assistantRate || 90,
                  })
                }
                disabled={locked}
              />
              Abschied individuell in Offerte aufnehmen
            </label>
            <Field label="Beschreibung" value={caseFile.offer.flexibleFarewell.description} onChange={(value) => updateFarewell({ description: value })} disabled={locked} />
            <Field type="number" label="Stunden" value={String(caseFile.offer.flexibleFarewell.hours)} onChange={(value) => updateFarewell({ hours: asNumber(value) })} disabled={locked} />
            <Field type="number" label="Fachperson Anzahl" value={String(caseFile.offer.flexibleFarewell.professionalCount)} onChange={(value) => updateFarewell({ professionalCount: asNumber(value) })} disabled={locked} />
            <Field type="number" label="Fachperson Ansatz CHF" value={String(caseFile.offer.flexibleFarewell.price)} onChange={(value) => updateFarewell({ price: asNumber(value) })} disabled={locked} />
            <Field type="number" label="Gehilfe Anzahl" value={String(caseFile.offer.flexibleFarewell.assistantCount)} onChange={(value) => updateFarewell({ assistantCount: asNumber(value) })} disabled={locked} />
            <Field type="number" label="Gehilfe Ansatz CHF" value={String(caseFile.offer.flexibleFarewell.assistantRate)} onChange={(value) => updateFarewell({ assistantRate: asNumber(value) })} disabled={locked} />
            <div className="farewell-preview full">
              <span>Berechneter Abschied</span>
              <strong>{formatCurrency(farewellTotal)}</strong>
              <small>
                {farewellHours > 0
                  ? `${farewellHours} Std. x ${formatCurrency(farewellHourlyRate)}`
                  : `${formatCurrency(farewellHourlyRate)} pro Stunde`}
              </small>
              <small>
                {farewellProfessionalCount} Fachperson x {formatCurrency(farewellProfessionalRate)} + {farewellAssistantCount} Gehilfe x {formatCurrency(farewellAssistantRate)}
              </small>
            </div>
            <div className="field">
              Mitarbeitende
              <div className="employee-picks">
                {employees.map((employee) => (
                  <label key={employee}>
                    <input
                      type="checkbox"
                      checked={caseFile.offer.flexibleFarewell.employees.includes(employee)}
                      onChange={(event) => {
                        const current = caseFile.offer.flexibleFarewell.employees;
                        updateFarewell({ employees: event.target.checked ? [...current, employee] : current.filter((item) => item !== employee) });
                      }}
                      disabled={locked}
                    />
                    {employee}
                  </label>
                ))}
              </div>
            </div>
            <label className="field full">
              Bemerkung
              <textarea value={caseFile.offer.flexibleFarewell.note} onChange={(event) => updateFarewell({ note: event.target.value })} disabled={locked} />
            </label>
          </div>
        </section>
      </div>
      <MiniOffer caseFile={caseFile} />
    </div>
  );
}

function OfferStep({ caseFile, onChange }: StepProps) {
  const totals = offerTotals(caseFile);

  function finishConsultation() {
    onChange({
      ...caseFile,
      consultationLocked: true,
      currentStep: "internal",
      status: "Organisation",
    });
  }

  return (
    <section className="subsection print-area">
      <div className="offer-heading">
        <div>
          <p className="eyebrow">Kundenteil</p>
          <h3>Grobe Kostenübersicht</h3>
        </div>
        <button className="button secondary no-print" onClick={() => window.print()}>
          <Printer size={18} /> Offerte drucken
        </button>
      </div>
      <OfferTable caseFile={caseFile} />
      <div className="totals-card">
        <div><span>Zwischentotal</span><strong>{formatCurrency(totals.subtotal)}</strong></div>
        <div><span>MwSt.</span><strong>{formatCurrency(totals.vat)}</strong></div>
        <div className="grand"><span>Gesamttotal</span><strong>{formatCurrency(totals.total)}</strong></div>
      </div>
      <label className="field">
        Bemerkungen zur Offerte
        <textarea value={caseFile.offer.notes} onChange={(event) => onChange({ ...caseFile, offer: { ...caseFile.offer, notes: event.target.value } })} disabled={caseFile.consultationLocked} />
      </label>
      <div className="completion-box no-print">
        <p>Nach Abschluss wird der Kundenteil gesperrt und die Organisation beginnt.</p>
        <button className="button primary" onClick={finishConsultation} disabled={caseFile.consultationLocked}>
          <Lock size={18} /> Trauergespräch abschliessen
        </button>
      </div>
    </section>
  );
}

function InternalStep({ caseFile, onChange }: StepProps) {
  const appointments = caseFile.appointments;
  function updateAppointment(key: keyof typeof appointments, value: unknown) {
    onChange({ ...caseFile, appointments: { ...appointments, [key]: value } });
  }

  function updateNested(key: "cremation" | "viewing" | "farewell" | "urnBurial", field: string, value: string) {
    onChange({ ...caseFile, appointments: { ...appointments, [key]: { ...appointments[key], [field]: value } } });
  }

  return (
    <div className="stack">
      <section className="subsection">
        <h3>Übernommene Daten aus dem Trauergespräch</h3>
        <div className="handover-grid">
          <InfoTile label="Fallnummer" value={caseFile.caseNumber} />
          <InfoTile label="Kontaktperson" value={caseFile.relatives.contactPerson || "-"} />
          <InfoTile label="Ausgewählte Leistungen" value={`${caseFile.offer.lines.filter((line) => line.selected).length} Positionen`} />
          <InfoTile label="Offertsumme" value={formatCurrency(offerTotals(caseFile).total)} />
        </div>
      </section>
      <section className="subsection">
        <h3>Termine</h3>
        <div className="appointment-grid">
          <AppointmentEditor title="Kremation" value={appointments.cremation} onChange={(field, value) => updateNested("cremation", field, value)} />
          <AppointmentEditor title="Aufbahrung" value={appointments.viewing} onChange={(field, value) => updateNested("viewing", field, value)} />
          <AppointmentEditor title="Abschied" value={appointments.farewell} onChange={(field, value) => updateNested("farewell", field, value)} timeRange />
          <AppointmentEditor title="Urnenbeisetzung" value={appointments.urnBurial} onChange={(field, value) => updateNested("urnBurial", field, value)} timeRange />
          <SelectField label="Grabart" value={appointments.graveType} onChange={(value) => updateAppointment("graveType", value as GraveType)} options={["", "Gemeinschaftsgrab", "Urnengrab", "Privat", "Mit Name", "Ohne Name", "Erdbestattung"]} />
        </div>
      </section>
    </div>
  );
}

function WorkReportStep({ caseFile, onChange }: StepProps) {
  function updateRows(rows: WorkReportRow[]) {
    onChange({ ...caseFile, workReport: rows });
  }

  function addRow(service = "") {
    updateRows([
      ...caseFile.workReport,
      {
        id: crypto.randomUUID(),
        date: "",
        service,
        description: "",
        employee: "Angela",
        people: 1,
        hours: 0,
        rate: 120,
        billable: true,
        note: "",
      },
    ]);
  }

  function updateRow(rowId: string, changes: Partial<WorkReportRow>) {
    updateRows(caseFile.workReport.map((row) => (row.id === rowId ? { ...row, ...changes } : row)));
  }

  return (
    <section className="subsection">
      <div className="offer-heading">
        <h3>Arbeitsrapport</h3>
        <div className="section-actions no-print">
          <select onChange={(event) => event.target.value && addRow(event.target.value)} defaultValue="">
            <option value="">Beispiel hinzufügen</option>
            {workReportExamples.map((example) => <option key={example}>{example}</option>)}
          </select>
          <button className="button primary" onClick={() => addRow()}><Plus size={18} /> Position</button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="editable">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Leistung</th>
              <th>Beschreibung</th>
              <th>Mitarbeiter</th>
              <th>Personen</th>
              <th>Stunden</th>
              <th>Ansatz</th>
              <th>Total</th>
              <th>Verrechnen</th>
              <th>Bemerkung</th>
              <th className="no-print">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {caseFile.workReport.map((row) => (
              <tr key={row.id}>
                <td><input type="date" value={row.date} onChange={(event) => updateRow(row.id, { date: event.target.value })} /></td>
                <td><input value={row.service} onChange={(event) => updateRow(row.id, { service: event.target.value })} /></td>
                <td><input value={row.description} onChange={(event) => updateRow(row.id, { description: event.target.value })} /></td>
                <td>
                  <select value={row.employee} onChange={(event) => updateRow(row.id, { employee: event.target.value as Employee })}>
                    {employees.map((employee) => <option key={employee}>{employee}</option>)}
                  </select>
                </td>
                <td><input type="number" value={row.people} onChange={(event) => updateRow(row.id, { people: asNumber(event.target.value) })} /></td>
                <td><input type="number" step="0.25" value={row.hours} onChange={(event) => updateRow(row.id, { hours: asNumber(event.target.value) })} /></td>
                <td><input type="number" step="0.05" value={row.rate} onChange={(event) => updateRow(row.id, { rate: asNumber(event.target.value) })} /></td>
                <td>{formatCurrency(reportLineTotal(row))}</td>
                <td><input type="checkbox" checked={row.billable} onChange={(event) => updateRow(row.id, { billable: event.target.checked })} /></td>
                <td><input value={row.note} onChange={(event) => updateRow(row.id, { note: event.target.value })} /></td>
                <td className="no-print"><button className="icon-button danger" onClick={() => updateRows(caseFile.workReport.filter((item) => item.id !== row.id))}><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function InvoiceBaseStep({ caseFile }: StepProps) {
  const draft = buildBexioDraft(caseFile);
  return (
    <section className="subsection print-area">
      <div className="offer-heading">
        <div>
          <p className="eyebrow">Bexio-Vorstufe</p>
          <h3>Rechnungsgrundlage</h3>
        </div>
        <button className="button secondary no-print" onClick={() => window.print()}><Printer size={18} /> Drucken</button>
      </div>
      <div className="handover-grid">
        <InfoTile label="Bexio Kontakt suchen" value={draft.contactLookup.name || "-"} />
        <InfoTile label="Referenz" value={draft.invoiceReference} />
        <InfoTile label="Positionen" value={String(draft.positions.length)} />
        <InfoTile label="Gesamttotal" value={formatCurrency(draft.total)} />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Quelle</th>
              <th>Leistung</th>
              <th>Menge</th>
              <th>Preis</th>
              <th>MwSt.</th>
              <th className="right">Total</th>
            </tr>
          </thead>
          <tbody>
            {draft.positions.map((position, index) => (
              <tr key={`${position.source}-${index}`}>
                <td>{position.source === "offer" ? "Offerte" : "Rapport"}</td>
                <td>{position.description}</td>
                <td>{position.quantity}</td>
                <td>{formatCurrency(position.unitPrice)}</td>
                <td>{position.vatRate}%</td>
                <td className="right">{formatCurrency(position.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="totals-card">
        <div><span>Zwischentotal</span><strong>{formatCurrency(draft.subtotal)}</strong></div>
        <div><span>MwSt.</span><strong>{formatCurrency(draft.vatTotal)}</strong></div>
        <div className="grand"><span>Gesamttotal</span><strong>{formatCurrency(draft.total)}</strong></div>
      </div>
      <div className="completion-box no-print">
        <p>Im MVP wird hier die strukturierte Grundlage vorbereitet. Später kann genau diese Struktur an die offizielle Bexio API übertragen werden.</p>
        <button className="button primary" onClick={() => exportCases([caseFile])}>Für Bexio vorbereiten</button>
      </div>
    </section>
  );
}

function CloseStep({ caseFile, onChange }: StepProps) {
  function updateChecklist(itemId: string, status: TaskStatus) {
    onChange({
      ...caseFile,
      checklist: caseFile.checklist.map((item) => (item.id === itemId ? { ...item, status } : item)),
    });
  }

  function closeCase() {
    onChange({ ...caseFile, status: "Abgeschlossen", currentStep: "close" });
  }

  return (
    <section className="subsection">
      <div className="offer-heading">
        <h3>Checkliste und Abschluss</h3>
        <button className="button secondary no-print" onClick={() => window.print()}><Printer size={18} /> Checkliste drucken</button>
      </div>
      <div className="checklist-grid">
        {caseFile.checklist.map((item) => (
          <div className="checklist-row" key={item.id}>
            <span>{item.task}</span>
            <select value={item.status} onChange={(event) => updateChecklist(item.id, event.target.value as TaskStatus)}>
              {taskStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
        ))}
      </div>
      <label className="field closing-notes">
        Bemerkungen zum Abschluss
        <textarea
          value={caseFile.closingNotes}
          onChange={(event) => onChange({ ...caseFile, closingNotes: event.target.value })}
          placeholder="Interne Bemerkungen zum abgeschlossenen Fall"
        />
      </label>
      <div className="completion-box no-print">
        <p>Wenn alle organisatorischen Punkte erledigt sind, kann der Fall abgeschlossen werden.</p>
        <button className="button primary" onClick={closeCase}>Fall abschliessen</button>
      </div>
    </section>
  );
}

function MiniOffer({ caseFile }: { caseFile: FuneralCase }) {
  const totals = offerTotals(caseFile);
  return (
    <aside className="mini-offer">
      <p className="eyebrow">Live-Offerte</p>
      <h3>Grobe Kostenübersicht</h3>
      <OfferTable caseFile={caseFile} compact />
      <div className="mini-total">
        <span>Gesamttotal</span>
        <strong>{formatCurrency(totals.total)}</strong>
      </div>
    </aside>
  );
}

function OfferTable({ caseFile, compact = false }: { caseFile: FuneralCase; compact?: boolean }) {
  const lines = caseFile.offer.lines.filter((line) => line.selected && line.showInOffer);
  const farewell = caseFile.offer.flexibleFarewell;
  const farewellHours = asNumber(farewell.hours);
  const farewellHourlyRate = flexibleFarewellHourlyRate(farewell);
  const farewellTotal = flexibleFarewellTotal(farewell);
  return (
    <div className="table-wrap">
      <table className={compact ? "compact-table" : ""}>
        <thead>
          <tr>
            <th>Leistung</th>
            <th>Menge</th>
            <th>Preis</th>
            <th className="right">Total</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id}>
              <td>{line.name}</td>
              <td>{line.quantity}</td>
              <td>{formatCurrency(line.price)}</td>
              <td className="right">{formatCurrency(lineNetTotal(line))}</td>
            </tr>
          ))}
          {farewell.enabled && (
            <tr>
              <td>{farewell.description || "Abschied"}</td>
              <td>{farewellHours > 0 ? `${farewellHours} Std.` : "1"}</td>
              <td>{formatCurrency(farewellHours > 0 ? farewellHourlyRate : farewellTotal)}</td>
              <td className="right">{formatCurrency(farewellTotal)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AppointmentEditor({
  title,
  value,
  onChange,
  timeRange = false,
}: {
  title: string;
  value: Appointment;
  onChange: (field: string, value: string) => void;
  timeRange?: boolean;
}) {
  return (
    <div className="appointment-card">
      <h4>{title}</h4>
      <Field label="Ort" value={value.place} onChange={(next) => onChange("place", next)} />
      <Field type="date" label="Datum" value={value.date} onChange={(next) => onChange("date", next)} />
      {timeRange ? (
        <>
          <Field type="time" label="Zeit von" value={value.timeFrom || value.time} onChange={(next) => onChange("timeFrom", next)} />
          <Field type="time" label="Zeit bis" value={value.timeTo} onChange={(next) => onChange("timeTo", next)} />
        </>
      ) : (
        <Field type="time" label="Zeit" value={value.time} onChange={(next) => onChange("time", next)} />
      )}
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-tile">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", disabled = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; disabled?: boolean }) {
  return (
    <label className="field">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} />
    </label>
  );
}

function SelectField({ label, value, onChange, options, disabled = false }: { label: string; value: string; onChange: (value: string) => void; options: string[]; disabled?: boolean }) {
  return (
    <label className="field">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled}>
        {options.map((option) => <option key={option} value={option}>{option || "Bitte wählen"}</option>)}
      </select>
    </label>
  );
}

function caseTitle(caseFile: FuneralCase): string {
  return `${caseFile.masterData.firstName} ${caseFile.masterData.lastName}`.trim() || "Unbenannter Todesfall";
}

interface StepProps {
  caseFile: FuneralCase;
  onChange: (caseFile: FuneralCase) => void;
}
