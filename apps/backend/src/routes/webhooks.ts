import { Router, type Router as RouterType } from "express";
import { z } from "zod";
import { prisma } from "@invoice/database";
import type { WebhookResponse } from "@invoice/types";

export const webhookRouter: RouterType = Router();

const turfReceiptSchema = z.object({
  invoice_id: z.string().min(1),
  status: z.string().min(1),
  received_at: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * POST /api/webhooks/turf-receipts
 *
 * Accepts incoming JSON payloads from Turf AI containing
 * extracted invoice_id and status fields.
 */
webhookRouter.post("/turf-receipts", async (req, res) => {
  const parsed = turfReceiptSchema.safeParse(req.body);

  if (!parsed.success) {
    const response: WebhookResponse = {
      success: false,
      message: `Invalid payload: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    };
    res.status(400).json(response);
    return;
  }

  const { invoice_id, status } = parsed.data;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoice_id },
    });

    if (!invoice) {
      const response: WebhookResponse = {
        success: false,
        message: `Invoice ${invoice_id} not found`,
      };
      res.status(404).json(response);
      return;
    }

    await prisma.invoice.update({
      where: { id: invoice_id },
      data: {
        status: (["PENDING", "SETTLED", "REJECTED"] as const).includes(
          status as "PENDING" | "SETTLED" | "REJECTED",
        )
          ? (status as "PENDING" | "SETTLED" | "REJECTED")
          : "PENDING",
      },
    });

    const response: WebhookResponse = {
      success: true,
      message: `Invoice ${invoice_id} updated to ${status}`,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error("[webhook] Error processing turf receipt:", error);
    const response: WebhookResponse = {
      success: false,
      message: "Internal server error",
    };
    res.status(500).json(response);
  }
});
