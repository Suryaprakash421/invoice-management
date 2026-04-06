import type { Invoice, InvoiceStatus } from "@invoice/types";

const BASE = "/api";

export async function listInvoices(): Promise<Invoice[]> {
  const res = await fetch(`${BASE}/invoices`);
  if (!res.ok) throw new Error(`Failed to fetch invoices: ${res.status}`);
  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error("Unexpected response shape");
  return data as Invoice[];
}

export async function createInvoice(form: FormData): Promise<Invoice> {
  const res = await fetch(`${BASE}/invoices`, { method: "POST", body: form });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Server error ${res.status}`);
  }
  return res.json() as Promise<Invoice>;
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus,
): Promise<Invoice> {
  const res = await fetch(`${BASE}/invoices/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Server error ${res.status}`);
  }
  return res.json() as Promise<Invoice>;
}
