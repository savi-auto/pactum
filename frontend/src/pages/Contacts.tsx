import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ContactAvatar } from "@/components/shared/ContactAvatar";
import { WalletAddress } from "@/components/shared/WalletAddress";
import { EmptyState } from "@/components/shared/EmptyState";
import { useContactsStore } from "@/stores/useContactsStore";
import { useUserEscrows } from "@/hooks/useEscrow";
import { useInvoicesStore } from "@/stores/useInvoicesStore";
import { Search, ChevronRight, Users, Plus, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function AddContactDialog({ onAdd }: { onAdd: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const { addContact, getContactByAddress } = useContactsStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      toast.error("Name and address are required");
      return;
    }
    
    // Validate Stacks address format
    if (!address.match(/^(SP|ST)[A-Z0-9]{38,}$/i)) {
      toast.error("Invalid Stacks address format");
      return;
    }

    // Check for duplicate
    if (getContactByAddress(address)) {
      toast.error("A contact with this address already exists");
      return;
    }

    addContact({ name: name.trim(), address: address.trim(), email: email.trim() || undefined, notes: notes.trim() || undefined });
    toast.success("Contact added successfully");
    setName("");
    setAddress("");
    setEmail("");
    setNotes("");
    setOpen(false);
    onAdd();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-orange border-0 text-white">
          <Plus className="mr-1.5 h-4 w-4" /> Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Contact name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Stacks Address *</Label>
            <Input
              id="address"
              placeholder="SP... or ST..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="Any notes about this contact..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gradient-orange border-0 text-white">
              Add Contact
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Contacts() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { contacts } = useContactsStore();
  const { data: escrows } = useUserEscrows();
  const { invoices } = useInvoicesStore();
  const [, forceUpdate] = useState(0);

  // Calculate stats for each contact based on real escrows and invoices
  const getContactStats = (address: string) => {
    const agreementCount = escrows?.filter(
      (e) => e.counterparty.address.toLowerCase() === address.toLowerCase()
    ).length ?? 0;
    const invoiceCount = invoices.filter(
      (inv) => inv.from.address.toLowerCase() === address.toLowerCase() || 
               inv.to.address.toLowerCase() === address.toLowerCase()
    ).length;
    const totalVolume = escrows?.filter(
      (e) => e.counterparty.address.toLowerCase() === address.toLowerCase()
    ).reduce((sum, e) => sum + e.amount, 0) ?? 0;
    return { agreementCount, invoiceCount, totalVolume };
  };

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
          <p className="text-sm text-muted-foreground">{contacts.length} contact{contacts.length !== 1 ? "s" : ""}</p>
        </div>
        <AddContactDialog onAdd={() => forceUpdate((n) => n + 1)} />
      </div>

      {/* Search */}
      {contacts.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* List */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
        {filtered.map(contact => {
          const stats = getContactStats(contact.address);
          return (
            <Card
              key={contact.id}
              className="cursor-pointer transition-colors hover:bg-accent"
              onClick={() => navigate(`/contacts/${contact.id}`)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <ContactAvatar name={contact.name} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{contact.name}</p>
                  <WalletAddress address={contact.address} />
                </div>
                <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                  {stats.agreementCount > 0 && (
                    <span>{stats.agreementCount} agreement{stats.agreementCount !== 1 ? "s" : ""}</span>
                  )}
                  {stats.totalVolume > 0 && (
                    <span className="font-mono">{stats.totalVolume.toLocaleString()} STX</span>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          search ? (
            <EmptyState
              icon={Search}
              title="No matching contacts"
              description="Try adjusting your search to find the contact you're looking for."
              secondaryLabel="Clear Search"
              onSecondaryClick={() => setSearch("")}
            />
          ) : (
            <EmptyState
              icon={UserPlus}
              title="Add your first contact"
              description="Add contacts to quickly create agreements and send invoices."
              actionLabel="Add Contact"
              actionOnClick={() => document.querySelector<HTMLButtonElement>('[class*="gradient-orange"]')?.click()}
            />
          )
        )}
      </motion.div>
    </div>
  );
}
