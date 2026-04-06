export enum InvoiceStatus {
  PENDING = "PENDING",
  SETTLED = "SETTLED",
  REJECTED = "REJECTED",
}

export interface Invoice {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvoiceDTO {
  customerName: string;
  customerEmail: string;
  amount: number;
}

export interface UpdateInvoiceDTO {
  status?: InvoiceStatus;
}
