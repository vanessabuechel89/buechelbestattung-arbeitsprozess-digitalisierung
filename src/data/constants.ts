import type { CaseStatus, Employee, TaskStatus, WizardStep } from "../types";

export const caseStatuses: CaseStatus[] = ["Neu", "Trauergespräch", "Organisation", "Rechnung vorbereiten", "Abgeschlossen"];

export const wizardSteps: Array<{ id: WizardStep; label: string; status?: CaseStatus }> = [
  { id: "masterData", label: "Stammdaten", status: "Neu" },
  { id: "consultation", label: "Trauergespräch", status: "Trauergespräch" },
  { id: "offer", label: "Live-Offerte", status: "Trauergespräch" },
  { id: "internal", label: "Organisation", status: "Organisation" },
  { id: "workReport", label: "Arbeitsrapport", status: "Organisation" },
  { id: "invoiceBase", label: "Rechnungsgrundlage", status: "Rechnung vorbereiten" },
  { id: "close", label: "Abschluss", status: "Abgeschlossen" },
];

export const employees: Employee[] = ["Angela", "Sabine", "Natascha", "Andere"];
export const taskStatuses: TaskStatus[] = ["Offen", "In Arbeit", "Erledigt"];

export const checklistTasks = [
  "Dokumente geprüft",
  "Abholung organisiert",
  "Einsargen organisiert",
  "Krematorium informiert",
  "Kirche informiert",
  "Friedhof informiert",
  "Blumen organisiert",
  "Drucksachen organisiert",
  "Urne gewählt",
  "Sarg gewählt",
  "Trauerfeier vorbereitet",
  "Urnenbeisetzung vorbereitet",
  "Rechnung vorbereitet",
  "Rechnung versendet",
  "Fall abgeschlossen",
];

export const workReportExamples = [
  "Trauergespräch",
  "Einsargen",
  "Überführung",
  "Abschied",
  "Urnenbeisetzung",
  "Administration",
  "Material",
  "Sonstiges",
];
