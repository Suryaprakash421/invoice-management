export enum InvoiceStatus {
  PENDING = "PENDING",
  PAID = "PAID",
}

export interface Invoice {
  id: string;
  customerEmail: string;
  amount: number;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvoiceDTO {
  customerEmail: string;
  amount: number;
}

export interface UpdateInvoiceDTO {
  status?: InvoiceStatus;
}
