'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Import FlowBuilder with SSR disabled to prevent window is not defined errors
const FlowBuilder = dynamic(
  () => import('@/components/FlowBuilder'),
  { ssr: false }
);

export default function FlowBuilderPage() {
  return <FlowBuilder />;
}
