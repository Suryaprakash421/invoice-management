import { Router, type Router as RouterType } from "express";
import { z } from "zod";
import { prisma } from "@invoice/database";

export const invoiceRouter: RouterType = Router();

const createInvoiceSchema = z.object({
  customerEmail: z.string().email(),
  amount: z.number().positive(),
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

/** POST /api/invoices — create a new invoice */
invoiceRouter.post("/", async (req, res) => {
  const parsed = createInvoiceSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid input",
      details: parsed.error.issues,
    });
    return;
  }

  try {
    const invoice = await prisma.invoice.create({
      data: {
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
