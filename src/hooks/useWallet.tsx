import { useEffect, useState } from "react";
import { ethers } from "ethers";

const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        // Atualização para remover o await duplicado
        setAccount(await (await signer).getAddress());
        setProvider(provider);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  return { account, provider, connectWallet };
};

export default useWallet;
