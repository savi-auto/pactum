import { createContext, useContext, useState, ReactNode } from "react";

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: number;
  network: "mainnet" | "testnet";
  walletName: string | null;
  connect: (wallet: string) => void;
  disconnect: () => void;
  setNetwork: (network: "mainnet" | "testnet") => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const MOCK_ADDRESS = "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQ9V6CJ";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [network, setNetwork] = useState<"mainnet" | "testnet">("testnet");
  const [walletName, setWalletName] = useState<string | null>(null);

  const connect = (wallet: string) => {
    setIsConnected(true);
    setAddress(MOCK_ADDRESS);
    setBalance(12450);
    setWalletName(wallet);
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
    setBalance(0);
    setWalletName(null);
  };

  return (
    <WalletContext.Provider value={{ isConnected, address, balance, network, walletName, connect, disconnect, setNetwork }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within WalletProvider");
  return context;
}
