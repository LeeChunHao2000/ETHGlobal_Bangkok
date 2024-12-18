// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IBridgeToken {
    function decimals() external view returns (uint8);
    function mint(address account, uint256 amount) external;
    function burn(address account, uint256 amount) external;
}