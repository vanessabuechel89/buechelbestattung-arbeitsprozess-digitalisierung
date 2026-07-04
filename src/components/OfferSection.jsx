import { Printer } from "lucide-react";
import { calculateOfferTotals, formatCurrency } from "../utils.js";

export function OfferSection({ caseFile, onChange }) {
  const offer = caseFile.offer;
  const totals = calculateOfferTotals(offer);

  function updateItem(itemId, changes) {
    onChange({
      ...caseFile,
      offer: {
        ...offer,
        items: offer.items.map((item) => (item.id === itemId ? { ...item, ...changes } : item)),
      },
    });
  }

  function updateOffer(changes) {
    onChange({ ...caseFile, offer: { ...offer, ...changes } });
  }

  return (
    <article className="content-section print-area offer-print">
      <div className="section-heading with-actions">
        <div>
          <p className="eyebrow">Trauergespräch</p>
          <h2>Live-Offerte</h2>
        </div>
        <button className="button secondary print-hidden" onClick={() => window.print()}>
          <Printer size={18} aria-hidden="true" /> Offerte drucken
        </button>
      </div>

      <div className="offer-grid">
        <div className="service-list">
          {offer.items.map((item) => (
            <div className="service-row" key={item.id}>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={(event) => updateItem(item.id, { selected: event.target.checked })}
                />
                <span>{item.name}</span>
              </label>
              <label>
                Menge
                <input type="number" min="0" step="1" value={item.quantity} onChange={(event) => updateItem(item.id, { quantity: event.target.value })} />
              </label>
              <label>
                Preis CHF
                <input type="number" min="0" step="0.05" value={item.manualPrice} onChange={(event) => updateItem(item.id, { manualPrice: event.target.value })} />
              </label>
              <strong>{formatCurrency(Number(item.quantity || 0) * Number(item.manualPrice || 0))}</strong>
            </div>
          ))}
        </div>

        <aside className="summary-panel">
          <h3>Offertsumme</h3>
          <dl>
            <div>
              <dt>Zwischentotal</dt>
              <dd>{formatCurrency(totals.subtotal)}</dd>
            </div>
            <div>
              <dt>Rabatt</dt>
              <dd>
                <input
                  type="number"
                  min="0"
                  step="0.05"
                  value={offer.discount}
                  onChange={(event) => updateOffer({ discount: event.target.value })}
                  aria-label="Rabatt in CHF"
                />
              </dd>
            </div>
            <div className="total-line">
              <dt>Total CHF</dt>
              <dd>{formatCurrency(totals.total)}</dd>
            </div>
          </dl>
          <label className="field">
            Bemerkungen zur Offerte
            <textarea rows="6" value={offer.notes} onChange={(event) => updateOffer({ notes: event.target.value })} />
          </label>
        </aside>
      </div>
    </article>
  );
}
