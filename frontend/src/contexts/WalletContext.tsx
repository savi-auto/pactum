import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { connect, disconnect as stacksDisconnect, getLocalStorage } from "@stacks/connect";
import { NETWORK_CONFIG } from "@/lib/contracts";
import { toast } from "sonner";

// App is currently testnet only
const TESTNET_ONLY = true;

// Suppress StacksProvider conflict warning from multiple wallet extensions
if (typeof window !== 'undefined') {
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function(obj, prop, descriptor) {
    if (obj === window && prop === 'StacksProvider' && Object.prototype.hasOwnProperty.call(window, 'StacksProvider')) {
      console.warn('Multiple Stacks wallets detected - using first available');
      return obj;
    }
    return originalDefineProperty.call(this, obj, prop, descriptor);
  };
}

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: number;
  network: "mainnet" | "testnet";
  isTestnet: boolean;
  apiUrl: string;
  walletName: string | null;
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  setNetwork: (network: "mainnet" | "testnet") => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [network, setNetwork] = useState<"mainnet" | "testnet">("testnet");
  const [walletName, setWalletName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch STX balance from API  
  const fetchBalance = useCallback(async (stxAddress: string, net: "mainnet" | "testnet") => {
    try {
      const apiUrl = NETWORK_CONFIG[net].apiUrl;
      const response = await fetch(`${apiUrl}/extended/v1/address/${stxAddress}/balances`);
      if (response.ok) {
        const data = await response.json();
        // Balance is in microSTX, convert to STX
        const stxBalance = Number(data.stx?.balance || 0) / 1_000_000;
        setBalance(stxBalance);
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  }, []);

  // Restore session on mount from localStorage (no wallet interaction)
  useEffect(() => {    
    const data = getLocalStorage();
    if (data?.addresses?.stx?.length) {
      // In testnet-only mode, only restore testnet addresses
      if (TESTNET_ONLY) {
        const testnetAddress = data.addresses.stx.find(
          (addr) => addr.address.startsWith('ST')
        )?.address;
        
        if (testnetAddress) {
          setIsConnected(true);
          setAddress(testnetAddress);
          setWalletName('Stacks Wallet');
          fetchBalance(testnetAddress, "testnet");
        }
      } else {
        // Normal network-aware restoration
        const stxAddress = data.addresses.stx.find(
          (addr) => addr.address.startsWith(network === 'mainnet' ? 'SP' : 'ST')
        )?.address;
        
        if (stxAddress) {
          setIsConnected(true);
          setAddress(stxAddress);
          setWalletName('Stacks Wallet');
          fetchBalance(stxAddress, network);
        }
      }
    }
  }, []);

  // Refetch balance when network changes
  useEffect(() => {
    if (address) {
      fetchBalance(address, network);
    }
  }, [address, network, fetchBalance]);

  const handleConnectionResult = (result: Awaited<ReturnType<typeof connect>>) => {
    // Find the STX address for testnet (starts with ST)
    const testnetAddress = result.addresses.find(
      (addr) => addr.symbol === 'STX' && addr.address.startsWith('ST')
    )?.address;
    
    // Find mainnet address to check if they're using mainnet wallet
    const mainnetAddress = result.addresses.find(
      (addr) => addr.symbol === 'STX' && addr.address.startsWith('SP')
    )?.address;

    // In testnet-only mode, reject mainnet wallets
    if (TESTNET_ONLY) {
      if (!testnetAddress && mainnetAddress) {
        toast.error("Mainnet wallet not supported", {
          description: "Please switch to testnet in your wallet settings. Testnet addresses start with 'ST'.",
          duration: 6000,
        });
        stacksDisconnect();
        return;
      }
      
      if (testnetAddress) {
        setIsConnected(true);
        setAddress(testnetAddress);
        fetchBalance(testnetAddress, "testnet");
      }
    } else {
      // Normal network-aware connection
      const stxAddress = network === 'mainnet' ? mainnetAddress : testnetAddress;
      if (stxAddress) {
        setIsConnected(true);
        setAddress(stxAddress);
        fetchBalance(stxAddress, network);
      }
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      const result = await connect();
      handleConnectionResult(result);
      setWalletName("Stacks Wallet");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    stacksDisconnect();
    setIsConnected(false);
    setAddress(null);
    setBalance(0);
    setWalletName(null);
  };

  // Derived values
  const isTestnet = TESTNET_ONLY || network === "testnet";
  const apiUrl = NETWORK_CONFIG[isTestnet ? "testnet" : "mainnet"].apiUrl;

  return (
    <WalletContext.Provider 
      value={{ 
        isConnected, 
        address, 
        balance, 
        network, 
        isTestnet,
        apiUrl,
        walletName, 
        isLoading,
        connect: connectWallet, 
        disconnect: disconnectWallet, 
        setNetwork 
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    // During HMR, context may be temporarily undefined - provide defaults
    if (import.meta.hot) {
      console.warn("WalletContext unavailable during HMR - using defaults");
      return {
        isConnected: false,
        address: null,
        balance: 0,
        network: "testnet" as const,
        isTestnet: true,
        apiUrl: NETWORK_CONFIG.testnet.apiUrl,
        walletName: null,
        isLoading: false,
        connect: async () => { console.warn("Wallet connection unavailable during HMR"); },
        disconnect: () => {},
        setNetwork: () => {},
      };
    }
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
