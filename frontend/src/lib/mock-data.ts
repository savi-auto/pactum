export type AgreementStatus = "created" | "funded" | "delivered" | "completed" | "disputed";

export interface Contact {
  id: string;
  name: string;
  address: string;
  avatar?: string;
}

export interface Agreement {
  id: string;
  title: string;
  counterparty: Contact;
  role: "client" | "freelancer";
  amount: number;
  amountUsd: number;
  status: AgreementStatus;
  description: string;
  deadline: string;
  createdAt: string;
  invoiceId?: string;
}

export interface ActivityEvent {
  id: string;
  type: "agreement_created" | "payment_received" | "agreement_funded" | "delivery_confirmed" | "dispute_opened";
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
  relatedId?: string;
  relatedType?: "agreement" | "invoice" | "transaction";
}

export const STX_PRICE_USD = 1.42;

export const mockContacts: Contact[] = [
  { id: "c1", name: "Alex Rivera", address: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQ9V6CJ", avatar: "" },
  { id: "c2", name: "Jordan Chen", address: "SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8Q", avatar: "" },
  { id: "c3", name: "Sam Nakamoto", address: "SP3FBR2AGK5H9QBDH3EFK3PZMRQ4FE27JKMBTGG", avatar: "" },
  { id: "c4", name: "Taylor Wright", address: "SP2C2YFP12AJZB1MAREPX93ZWMDD89WAQS5QYARG", avatar: "" },
  { id: "c5", name: "Morgan Lee", address: "SP3GWX3NE58KXHESRYE4DYJ1EH600FMF5TSTN8VR", avatar: "" },
];

export const mockAgreements: Agreement[] = [
  {
    id: "AGR-001",
    title: "Landing Page Design",
    counterparty: mockContacts[0],
    role: "client",
    amount: 2500,
    amountUsd: 2500 * STX_PRICE_USD,
    status: "funded",
    description: "Design and develop a responsive landing page for the new product launch.",
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    invoiceId: "INV-001",
  },
  {
    id: "AGR-002",
    title: "Smart Contract Audit",
    counterparty: mockContacts[1],
    role: "freelancer",
    amount: 8000,
    amountUsd: 8000 * STX_PRICE_USD,
    status: "created",
    description: "Complete security audit of the escrow smart contract including test coverage.",
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "AGR-003",
    title: "Brand Identity Package",
    counterparty: mockContacts[2],
    role: "client",
    amount: 4200,
    amountUsd: 4200 * STX_PRICE_USD,
    status: "delivered",
    description: "Full brand identity including logo, color palette, typography, and brand guidelines.",
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    invoiceId: "INV-003",
  },
  {
    id: "AGR-004",
    title: "API Integration",
    counterparty: mockContacts[3],
    role: "freelancer",
    amount: 3000,
    amountUsd: 3000 * STX_PRICE_USD,
    status: "completed",
    description: "Integrate third-party payment API with the existing platform backend.",
    deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    invoiceId: "INV-004",
  },
  {
    id: "AGR-005",
    title: "Mobile App Prototype",
    counterparty: mockContacts[4],
    role: "client",
    amount: 5500,
    amountUsd: 5500 * STX_PRICE_USD,
    status: "disputed",
    description: "High-fidelity prototype for iOS and Android mobile applications.",
    deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "AGR-006",
    title: "Database Migration",
    counterparty: mockContacts[0],
    role: "freelancer",
    amount: 1800,
    amountUsd: 1800 * STX_PRICE_USD,
    status: "funded",
    description: "Migrate legacy database to new schema with zero downtime.",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockActivity: ActivityEvent[] = [
  {
    id: "evt1",
    type: "agreement_funded",
    title: "Agreement Funded",
    description: "AGR-001 funded by Alex Rivera",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    amount: 2500,
    relatedId: "AGR-001",
    relatedType: "agreement",
  },
  {
    id: "evt2",
    type: "delivery_confirmed",
    title: "Delivery Confirmed",
    description: "AGR-003 marked as delivered",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    relatedId: "AGR-003",
    relatedType: "agreement",
  },
  {
    id: "evt3",
    type: "payment_received",
    title: "Payment Received",
    description: "3,000 STX released for AGR-004",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    amount: 3000,
    relatedId: "AGR-004",
    relatedType: "agreement",
  },
  {
    id: "evt4",
    type: "dispute_opened",
    title: "Dispute Opened",
    description: "AGR-005 dispute initiated by Morgan Lee",
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    relatedId: "AGR-005",
    relatedType: "agreement",
  },
  {
    id: "evt5",
    type: "agreement_created",
    title: "Agreement Created",
    description: "AGR-006 created with Alex Rivera",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 1800,
    relatedId: "AGR-006",
    relatedType: "agreement",
  },
];

// Invoice types
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  title: string;
  from: Contact;
  to: Contact;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  totalUsd: number;
  agreementId?: string;
  issuedAt: string;
  dueDate: string;
  notes?: string;
}

export const mockInvoices: Invoice[] = [
  {
    id: "INV-001",
    title: "Landing Page Design - Milestone 1",
    from: mockContacts[0],
    to: { id: "self", name: "You", address: "SP1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5" },
    status: "paid",
    lineItems: [
      { id: "li1", description: "UI/UX Design", quantity: 40, unitPrice: 50, total: 2000 },
      { id: "li2", description: "Responsive Implementation", quantity: 10, unitPrice: 50, total: 500 },
    ],
    subtotal: 2500,
    tax: 0,
    total: 2500,
    totalUsd: 2500 * STX_PRICE_USD,
    agreementId: "AGR-001",
    issuedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "INV-002",
    title: "Consulting Hours - January",
    from: { id: "self", name: "You", address: "SP1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5" },
    to: mockContacts[1],
    status: "sent",
    lineItems: [
      { id: "li3", description: "Strategy Consultation", quantity: 8, unitPrice: 150, total: 1200 },
      { id: "li4", description: "Technical Review", quantity: 4, unitPrice: 150, total: 600 },
      { id: "li5", description: "Documentation", quantity: 2, unitPrice: 100, total: 200 },
    ],
    subtotal: 2000,
    tax: 5,
    total: 2100,
    totalUsd: 2100 * STX_PRICE_USD,
    issuedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "INV-003",
    title: "Brand Identity - Final Payment",
    from: mockContacts[2],
    to: { id: "self", name: "You", address: "SP1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5" },
    status: "overdue",
    lineItems: [
      { id: "li6", description: "Logo Design", quantity: 1, unitPrice: 1500, total: 1500 },
      { id: "li7", description: "Brand Guidelines", quantity: 1, unitPrice: 2000, total: 2000 },
      { id: "li8", description: "Color Palette & Typography", quantity: 1, unitPrice: 700, total: 700 },
    ],
    subtotal: 4200,
    tax: 0,
    total: 4200,
    totalUsd: 4200 * STX_PRICE_USD,
    agreementId: "AGR-003",
    issuedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Payment overdue. Please remit at your earliest convenience.",
  },
  {
    id: "INV-004",
    title: "API Integration Services",
    from: { id: "self", name: "You", address: "SP1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5" },
    to: mockContacts[3],
    status: "paid",
    lineItems: [
      { id: "li9", description: "API Development", quantity: 20, unitPrice: 100, total: 2000 },
      { id: "li10", description: "Testing & QA", quantity: 10, unitPrice: 80, total: 800 },
      { id: "li11", description: "Deployment Support", quantity: 2, unitPrice: 100, total: 200 },
    ],
    subtotal: 3000,
    tax: 0,
    total: 3000,
    totalUsd: 3000 * STX_PRICE_USD,
    agreementId: "AGR-004",
    issuedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "INV-005",
    title: "Mobile App Wireframes",
    from: { id: "self", name: "You", address: "SP1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5" },
    to: mockContacts[4],
    status: "draft",
    lineItems: [
      { id: "li12", description: "Wireframe Design (10 screens)", quantity: 10, unitPrice: 200, total: 2000 },
      { id: "li13", description: "Interactive Prototype", quantity: 1, unitPrice: 1500, total: 1500 },
    ],
    subtotal: 3500,
    tax: 10,
    total: 3850,
    totalUsd: 3850 * STX_PRICE_USD,
    issuedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Draft — pending review before sending.",
  },
  {
    id: "INV-006",
    title: "Database Migration - Cancelled",
    from: mockContacts[0],
    to: { id: "self", name: "You", address: "SP1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5" },
    status: "cancelled",
    lineItems: [
      { id: "li14", description: "Schema Design", quantity: 5, unitPrice: 120, total: 600 },
      { id: "li15", description: "Data Migration", quantity: 10, unitPrice: 120, total: 1200 },
    ],
    subtotal: 1800,
    tax: 0,
    total: 1800,
    totalUsd: 1800 * STX_PRICE_USD,
    issuedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Wallet transactions
export interface WalletTransaction {
  id: string;
  type: "sent" | "received";
  amount: number;
  counterparty: string;
  timestamp: string;
  status: "confirmed" | "pending";
  memo?: string;
}

export const mockWalletTransactions: WalletTransaction[] = [
  { id: "tx1", type: "received", amount: 2500, counterparty: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQ9V6CJ", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: "confirmed", memo: "Landing Page Design payment" },
  { id: "tx2", type: "sent", amount: 800, counterparty: "SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8Q", timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), status: "confirmed", memo: "Consulting fee" },
  { id: "tx3", type: "received", amount: 3000, counterparty: "SP2C2YFP12AJZB1MAREPX93ZWMDD89WAQS5QYARG", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), status: "confirmed", memo: "API Integration Services" },
  { id: "tx4", type: "sent", amount: 1200, counterparty: "SP3FBR2AGK5H9QBDH3EFK3PZMRQ4FE27JKMBTGG", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed" },
  { id: "tx5", type: "received", amount: 450, counterparty: "SP3GWX3NE58KXHESRYE4DYJ1EH600FMF5TSTN8VR", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: "pending", memo: "Partial milestone payment" },
  { id: "tx6", type: "sent", amount: 5000, counterparty: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQ9V6CJ", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed", memo: "Escrow funding for AGR-001" },
  { id: "tx7", type: "received", amount: 1800, counterparty: "SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8Q", timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed", memo: "Database Migration" },
  { id: "tx8", type: "sent", amount: 350, counterparty: "SP3GWX3NE58KXHESRYE4DYJ1EH600FMF5TSTN8VR", timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed" },
  { id: "tx9", type: "received", amount: 6500, counterparty: "SP2C2YFP12AJZB1MAREPX93ZWMDD89WAQS5QYARG", timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed", memo: "Smart Contract Audit" },
  { id: "tx10", type: "sent", amount: 200, counterparty: "SP3FBR2AGK5H9QBDH3EFK3PZMRQ4FE27JKMBTGG", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), status: "pending", memo: "Gas fee reimbursement" },
  { id: "tx11", type: "received", amount: 1500, counterparty: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQ9V6CJ", timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed", memo: "Frontend refactor" },
  { id: "tx12", type: "sent", amount: 2200, counterparty: "SP2C2YFP12AJZB1MAREPX93ZWMDD89WAQS5QYARG", timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed", memo: "Server hosting" },
  { id: "tx13", type: "received", amount: 780, counterparty: "SP3FBR2AGK5H9QBDH3EFK3PZMRQ4FE27JKMBTGG", timestamp: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed" },
  { id: "tx14", type: "sent", amount: 4100, counterparty: "SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8Q", timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed", memo: "Brand identity package" },
  { id: "tx15", type: "received", amount: 920, counterparty: "SP3GWX3NE58KXHESRYE4DYJ1EH600FMF5TSTN8VR", timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed", memo: "Bug bounty reward" },
  { id: "tx16", type: "sent", amount: 600, counterparty: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQ9V6CJ", timestamp: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed" },
  { id: "tx17", type: "received", amount: 3400, counterparty: "SP2C2YFP12AJZB1MAREPX93ZWMDD89WAQS5QYARG", timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed", memo: "Mobile app prototype" },
  { id: "tx18", type: "sent", amount: 150, counterparty: "SP3FBR2AGK5H9QBDH3EFK3PZMRQ4FE27JKMBTGG", timestamp: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed", memo: "Domain registration" },
  { id: "tx19", type: "received", amount: 7200, counterparty: "SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8Q", timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed", memo: "Full-stack development" },
  { id: "tx20", type: "sent", amount: 500, counterparty: "SP3GWX3NE58KXHESRYE4DYJ1EH600FMF5TSTN8VR", timestamp: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed" },
  { id: "tx21", type: "received", amount: 1100, counterparty: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQ9V6CJ", timestamp: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed", memo: "Logo redesign" },
  { id: "tx22", type: "sent", amount: 2800, counterparty: "SP2C2YFP12AJZB1MAREPX93ZWMDD89WAQS5QYARG", timestamp: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed", memo: "Cloud infrastructure" },
  { id: "tx23", type: "received", amount: 390, counterparty: "SP3FBR2AGK5H9QBDH3EFK3PZMRQ4FE27JKMBTGG", timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed" },
  { id: "tx24", type: "sent", amount: 1750, counterparty: "SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8Q", timestamp: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed", memo: "Security audit retainer" },
  { id: "tx25", type: "received", amount: 4600, counterparty: "SP3GWX3NE58KXHESRYE4DYJ1EH600FMF5TSTN8VR", timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed", memo: "Token integration" },
  { id: "tx26", type: "sent", amount: 320, counterparty: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQ9V6CJ", timestamp: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed", memo: "SSL certificate" },
  { id: "tx27", type: "received", amount: 2100, counterparty: "SP2C2YFP12AJZB1MAREPX93ZWMDD89WAQS5QYARG", timestamp: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed", memo: "Data pipeline setup" },
  { id: "tx28", type: "sent", amount: 950, counterparty: "SP3FBR2AGK5H9QBDH3EFK3PZMRQ4FE27JKMBTGG", timestamp: new Date(Date.now() - 52 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed" },
  { id: "tx29", type: "received", amount: 5500, counterparty: "SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8Q", timestamp: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(), status: "confirmed", memo: "Quarterly retainer" },
  { id: "tx30", type: "sent", amount: 175, counterparty: "SP3GWX3NE58KXHESRYE4DYJ1EH600FMF5TSTN8VR", timestamp: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000).toISOString(), status: "pending", memo: "Testing tools subscription" },
];

export const chartData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    volume: Math.floor(Math.random() * 8000) + 1000,
    count: Math.floor(Math.random() * 5) + 1,
  };
});
