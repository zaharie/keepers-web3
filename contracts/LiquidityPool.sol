// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BLTMToken.sol";

contract LiquidityPool is AccessControl {
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    uint256 public exchangeRate;
    IERC20 public usdcToken;
    BLTMToken public bltmToken;
    uint256 public royaltyPercentage = 2;

    event Deposit(address indexed user, uint256 usdcAmount, uint256 bltmAmount);
    event Redemption(address indexed user, uint256 bltmAmount, uint256 usdcAmount);
    event Withdrawal(address indexed owner, uint256 amount);

    constructor(address usdcAddress, address bltmAddress, uint256 rate) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OWNER_ROLE, msg.sender);
        usdcToken = IERC20(usdcAddress);
        bltmToken = BLTMToken(bltmAddress);
        exchangeRate = rate;
  
    }

    function setExchangeRate(uint256 newRate) public onlyRole(OWNER_ROLE) {
        exchangeRate = newRate;
    }

    function depositUSDC(uint256 amount) public {
        uint256 royalty = (amount * royaltyPercentage) / 100;
        uint256 netAmount = amount - royalty;
        uint256 bltmAmount = netAmount * exchangeRate;
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");
        bltmToken.mint(msg.sender, bltmAmount);
        emit Deposit(msg.sender, amount, bltmAmount);
    }

    function withdrawUSDC(uint256 amount) public onlyRole(OWNER_ROLE) {
        require(usdcToken.balanceOf(address(this)) >= amount, "Not enough USDC in pool");
        require(usdcToken.transfer(msg.sender, amount), "USDC transfer failed");
        emit Withdrawal(msg.sender, amount);
    }

    function redeemBLTM(uint256 amount) public {
        uint256 usdcAmount = amount / exchangeRate;
        require(usdcToken.balanceOf(address(this)) >= usdcAmount, "Not enough USDC in pool");
        bltmToken.burn(msg.sender, amount);
        require(usdcToken.transfer(msg.sender, usdcAmount), "USDC transfer failed");
        emit Redemption(msg.sender, amount, usdcAmount);
    }
}
