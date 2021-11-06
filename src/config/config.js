import { ethers } from 'ethers';
import { getNetworkName } from './chainIds';

const { abi: ERC20ABI } = require('../contracts/ERC20.json');

// export const VALID_CHAIN_IDS = ['42', '4'];
export const VALID_CHAIN_IDS = ['42'];

const contractAddress = {
  rinkeby: '0xD22460D669B37b90fB5b1bC1855b2E43084CFb3D',
  kovan: '0xE9C0962E56b723C8DE5602b054aB5F1a6C1a57d7',
};

const whitelist = [
  { address: { kovan: '0x83DB0478eCFd19713521DBB589227cb1E7F00699' }, name: 'MockToken', symbol: 'MOCK' },
  {
    address: { kovan: '0x2B9045Efa910eA2CF698B2DEE5EBE2Fb10DAD309' },
    name: 'BananaToken',
    symbol: 'Banana',
  },
];

export const PLATFORMS_TO_ID = {
  Twitter: 0,
  Instagram: 1,
};

export const getContractAddress = (networkName) => {
  return contractAddress[networkName];
};

export const DURATION_CHOICES = {
  None: 0,
  'One Day': 1 * 24 * 60 * 60 * 1000,
  'Three Days': 3 * 24 * 60 * 60 * 1000,
  'One Week': 1 * 7 * 24 * 60 * 60 * 1000,
  'Two Weeks': 2 * 7 * 24 * 60 * 60 * 1000,
};

export const oneWeek = 7 * 24 * 60 * 60 * 1000;

export const A_VALID_CHAIN_ID = VALID_CHAIN_IDS[0];

// builds dict indexed by key, resolves address, adds 'contract' entry
const buildContractsIndexedBy = (obj, key, chainName, provider = null) => {
  return Object.fromEntries(
    obj.map((token) => [
      token[key],
      {
        ...token,
        address: token.address[chainName],
        contract: new ethers.Contract(token.address[chainName], ERC20ABI, provider),
      },
    ])
  );
};

export const getErc20TokenWhitelist = (chainName, provider) => {
  return buildContractsIndexedBy(whitelist, 'symbol', chainName, provider);
};
