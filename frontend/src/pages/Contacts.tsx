import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ContactAvatar } from "@/components/shared/ContactAvatar";
import { WalletAddress } from "@/components/shared/WalletAddress";
import { ListPageSkeleton } from "@/components/shared/PageSkeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { mockContacts, mockAgreements, mockInvoices } from "@/lib/mock-data";
import { Search, ChevronRight, Users } from "lucide-react";

function getContactStats(contactId: string) {
  const agreements = mockAgreements.filter(a => a.counterparty.id === contactId);
  const invoices = mockInvoices.filter(
    inv => inv.from.id === contactId || inv.to.id === contactId
  ).filter(inv => inv.from.id !== "self" || inv.to.id !== "self");
  const totalVolume = agreements.reduce((sum, a) => sum + a.amount, 0);
  return { agreementCount: agreements.length, invoiceCount: invoices.length, totalVolume };
}

export default function Contacts() {
  const navigate = useNavigate();
  const isLoading = useSimulatedLoading();
  const [search, setSearch] = useState("");

  const filtered = mockContacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.address.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <ListPageSkeleton />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
        <p className="text-sm text-muted-foreground">{mockContacts.length} contacts</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or address..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* List */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
        {filtered.map(contact => {
          const stats = getContactStats(contact.id);
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
                  <span>{stats.agreementCount} agreement{stats.agreementCount !== 1 ? "s" : ""}</span>
                  <span className="font-mono">{stats.totalVolume.toLocaleString()} STX</span>
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
              icon={Users}
              title="Add your first contact"
              description="Contacts are created automatically when you set up agreements or invoices."
              actionLabel="New Agreement"
              actionTo="/agreements/create"
            />
          )
        )}
      </motion.div>
    </div>
  );
}
