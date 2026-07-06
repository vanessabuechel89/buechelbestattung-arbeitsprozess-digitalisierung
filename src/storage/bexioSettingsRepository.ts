import type { BexioSettings } from "../types";

const STORAGE_KEY = "buechel-bestattungen.bexio-settings.v1";

export const defaultBexioSettings: BexioSettings = {
  enabled: false,
  supabaseProjectUrl: "",
  proxyUrl: "",
  defaultUserId: "",
  defaultAccountId: "",
  defaultTaxId: "",
  defaultUnitId: "",
  invoiceTitle: "Rechnung Bestattungsdienstleistungen",
};

export const bexioSettingsRepository = {
  load(): BexioSettings {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Partial<BexioSettings>;
      return { ...defaultBexioSettings, ...parsed };
    } catch {
      return defaultBexioSettings;
    }
  },

  save(settings: BexioSettings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // The integration remains usable through download/export if browser storage is unavailable.
    }
  },
};
