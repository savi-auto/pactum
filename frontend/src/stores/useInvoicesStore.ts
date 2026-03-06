import { create } from "zustand";
import { persist } from "zustand/middleware";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceContact {
  id: string;
  name: string;
  address: string;
}

export interface Invoice {
  id: string;
  title: string;
  from: InvoiceContact;
  to: InvoiceContact;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  agreementId?: string;
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface InvoicesState {
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">) => Invoice;
  updateInvoice: (id: string, updates: Partial<Omit<Invoice, "id" | "createdAt">>) => void;
  deleteInvoice: (id: string) => void;
  getInvoice: (id: string) => Invoice | undefined;
  markAsPaid: (id: string) => void;
  markAsSent: (id: string) => void;
}

function generateInvoiceId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `INV-${timestamp}${random}`;
}

export const useInvoicesStore = create<InvoicesState>()(
  persist(
    (set, get) => ({
      invoices: [],

      addInvoice: (invoiceData) => {
        const now = new Date().toISOString();
        const invoice: Invoice = {
          ...invoiceData,
          id: generateInvoiceId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ invoices: [invoice, ...state.invoices] }));
        return invoice;
      },

      updateInvoice: (id, updates) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...updates, updatedAt: new Date().toISOString() } : inv
          ),
        }));
      },

      deleteInvoice: (id) => {
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
        }));
      },

      getInvoice: (id) => {
        return get().invoices.find((inv) => inv.id === id);
      },

      markAsPaid: (id) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id
              ? { ...inv, status: "paid" as InvoiceStatus, paidAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : inv
          ),
        }));
      },

      markAsSent: (id) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id && inv.status === "draft"
              ? { ...inv, status: "sent" as InvoiceStatus, issuedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : inv
          ),
        }));
      },
    }),
    {
      name: "pactum-invoices",
    }
  )
);
