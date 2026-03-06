import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContactAvatar } from "@/components/shared/ContactAvatar";
import { WalletAddress } from "@/components/shared/WalletAddress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { STXAmount } from "@/components/shared/STXAmount";
import { useContactsStore } from "@/stores/useContactsStore";
import { useInvoicesStore } from "@/stores/useInvoicesStore";
import { useUserEscrows } from "@/hooks/useEscrow";
import { ArrowLeft, FileText, Handshake, TrendingUp, BarChart3, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getContact, deleteContact } = useContactsStore();
  const { invoices } = useInvoicesStore();
  const { data: escrows } = useUserEscrows();
  
  const contact = getContact(id!);

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Contact not found</p>
        <Button variant="ghost" onClick={() => navigate("/contacts")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  // Get agreements (escrows) where this contact is the counterparty
  const agreements = escrows?.filter(
    e => e.counterparty.address.toLowerCase() === contact.address.toLowerCase()
  ) ?? [];
  
  // Get invoices involving this contact
  const contactInvoices = invoices.filter(
    inv => inv.from.address.toLowerCase() === contact.address.toLowerCase() || 
           inv.to.address.toLowerCase() === contact.address.toLowerCase()
  );
  
  const totalVolume = agreements.reduce((sum, a) => sum + a.amount, 0);
  const completedCount = agreements.filter(a => a.status === "completed").length;
  const activeCount = agreements.filter(a => !["completed", "disputed", "cancelled"].includes(a.status)).length;

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this contact?")) {
      deleteContact(contact.id);
      toast.success("Contact deleted");
      navigate("/contacts");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate("/contacts")}>
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Contacts
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ContactAvatar name={contact.name} className="h-14 w-14 text-lg" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{contact.name}</h1>
            <WalletAddress address={contact.address} />
            {contact.email && <p className="text-sm text-muted-foreground">{contact.email}</p>}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
          <Trash2 className="mr-1.5 h-4 w-4" /> Delete
        </Button>
      </div>

      {contact.notes && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{contact.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Agreements", value: agreements.length, icon: Handshake },
          { label: "Invoices", value: contactInvoices.length, icon: FileText },
          { label: "Volume (STX)", value: totalVolume.toLocaleString(), icon: TrendingUp },
          { label: "Status", value: `${completedCount} done, ${activeCount} active`, icon: BarChart3 },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <stat.icon className="h-4 w-4" />
                <span className="text-xs">{stat.label}</span>
              </div>
              <p className="mt-1 font-mono text-lg font-semibold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agreement History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Agreement History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {agreements.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No agreements with this contact</p>
          ) : (
            agreements.map(agr => (
              <div
                key={agr.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
                onClick={() => navigate(`/agreements/${agr.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{agr.id}</span>
                    <StatusBadge status={agr.status} />
                  </div>
                  <p className="truncate text-sm font-medium text-foreground">{agr.title}</p>
                </div>
                <div className="flex flex-col items-end">
                  <STXAmount amount={agr.amount} showUsd={false} size="sm" />
                  <span className="text-xs text-muted-foreground">{new Date(agr.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Invoice History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {contactInvoices.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No invoices with this contact</p>
          ) : (
            contactInvoices.map(inv => (
              <div
                key={inv.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
                onClick={() => navigate(`/invoices/${inv.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{inv.id}</span>
                    <StatusBadge status={inv.status} />
                  </div>
                  <p className="truncate text-sm font-medium text-foreground">{inv.title}</p>
                </div>
                <div className="flex flex-col items-end">
                  <STXAmount amount={inv.total} showUsd={false} size="sm" />
                  <span className="text-xs text-muted-foreground">{new Date(inv.issuedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
