import { Node, Edge } from 'reactflow';

export interface ExampleWorkflow {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon?: string; // Placeholder for an icon name or SVG path
  nodes: Node[];
  edges: Edge[];
}

export const exampleFlows: ExampleWorkflow[] = [
  {
    id: 'cross-chain-arbitrage-01',
    name: 'Cross-Chain Arbitrage: DOT/USDC (Polkadot <> Asset Hub)',
    description: 'Exploit DOT/USDC price differences between Polkadot Relay Chain and Asset Hub. Buys low on one, sells high on the other.',
    category: 'Arbitrage',
    difficulty: 'Advanced',
    icon: 'FaSyncAlt', // Example icon name
    nodes: [
      {
        id: 'arb-wc',
        type: 'walletConnect',
        position: { x: 50, y: 50 },
        data: { label: 'Connect Wallet', walletOptions: ['Polkadot.js', 'Talisman'], selectedWallet: 'Polkadot.js', isConnected: true },
      },
      // Polkadot Leg
      {
        id: 'arb-as-dot-pdot',
        type: 'assetSelector',
        position: { x: 50, y: 200 },
        data: { label: 'DOT on Polkadot', chains: ['Polkadot'], assets: ['DOT'], selectedChain: 'Polkadot', selectedAsset: 'DOT', amount: '100' },
      },
      {
        id: 'arb-dex-usdc-pdot',
        type: 'dexAggregator',
        position: { x: 50, y: 350 },
        data: { label: 'Swap DOT for USDC (Polkadot)', dexes: ['PolkadotSwap'], selectedDexes: ['PolkadotSwap'], slippageTolerance: '0.5', sourceToken: 'DOT', targetToken: 'USDC', amount: '100' },
      },
      // Asset Hub Leg
      {
        id: 'arb-as-usdc-ah',
        type: 'assetSelector',
        position: { x: 400, y: 200 },
        data: { label: 'USDC on Asset Hub', chains: ['Asset Hub'], assets: ['USDC'], selectedChain: 'Asset Hub', selectedAsset: 'USDC', amount: '0' },
      },
      {
        id: 'arb-dex-dot-ah',
        type: 'dexAggregator',
        position: { x: 400, y: 350 },
        data: { label: 'Swap USDC for DOT (Asset Hub)', dexes: ['AssetHubSwap'], selectedDexes: ['AssetHubSwap'], slippageTolerance: '0.5', sourceToken: 'USDC', targetToken: 'DOT', amount: '0' },
      },
      // XCM Transfers
      {
        id: 'arb-xcm-pdot-to-ah',
        type: 'xcmTransfer',
        position: { x: 225, y: 150 },
        data: { label: 'XCM DOT: Polkadot to Asset Hub', sourceChain: 'Polkadot', destinationChain: 'Asset Hub', xcmVersion: 'v3' },
      },
      {
        id: 'arb-xcm-ah-to-pdot',
        type: 'xcmTransfer',
        position: { x: 225, y: 400 },
        data: { label: 'XCM USDC: Asset Hub to Polkadot', sourceChain: 'Asset Hub', destinationChain: 'Polkadot', xcmVersion: 'v3' },
      },
      // Logic & Alert
      {
        id: 'arb-conditional',
        type: 'conditional',
        position: { x: 225, y: 550 },
        data: { label: 'Arbitrage Condition', condition: 'greater_than', value: '1.005', logicType: 'if', referenceNodeId: 'arb-dex-dot-ah', referenceProperty: 'price' /* Assuming price is output */ },
      },
      {
        id: 'arb-alert',
        type: 'alert',
        position: { x: 225, y: 700 },
        data: { label: 'Arbitrage Alert', alertType: 'Telegram', message: 'Arbitrage opportunity executed! Profit: {profit_amount}' },
      },
    ],
    edges: [
      { id: 'e-wc-asdotpdot', source: 'arb-wc', target: 'arb-as-dot-pdot', type: 'assetFlow' },
      { id: 'e-asdotpdot-dexusdcpdot', source: 'arb-as-dot-pdot', target: 'arb-dex-usdc-pdot', type: 'assetFlow' },
      { id: 'e-dexusdcpdot-xcm1', source: 'arb-dex-usdc-pdot', target: 'arb-xcm-pdot-to-ah', type: 'assetFlow' },
      { id: 'e-xcm1-asusdcah', source: 'arb-xcm-pdot-to-ah', target: 'arb-as-usdc-ah', type: 'assetFlow' },
      { id: 'e-asusdcah-dexdotah', source: 'arb-as-usdc-ah', target: 'arb-dex-dot-ah', type: 'assetFlow' },
      { id: 'e-dexdotah-conditional', source: 'arb-dex-dot-ah', target: 'arb-conditional', type: 'dataFlow', sourceHandle: 'output' /* Assuming DEX outputs price */, targetHandle: 'input' },
      // True path of conditional could trigger XCM back or other actions
      { id: 'e-conditional-xcm2', source: 'arb-conditional', target: 'arb-xcm-ah-to-pdot', type: 'logicFlow', sourceHandle: 'true' },
      { id: 'e-conditional-alert', source: 'arb-conditional', target: 'arb-alert', type: 'logicFlow', sourceHandle: 'true' },
    ],
  },
  {
    id: 'yield-optimizer-01',
    name: 'Yield Optimizer: Acala Farms (ACA/LDOT/aUSD)',
    description: 'Monitors APYs on Acala for ACA, LDOT, and aUSD farms. Automatically reallocates to the highest APY farm.',
    category: 'Yield Farming',
    difficulty: 'Intermediate',
    icon: 'FaTractor',
    nodes: [
      {
        id: 'yo-wc',
        type: 'walletConnect',
        position: { x: 50, y: 50 },
        data: { label: 'Connect Wallet (Acala)', selectedWallet: 'Talisman' },
      },
      {
        id: 'yo-as-usdc', // Starting with USDC to deposit
        type: 'assetSelector',
        position: { x: 50, y: 200 },
        data: { label: 'Select USDC (Acala)', chains: ['Acala'], assets: ['USDC', 'ACA', 'LDOT', 'aUSD'], selectedChain: 'Acala', selectedAsset: 'USDC', amount: '1000' },
      },
      {
        id: 'yo-oracle-farm-apy',
        type: 'oracleFeed',
        position: { x: 50, y: 350 },
        data: { label: 'APY Monitor (Acala Farms)', dataSource: 'Custom', customEndpoint: 'https://api.acala.network/farm-apys', dataType: 'apy-multiple', updateFrequency: '5m' },
      },
      // Conditional logic to compare APYs (simplified to one conditional for brevity)
      {
        id: 'yo-cond-best-apy',
        type: 'conditional',
        position: { x: 300, y: 350 },
        data: { label: 'Find Best APY Farm', logicType: 'if', condition: 'custom_logic', value: 'highest_apy_farm_id' /* Custom logic to determine best farm */ },
      },
      // Farm Nodes - one for each potential farm
      {
        id: 'yo-farm-aca',
        type: 'yieldFarm',
        position: { x: 550, y: 200 },
        data: { label: 'ACA Farm (Acala)', selectedPlatform: 'Acala', assetFilter: ['ACA'] },
      },
      {
        id: 'yo-farm-ldot',
        type: 'yieldFarm',
        position: { x: 550, y: 350 },
        data: { label: 'LDOT Farm (Acala)', selectedPlatform: 'Acala', assetFilter: ['LDOT'] },
      },
      {
        id: 'yo-farm-ausd',
        type: 'yieldFarm',
        position: { x: 550, y: 500 },
        data: { label: 'aUSD Farm (Acala)', selectedPlatform: 'Acala', assetFilter: ['aUSD'] },
      },
      {
        id: 'yo-alert',
        type: 'alert',
        position: { x: 300, y: 650 },
        data: { label: 'Reallocation Alert', alertType: 'Email', message: 'Yield optimization: Reallocated funds to {farm_name} with {apy}% APY.' },
      },
    ],
    edges: [
      { id: 'e-yo-wc-as', source: 'yo-wc', target: 'yo-as-usdc', type: 'assetFlow' },
      { id: 'e-yo-as-oracle', source: 'yo-as-usdc', target: 'yo-oracle-farm-apy', type: 'assetFlow' }, // Funds ready for deposit
      { id: 'e-yo-oracle-cond', source: 'yo-oracle-farm-apy', target: 'yo-cond-best-apy', type: 'dataFlow' },
      // Conditional outputs would connect to specific farm deposit/withdraw actions
      // This is highly simplified. A real setup would need more nodes for withdraw/deposit logic per farm.
      { id: 'e-yo-cond-farm-aca', source: 'yo-cond-best-apy', target: 'yo-farm-aca', type: 'logicFlow', sourceHandle: 'true', data: { label: 'If ACA best' } },
      { id: 'e-yo-cond-farm-ldot', source: 'yo-cond-best-apy', target: 'yo-farm-ldot', type: 'logicFlow', sourceHandle: 'true', data: { label: 'If LDOT best' } },
      { id: 'e-yo-cond-farm-ausd', source: 'yo-cond-best-apy', target: 'yo-farm-ausd', type: 'logicFlow', sourceHandle: 'true', data: { label: 'If aUSD best' } },
      { id: 'e-yo-cond-alert', source: 'yo-cond-best-apy', target: 'yo-alert', type: 'logicFlow', sourceHandle: 'true' },
    ],
  },
  {
    id: 'dca-strategy-01',
    name: 'DCA Strategy: USDC into DOT (Asset Hub)',
    description: 'Automatically invest a fixed amount of USDC into DOT on Asset Hub at regular intervals (e.g., daily).',
    category: 'Investment',
    difficulty: 'Beginner',
    icon: 'FaChartPie',
    nodes: [
      {
        id: 'dca-wc',
        type: 'walletConnect',
        position: { x: 50, y: 50 },
        data: { label: 'Connect Wallet (Asset Hub)', selectedWallet: 'Nova Wallet' },
      },
      {
        id: 'dca-as-usdc',
        type: 'assetSelector',
        position: { x: 50, y: 200 },
        data: { label: 'USDC Source (Asset Hub)', chains: ['Asset Hub'], assets: ['USDC'], selectedChain: 'Asset Hub', selectedAsset: 'USDC', amount: '100' /* Amount per DCA */ },
      },
      {
        id: 'dca-timer',
        type: 'conditional', // Using conditional as a timer/scheduler
        position: { x: 50, y: 350 },
        data: { label: 'Daily Timer', logicType: 'cron', value: '0 0 * * *' /* Every day at midnight */, condition: 'time_trigger' },
      },
      {
        id: 'dca-dex-swap',
        type: 'dexAggregator',
        position: { x: 300, y: 200 },
        data: { label: 'Swap USDC for DOT', dexes: ['AssetHubSwap'], selectedDexes: ['AssetHubSwap'], slippageTolerance: '1', sourceToken: 'USDC', targetToken: 'DOT', amount: '100' /* This amount should be linked from asset selector */ },
      },
      {
        id: 'dca-alert',
        type: 'alert',
        position: { x: 300, y: 350 },
        data: { label: 'DCA Execution Alert', alertType: 'Discord', message: 'DCA executed: Bought {amount_dot} DOT with {amount_usdc} USDC.' },
      },
    ],
    edges: [
      { id: 'e-dca-wc-as', source: 'dca-wc', target: 'dca-as-usdc', type: 'assetFlow' },
      { id: 'e-dca-timer-as', source: 'dca-timer', target: 'dca-as-usdc', type: 'logicFlow', sourceHandle: 'true' }, // Timer triggers asset availability for swap
      { id: 'e-dca-as-dex', source: 'dca-as-usdc', target: 'dca-dex-swap', type: 'assetFlow' },
      { id: 'e-dca-dex-alert', source: 'dca-dex-swap', target: 'dca-alert', type: 'assetFlow' }, // Notify after swap
    ],
  },
];

// Function to get a specific example flow by ID
export const getExampleFlowById = (id: string): ExampleWorkflow | undefined => {
  return exampleFlows.find(flow => flow.id === id);
};
