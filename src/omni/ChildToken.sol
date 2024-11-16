// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/shared/token/ERC677/OpStackBurnMintERC677.sol";

contract ChildToken is OpStackBurnMintERC677 {
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 maxSupply, // @dev The maximum supply of the token, 0 if unlimited
        address l1Token,
        address l2Bridge
    ) OpStackBurnMintERC677(name, symbol, decimals, maxSupply, l1Token, l2Bridge) {}
}