// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";

import "../src/omni/ChildToken.sol";

contract DeployToken is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        ChildToken Token = new ChildToken(
            "Moo Deng",
            "MOODENG",
            18,
            100000000000000000000000,
            address(0),
            address(0)
        );

        vm.stopBroadcast();
    }
}
