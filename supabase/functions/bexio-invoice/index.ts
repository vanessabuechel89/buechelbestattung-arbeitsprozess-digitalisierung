type InvoicePosition = {
  source: "offer" | "workReport";
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
};

type BexioPayload = {
  metadata: {
    caseId: string;
    caseNumber: string;
    deceasedName: string;
    createdAt: string;
  };
  contact: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  invoice: {
    reference: string;
    title: string;
    userId: string;
    accountId: string;
    taxId: string;
    unitId: string;
    positions: InvoicePosition[];
    subtotal: number;
    vatTotal: number;
    total: number;
  };
};

const BEXIO_BASE_URL = "https://api.bexio.com/2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const token = Deno.env.get("BEXIO_ACCESS_TOKEN") || Deno.env.get("BEXIO_API_TOKEN");
    if (!token) {
      return jsonResponse({ error: "Missing Supabase secret BEXIO_ACCESS_TOKEN" }, 500);
    }

    const payload = (await request.json()) as BexioPayload;
    validatePayload(payload);

    const client = new BexioClient(token);
    const contact = await findOrCreateContact(client, payload);
    const invoice = await createInvoiceDraft(client, payload, contact.id);

    return jsonResponse({
      ok: true,
      message: "Bexio-Rechnungsentwurf wurde vorbereitet.",
      caseNumber: payload.metadata.caseNumber,
      contactId: contact.id,
      invoice,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});

class BexioClient {
  constructor(private readonly token: string) {}

  async get(path: string) {
    return this.request(path, { method: "GET" });
  }

  async post(path: string, body: unknown) {
    return this.request(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  private async request(path: string, init: RequestInit) {
    const response = await fetch(`${BEXIO_BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const text = await response.text();
    const data = text ? safeJson(text) : null;

    if (!response.ok) {
      throw new Error(`Bexio API ${response.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
    }

    return data;
  }
}

async function findOrCreateContact(client: BexioClient, payload: BexioPayload): Promise<{ id: number }> {
  const searchTerm = payload.contact.email || payload.contact.name;
  if (searchTerm) {
    const contacts = await client.get(`/contact?search=${encodeURIComponent(searchTerm)}`);
    const match = Array.isArray(contacts)
      ? contacts.find((contact) => {
          const email = String(contact.mail || contact.email || "").toLowerCase();
          const name = String(contact.name_1 || contact.name || "").toLowerCase();
          return (
            (payload.contact.email && email === payload.contact.email.toLowerCase()) ||
            (payload.contact.name && name.includes(payload.contact.name.toLowerCase()))
          );
        })
      : null;

    if (match?.id) return { id: Number(match.id) };
  }

  const [street, postcode, city] = splitAddress(payload.contact.address);
  const created = await client.post("/contact", {
    contact_type_id: 2,
    name_1: payload.contact.name || "Kontaktperson",
    mail: payload.contact.email || undefined,
    phone_fixed: payload.contact.phone || undefined,
    address: street,
    postcode,
    city,
    country_id: Number(Deno.env.get("BEXIO_DEFAULT_COUNTRY_ID") || 1),
  });

  if (!created?.id) {
    throw new Error("Bexio contact was created but no contact id was returned.");
  }

  return { id: Number(created.id) };
}

async function createInvoiceDraft(client: BexioClient, payload: BexioPayload, contactId: number) {
  const invoiceBody = {
    contact_id: contactId,
    user_id: toNumber(payload.invoice.userId, "Bexio User ID"),
    title: payload.invoice.title || "Rechnung Bestattungsdienstleistungen",
    document_nr: payload.invoice.reference,
    positions: payload.invoice.positions.map((position) => ({
      type: "KbPositionCustom",
      text: `${position.description} (${position.source === "offer" ? "Offerte" : "Rapport"})`,
      amount: position.quantity,
      unit_id: toNumber(payload.invoice.unitId, "Bexio Einheit ID"),
      unit_price: position.unitPrice,
      account_id: toNumber(payload.invoice.accountId, "Bexio Konto ID"),
      tax_id: toNumber(payload.invoice.taxId, "Bexio Steuer ID"),
      discount_in_percent: 0,
    })),
  };

  return client.post("/kb_invoice", invoiceBody);
}

function validatePayload(payload: BexioPayload) {
  if (!payload?.metadata?.caseNumber) throw new Error("Missing case number.");
  if (!payload?.contact?.name) throw new Error("Missing contact name.");
  if (!payload?.invoice?.positions?.length) throw new Error("Missing invoice positions.");
}

function toNumber(value: string, label: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${label} fehlt oder ist ungültig.`);
  }
  return parsed;
}

function splitAddress(address: string): [string, string, string] {
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 3) return [parts[0], parts[1], parts.slice(2).join(", ")];
  if (parts.length === 2) return [parts[0], "", parts[1]];
  return [address || "", "", ""];
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
