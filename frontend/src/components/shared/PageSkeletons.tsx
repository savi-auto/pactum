import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export function DashboardSkeleton() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Hero card */}
      <motion.div variants={item}>
        <Skeleton className="h-36 w-full rounded-xl" />
      </motion.div>
      {/* Chart */}
      <motion.div variants={item}>
        <Skeleton className="h-64 w-full rounded-xl" />
      </motion.div>
      {/* Quick actions */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </motion.div>
      {/* Two columns */}
      <motion.div variants={item} className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </motion.div>
    </motion.div>
  );
}

export function ListPageSkeleton() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </motion.div>
      {/* Search */}
      <motion.div variants={item}>
        <Skeleton className="h-10 w-full rounded-md" />
      </motion.div>
      {/* List rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div key={i} variants={item} className="flex items-center gap-3 rounded-xl border border-border p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="hidden sm:block h-4 w-20" />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function DetailPageSkeleton() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <Skeleton className="h-9 w-36" />
      </motion.div>
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-28" />
      </motion.div>
      {/* Timeline */}
      <motion.div variants={item}>
        <Skeleton className="h-24 w-full rounded-xl" />
      </motion.div>
      {/* Two column cards */}
      <motion.div variants={item} className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </motion.div>
      <motion.div variants={item}>
        <Skeleton className="h-16 w-full rounded-xl" />
      </motion.div>
    </motion.div>
  );
}
