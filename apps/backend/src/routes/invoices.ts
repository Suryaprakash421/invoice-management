import { Router, type Router as RouterType } from "express";
import { z } from "zod";
import multer from "multer";
import { prisma } from "@invoice/database";

export const invoiceRouter: RouterType = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const createInvoiceSchema = z.object({
  customerName: z.string().min(1, "Recipient name is required"),
  customerEmail: z.string().email("Invalid email address"),
  amount: z.coerce.number().nonnegative().default(0),
});

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "SETTLED", "REJECTED"]),
});

/** GET /api/invoices — list all invoices */
invoiceRouter.get("/", async (_req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(invoices);
  } catch (error) {
    console.error("[invoices] Error listing invoices:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** POST /api/invoices — create invoice (multipart/form-data: file, customerName, customerEmail, amount) */
invoiceRouter.post("/", upload.single("file"), async (req, res) => {
  const parsed = createInvoiceSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }

  if (req.file) {
    // TODO: persist file to storage (S3, GCS, local disk, etc.)
    console.log(`[invoices] Received file: ${req.file.originalname} (${req.file.size} bytes)`);
  }

  try {
    const invoice = await prisma.invoice.create({
      data: {
        customerName: parsed.data.customerName,
        customerEmail: parsed.data.customerEmail,
        amount: parsed.data.amount,
      },
    });
    res.status(201).json(invoice);
  } catch (error) {
    console.error("[invoices] Error creating invoice:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** PATCH /api/invoices/:id — update invoice status */
invoiceRouter.patch("/:id", async (req, res) => {
  const parsed = updateStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid status", details: parsed.error.issues });
    return;
  }

  try {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
    });
    res.json(invoice);
  } catch (error) {
    console.error("[invoices] Error updating invoice status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
