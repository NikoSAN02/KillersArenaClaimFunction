"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { setClaimAmountAction } from '../actions';

const CLAIM_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "bytes", name: "signature", type: "bytes" },
    ],
    name: "claimTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const CONTRACT_ADDRESS = "0xE16bcF46B98cab58C661531Ff02D64DA59C39D19";

export default function ClaimComponent() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [claimAmount, setClaimAmount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use useEffect to get URL parameters instead of useSearchParams
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const amountFromQuery = urlParams.get('amount');
      if (amountFromQuery) {
        setClaimAmount(amountFromQuery);
      }
      setIsLoading(false);
    }
  }, []);

  const getTypedData = (address, amountToClaim) => {
    return {
      domain: {
        name: "GameTokenClaim",
        version: "1",
        chainId: 320,
        verifyingContract: CONTRACT_ADDRESS
      },
      message: {
        recipient: address,
        amount: ethers.parseUnits(amountToClaim || "0", 18)
      },
      primaryType: "Claim",
      types: {
        Claim: [
          { name: "recipient", type: "address" },
          { name: "amount", type: "uint256" }
        ]
      }
    };
  };

  const claimTokens = async () => {
    if (!provider || !account) {
      alert("Please connect your wallet first");
      return;
    }

    if (!claimAmount) {
      alert("Claim amount not loaded yet");
      return;
    }

    setIsClaiming(true);
    try {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const typedData = getTypedData(address, claimAmount);
      const signature = await signer.signTypedData(
        typedData.domain,
        typedData.types,
        typedData.message
      );

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CLAIM_ABI, signer);

      // Convert amount to wei
      const amountWei = ethers.parseUnits(claimAmount, 18);
      const signatureBytes = ethers.getBytes(signature);

      // Call contract directly
      const tx = await contract.claimTokens(amountWei, signatureBytes);
      await tx.wait();

      alert(`Claim successful! TX Hash: ${tx.hash}`);
    } catch (error) {
      console.error(error);
      alert(`Claim failed: ${error.message}`);
    } finally {
      setIsClaiming(false);
      setClaimAmountAction(claimAmount);
    }
  };

  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          320: "https://rpc.zkcandy.io/",
        },
      },
    },
  };

  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal({
        network: "zkCandy",
        cacheProvider: true,
        providerOptions,
      });
      const instance = await web3Modal.connect();
      const provider = new ethers.BrowserProvider(instance);
      setProvider(provider);

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      const network = await provider.getNetwork();
      setChainId(network.chainId.toString());
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Show loading state while checking for URL parameters
  if (isLoading) {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <div>Loading claim information...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {claimAmount ? (
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold">Claim {claimAmount} Tokens</h1>
            <p className="text-gray-600">Connect your wallet to claim your tokens</p>
          </div>
        ) : (
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold">No Claim Amount</h1>
            <p className="text-gray-600">Please access this page through a valid claim link</p>
          </div>
        )}
        
        {claimAmount && !isConnected ? (
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Connect Wallet
          </button>
        ) : claimAmount && isConnected ? (
          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <p className="text-sm">
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={claimTokens}
                disabled={isClaiming}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                {isClaiming ? "Claiming..." : `Claim ${claimAmount} Tokens`}
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}