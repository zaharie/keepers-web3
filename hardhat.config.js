/* eslint-disable @typescript-eslint/no-require-imports */
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
      },
      {
        version: "0.8.27",
      },
    ],
  },
  networks: {
    amoy: {
      url: "https://polygon-amoy.g.alchemy.com/v2/IO3XsLkBoxKKFW8rxcaxDcjYKUvZtQsP",
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
};
