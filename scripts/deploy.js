const gasSettings = {
  gasLimit: 3000000,
  maxFeePerGas: ethers.parseUnits("100", "gwei"),
  maxPriorityFeePerGas: ethers.parseUnits("25", "gwei"),
};

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const USDC = await ethers.getContractFactory("ERC20Mock");

  const usdc = await USDC.deploy("USD Coin", "USDC", 6, gasSettings);

  console.log("USDC deployment transaction hash:", usdc.transactionHash);

  const usdTransaction = await usdc.waitForDeployment();

  console.log("USDC deployment transaction hash:", usdTransaction);

  const initialUSDCAmount = ethers.parseUnits("1000", 6);
  await usdc.mint(deployer.address, initialUSDCAmount);
  console.log(
    `Minted ${initialUSDCAmount} USDC to deployer:`,
    deployer.address
  );

  const BLTM = await ethers.getContractFactory("BLTMToken");
  const bltmToken = await BLTM.deploy(gasSettings);
  await bltmToken.waitForDeployment();

  console.log("BLTM Token deployed to:", bltmToken.target);

  const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
  const liquidityPool = await LiquidityPool.deploy(
    usdc.target,
    bltmToken.target,
    1,
    gasSettings
  );
  await liquidityPool.waitForDeployment();

  console.log("LiquidityPool deployed to:", liquidityPool.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
