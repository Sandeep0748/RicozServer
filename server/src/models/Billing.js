import mongoose from "mongoose";

const lineSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
    name: { type: String, default: "" },
    qty: { type: Number, default: 1, min: 0 },
    rate: { type: Number, default: 0, min: 0 }, // minor units (paise)
    taxRate: { type: Number, default: 0, min: 0, max: 100 },
    amount: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

function orgField(schema) {
  schema.add({ orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true } });
}

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, default: "" },
    description: { type: String, default: "" },
    type: { type: String, enum: ["product", "service"], default: "product" },
    rate: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 0, min: 0, max: 100 },
    unit: { type: String, default: "pcs" },
  },
  { timestamps: true }
);
orgField(itemSchema);
itemSchema.index({ orgId: 1, name: 1 });

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 1 },
    date: { type: Date, default: Date.now },
    method: { type: String, default: "UPI" },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    number: { type: String, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, default: "" },
    company: { type: String, default: "" },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    lines: { type: [lineSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    paid: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "sent", "partial", "paid", "overdue", "void"], default: "draft" },
    paymentTerms: { type: String, default: "Net 30" },
    notes: { type: String, default: "" },
    payments: { type: [paymentSchema], default: [] },
  },
  { timestamps: true }
);
orgField(invoiceSchema);
invoiceSchema.index({ orgId: 1, number: 1 }, { unique: true, sparse: true });
invoiceSchema.index({ orgId: 1, status: 1 });

const estimateSchema = new mongoose.Schema(
  {
    number: { type: String, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, default: "" },
    company: { type: String, default: "" },
    validTill: { type: Date },
    lines: { type: [lineSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "sent", "accepted", "declined", "converted"], default: "draft" },
    notes: { type: String, default: "" },
    convertedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
  },
  { timestamps: true }
);
orgField(estimateSchema);
estimateSchema.index({ orgId: 1, number: 1 }, { unique: true, sparse: true });

const recurringSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, default: "" },
    frequency: { type: String, enum: ["weekly", "monthly", "quarterly", "yearly"], default: "monthly" },
    startDate: { type: Date, default: Date.now },
    nextRunDate: { type: Date, default: Date.now },
    paymentTerms: { type: String, default: "Net 30" },
    discount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "paused"], default: "active" },
  },
  { timestamps: true }
);
orgField(recurringSchema);

const expenseSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    category: { type: String, default: "General" },
    vendor: { type: String, default: "" },
    amount: { type: Number, default: 0, min: 0 },
    billable: { type: Boolean, default: false },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, default: "" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    projectName: { type: String, default: "" },
    paymentMethod: { type: String, default: "UPI" },
    status: { type: String, enum: ["logged", "billed", "reimbursed"], default: "logged" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);
orgField(expenseSchema);
expenseSchema.index({ orgId: 1, date: -1 });

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    billingMethod: { type: String, default: "Fixed" },
    budget: { type: Number, default: 0 },
    description: { type: String, default: "" },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, default: "" },
    status: { type: String, enum: ["active", "completed", "archived"], default: "active" },
  },
  { timestamps: true }
);
orgField(projectSchema);

const timeEntrySchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    projectName: { type: String, default: "" },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, default: "" },
    task: { type: String, default: "" },
    hours: { type: Number, default: 0, min: 0 },
    billable: { type: Boolean, default: true },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    employeeName: { type: String, default: "" },
  },
  { timestamps: true }
);
orgField(timeEntrySchema);

const noteSchema = new mongoose.Schema(
  {
    number: { type: String, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, default: "" },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
    invoiceNumber: { type: String, default: "" },
    description: { type: String, default: "" },
    amount: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 0 },
    reason: { type: String, default: "" },
    status: { type: String, enum: ["draft", "applied", "void"], default: "draft" },
  },
  { timestamps: true }
);
orgField(noteSchema);

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, default: "" },
    type: { type: String, default: "info" },
    read: { type: Boolean, default: false },
    link: { type: String, default: "" },
  },
  { timestamps: true }
);
orgField(notificationSchema);
notificationSchema.index({ orgId: 1, createdAt: -1 });

export const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);
export const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
export const Estimate = mongoose.models.Estimate || mongoose.model("Estimate", estimateSchema);
export const RecurringInvoice = mongoose.models.RecurringInvoice || mongoose.model("RecurringInvoice", recurringSchema);
export const Expense = mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
export const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);
export const TimeEntry = mongoose.models.TimeEntry || mongoose.model("TimeEntry", timeEntrySchema);
export const CreditNote = mongoose.models.CreditNote || mongoose.model("CreditNote", noteSchema.clone());
export const DebitNote = mongoose.models.DebitNote || mongoose.model("DebitNote", noteSchema.clone());
export const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
