// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    uint8 private _customDecimals;

    constructor(string memory name, string memory symbol, uint8 decimals) ERC20(name, symbol) {
        _customDecimals = decimals;
    }

    function decimals() public view override returns (uint8) {
        return _customDecimals;
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
