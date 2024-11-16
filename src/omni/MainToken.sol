// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title Token Contract on Layer 1 or source chain
 */

contract MainToken is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 maxSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, maxSupply * 10 ** decimals());
    }
}