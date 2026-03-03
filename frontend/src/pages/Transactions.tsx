import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { STXAmount } from "@/components/shared/STXAmount";
import { WalletAddress } from "@/components/shared/WalletAddress";
import { ListPageSkeleton } from "@/components/shared/PageSkeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { mockWalletTransactions } from "@/lib/mock-data";
import { Search, Filter, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, CalendarIcon, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow, format, endOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 10;

export default function Transactions() {
  const isLoading = useSimulatedLoading();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const hasFilters = search !== "" || typeFilter !== "all" || statusFilter !== "all" || !!dateFrom || !!dateTo;

  // Reset page when filters change
  useEffect(() => setCurrentPage(1), [search, typeFilter, statusFilter, dateFrom, dateTo]);

  const filtered = useMemo(() => mockWalletTransactions.filter(tx => {
    const matchSearch =
      tx.counterparty.toLowerCase().includes(search.toLowerCase()) ||
      (tx.memo?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchType = typeFilter === "all" || tx.type === typeFilter;
    const matchStatus = statusFilter === "all" || tx.status === statusFilter;
    const txDate = new Date(tx.timestamp);
    const matchDateFrom = !dateFrom || txDate >= dateFrom;
    const matchDateTo = !dateTo || txDate <= endOfDay(dateTo);
    return matchSearch && matchType && matchStatus && matchDateFrom && matchDateTo;
  }), [search, typeFilter, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filtered.length);

  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "ellipsis")[] = [1];
    if (currentPage > 3) pages.push("ellipsis");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
    return pages;
  };

  if (isLoading) return <ListPageSkeleton />;

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          {filtered.length === 0
            ? "No transactions found"
            : `Showing ${startIndex + 1}–${endIndex} of ${filtered.length} transactions`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by address or memo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="received">Received</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        {/* Date From */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-36 justify-start text-left font-normal gap-1.5", !dateFrom && "text-muted-foreground")}>
              <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{dateFrom ? format(dateFrom, "MMM d, yyyy") : "From date"}</span>
              {dateFrom && (
                <X className="ml-auto h-3.5 w-3.5 shrink-0 opacity-50 hover:opacity-100" onClick={(e) => { e.stopPropagation(); setDateFrom(undefined); }} />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>

        {/* Date To */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-36 justify-start text-left font-normal gap-1.5", !dateTo && "text-muted-foreground")}>
              <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{dateTo ? format(dateTo, "MMM d, yyyy") : "To date"}</span>
              {dateTo && (
                <X className="ml-auto h-3.5 w-3.5 shrink-0 opacity-50 hover:opacity-100" onClick={(e) => { e.stopPropagation(); setDateTo(undefined); }} />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>
      </div>

      {/* List */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
        {paginated.map(tx => {
          const isSent = tx.type === "sent";
          return (
            <Link key={tx.id} to={`/transactions/${tx.id}`}>
            <Card className="cursor-pointer transition-colors hover:bg-accent">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isSent ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-500"}`}>
                  {isSent ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {isSent ? "Sent" : "Received"}
                    </span>
                    <Badge variant={tx.status === "confirmed" ? "secondary" : "outline"} className="text-[10px]">
                      {tx.status}
                    </Badge>
                  </div>
                  <WalletAddress address={tx.counterparty} />
                  {tx.memo && (
                    <p className="truncate text-xs text-muted-foreground mt-0.5">{tx.memo}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`font-mono text-sm font-semibold ${isSent ? "text-destructive" : "text-emerald-500"}`}>
                    {isSent ? "-" : "+"}{tx.amount.toLocaleString()} STX
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
            </Card>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          hasFilters ? (
            <EmptyState
              icon={Search}
              title="No matching transactions"
              description="Try adjusting your search or filters."
              secondaryLabel="Clear Filters"
              onSecondaryClick={clearFilters}
            />
          ) : (
            <EmptyState
              icon={ArrowLeftRight}
              title="No transactions yet"
              description="Your wallet transaction history will appear here."
            />
          )
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {getPageNumbers().map((page, i) =>
              page === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
