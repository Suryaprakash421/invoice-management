import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { InvoiceStatus, type Invoice } from "@invoice/types";
import { listInvoices, updateInvoiceStatus } from "../lib/api";

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  [InvoiceStatus.PENDING]: "bg-yellow-50 text-yellow-800 border-yellow-200",
  [InvoiceStatus.SETTLED]: "bg-green-50 text-green-800 border-green-200",
  [InvoiceStatus.REJECTED]: "bg-red-50 text-red-800 border-red-200",
};

const STATUS_OPTIONS: InvoiceStatus[] = [
  InvoiceStatus.PENDING,
  InvoiceStatus.SETTLED,
  InvoiceStatus.REJECTED,
];

function StatusSelect({
  invoiceId,
  current,
  onChange,
}: {
  invoiceId: string;
  current: InvoiceStatus;
  onChange: (id: string, next: InvoiceStatus) => void;
}) {
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as InvoiceStatus;
    setSaving(true);
    await onChange(invoiceId, next);
    setSaving(false);
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      disabled={saving}
      className={[
        "text-xs font-semibold px-2.5 py-1.5 rounded-full border appearance-none cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400",
        "disabled:opacity-50 disabled:cursor-wait transition-colors",
        STATUS_STYLES[current],
      ].join(" ")}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0) + s.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  );
}

export function InvoiceListPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listInvoices()
      .then(setInvoices)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load invoices"),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = useCallback(async (id: string, next: InvoiceStatus) => {
    // Optimistic update
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: next } : inv)),
    );
    try {
      const updated = await updateInvoiceStatus(id, next);
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
    } catch (err) {
      // Revert on failure
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === id
            ? { ...inv, status: invoices.find((i) => i.id === id)!.status }
            : inv,
        ),
      );
      console.error("Status update failed:", err);
    }
  }, [invoices]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          to="/invoices/send"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Send Invoice
        </Link>
      </div>

      {/* States */}
      {loading && (
        <div className="text-center py-20 text-gray-400 text-sm">Loading invoices…</div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {invoices.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              No invoices yet.{" "}
              <Link to="/invoices/send" className="text-indigo-600 hover:underline">
                Send your first one →
              </Link>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50">
                  {["Recipient", "Email", "Amount", "Status", "Date"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {inv.customerName}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{inv.customerEmail}</td>
                    <td className="px-5 py-4 text-sm text-gray-700 font-mono">
                      ${Number(inv.amount).toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusSelect
                        invoiceId={inv.id}
                        current={inv.status as InvoiceStatus}
                        onChange={handleStatusChange}
                      />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {new Date(inv.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
