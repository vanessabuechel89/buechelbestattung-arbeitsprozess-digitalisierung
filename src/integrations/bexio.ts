import type { BexioDraft, BexioPayload, BexioSettings, FuneralCase } from "../types";

export function buildBexioPayload(caseFile: FuneralCase, draft: BexioDraft, settings: BexioSettings): BexioPayload {
  return {
    metadata: {
      caseId: caseFile.id,
      caseNumber: caseFile.caseNumber,
      deceasedName: `${caseFile.masterData.firstName} ${caseFile.masterData.lastName}`.trim(),
      createdAt: new Date().toISOString(),
    },
    contact: draft.contactLookup,
    invoice: {
      reference: draft.invoiceReference,
      title: settings.invoiceTitle,
      userId: settings.defaultUserId,
      accountId: settings.defaultAccountId,
      taxId: settings.defaultTaxId,
      unitId: settings.defaultUnitId,
      positions: draft.positions,
      subtotal: draft.subtotal,
      vatTotal: draft.vatTotal,
      total: draft.total,
    },
  };
}

export function downloadBexioPayload(payload: BexioPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bexio-${payload.metadata.caseNumber}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function sendBexioPayload(settings: BexioSettings, payload: BexioPayload): Promise<string> {
  if (!settings.enabled) {
    throw new Error("Bexio-Schnittstelle ist noch nicht aktiviert.");
  }

  if (!settings.proxyUrl.trim()) {
    throw new Error("Bitte zuerst eine sichere Proxy-URL hinterlegen.");
  }

  const response = await fetch(settings.proxyUrl.trim(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Bexio-Proxy hat mit ${response.status} geantwortet.${detail ? ` ${detail}` : ""}`);
  }

  return response.text();
}
