import * as ethers from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const LzEndpointABI = [
  'function getConfig(address _oapp, address _lib, uint32 _eid, uint32 _configType) external view returns (bytes memory config)',
];

const ulnConfigStructType = [
  'tuple(uint64 confirmations, uint8 requiredDVNCount, uint8 optionalDVNCount, uint8 optionalDVNThreshold, address[] requiredDVNs, address[] optionalDVNs)',
];
const executorConfigAbi = ['tuple(uint32 maxMessageSize, address executorAddress)'];

const executorConfigType = 1; // 1 for executor
const ulnConfigType = 2; // 2 for ULN Config


const LZ_IDS = {
  testnet: {
    sepolia: 40161,
  }
};

// https://docs.layerzero.network/v2/developers/evm/technical-reference/dvn-addresses
const LayerZeroDVNs = {
  testnet: {
    sepolia: "0x8eebf8b423B73bFCa51a1Db4B7354AA0bFCA9193"
  }
};

const oappAddresses = {
  bkktoken: {
    testnet: {
      sepolia: '0x0c1585D94b2C395942eBc9e46f9ae2f51E79fe64'
    }
  }
};

const originConfigs = {
  testnet: {
    sepolia: {
      LzEndpointAddress: "0x6EDCE65403992e310A62460808c4b910D972f10f",
      providerUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
      sendLibAddress: '0xcc1ae8Cf5D3904Cef3360A9532B477529b177cCE',
      receiveLibAddress: '0xdAf00F5eE2158dD58E0d3857851c432E34A3A851'
    }
  }
};

const executorConfigs = {
  testnet: {
    sepolia: {
      maxMessageSize: 10000,
      executorAddress: '0x718B92b5CB0a5552039B593faF724D182A881eDA'
    }
  }
};

const ulnConfigs = {
  testnet: {
    sepolia: {
      confirmations: 12n,
      requiredDVNCount: 1,
      optionalDVNCount: 0,
      optionalDVNThreshold: 0,
      requiredDVNs: [LayerZeroDVNs.testnet.sepolia],
      optionalDVNs: [],
    }
  }
};



// Define the addresses and parameters
// 0x00000000000000000000000082e09977ced7de0f93548d89c227d2e1bf8f3337
// 0x0000000000000000000000000c0dfFF29E449B0a84F78cc7CdBbe0E31FdAF1B7 // bytes32 receiver
// 0x00000000000000000000000004D5ddf5f3a8939889F11E97f8c4BB48317F1938 // bytes32 receiver

// https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts
// https://docs.layerzero.network/v2/developers/evm/configuration/default-config#checking-default-configuration
async function getConfigAndDecode(title, { LzEndpointAddress, remoteEid, oappAddress, providerUrl, sendLibAddress, receiveLibAddress }) {
  // Create provider and contract instance
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  const contract = new ethers.Contract(LzEndpointAddress, LzEndpointABI, provider);

  try {
    // Fetch and decode for sendLib (both Executor and ULN Config)
    const sendExecutorConfigBytes = await contract.getConfig(oappAddress, sendLibAddress, remoteEid, executorConfigType);
    const executorConfigArray = ethers.utils.defaultAbiCoder.decode(executorConfigAbi, sendExecutorConfigBytes);
    // console.log(`\n\n${title}:\n`, 'Send Library Executor Config:', executorConfigArray);

    const sendUlnConfigBytes = await contract.getConfig(oappAddress, sendLibAddress, remoteEid, ulnConfigType);
    const sendUlnConfigArray = ethers.utils.defaultAbiCoder.decode(ulnConfigStructType, sendUlnConfigBytes);
    // console.log('Send Library ULN Config:', sendUlnConfigArray);

    // Fetch and decode for receiveLib (only ULN Config)
    const receiveUlnConfigBytes = await contract.getConfig(oappAddress, receiveLibAddress, remoteEid, ulnConfigType);
    const receiveUlnConfigArray = ethers.utils.defaultAbiCoder.decode(ulnConfigStructType, receiveUlnConfigBytes);
    // console.log('Receive Library ULN Config:', receiveUlnConfigArray);

    console.log(
      `\n\n${title}\n`,
      'Send Library Executor Config:\n',
      executorConfigArray,
      '\nSend Library ULN Config:\n',
      sendUlnConfigArray,
      '\nReceive Library ULN Config:\n',
      receiveUlnConfigArray,
    );
  } catch (error) {
    console.error('Error fetching or decoding config:', title);
  }
}

function generateUlnConfigBytes(ulnConfig) {
  return ethers.utils.defaultAbiCoder.encode(ulnConfigStructType, [ulnConfig]);
}

function generateExecutorConfigBytes(executorConfig) {
  return ethers.utils.defaultAbiCoder.encode(executorConfigAbi, [executorConfig]);
}

function logConfigParams(title, sendingParams, receivingParams) {
  console.log(`\n\n${title}`);
  console.log(`send`, sendingParams);
  console.log(`receive`, receivingParams);
}

function createSendingParams(lzId, executorConfig, ulnConfig) {
  return [
    [lzId, executorConfigType, generateExecutorConfigBytes(executorConfig)],
    [lzId, ulnConfigType, generateUlnConfigBytes(ulnConfig)],
  ];
}

function createReceivingParams(lzId, ulnConfig) {
  return [
    [lzId, ulnConfigType, generateUlnConfigBytes(ulnConfig)],
  ];
}

function getConfigs(originChain, destinationChain, networkType, tokenType) {
  try {
    const network = networkType === 'mainnet' ? 'mainnet' : 'testnet';
    const config = {
      ...originConfigs[network][originChain],
      oappAddress: oappAddresses[tokenType][network][originChain],
      remoteEid: LZ_IDS[network][destinationChain]
    };
    const ulnConfig = ulnConfigs[network][originChain];
    const executorConfig = executorConfigs[network][originChain];
    const lzId = LZ_IDS[network][destinationChain];

    const sendingParams = createSendingParams(lzId, executorConfig, ulnConfig);
    const receivingParams = createReceivingParams(lzId, ulnConfig);

    logConfigParams(`Target Parameters: \n ${network} ${originChain} to ${destinationChain}`, sendingParams, receivingParams);
    getConfigAndDecode(`Current Parameters: \n ${network} ${tokenType} ${originChain} to ${destinationChain} Config`, config);
  } catch (error) {
    console.error(`*******\n\nError fetching or decoding config: \n ${network} ${tokenType} ${originChain} to ${destinationChain}\n\n`);
  }
}

const testnetChains = ['sepolia'];
const tokenTypes = ['bkktoken'];

tokenTypes.forEach((tokenType) => {
  testnetChains.forEach((origin) => {
    testnetChains.forEach((destination) => {
      if (origin !== destination) getConfigs(origin, destination, 'testnet', tokenType);
    });
  });
});
