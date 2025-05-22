"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useSearchParams } from 'next/navigation'

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

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [claimAmount, setClaimAmount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const searchParams = useSearchParams()
  const amountFromQuery = searchParams.get('amount')

  useEffect(() => {
    if (amountFromQuery) {
      setClaimAmount(amountFromQuery);
      claimTokens(); // Trigger claimTokens when amountFromQuery is updated
    }
  }, [amountFromQuery]);

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
      setIsConnected(true); // Set connected state to true
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
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
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CLAIM_ABI, signer);

      // Convert amount to wei
      const amountWei = ethers.parseUnits(claimAmount, 18);

      // Call contract directly
      const tx = await contract.claimTokens(amountWei, account);
      await tx.wait();

      alert(`Claim successful! TX Hash: ${tx.hash}`);
    } catch (error) {
      console.error(error);
      alert(`Claim failed: ${error.message}`);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {!isConnected ? (
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Connect Wallet
          </button>
        ) : (
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
                {isClaiming ? "Claiming..." : "Claim Tokens"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
