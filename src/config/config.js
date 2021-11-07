import { ethers } from 'ethers';
import { reverseLookup } from './utils';

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

export const PLATFORM_TO_ID = {
  Twitter: 0,
  Instagram: 1,
};

export const ID_TO_STATUS = {
  0: 'Closed',
  1: 'Open',
  2: 'Fulfilled',
};

export const parseTask = (taskArr) => ({
  status: taskArr[0],
  platform: taskArr[1],
  sponsorAddress: taskArr[2],
  promoterAddress: taskArr[3],
  promoterUserId: taskArr[4],
  tokenAddress: taskArr[5],
  tokenAmount: taskArr[6],
  startDate: taskArr[7],
  endDate: taskArr[8],
  minDuration: taskArr[9],
  hash: taskArr[10],
});

export const ID_TO_PLATFORM = reverseLookup(PLATFORM_TO_ID);

export const getContractAddress = (networkName) => {
  return contractAddress[networkName];
};

export const DURATION_CHOICES = {
  None: 0,
  'One Day': 1 * 24 * 60 * 60,
  'Three Days': 3 * 24 * 60 * 60,
  'One Week': 1 * 7 * 24 * 60 * 60,
  'Two Weeks': 2 * 7 * 24 * 60 * 60,
};

export const oneWeek = 7 * 24 * 60 * 60 * 1000;

export const A_VALID_CHAIN_ID = VALID_CHAIN_IDS[0];

export const getWhitelistAddressToSymbol = (chainName) => {
  return reverseLookup(buildDictIndexedBy(whitelist, 'symbol', (token) => token.address[chainName]));
};

const buildDictIndexedBy = (arr, key, fn) => {
  return Object.fromEntries(arr.map((entry, i) => [entry[key], fn(entry, i)]));
};

export const getErc20TokenWhitelist = (chainName, provider) => {
  return buildDictIndexedBy(whitelist, 'symbol', (token) => ({
    ...token,
    address: token.address[chainName],
    contract: new ethers.Contract(token.address[chainName], ERC20ABI, provider),
  }));
  // return buildContractsIndexedBy(whitelist, 'symbol', chainName, provider);
};
