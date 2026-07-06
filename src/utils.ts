import type { BexioDraft, FlexibleFarewell, FuneralCase, InvoicePosition, OfferLine, WorkReportRow } from "./types";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(Number(value) || 0);
}

export function formatDate(value: string): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("de-CH").format(new Date(value));
}

export function asNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function lineNetTotal(line: Pick<OfferLine, "quantity" | "price">): number {
  return asNumber(line.quantity) * asNumber(line.price);
}

export function lineVat(line: Pick<OfferLine, "quantity" | "price" | "vatRate">): number {
  return lineNetTotal(line) * (asNumber(line.vatRate) / 100);
}

export function flexibleFarewellTotal(farewell: Pick<FlexibleFarewell, "hours" | "price">): number {
  const hours = asNumber(farewell.hours);
  const price = asNumber(farewell.price);
  return hours > 0 ? hours * price : price;
}

export function selectedOfferLines(caseFile: FuneralCase): OfferLine[] {
  return caseFile.offer.lines.filter((line) => line.selected && line.showInOffer);
}

export function offerTotals(caseFile: FuneralCase) {
  const lines = selectedOfferLines(caseFile);
  const lineSubtotal = lines.reduce((sum, line) => sum + lineNetTotal(line), 0);
  const lineVat = lines.reduce((sum, line) => sum + lineNetTotal(line) * (asNumber(line.vatRate) / 100), 0);
  const farewell = caseFile.offer.flexibleFarewell.enabled ? flexibleFarewellTotal(caseFile.offer.flexibleFarewell) : 0;
  const farewellVat = farewell * 0.081;
  return {
    subtotal: lineSubtotal + farewell,
    vat: lineVat + farewellVat,
    total: lineSubtotal + farewell + lineVat + farewellVat,
  };
}

export function reportLineTotal(row: WorkReportRow): number {
  return asNumber(row.people) * asNumber(row.hours) * asNumber(row.rate);
}

export function workReportTotal(caseFile: FuneralCase): number {
  return caseFile.workReport.filter((row) => row.billable).reduce((sum, row) => sum + reportLineTotal(row), 0);
}

export function buildBexioDraft(caseFile: FuneralCase): BexioDraft {
  const offerPositions: InvoicePosition[] = selectedOfferLines(caseFile)
    .filter((line) => line.internallyBillable)
    .map((line) => ({
      source: "offer",
      description: line.name,
      quantity: asNumber(line.quantity),
      unitPrice: asNumber(line.price),
      vatRate: asNumber(line.vatRate),
      total: lineNetTotal(line),
    }));

  const farewell = caseFile.offer.flexibleFarewell;
  const farewellTotal = flexibleFarewellTotal(farewell);
  if (farewell.enabled && farewellTotal > 0) {
    offerPositions.push({
      source: "offer",
      description: farewell.description || "Abschied",
      quantity: asNumber(farewell.hours) > 0 ? asNumber(farewell.hours) : 1,
      unitPrice: asNumber(farewell.price),
      vatRate: 8.1,
      total: farewellTotal,
    });
  }

  const reportPositions: InvoicePosition[] = caseFile.workReport
    .filter((row) => row.billable)
    .map((row) => ({
      source: "workReport",
      description: row.service,
      quantity: asNumber(row.people) * asNumber(row.hours),
      unitPrice: asNumber(row.rate),
      vatRate: 8.1,
      total: reportLineTotal(row),
    }));

  const positions = [...offerPositions, ...reportPositions];
  const subtotal = positions.reduce((sum, row) => sum + row.total, 0);
  const vatTotal = positions.reduce((sum, row) => sum + row.total * (row.vatRate / 100), 0);

  return {
    contactLookup: {
      name: caseFile.relatives.contactPerson,
      email: caseFile.relatives.email,
      phone: caseFile.relatives.mobile || caseFile.relatives.phone,
      address: caseFile.relatives.billingAddress || caseFile.relatives.address,
    },
    invoiceReference: caseFile.caseNumber,
    positions,
    subtotal,
    vatTotal,
    total: subtotal + vatTotal,
  };
}
