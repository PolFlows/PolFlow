'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Use dynamic imports with { ssr: false } for all browser-dependent components
const DynamicProviders = dynamic(
  () => import('./DynamicProviders'),
  { ssr: false }
);

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  // Use client-side only rendering
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Return a placeholder or loading state
    return <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">{children}</div>;
  }

  return <DynamicProviders>{children}</DynamicProviders>;
}
