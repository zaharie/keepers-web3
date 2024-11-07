"use client";
import { useEffect, useState } from "react";
import { ethers, formatUnits, parseUnits } from "ethers";
import LiquidityPoolData from "../../../artifacts/contracts/LiquidityPool.sol/LiquidityPool.json";
import USDCData from "../../../artifacts/contracts/ERC20Mock.sol/ERC20Mock.json";
import BLTMTokenData from "../../../artifacts/contracts/BLTMToken.sol/BLTMToken.json";
import useWallet from "../../hooks/useWallet";

const LIQUIDITY_POOL_ADDRESS = "0x1D2c4Fa72509Ab0Db259e41F5D264c11dD1Bde80";
const USDC_ADDRESS = "0x76a58661a02Ab349a3902AF843056123F8168Cf2";
const BLTM_TOKEN_ADDRESS = "0xBd9B0231e597E5348b10c2e9Cc466A25C2acdD13";

const ExchangePage = () => {
  const { account, provider } = useWallet();
  const [liquidityPoolContract, setLiquidityPoolContract] =
    useState<ethers.Contract | null>(null);
  const [usdcContract, setUsdcContract] = useState<ethers.Contract | null>(
    null
  );
  const [bltmTokenContract, setBltmTokenContract] =
    useState<ethers.Contract | null>(null);
  const [amount, setAmount] = useState<string>("");

  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  const [bltmBalance, setBltmBalance] = useState<string>("0");
  const [exchangeRate, setExchangeRate] = useState<string>("1");
  const [transactions, setTransactions] = useState<
    Array<{ date: string; action: string; amount: string }>
  >([]);

  useEffect(() => {
    const setupContracts = async () => {
      if (provider && account) {
        const signer = await provider.getSigner();
        const liquidityPool = new ethers.Contract(
          LIQUIDITY_POOL_ADDRESS,
          LiquidityPoolData.abi,
          signer
        );
        const usdc = new ethers.Contract(USDC_ADDRESS, USDCData.abi, signer);
        const bltmToken = new ethers.Contract(
          BLTM_TOKEN_ADDRESS,
          BLTMTokenData.abi,
          signer
        );

        setLiquidityPoolContract(liquidityPool);
        setUsdcContract(usdc);
        setBltmTokenContract(bltmToken);

        const rate = await liquidityPool.exchangeRate();
        setExchangeRate(formatUnits(rate, 6));

        loadSavedTransactions();
      }
    };

    setupContracts();
  }, [provider, account]);

  useEffect(() => {
    if (usdcContract && bltmTokenContract && account) {
      updateBalances();
    }
  }, [usdcContract, bltmTokenContract, account]);

  // Load transactions from localStorage for display purposes only
  const loadSavedTransactions = () => {
    if (account) {
      const savedTransactions = localStorage.getItem(`transactions_${account}`);
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
    }
  };

  // Save transactions to localStorage without affecting the transaction logic
  const saveTransactionsToLocalStorage = (
    newTransactions: Array<{ date: string; action: string; amount: string }>
  ) => {
    if (account) {
      localStorage.setItem(
        `transactions_${account}`,
        JSON.stringify(newTransactions)
      );
    }
  };

  const updateBalances = async () => {
    if (usdcContract && bltmTokenContract && account) {
      const usdcBal = await usdcContract.balanceOf(account);
      const bltmBal = await bltmTokenContract.balanceOf(account);
      setUsdcBalance(formatUnits(usdcBal, 6));
      setBltmBalance(formatUnits(bltmBal, 6));
    }
  };

  const handleDepositUSDC = async () => {
    if (!liquidityPoolContract || !usdcContract || !account) return;

    const parsedAmount = parseUnits(amount, 6);
    await usdcContract.approve(LIQUIDITY_POOL_ADDRESS, parsedAmount);
    const tx = await liquidityPoolContract.depositUSDC(parsedAmount);
    await tx.wait();

    updateBalances();

    const newTransaction = {
      date: new Date().toISOString(),
      action: "Deposit USDC",
      amount,
    };
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    saveTransactionsToLocalStorage(updatedTransactions);
  };

  const handleWithdrawBLTM = async () => {
    if (!liquidityPoolContract || !bltmTokenContract || !account) return;

    const parsedAmount = parseUnits(amount, 6);
    const tx = await liquidityPoolContract.redeemBLTM(parsedAmount);
    await tx.wait();

    updateBalances();

    const newTransaction = {
      date: new Date().toISOString(),
      action: "Withdraw USDC",
      amount,
    };
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    saveTransactionsToLocalStorage(updatedTransactions);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setAmount(e.target.value);

  const sortTransactions = (key: keyof (typeof transactions)[0]) => {
    const sortedTransactions = [...transactions].sort((a, b) =>
      a[key] > b[key] ? 1 : -1
    );
    setTransactions(sortedTransactions);
    saveTransactionsToLocalStorage(sortedTransactions);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Exchange USDC for BLTM</h1>
      <p className="mb-4">USDC Balance: {usdcBalance}</p>
      <p className="mb-4">BLTM Balance: {bltmBalance}</p>
      <p className="mb-4">Exchange Rate: 1 USDC = {exchangeRate} BLTM</p>
      <input
        type="text"
        placeholder="Amount in USDC"
        value={amount}
        onChange={handleAmountChange}
        className="p-2 border rounded mb-4"
      />
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleDepositUSDC}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Deposit USDC
        </button>
        <button
          onClick={handleWithdrawBLTM}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Withdraw USDC
        </button>
      </div>

      <div className="w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
        <table className="min-w-full bg-white border rounded-lg shadow-md">
          <thead>
            <tr>
              <th
                onClick={() => sortTransactions("date")}
                className="cursor-pointer p-2 border"
              >
                Date
              </th>
              <th
                onClick={() => sortTransactions("action")}
                className="cursor-pointer p-2 border"
              >
                Action
              </th>
              <th
                onClick={() => sortTransactions("amount")}
                className="cursor-pointer p-2 border"
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => (
              <tr key={idx} className="hover:bg-gray-100">
                <td className="p-2 border">{tx.date}</td>
                <td className="p-2 border">{tx.action}</td>
                <td className="p-2 border">{tx.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExchangePage;
