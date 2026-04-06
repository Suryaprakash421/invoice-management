import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { InvoiceListPage } from "./pages/InvoiceListPage";
import { SendInvoicePage } from "./pages/SendInvoicePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/invoices" replace />} />
          <Route path="/invoices" element={<InvoiceListPage />} />
          <Route path="/invoices/send" element={<SendInvoicePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
