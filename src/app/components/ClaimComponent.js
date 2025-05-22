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
  const [isConnected, setIsConnected] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimAmount, setClaimAmount] = useState(0);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const [web3Modal, setWeb3Modal] = useState(null);

  useEffect(() => {
    const min = 9;
    const max = 50;
    const randomAmount = Math.floor(Math.random() * (max - min + 1)) + min;
    setClaimAmount(randomAmount);
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
        amount: ethers.parseUnits(String(amountToClaim) || "0", 18)
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
      const amountWei = ethers.parseUnits(String(claimAmount), 18);
      const signatureBytes = ethers.getBytes(signature);

      // Call contract directly
      const tx = await contract.claimTokens(amountWei, signatureBytes);
      await tx.wait();

      setClaimSuccess(tx.hash);
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
    okxwallet: {
      package: true,
      connector: async () => {
        let provider = null;
        if (typeof window.okxwallet !== 'undefined') {
          provider = window.okxwallet;
          try {
            await window.okxwallet.enable();
          } catch (error) {
            console.error("User denied account access");
          }
        } else {
          console.error("OKX Wallet not found");
        }
        return provider;
      }
    }
  };

  const connectWallet = async () => {
    try {
      const web3ModalInstance = new Web3Modal({
        network: "zkCandy",
        cacheProvider: true,
        providerOptions,
      });
      setWeb3Modal(web3ModalInstance);
      let instance;

      // Check if OKX Wallet is available
      if (window.okxwallet) {
        instance = window.okxwallet;
      } else {
        instance = await web3ModalInstance.connect();
      }

      // Check if the provider is OKX Wallet
      let provider = null;
      if (instance.isOKExWallet || window.okxwallet) {
        provider = new ethers.BrowserProvider(window.okxwallet);
      } else {
        provider = new ethers.BrowserProvider(instance);
      }

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

  const disconnectWallet = async () => {
    try {
      if (web3Modal) {
        await web3Modal.clearCachedProvider();
      }
      setProvider(null);
      setAccount("");
      setChainId("");
      setIsConnected(false);
      setClaimSuccess(null);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  return (
    <div className="font-inter bg-[#1a0033] text-[#e0e0e0] min-h-screen flex items-center justify-center">
      <main className="main-container max-w-4xl w-full p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-4xl font-extrabold text-purple-200 mb-8 text-shadow-lg">Killers Arena</h1>
        <p className="text-lg mb-4 text-purple-200">Claim Tokens</p>
        {!isConnected ? (
          <button
            onClick={connectWallet}
            className="platform-card bg-[#4a0080] hover:bg-[#a855f7] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-2">
              <p className="text-sm mr-2">
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </p>
              <span
                onClick={disconnectWallet}
                className="text-sm text-purple-200 cursor-pointer hover:underline"
              >
                Disconnect
              </span>
            </div>
            <button
              onClick={claimTokens}
              disabled={isClaiming || claimSuccess}
              className="platform-card bg-[#4a0080] hover:bg-[#a855f7] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {isClaiming ? "Claiming..." : `Claim ${claimAmount} Tokens`}
            </button>
            {claimSuccess && <p>Claim successful! TX Hash: {claimSuccess}</p>}
          </div>
        )}
      </main>
    </div>
  );
}