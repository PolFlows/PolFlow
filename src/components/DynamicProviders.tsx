'use client';

import React from 'react';
import { PolkadotProvider } from '@/contexts/PolkadotContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { FlowProvider } from '@/contexts/FlowContext';
import { Toaster } from '@/components/ui/toaster';

interface DynamicProvidersProps {
  children: React.ReactNode;
}

export default function DynamicProviders({ children }: DynamicProvidersProps) {
  return (
    <>
      <PolkadotProvider>
        <WalletProvider>
          <FlowProvider>
            {children}
            <Toaster />
          </FlowProvider>
        </WalletProvider>
      </PolkadotProvider>
    </>
  );
}