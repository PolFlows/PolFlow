import React, { useState, useEffect, memo } from 'react';
import { NodeProps, Position } from 'reactflow';
import { FaGavel } from 'react-icons/fa';
import BaseNode, { BaseNodeData } from './BaseNode';
import { usePolkadot } from '@/contexts/PolkadotContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useWallet } from '@/contexts/WalletContext';

// Governance node specific data
interface GovernanceNodeData extends BaseNodeData {
  governanceType: string;
  proposalId: string;
  votingPower: string;
  delegationEnabled: boolean;
  delegateAddress?: string;
  autoVote?: boolean;
  voteDirection?: 'yes' | 'no' | 'abstain';
  trackFilter?: string[];
  minThreshold?: string;
}

// Proposal interface
interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: string;
  track: string;
  votingEnds: string;
  yesVotes: string;
  noVotes: string;
  abstainVotes: string;
  threshold: string;
}

// Governance node component
const GovernanceNode: React.FC<NodeProps<GovernanceNodeData>> = ({ id, data, selected }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { api, activeChain } = usePolkadot();
  const { activeAccount, isConnected } = useWallet();
  
  // State for the node's properties
  const [governanceType, setGovernanceType] = useState<string>(data.governanceType || 'OpenGov');
  const [proposalId, setProposalId] = useState<string>(data.proposalId || '');
  const [votingPower, setVotingPower] = useState<string>(data.votingPower || '100');
  const [delegationEnabled, setDelegationEnabled] = useState<boolean>(data.delegationEnabled || false);
  const [delegateAddress, setDelegateAddress] = useState<string>(data.delegateAddress || '');
  const [autoVote, setAutoVote] = useState<boolean>(data.autoVote || false);
  const [voteDirection, setVoteDirection] = useState<'yes' | 'no' | 'abstain'>(data.voteDirection || 'yes');
  const [trackFilter, setTrackFilter] = useState<string[]>(data.trackFilter || []);
  const [minThreshold, setMinThreshold] = useState<string>(data.minThreshold || '0');
  
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [userVotingPower, setUserVotingPower] = useState<string>('0');
  const [userVotes, setUserVotes] = useState<{
    proposal: string;
    vote: 'yes' | 'no' | 'abstain';
    power: string;
  }[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionStatus, setActionStatus] = useState<string>('');

  // Available governance types
  const governanceTypes = [
    { value: 'OpenGov', label: 'OpenGov' },
    { value: 'Council', label: 'Council' },
    { value: 'Treasury', label: 'Treasury' },
    { value: 'Technical', label: 'Technical Committee' },
  ];

  // Available voting directions
  const voteDirections = [
    { value: 'yes', label: 'Yes (Approve)' },
    { value: 'no', label: 'No (Reject)' },
    { value: 'abstain', label: 'Abstain' },
  ];

  // Available governance tracks
  const getTracks = (): string[] => {
    // This is a simplified implementation
    // In a real app, you would query the chain for available tracks
    return [
      'Root',
      'Whitelisted Caller',
      'Staking Admin',
      'Treasurer',
      'Lease Admin',
      'Fellowship Admin',
      'General Admin',
      'Auction Admin',
      'Referendum Canceller',
      'Referendum Killer',
      'Small Tipper',
      'Big Tipper',
      'Small Spender',
      'Medium Spender',
      'Big Spender',
    ];
  };

  // Fetch proposals when parameters change
  useEffect(() => {
    const fetchProposals = async () => {
      if (!api) {
        setProposals([]);
        setSelectedProposal(null);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // This is a simplified implementation
        // In a real app, you would query the chain for active proposals
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock proposals based on governance type
        const mockProposals: Proposal[] = [];
        
        // Different proposals based on governance type
        if (governanceType === 'OpenGov') {
          mockProposals.push(
            {
              id: '12345',
              title: 'Increase Validator Set',
              description: 'Proposal to increase the validator set from 297 to 400 validators.',
              proposer: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
              status: 'Voting',
              track: 'Staking Admin',
              votingEnds: '3 days',
              yesVotes: '1,234,567 DOT',
              noVotes: '567,890 DOT',
              abstainVotes: '123,456 DOT',
              threshold: '50%',
            },
            {
              id: '12346',
              title: 'Treasury Funding for Development',
              description: 'Allocate 10,000 DOT for ecosystem development grants.',
              proposer: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
              status: 'Voting',
              track: 'Medium Spender',
              votingEnds: '5 days',
              yesVotes: '2,345,678 DOT',
              noVotes: '345,678 DOT',
              abstainVotes: '234,567 DOT',
              threshold: '60%',
            },
            {
              id: '12347',
              title: 'Parachain Slot Auction Schedule',
              description: 'Proposal to schedule the next batch of parachain slot auctions.',
              proposer: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
              status: 'Preparing',
              track: 'Auction Admin',
              votingEnds: '7 days',
              yesVotes: '3,456,789 DOT',
              noVotes: '234,567 DOT',
              abstainVotes: '345,678 DOT',
              threshold: '75%',
            }
          );
        } else if (governanceType === 'Council') {
          mockProposals.push(
            {
              id: '5678',
              title: 'Council Motion: Technical Upgrade',
              description: 'Motion to approve the upcoming runtime upgrade.',
              proposer: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
              status: 'Voting',
              track: 'Council',
              votingEnds: '2 days',
              yesVotes: '8 members',
              noVotes: '3 members',
              abstainVotes: '2 members',
              threshold: '50%',
            },
            {
              id: '5679',
              title: 'Council Motion: Treasury Proposal Review',
              description: 'Review and vote on treasury proposal #45.',
              proposer: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
              status: 'Passed',
              track: 'Council',
              votingEnds: 'Completed',
              yesVotes: '10 members',
              noVotes: '2 members',
              abstainVotes: '1 member',
              threshold: '50%',
            }
          );
        } else if (governanceType === 'Treasury') {
          mockProposals.push(
            {
              id: '789',
              title: 'Treasury Proposal: Marketing Campaign',
              description: 'Fund a marketing campaign to increase Polkadot awareness.',
              proposer: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
              status: 'Voting',
              track: 'Treasury',
              votingEnds: '4 days',
              yesVotes: '5 members',
              noVotes: '2 members',
              abstainVotes: '0 members',
              threshold: '60%',
            },
            {
              id: '790',
              title: 'Treasury Proposal: Developer Grants',
              description: 'Allocate funds for developer grants program.',
              proposer: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
              status: 'Voting',
              track: 'Treasury',
              votingEnds: '6 days',
              yesVotes: '4 members',
              noVotes: '3 members',
              abstainVotes: '0 members',
              threshold: '60%',
            }
          );
        } else {
          // Technical Committee
          mockProposals.push(
            {
              id: '456',
              title: 'Technical Motion: Emergency Fix',
              description: 'Apply emergency fix for vulnerability CVE-2023-12345.',
              proposer: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
              status: 'Voting',
              track: 'Technical',
              votingEnds: '1 day',
              yesVotes: '6 members',
              noVotes: '0 members',
              abstainVotes: '1 member',
              threshold: '66%',
            }
          );
        }
        
        // Filter proposals based on track filter
        const filteredProposals = trackFilter.length > 0 
          ? mockProposals.filter(prop => trackFilter.includes(prop.track))
          : mockProposals;
        
        setProposals(filteredProposals);
        
        // Select the first proposal by default
        if (filteredProposals.length > 0) {
          if (proposalId) {
            const matchedProposal = filteredProposals.find(p => p.id === proposalId);
            if (matchedProposal) {
              setSelectedProposal(matchedProposal);
            } else {
              setSelectedProposal(filteredProposals[0]);
              setProposalId(filteredProposals[0].id);
            }
          } else {
            setSelectedProposal(filteredProposals[0]);
            setProposalId(filteredProposals[0].id);
          }
        } else {
          setSelectedProposal(null);
        }
        
        // If user is connected, generate mock voting power
        if (isConnected) {
          const mockVotingPower = (Math.random() * 1000).toFixed(2);
          setUserVotingPower(mockVotingPower);
          
          // Generate mock user votes
          const mockUserVotes = [];
          if (filteredProposals.length > 0 && Math.random() > 0.5) {
            const randomProposal = filteredProposals[Math.floor(Math.random() * filteredProposals.length)];
            const randomVote = ['yes', 'no', 'abstain'][Math.floor(Math.random() * 3)] as 'yes' | 'no' | 'abstain';
            const randomPower = (Math.random() * parseFloat(mockVotingPower)).toFixed(2);
            
            mockUserVotes.push({
              proposal: randomProposal.id,
              vote: randomVote,
              power: randomPower,
            });
          }
          
          setUserVotes(mockUserVotes);
        } else {
          setUserVotingPower('0');
          setUserVotes([]);
        }
      } catch (error) {
        console.error('Failed to fetch proposals:', error);
        setProposals([]);
        setSelectedProposal(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposals();
  }, [
    governanceType, 
    trackFilter, 
    proposalId, 
    isConnected, 
    api, 
    activeChain
  ]);

  // Update node data when properties change
  useEffect(() => {
    data.governanceType = governanceType;
    data.proposalId = proposalId;
    data.votingPower = votingPower;
    data.delegationEnabled = delegationEnabled;
    data.delegateAddress = delegateAddress;
    data.autoVote = autoVote;
    data.voteDirection = voteDirection;
    data.trackFilter = trackFilter;
    data.minThreshold = minThreshold;
  }, [
    data, 
    governanceType, 
    proposalId, 
    votingPower, 
    delegationEnabled, 
    delegateAddress, 
    autoVote, 
    voteDirection, 
    trackFilter, 
    minThreshold
  ]);

  // Handle governance type change
  const handleGovernanceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGovernanceType(e.target.value);
    // Reset proposal ID when governance type changes
    setProposalId('');
    setSelectedProposal(null);
  };

  // Handle proposal selection
  const handleProposalSelect = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setProposalId(proposal.id);
  };

  // Handle voting power change
  const handleVotingPowerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ensure value is between 0 and 100
    const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0)).toString();
    setVotingPower(value);
  };

  // Handle delegation toggle
  const handleDelegationEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDelegationEnabled(e.target.checked);
  };

  // Handle delegate address change
  const handleDelegateAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDelegateAddress(e.target.value);
  };

  // Handle auto vote toggle
  const handleAutoVoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoVote(e.target.checked);
  };

  // Handle vote direction change
  const handleVoteDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVoteDirection(e.target.value as 'yes' | 'no' | 'abstain');
  };

  // Handle track filter change
  const handleTrackFilterChange = (track: string) => {
    setTrackFilter(prev => {
      if (prev.includes(track)) {
        return prev.filter(t => t !== track);
      } else {
        return [...prev, track];
      }
    });
  };

  // Handle min threshold change
  const handleMinThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ensure value is between 0 and 100
    const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0)).toString();
    setMinThreshold(value);
  };

  // Vote on proposal
  const handleVote = async () => {
    if (!isConnected || !activeAccount || !api || !selectedProposal) {
      setActionStatus('Not connected or no proposal selected');
      return;
    }
    
    setIsLoading(true);
    setActionStatus('Preparing transaction...');
    
    try {
      // This is a simplified implementation
      // In a real app, you would create and submit the actual transaction
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful transaction
      setActionStatus(`Voted ${voteDirection} on proposal ${selectedProposal.id}`);
      
      // Update user votes with mock data
      const existingVoteIndex = userVotes.findIndex(v => v.proposal === selectedProposal.id);
      
      if (existingVoteIndex >= 0) {
        // Update existing vote
        const updatedVotes = [...userVotes];
        updatedVotes[existingVoteIndex] = {
          proposal: selectedProposal.id,
          vote: voteDirection,
          power: votingPower,
        };
        setUserVotes(updatedVotes);
      } else {
        // Add new vote
        setUserVotes([
          ...userVotes,
          {
            proposal: selectedProposal.id,
            vote: voteDirection,
            power: votingPower,
          }
        ]);
      }
    } catch (error) {
      console.error('Vote error:', error);
      setActionStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delegate voting power
  const handleDelegate = async () => {
    if (!isConnected || !activeAccount || !api) {
      setActionStatus('Not connected');
      return;
    }
    
    if (!delegateAddress) {
      setActionStatus('No delegate address specified');
      return;
    }
    
    setIsLoading(true);
    setActionStatus('Preparing transaction...');
    
    try {
      // This is a simplified implementation
      // In a real app, you would create and submit the actual transaction
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful transaction
      setActionStatus(`Delegated voting power to ${delegateAddress.substring(0, 8)}...`);
    } catch (error) {
      console.error('Delegation error:', error);
      setActionStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up auto voting
  const handleSetupAutoVoting = async () => {
    if (!isConnected || !activeAccount || !api) {
      setActionStatus('Not connected');
      return;
    }
    
    setIsLoading(true);
    setActionStatus('Setting up auto-voting...');
    
    try {
      // This is a simplified implementation
      // In a real app, you would set up a service to monitor and vote on proposals
      
      // Simulate setup delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Toggle auto vote
      setAutoVote(true);
      
      // Simulate successful setup
      setActionStatus(`Auto-voting enabled for ${voteDirection} votes`);
    } catch (error) {
      console.error('Auto-voting setup error:', error);
      setActionStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Get user vote for current proposal
  const getUserVoteForCurrentProposal = () => {
    if (!selectedProposal) return null;
    return userVotes.find(v => v.proposal === selectedProposal.id);
  };

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      nodeColor="#6366f1" // Indigo for governance nodes
      icon={<FaGavel />}
      inputHandles={[{ id: 'input', position: Position.Left }]}
      outputHandles={[{ id: 'output', position: Position.Right }]}
    >
      <div className="space-y-3">
        {/* Governance type selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Governance System</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={governanceType}
            onChange={handleGovernanceTypeChange}
            disabled={isLoading}
          >
            {governanceTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Track filter */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Track Filter</label>
          <div className={`max-h-24 overflow-y-auto p-1 rounded ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            {getTracks().map((track) => (
              <div key={track} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  id={`${id}-track-${track}`}
                  checked={trackFilter.includes(track)}
                  onChange={() => handleTrackFilterChange(track)}
                  className="mr-2"
                  disabled={isLoading}
                />
                <label htmlFor={`${id}-track-${track}`} className="text-xs">
                  {track}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Proposals list */}
        {proposals.length > 0 ? (
          <div className="space-y-1">
            <label className="text-sm font-medium block">Active Proposals</label>
            <div className={`max-h-32 overflow-y-auto p-1 rounded ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className={`p-2 rounded mb-1 cursor-pointer ${
                    selectedProposal?.id === proposal.id
                      ? isDark ? 'bg-indigo-900' : 'bg-indigo-100'
                      : isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => handleProposalSelect(proposal)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">#{proposal.id}: {proposal.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      proposal.status === 'Voting'
                        ? 'bg-green-500 text-white'
                        : proposal.status === 'Passed'
                        ? 'bg-blue-500 text-white'
                        : 'bg-yellow-500 text-white'
                    }`}>
                      {proposal.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>{proposal.track}</span>
                    <span>Ends in: {proposal.votingEnds}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center py-2">
            <span className="text-sm">Loading proposals...</span>
          </div>
        ) : (
          <div className="text-center py-2">
            <span className="text-sm">No active proposals match your criteria</span>
          </div>
        )}

        {/* Selected proposal details */}
        {selectedProposal && (
          <div className={`p-3 rounded-md ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          } space-y-2`}>
            <div className="text-sm font-medium">{selectedProposal.title}</div>
            <div className="text-xs">{selectedProposal.description}</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Yes: {selectedProposal.yesVotes}</div>
              <div>No: {selectedProposal.noVotes}</div>
              <div>Abstain: {selectedProposal.abstainVotes}</div>
              <div>Threshold: {selectedProposal.threshold}</div>
            </div>
            {getUserVoteForCurrentProposal() && (
              <div className="text-xs font-medium">
                Your vote: <span className={`${
                  getUserVoteForCurrentProposal()?.vote === 'yes'
                    ? 'text-green-500'
                    : getUserVoteForCurrentProposal()?.vote === 'no'
                    ? 'text-red-500'
                    : 'text-yellow-500'
                }`}>
                  {getUserVoteForCurrentProposal()?.vote.toUpperCase()}
                </span> with {getUserVoteForCurrentProposal()?.power}% power
              </div>
            )}
          </div>
        )}

        {/* Voting options */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Voting Power (%)</label>
            <span className="text-sm">{votingPower}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            value={votingPower}
            onChange={(e) => setVotingPower(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Vote direction selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Vote Direction</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={voteDirection}
            onChange={handleVoteDirectionChange}
            disabled={isLoading}
          >
            {voteDirections.map((direction) => (
              <option key={direction.value} value={direction.value}>
                {direction.label}
              </option>
            ))}
          </select>
        </div>

        {/* Delegation options */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`${id}-delegation`}
            checked={delegationEnabled}
            onChange={handleDelegationEnabledChange}
            className="mr-2"
            disabled={isLoading}
          />
          <label htmlFor={`${id}-delegation`} className="text-sm font-medium">
            Enable Delegation
          </label>
        </div>

        {/* Delegate address input */}
        {delegationEnabled && (
          <div className="space-y-1">
            <label className="text-sm font-medium block">Delegate Address</label>
            <input
              type="text"
              className={`w-full p-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border text-sm`}
              value={delegateAddress}
              onChange={handleDelegateAddressChange}
              placeholder="5GrwvaEF..."
              disabled={isLoading}
            />
          </div>
        )}

        {/* Auto vote toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`${id}-autovote`}
            checked={autoVote}
            onChange={handleAutoVoteChange}
            className="mr-2"
            disabled={isLoading}
          />
          <label htmlFor={`${id}-autovote`} className="text-sm font-medium">
            Enable Auto-Voting
          </label>
        </div>

        {/* Min threshold input (for auto-voting) */}
        {autoVote && (
          <div className="space-y-1">
            <label className="text-sm font-medium block">Minimum Threshold (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className={`w-full p-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border text-sm`}
              value={minThreshold}
              onChange={handleMinThresholdChange}
              placeholder="0"
              disabled={isLoading}
            />
            <div className="text-xs text-gray-500 mt-1">
              Only vote on proposals with threshold above this value
            </div>
          </div>
        )}

        {/* User voting power display */}
        {isConnected && (
          <div className="text-sm">
            Your voting power: <span className="font-medium">{userVotingPower} DOT</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          {selectedProposal && (
            <button
              className={`py-2 px-4 rounded-md text-white font-medium ${
                !isConnected || isLoading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } transition-colors duration-200`}
              onClick={handleVote}
              disabled={!isConnected || isLoading}
            >
              Vote {voteDirection.charAt(0).toUpperCase() + voteDirection.slice(1)}
            </button>
          )}
          
          {delegationEnabled && delegateAddress && (
            <button
              className={`py-2 px-4 rounded-md text-white font-medium ${
                !isConnected || isLoading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              } transition-colors duration-200`}
              onClick={handleDelegate}
              disabled={!isConnected || isLoading}
            >
              Delegate
            </button>
          )}
          
          {!autoVote && (
            <button
              className={`py-2 px-4 rounded-md text-white font-medium ${
                !isConnected || isLoading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors duration-200 ${delegationEnabled && delegateAddress ? '' : 'col-span-2'}`}
              onClick={handleSetupAutoVoting}
              disabled={!isConnected || isLoading}
            >
              Setup Auto-Voting
            </button>
          )}
        </div>

        {/* Action status */}
        {actionStatus && (
          <div className={`text-xs ${
            actionStatus.startsWith('Voted') || actionStatus.startsWith('Delegated') || actionStatus.startsWith('Auto-voting')
              ? 'text-green-500'
              : actionStatus.startsWith('Error') || actionStatus.startsWith('Not') || actionStatus.startsWith('No')
              ? 'text-red-500'
              : isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {actionStatus}
          </div>
        )}

        {/* Not connected warning */}
        {!isConnected && (
          <div className="text-xs text-amber-500">
            Connect a wallet to participate in governance
          </div>
        )}
      </div>
    </BaseNode>
  );
};

export default memo(GovernanceNode);
