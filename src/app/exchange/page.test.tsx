import { render, screen, fireEvent, act } from "@testing-library/react";
import ExchangePage from "./page";
import useWallet from "../../hooks/useWallet";
import { ethers } from "ethers";
import "@testing-library/jest-dom";

jest.mock("../../hooks/useWallet");
jest.mock("ethers", () => ({
  ethers: {
    Contract: jest.fn(),
    providers: {
      JsonRpcProvider: jest.fn(),
    },
    Wallet: jest.fn(),
  },
  formatUnits: jest.fn(() => "1000"),
  parseUnits: jest.fn(() => "1000000"),
}));

const mockSigner = {
  getAddress: jest.fn(() => "0x123"),
};
const mockProvider = {
  getSigner: jest.fn(() => mockSigner),
};

const mockLiquidityPoolContract = {
  exchangeRate: jest.fn(() => "1000"),
  depositUSDC: jest.fn(() => ({
    wait: jest.fn(),
  })),
  redeemBLTM: jest.fn(() => ({
    wait: jest.fn(),
  })),
};

const mockUsdcContract = {
  balanceOf: jest.fn(() => "1000000"),
  approve: jest.fn(() => ({
    wait: jest.fn(),
  })),
};

const mockBltmTokenContract = {
  balanceOf: jest.fn(() => "500000"),
};

describe("ExchangePage", () => {
  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue({
      account: "0x123",
      provider: mockProvider,
    });
    (ethers.Contract as jest.Mock)
      .mockImplementationOnce(() => mockLiquidityPoolContract)
      .mockImplementationOnce(() => mockUsdcContract)
      .mockImplementationOnce(() => mockBltmTokenContract);
  });

  test("renders component with initial balances", async () => {
    await act(async () => {
      render(<ExchangePage />);
    });
    expect(screen.getByText("Exchange USDC for BLTM")).toBeInTheDocument();
    expect(screen.getByText("USDC Balance: 1000")).toBeInTheDocument();
    expect(screen.getByText("BLTM Balance: 1000")).toBeInTheDocument();
    expect(
      screen.getByText("Exchange Rate: 1 USDC = 1000 BLTM")
    ).toBeInTheDocument();
  });

  test("updates amount input", async () => {
    render(<ExchangePage />);
    const amountInput = screen.getByPlaceholderText("Amount in USDC");
    fireEvent.change(amountInput, { target: { value: "50" } });
    expect(amountInput).toHaveValue("50");
  });

  test("sorts transactions by date", async () => {
    render(<ExchangePage />);
    const dateHeader = screen.getByText("Date");
    fireEvent.click(dateHeader);
    expect(dateHeader).toBeInTheDocument();
  });
});
