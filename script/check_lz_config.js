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
    arbSep: 40231,
    polyAmoy: 40267,
    polyZkevm: 40247,
    scrollSep: 40170,
    worldcoin: 40335,
    mantleSep: 40246,
    // The Hedera EVM has 8 decimals while their JSON RPC uses 18 decimals for `msg.value`, 
    // please take precaution when calling `quoteFee`
    hedera: 40285,
    celoAlf: 40125,
    zircuit: 40275,
    baseSep: 40245,
    morph: 40322,
    lineaSep: 40287
  }
};

// https://docs.layerzero.network/v2/developers/evm/technical-reference/dvn-addresses
const LayerZeroDVNs = {
  testnet: {
    sepolia: "0x8eebf8b423B73bFCa51a1Db4B7354AA0bFCA9193",
    arbSep: "0x53f488e93b4f1b60e8e83aa374dbe1780a1ee8a8",
    polyAmoy: "0x55c175dd5b039331db251424538169d8495c18d1",
    polyZkevm: "0x55c175dd5b039331db251424538169d8495c18d1",
    scrollSep: "0xb186f85d0604fe58af2ea33fe40244f5eef7351b",
    worldcoin: "0x55c175dd5b039331db251424538169d8495c18d1",
    mantleSep: "0x9454f0eabc7c4ea9ebf89190b8bf9051a0468e03",
    hedera: "0xec7ee1f9e9060e08df969dc08ee72674afd5e14d",
    celoAlf: "0xbef132bc69c87f52d173d093a3f8b5b98842275f",
    zircuit: "0x88b27057a9e00c5f05dda29241027aff63f9e6e0",
    baseSep: "0xe1a12515f9ab2764b887bf60b923ca494ebbb2d6",
    morph: "0xf49d162484290eaead7bb8c2c7e3a6f8f52e32d6",
    lineaSep: "0x701f3927871efcea1235db722f9e608ae120d243"
  }
};

const oappAddresses = {
  omnitoken: {
    testnet: {
      sepolia: '0x00'
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
    },
    arbSep: {
        LzEndpointAddress: "0x6EDCE65403992e310A62460808c4b910D972f10f",
        providerUrl: 'https://arbitrum-sepolia.gateway.tenderly.co',
        sendLibAddress: '0x4f7cd4DA19ABB31b0eC98b9066B9e857B1bf9C0E',
        receiveLibAddress: '0x75Db67CDab2824970131D5aa9CECfC9F69c69636'
    },
    polyAmoy: {
        LzEndpointAddress: "0x6EDCE65403992e310A62460808c4b910D972f10f",
        providerUrl: 'https://rpc-amoy.polygon.technology',
        sendLibAddress: '0x1d186C560281B8F1AF831957ED5047fD3AB902F9',
        receiveLibAddress: '0x53fd4C4fBBd53F6bC58CaE6704b92dB1f360A648'
    },
    polyZkevm: {
        LzEndpointAddress: "0x6EDCE65403992e310A62460808c4b910D972f10f",
        providerUrl: 'https://endpoints.omniatech.io/v1/polygon-zkevm/testnet/public',
        sendLibAddress: '0x1d186C560281B8F1AF831957ED5047fD3AB902F9',
        receiveLibAddress: '0x53fd4C4fBBd53F6bC58CaE6704b92dB1f360A648'
    },
    scrollSep: {
        LzEndpointAddress: "0x6EDCE65403992e310A62460808c4b910D972f10f",
        providerUrl: 'https://sepolia-rpc.scroll.io',
        sendLibAddress: '0x21f1C2B131557c3AebA918D590815c47Dc4F20aa',
        receiveLibAddress: '0xf2dB23f9eA1311E9ED44E742dbc4268de4dB0a88'
    },
    worldcoin: {
        LzEndpointAddress: "0x145C041566B21Bec558B2A37F1a5Ff261aB55998",
        providerUrl: 'https://worldchain-sepolia.g.alchemy.com/public',
        sendLibAddress: '0x1d186C560281B8F1AF831957ED5047fD3AB902F9',
        receiveLibAddress: '0x53fd4C4fBBd53F6bC58CaE6704b92dB1f360A648'
    },
    mantleSep: {
        LzEndpointAddress: "0x6EDCE65403992e310A62460808c4b910D972f10f",
        providerUrl: 'https://rpc.sepolia.mantle.xyz',
        sendLibAddress: '0x9A289B849b32FF69A95F8584a03343a33Ff6e5Fd',
        receiveLibAddress: '0x8A3D588D9f6AC041476b094f97FF94ec30169d3D'
    },
    hedera: {
        LzEndpointAddress: "0xbD672D1562Dd32C23B563C989d8140122483631d",
        providerUrl: 'https://testnet.hashio.io/api',
        sendLibAddress: '0x1707575f7cecdc0ad53fde9ba9bda3ed5d4440f4',
        receiveLibAddress: '0xc0c34919A04d69415EF2637A3Db5D637a7126cd0'
    },
    celoAlf: {
        LzEndpointAddress: "0x6EDCE65403992e310A62460808c4b910D972f10f",
        providerUrl: 'https://alfajores-forno.celo-testnet.org',
        sendLibAddress: '0x00432463F40E100F6A99fA2E60B09F0182D828DE',
        receiveLibAddress: '0xdb5A808eF72Aa3224D9fA6c15B717E8029B89a4f'
    },
    zircuit: {
        LzEndpointAddress: "0x6EDCE65403992e310A62460808c4b910D972f10f",
        providerUrl: 'https://zircuit1-testnet.p2pify.com',
        sendLibAddress: '0x45841dd1ca50265Da7614fC43A361e526c0e6160',
        receiveLibAddress: '0xd682ECF100f6F4284138AA925348633B0611Ae21'
    },
    baseSep: {
        LzEndpointAddress: "0x6EDCE65403992e310A62460808c4b910D972f10f",
        providerUrl: 'https://base-sepolia-rpc.publicnode.com',
        sendLibAddress: '0xC1868e054425D378095A003EcbA3823a5D0135C9',
        receiveLibAddress: '0x12523de19dc41c91F7d2093E0CFbB76b17012C8d'
    },
    morph: {
        LzEndpointAddress: "0x6C7Ab2202C98C4227C5c46f1417D81144DA716Ff",
        providerUrl: 'https://rpc-holesky.morphl2.io',
        sendLibAddress: '0xd682ECF100f6F4284138AA925348633B0611Ae21',
        receiveLibAddress: '0xcF1B0F4106B0324F96fEfcC31bA9498caa80701C'
    },
    lineaSep: {
        LzEndpointAddress: "0x6EDCE65403992e310A62460808c4b910D972f10f",
        providerUrl: 'https://rpc.sepolia.linea.build',
        sendLibAddress: '0x53fd4C4fBBd53F6bC58CaE6704b92dB1f360A648',
        receiveLibAddress: '0x9eCf72299027e8AeFee5DC5351D6d92294F46d2b'
    }
  }
};

const executorConfigs = {
  testnet: {
    sepolia: {
      maxMessageSize: 10000,
      executorAddress: '0x718B92b5CB0a5552039B593faF724D182A881eDA'
    },
    arbSep: {
      maxMessageSize: 10000,
      executorAddress: '0x5Df3a1cEbBD9c8BA7F8dF51Fd632A9aef8308897'
    },
    polyAmoy: {
      maxMessageSize: 10000,
      executorAddress: '0x4Cf1B3Fa61465c2c907f82fC488B43223BA0CF93'
    },
    polyZkevm: {
      maxMessageSize: 10000,
      executorAddress: '0x9dB9Ca3305B48F196D18082e91cB64663b13d014'
    },
    scrollSep: {
      maxMessageSize: 10000,
      executorAddress: '0xD0D47C34937DdbeBBe698267a6BbB1dacE51198D'
    },
    worldcoin: {
      maxMessageSize: 10000,
      executorAddress: '0xe1a12515F9AB2764b887bF60B923Ca494EBbB2d6'
    },
    mantleSep: {
      maxMessageSize: 10000,
      executorAddress: '0x8BEEe743829af63F5b37e52D5ef8477eF12511dE'
    },
    hedera: {
      maxMessageSize: 10000,
      executorAddress: '0xe514D331c54d7339108045bF4794F8d71cad110e'
    },
    celoAlf: {
      maxMessageSize: 10000,
      executorAddress: '0x5468b60ed00F9b389B5Ba660189862Db058D7dC8'
    },
    zircuit: {
      maxMessageSize: 10000,
      executorAddress: '0x12523de19dc41c91F7d2093E0CFbB76b17012C8d'
    },
    baseSep: {
      maxMessageSize: 10000,
      executorAddress: '0x8A3D588D9f6AC041476b094f97FF94ec30169d3D'
    },
    morph: {
      maxMessageSize: 10000,
      executorAddress: '0x701f3927871EfcEa1235dB722f9E608aE120d243'
    },
    lineaSep: {
      maxMessageSize: 10000,
      executorAddress: '0xe1a12515F9AB2764b887bF60B923Ca494EBbB2d6'
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
    },
    arbSep: {
      confirmations: 12n,
      requiredDVNCount: 1,
      optionalDVNCount: 0,
      optionalDVNThreshold: 0,
      requiredDVNs: [LayerZeroDVNs.testnet.arbSep],
      optionalDVNs: [],
    },
    polyAmoy: {
      confirmations: 12n,
      requiredDVNCount: 1,
      optionalDVNCount: 0,
      optionalDVNThreshold: 0,
      requiredDVNs: [LayerZeroDVNs.testnet.polyAmoy],
      optionalDVNs: [],
    },
    polyZkevm: {
      confirmations: 12n,
      requiredDVNCount: 1,
      optionalDVNCount: 0,
      optionalDVNThreshold: 0,
      requiredDVNs: [LayerZeroDVNs.testnet.polyZkevm],
      optionalDVNs: [],
    },
    scrollSep: {
      confirmations: 12n,
      requiredDVNCount: 1,
      optionalDVNCount: 0,
      optionalDVNThreshold: 0,
      requiredDVNs: [LayerZeroDVNs.testnet.scrollSep],
      optionalDVNs: [],
    },
    worldcoin: {
      confirmations: 12n,
      requiredDVNCount: 1,
      optionalDVNCount: 0,
      optionalDVNThreshold: 0,
      requiredDVNs: [LayerZeroDVNs.testnet.worldcoin],
      optionalDVNs: [],
    },
    mantleSep: {
      confirmations: 12n,
      requiredDVNCount: 1,
      optionalDVNCount: 0,
      optionalDVNThreshold: 0,
      requiredDVNs: [LayerZeroDVNs.testnet.mantleSep],
      optionalDVNs: [],
    },
    hedera: {
      confirmations: 12n,
      requiredDVNCount: 1,
      optionalDVNCount: 0,
      optionalDVNThreshold: 0,
      requiredDVNs: [LayerZeroDVNs.testnet.hedera],
      optionalDVNs: [],
    },
    celoAlf: {
      confirmations: 12n,
      requiredDVNCount: 1,
      optionalDVNCount: 0,
      optionalDVNThreshold: 0,
      requiredDVNs: [LayerZeroDVNs.testnet.celoAlf],
      optionalDVNs: [],
    },
    zircuit: {
      confirmations: 12n,
      requiredDVNCount: 1,
      optionalDVNCount: 0,
      optionalDVNThreshold: 0,
      requiredDVNs: [LayerZeroDVNs.testnet.zircuit],
      optionalDVNs: [],
    },
    baseSep: {
      confirmations: 12n,
      requiredDVNCount: 1,
      optionalDVNCount: 0,
      optionalDVNThreshold: 0,
      requiredDVNs: [LayerZeroDVNs.testnet.baseSep],
      optionalDVNs: [],
    },
    morph: {
      confirmations: 12n,
      requiredDVNCount: 1,
      optionalDVNCount: 0,
      optionalDVNThreshold: 0,
      requiredDVNs: [LayerZeroDVNs.testnet.morph],
      optionalDVNs: [],
    },
    lineaSep: {
      confirmations: 12n,
      requiredDVNCount: 1,
      optionalDVNCount: 0,
      optionalDVNThreshold: 0,
      requiredDVNs: [LayerZeroDVNs.testnet.lineaSep],
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

const testnetChains = ['sepolia', 'arbSep', 'polyAmoy', 'polyZkevm', 'scrollSep', 'worldcoin', 'mantleSep', 'hedera', 'celoAlf', 'zircuit', 'baseSep', 'morph', 'lineaSep'];
const tokenTypes = ['omnitoken'];

tokenTypes.forEach((tokenType) => {
  testnetChains.forEach((origin) => {
    testnetChains.forEach((destination) => {
      if (origin !== destination) getConfigs(origin, destination, 'testnet', tokenType);
    });
  });
});
