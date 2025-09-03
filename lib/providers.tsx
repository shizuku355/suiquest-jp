'use client';

import { getFullnodeUrl } from '@mysten/sui/client';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);
  
  const network = (process.env.NEXT_PUBLIC_SUI_NETWORK as 'testnet' | 'mainnet') || 'testnet';
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={{ [network]: { url: getFullnodeUrl(network) } }} defaultNetwork={network}>
        <WalletProvider 
          autoConnect={false}
          storageKey="suiquest-jp-wallet"
          preferredWallets={['Sui Wallet']}
        >
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}