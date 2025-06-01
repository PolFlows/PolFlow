'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24">
      {/* Header */}
      <div className="w-full max-w-6xl mb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
          Polkadot DeFi Flow Platform
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
          A node-based, no-code strategy builder for cross-chain automation in the Polkadot ecosystem
        </p>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-6xl">
        {/* Left column - Features */}
        <div className="space-y-8">
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Build Cross-Chain Workflows</h2>
            <p className="text-gray-300">
              Drag, drop and connect strategy nodes to automate your DeFi operations across the Polkadot ecosystem.
            </p>
          </div>
          
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h2 className="text-2xl font-semibold mb-4 text-purple-400">Connect Your Wallet</h2>
            <p className="text-gray-300">
              Seamlessly integrate with Polkadot.js, Talisman, Nova, or SubWallet extensions.
            </p>
          </div>
          
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h2 className="text-2xl font-semibold mb-4 text-green-400">Automate DeFi Strategies</h2>
            <p className="text-gray-300">
              Set up XCM transfers, DEX swaps, liquidity provision, and yield farming with no coding required.
            </p>
          </div>
        </div>
        
        {/* Right column - CTA */}
        <div className="flex flex-col justify-center space-y-8">
          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-8 rounded-xl border border-blue-700/50">
            <h2 className="text-2xl font-semibold mb-6 text-white">Ready to get started?</h2>
            <button 
              onClick={() => router.push('/flow-builder')}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
            >
              Launch Flow Builder
            </button>
            <p className="mt-4 text-sm text-gray-300 text-center">
              No coding skills required. Just drag, drop, and connect.
            </p>
          </div>
          
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-xl font-semibold mb-4 text-white">Supported Parachains</h3>
            <div className="grid grid-cols-3 gap-3">
              {['Polkadot', 'Acala', 'Moonbeam', 'Astar', 'HydraDX', 'Parallel'].map((chain) => (
                <div key={chain} className="bg-slate-700/50 p-2 rounded text-center text-sm">
                  {chain}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-24 w-full max-w-6xl text-center text-gray-400 text-sm">
        <p>© 2025 Polkadot DeFi Flow Platform | <Link href="/docs" className="text-blue-400 hover:underline">Documentation</Link></p>
      </footer>
    </main>
  );
}
