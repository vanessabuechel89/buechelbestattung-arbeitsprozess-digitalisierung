import { CHECKLIST_TASKS, OFFER_ITEMS } from "../data/defaults.js";

const STORAGE_KEY = "bestattungsunternehmen.cases.v1";

export function createEmptyCase() {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    status: "neu",
    masterData: {
      firstName: "",
      lastName: "",
      birthDate: "",
      deathDate: "",
      deathPlace: "",
      address: "",
      contactPerson: "",
      phone: "",
      email: "",
      invoiceAddress: "",
      notes: "",
    },
    offer: {
      items: OFFER_ITEMS.map((item) => ({
        ...item,
        selected: item.id === "basic",
        quantity: 1,
        manualPrice: item.price,
      })),
      discount: 0,
      notes: "",
    },
    billing: {
      rows: [],
    },
    checklist: CHECKLIST_TASKS.map((task) => ({
      id: crypto.randomUUID(),
      task,
      status: "offen",
    })),
    schedule: [],
  };
}

export function readCases() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function writeCases(cases) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

export function exportCases(cases) {
  const blob = new Blob([JSON.stringify(cases, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bestattungs-faelle-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
