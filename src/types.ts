export type CaseStatus = "Neu" | "Trauergespräch" | "Organisation" | "Rechnung vorbereiten" | "Abgeschlossen";
export type WizardStep = "masterData" | "consultation" | "offer" | "internal" | "workReport" | "invoiceBase" | "close";
export type TaskStatus = "Offen" | "In Arbeit" | "Erledigt";
export type Confession = "" | "Katholisch" | "Reformiert" | "Konfessionslos" | "Andere";
export type DeathPlace = "" | "Spital" | "Altersheim" | "Zuhause" | "Andere";
export type GraveType = "" | "Gemeinschaftsgrab" | "Urnengrab" | "Privat" | "Mit Name" | "Ohne Name" | "Erdbestattung";
export type Employee = "Angela" | "Sabine" | "Natascha" | "Andere";

export interface PriceListItem {
  id: string;
  category: string;
  name: string;
  description: string;
  standardPrice: number;
  vatRate: number;
  defaultQuantity: number;
  active: boolean;
  editable: boolean;
  showInOffer: boolean;
  internallyBillable: boolean;
}

export interface OfferLine extends PriceListItem {
  selected: boolean;
  quantity: number;
  price: number;
  note: string;
}

export interface FlexibleFarewell {
  enabled: boolean;
  description: string;
  price: number;
  hours: number;
  professionalCount: number;
  assistantCount: number;
  assistantRate: number;
  employees: Employee[];
  note: string;
}

export interface MasterData {
  firstName: string;
  lastName: string;
  birthDate: string;
  deathDate: string;
  deathTime: string;
  address: string;
  homeTown: string;
  profession: string;
  spouse: string;
  confession: Confession;
  deathPlace: DeathPlace;
  papers: Record<string, boolean>;
  paperOther: string;
  notes: string;
}

export interface RelativeData {
  contactPerson: string;
  relationship: string;
  phone: string;
  mobile: string;
  email: string;
  address: string;
  billingAddress: string;
  notes: string;
}

export interface AppointmentData {
  cremation: Appointment;
  viewing: Appointment;
  farewell: Appointment;
  urnBurial: Appointment;
  graveType: GraveType;
}

export interface Appointment {
  place: string;
  date: string;
  time: string;
}

export interface WorkReportRow {
  id: string;
  date: string;
  service: string;
  description: string;
  employee: Employee;
  people: number;
  hours: number;
  rate: number;
  billable: boolean;
  note: string;
}

export interface ChecklistItem {
  id: string;
  task: string;
  status: TaskStatus;
}

export interface BexioDraft {
  contactLookup: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  invoiceReference: string;
  positions: InvoicePosition[];
  subtotal: number;
  vatTotal: number;
  total: number;
}

export interface InvoicePosition {
  source: "offer" | "workReport";
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
}

export interface FuneralCase {
  id: string;
  caseNumber: string;
  createdAt: string;
  updatedAt: string;
  status: CaseStatus;
  currentStep: WizardStep;
  consultationLocked: boolean;
  masterData: MasterData;
  relatives: RelativeData;
  offer: {
    lines: OfferLine[];
    flexibleFarewell: FlexibleFarewell;
    notes: string;
  };
  appointments: AppointmentData;
  workReport: WorkReportRow[];
  checklist: ChecklistItem[];
}
