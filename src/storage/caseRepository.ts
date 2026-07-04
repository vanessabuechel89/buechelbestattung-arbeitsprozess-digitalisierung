import { priceList } from "../data/priceList";
import { checklistTasks } from "../data/constants";
import type { FuneralCase } from "../types";

const STORAGE_KEY = "buechel-bestattungen.cases.v1";

export interface CaseRepository {
  list(): FuneralCase[];
  saveAll(cases: FuneralCase[]): void;
}

export const localStorageCaseRepository: CaseRepository = {
  list() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as FuneralCase[];
    } catch {
      return [];
    }
  },
  saveAll(cases) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  },
};

export function createEmptyCase(existingCases: FuneralCase[]): FuneralCase {
  const now = new Date().toISOString();
  const year = new Date().getFullYear();
  const nextNumber =
    existingCases
      .map((item) => item.caseNumber)
      .filter((number) => number.startsWith(String(year)))
      .map((number) => Number(number.split("-")[1]))
      .filter(Number.isFinite)
      .reduce((max, number) => Math.max(max, number), 0) + 1;

  return {
    id: crypto.randomUUID(),
    caseNumber: `${year}-${String(nextNumber).padStart(4, "0")}`,
    createdAt: now,
    updatedAt: now,
    status: "Neu",
    currentStep: "masterData",
    consultationLocked: false,
    masterData: {
      firstName: "",
      lastName: "",
      birthDate: "",
      deathDate: "",
      deathTime: "",
      address: "",
      homeTown: "",
      profession: "",
      spouse: "",
      confession: "",
      deathPlace: "",
      papers: {
        deathCertificate: false,
        familyBook: false,
        identityDocument: false,
        advanceDirective: false,
        other: false,
      },
      paperOther: "",
      notes: "",
    },
    relatives: {
      contactPerson: "",
      relationship: "",
      phone: "",
      mobile: "",
      email: "",
      address: "",
      billingAddress: "",
      notes: "",
    },
    offer: {
      lines: priceList.map((item) => ({
        ...item,
        selected: false,
        quantity: item.defaultQuantity,
        price: item.standardPrice,
        note: "",
      })),
      flexibleFarewell: {
        enabled: false,
        description: "",
        price: 0,
        hours: 0,
        employees: [],
        note: "",
      },
      notes: "",
    },
    appointments: {
      cremation: { place: "Krematorium Solothurn", date: "", time: "" },
      viewing: { place: "", date: "", time: "" },
      farewell: { place: "", date: "", time: "" },
      urnBurial: { place: "", date: "", time: "" },
      graveType: "",
    },
    workReport: [],
    checklist: checklistTasks.map((task) => ({ id: crypto.randomUUID(), task, status: "Offen" })),
  };
}

export function exportCases(cases: FuneralCase[]) {
  const blob = new Blob([JSON.stringify(cases, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `buechel-bestattungen-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
