import { useState, useEffect } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { Header } from "./Header";
import { WalletModal } from "@/components/wallet/WalletModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWallet } from "@/contexts/WalletContext";

export function AppLayout() {
  const location = useLocation();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const { isConnected } = useWallet();

  useEffect(() => {
    if (!isConnected) {
      toast({
        title: "Wallet required",
        description: "Please connect your wallet to access the app.",
      });
    }
  }, [isConnected]);

  if (!isConnected) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen w-full bg-background">
      {!isMobile && (
        <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      )}
      <div className="flex flex-1 flex-col min-w-0">
        <Header onConnectWallet={() => setWalletModalOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        {isMobile && <MobileNav />}
      </div>
      <WalletModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </div>
  );
}
