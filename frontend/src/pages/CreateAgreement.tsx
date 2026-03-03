import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ContactAvatar } from "@/components/shared/ContactAvatar";
import { STXAmount } from "@/components/shared/STXAmount";
import { mockContacts, STX_PRICE_USD } from "@/lib/mock-data";
import { ArrowLeft, ArrowRight, Check, UserPlus, FileText, SkipForward } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const steps = ["Counterparty", "Terms", "Invoice", "Review"];

export default function CreateAgreement() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    counterpartyId: "",
    role: "client" as "client" | "freelancer",
    title: "",
    amount: "",
    description: "",
    invoiceOption: "skip" as "skip" | "create" | "link",
    consent: false,
  });

  const counterparty = mockContacts.find(c => c.id === form.counterpartyId);
  const amountNum = parseFloat(form.amount) || 0;

  const canNext = (() => {
    if (step === 0) return !!form.counterpartyId;
    if (step === 1) return form.title && amountNum > 0;
    if (step === 2) return true;
    if (step === 3) return form.consent;
    return false;
  })();

  const handleSubmit = () => {
    toast({ title: "Agreement Created", description: `${form.title} has been created successfully.` });
    navigate("/agreements");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/agreements")}>
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Create Agreement</h1>
        <p className="text-sm text-muted-foreground">Step {step + 1} of {steps.length}: {steps[step]}</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center">
            <div className={`h-1 w-full rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          {/* Step 0: Counterparty */}
          {step === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Counterparty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockContacts.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setForm(f => ({ ...f, counterpartyId: c.id }))}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                      form.counterpartyId === c.id ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
                    }`}
                  >
                    <ContactAvatar name={c.name} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{c.address.slice(0, 10)}...</p>
                    </div>
                    {form.counterpartyId === c.id && <Check className="ml-auto h-4 w-4 text-primary" />}
                  </button>
                ))}
                <Button variant="outline" className="w-full mt-2" disabled>
                  <UserPlus className="mr-1.5 h-4 w-4" /> Add New Contact
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Terms */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Define Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Your Role</Label>
                  <Select value={form.role} onValueChange={(v: "client" | "freelancer") => setForm(f => ({ ...f, role: v }))}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client (paying)</SelectItem>
                      <SelectItem value="freelancer">Freelancer (receiving)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Agreement Title</Label>
                  <Input className="mt-1.5" placeholder="e.g., Website Redesign" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <Label>Amount (STX)</Label>
                  <Input className="mt-1.5 font-mono" type="number" placeholder="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                  {amountNum > 0 && (
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      ≈ ${(amountNum * STX_PRICE_USD).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                    </p>
                  )}
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea className="mt-1.5" rows={3} placeholder="Describe the deliverables..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Invoice */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Link Invoice (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { value: "create", label: "Create New Invoice", icon: FileText, desc: "Generate an invoice for this agreement" },
                  { value: "link", label: "Link Existing", icon: FileText, desc: "Attach an existing invoice" },
                  { value: "skip", label: "Skip for Now", icon: SkipForward, desc: "You can add an invoice later" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setForm(f => ({ ...f, invoiceOption: opt.value as any }))}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                      form.invoiceOption === opt.value ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
                    }`}
                  >
                    <opt.icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Review & Confirm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Counterparty</span>
                    <span className="text-sm font-medium text-foreground">{counterparty?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Role</span>
                    <span className="text-sm font-medium text-foreground capitalize">{form.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Title</span>
                    <span className="text-sm font-medium text-foreground">{form.title}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <STXAmount amount={amountNum} size="sm" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Est. Network Fee</span>
                    <span className="font-mono text-sm text-muted-foreground">~0.01 STX</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="consent"
                    checked={form.consent}
                    onCheckedChange={(c) => setForm(f => ({ ...f, consent: !!c }))}
                  />
                  <label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed">
                    I understand that this will create an on-chain escrow contract and the funds will be locked until the agreement is fulfilled or disputed.
                  </label>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => step > 0 ? setStep(s => s - 1) : navigate("/agreements")}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> {step > 0 ? "Back" : "Cancel"}
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canNext} className="gradient-orange border-0 text-white">
            Next <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canNext} className="gradient-orange border-0 text-white">
            Create Agreement <Check className="ml-1.5 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
