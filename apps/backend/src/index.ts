import express from "express";
import { webhookRouter } from "./routes/webhooks.js";
import { invoiceRouter } from "./routes/invoices.js";
import { startReminderCron } from "./cron/reminder.js";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(express.json());

// --- Routes ---
app.use("/api/webhooks", webhookRouter);
app.use("/api/invoices", invoiceRouter);

// --- Health check ---
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`[backend] Server listening on http://localhost:${PORT}`);
  startReminderCron();
});
