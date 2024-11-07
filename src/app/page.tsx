// src/app/page.tsx
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import useWallet from "../hooks/useWallet";

const Home = () => {
  const { account, connectWallet } = useWallet();
  const router = useRouter();

  const handleStartExchanging = () => {
    router.push("/exchange");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center bg-gray-100 p-6">
        <h2 className="text-3xl font-semibold mb-4">
          Welcome to the Stablecoin Exchange
        </h2>
        <p className="text-lg text-gray-700 mb-8">
          Exchange your USDC for our custom ERC-20 token easily and securely.
        </p>

        {account ? (
          <p className="text-lg text-green-600">Connected: {account}</p>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition duration-200"
          >
            Connect Wallet
          </button>
        )}

        <button
          onClick={handleStartExchanging}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition duration-200 mt-4"
        >
          Start Exchanging
        </button>
      </main>
    </div>
  );
};

export default Home;
