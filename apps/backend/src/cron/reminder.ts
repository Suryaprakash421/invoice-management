import cron from "node-cron";
import { prisma } from "@invoice/database";

/**
 * Starts a CRON job that runs daily at 09:00 to find pending invoices
 * older than 3 days and triggers dunning reminders.
 */
export function startReminderCron() {
  // Run every day at 09:00
  cron.schedule("0 9 * * *", async () => {
    console.log("[cron] Running 3-day pending invoice reminder check...");

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    try {
      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          status: "PENDING",
          createdAt: { lt: threeDaysAgo },
        },
      });

      if (overdueInvoices.length === 0) {
        console.log("[cron] No overdue pending invoices found.");
        return;
      }

      console.log(
        `[cron] Found ${overdueInvoices.length} overdue pending invoice(s):`,
      );

      for (const invoice of overdueInvoices) {
        console.log(
          `  - Invoice ${invoice.id} | ${invoice.customerEmail} | $${invoice.amount} | Created: ${invoice.createdAt.toISOString()}`,
        );

        // TODO: Send dunning email/notification to invoice.customerEmail
        // e.g., await sendDunningEmail(invoice);
      }
    } catch (error) {
      console.error("[cron] Error during reminder check:", error);
    }
  });

  console.log("[cron] 3-day reminder CRON scheduled (daily at 09:00)");
}
