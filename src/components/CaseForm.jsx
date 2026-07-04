export function CaseForm({ caseFile, onChange }) {
  const data = caseFile.masterData;

  function updateField(field, value) {
    onChange({ ...caseFile, masterData: { ...data, [field]: value } });
  }

  return (
    <article className="content-section">
      <div className="section-heading">
        <p className="eyebrow">Stammdaten</p>
        <h2>Neuer Todesfall / Stammdaten</h2>
      </div>

      <div className="form-grid">
        <Field label="Vorname verstorbene Person" value={data.firstName} onChange={(value) => updateField("firstName", value)} />
        <Field label="Nachname verstorbene Person" value={data.lastName} onChange={(value) => updateField("lastName", value)} />
        <Field type="date" label="Geburtsdatum" value={data.birthDate} onChange={(value) => updateField("birthDate", value)} />
        <Field type="date" label="Todesdatum" value={data.deathDate} onChange={(value) => updateField("deathDate", value)} />
        <Field label="Todesort" value={data.deathPlace} onChange={(value) => updateField("deathPlace", value)} />
        <Field label="Wohnadresse" value={data.address} onChange={(value) => updateField("address", value)} />
        <Field label="Kontaktperson Angehörige" value={data.contactPerson} onChange={(value) => updateField("contactPerson", value)} />
        <Field label="Telefonnummer" value={data.phone} onChange={(value) => updateField("phone", value)} />
        <Field type="email" label="E-Mail" value={data.email} onChange={(value) => updateField("email", value)} />
        <label className="field full">
          Adresse Rechnungsempfänger
          <textarea value={data.invoiceAddress} onChange={(event) => updateField("invoiceAddress", event.target.value)} rows="3" />
        </label>
        <label className="field full">
          Bemerkungen
          <textarea value={data.notes} onChange={(event) => updateField("notes", event.target.value)} rows="4" />
        </label>
      </div>
    </article>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="field">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
