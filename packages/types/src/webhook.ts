/**
 * Payload received from Turf AI via POST /api/webhooks/turf-receipts.
 * Contains extracted invoice data from the AI orchestration engine.
 */
export interface TurfReceiptWebhookPayload {
  invoice_id: string;
  status: string;
  received_at?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Standard response returned from webhook endpoints.
 */
export interface WebhookResponse {
  success: boolean;
  message: string;
}
