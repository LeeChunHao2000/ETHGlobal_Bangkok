// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";

import "../src/adapters/LayerZero/LayerZeroAdapter.sol";

contract DeployLayerZeroAdapter is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address defaultAdmin = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        LayerZeroAdapter l0Adapter = new LayerZeroAdapter(
            IBridgeToken(address(0x2A94ce5d0EFC10ed48b3f5C2cA9b418cc9b17372)),
            address(0x6EDCE65403992e310A62460808c4b910D972f10f),
            defaultAdmin
        );

        vm.stopBroadcast();
    }
}
