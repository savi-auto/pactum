import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { mockContacts, mockAgreements, STX_PRICE_USD } from "@/lib/mock-data";
import { ArrowLeft, Plus, Trash2, CalendarIcon, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface LineItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [taxPercent, setTaxPercent] = useState("0");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");
  const [linkedAgreement, setLinkedAgreement] = useState("none");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: "1", unitPrice: "" },
  ]);

  const addLineItem = () => {
    setLineItems(prev => [...prev, { id: Date.now().toString(), description: "", quantity: "1", unitPrice: "" }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) setLineItems(prev => prev.filter(li => li.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string) => {
    setLineItems(prev => prev.map(li => li.id === id ? { ...li, [field]: value } : li));
  };

  const getLineTotal = (li: LineItem) => (parseFloat(li.quantity) || 0) * (parseFloat(li.unitPrice) || 0);
  const subtotal = lineItems.reduce((sum, li) => sum + getLineTotal(li), 0);
  const tax = parseFloat(taxPercent) || 0;
  const total = subtotal + (subtotal * tax / 100);
  const totalUsd = total * STX_PRICE_USD;

  const canSubmit = title && recipientId && lineItems.some(li => li.description && getLineTotal(li) > 0);

  const handleSubmit = (asDraft: boolean) => {
    toast({
      title: asDraft ? "Draft Saved" : "Invoice Created & Sent",
      description: `"${title}" — ${total.toLocaleString()} STX`,
    });
    navigate("/invoices");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/invoices")}>
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Create Invoice</h1>
        <p className="text-sm text-muted-foreground">Build and send an invoice to a contact</p>
      </div>

      {/* Header fields */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Invoice Title</Label>
            <Input className="mt-1.5" placeholder="e.g., Website Design - Phase 1" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Recipient</Label>
            <Select value={recipientId} onValueChange={setRecipientId}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a contact" /></SelectTrigger>
              <SelectContent>
                {mockContacts.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Line Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_80px_120px_120px_40px] gap-2 text-xs font-semibold text-muted-foreground px-1">
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Unit Price (STX)</span>
            <span className="text-right">Total</span>
            <span />
          </div>

          {lineItems.map(li => (
            <div key={li.id} className="grid grid-cols-1 sm:grid-cols-[1fr_80px_120px_120px_40px] gap-2 items-center rounded-lg border border-border p-3 sm:p-1 sm:border-0">
              <Input placeholder="Description" value={li.description} onChange={e => updateLineItem(li.id, "description", e.target.value)} />
              <Input type="number" min="1" placeholder="1" className="font-mono text-right" value={li.quantity} onChange={e => updateLineItem(li.id, "quantity", e.target.value)} />
              <Input type="number" min="0" placeholder="0" className="font-mono text-right" value={li.unitPrice} onChange={e => updateLineItem(li.id, "unitPrice", e.target.value)} />
              <p className="font-mono text-sm font-semibold text-foreground text-right">
                {getLineTotal(li).toLocaleString()} STX
              </p>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeLineItem(li.id)} disabled={lineItems.length === 1}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={addLineItem}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Line Item
          </Button>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono font-semibold text-foreground">{subtotal.toLocaleString()} STX</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Tax (%)</span>
            <Input type="number" min="0" max="100" className="w-24 font-mono text-right" value={taxPercent} onChange={e => setTaxPercent(e.target.value)} />
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between text-base font-semibold">
            <span className="text-foreground">Grand Total</span>
            <div className="text-right">
              <span className="font-mono">{total.toLocaleString()} <span className="text-primary">STX</span></span>
              <p className="font-mono text-xs font-normal text-muted-foreground">
                ≈ ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optional fields */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Optional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("mt-1.5 w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Link to Agreement</Label>
            <Select value={linkedAgreement} onValueChange={setLinkedAgreement}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {mockAgreements.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.id} — {a.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea className="mt-1.5" rows={3} placeholder="Any additional notes..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Footer actions */}
      <div className="flex justify-between pb-8">
        <Button variant="outline" onClick={() => handleSubmit(true)} disabled={!canSubmit}>
          Save as Draft
        </Button>
        <Button className="gradient-orange border-0 text-white" onClick={() => handleSubmit(false)} disabled={!canSubmit}>
          Create & Send <Check className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
