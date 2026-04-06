import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createInvoice } from "../lib/api";

interface FormState {
  customerName: string;
  customerEmail: string;
  amount: string;
  file: File | null;
}

const EMPTY: FormState = { customerName: "", customerEmail: "", amount: "", file: null };

export function SendInvoicePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.file) {
      setError("Please attach an invoice file.");
      return;
    }

    const data = new FormData();
    data.append("file", form.file);
    data.append("customerName", form.customerName.trim());
    data.append("customerEmail", form.customerEmail.trim());
    data.append("amount", form.amount || "0");

    setSubmitting(true);
    setError(null);
    try {
      await createInvoice(data);
      navigate("/invoices");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/invoices"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Invoices
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Send Invoice</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload an invoice file and fill in the recipient details.
        </p>
      </div>

      <div className="max-w-xl">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100"
        >
          {/* File upload */}
          <div className="p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Invoice File <span className="text-red-500">*</span>
            </label>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              className={[
                "flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg px-6 py-10",
                "cursor-pointer transition-colors",
                form.file
                  ? "border-indigo-300 bg-indigo-50"
                  : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50",
              ].join(" ")}
            >
              <svg
                className={`w-8 h-8 ${form.file ? "text-indigo-500" : "text-gray-300"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {form.file ? (
                <span className="text-sm font-medium text-indigo-700">{form.file.name}</span>
              ) : (
                <>
                  <span className="text-sm font-medium text-gray-700">
                    Click to upload invoice
                  </span>
                  <span className="text-xs text-gray-400">PDF, PNG, JPG up to 10 MB</span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setForm((prev) => ({ ...prev, file: f }));
                setError(null);
              }}
            />
          </div>

          {/* Recipient fields */}
          <div className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Recipient Details</h2>

            <div>
              <label
                htmlFor="customerName"
                className="block text-sm text-gray-600 mb-1.5 font-medium"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="customerName"
                type="text"
                required
                placeholder="Jane Smith"
                value={form.customerName}
                onChange={(e) => set("customerName", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-gray-300"
              />
            </div>

            <div>
              <label
                htmlFor="customerEmail"
                className="block text-sm text-gray-600 mb-1.5 font-medium"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="customerEmail"
                type="email"
                required
                placeholder="jane@example.com"
                value={form.customerEmail}
                onChange={(e) => set("customerEmail", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-gray-300"
              />
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm text-gray-600 mb-1.5 font-medium"
              >
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 select-none">
                  $
                </span>
                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => set("amount", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg pl-7 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 flex items-center justify-between gap-3">
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <Link
                to="/invoices"
                className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-wait text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Sending…
                  </>
                ) : (
                  "Send Invoice"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
