import { ethers } from 'ethers';
import { reverseLookup } from './utils';

const { abi: ERC20ABI } = require('../contracts/ERC20.json');

// export const VALID_CHAIN_IDS = ['42', '4'];
export const VALID_CHAIN_IDS = ['42'];

const contractAddressKovan = '0xD4d728A30D2fd80De1eD4b5e743d1Da3d4C85fd3';
const mockToken1Kovan = '0x1225963012F98CB1bC938B6B194cC09498C4a4aA';
const mockToken2Kovan = '0xAB2A3c84dc7Be6fdD68A783e528dEf7A0Fc6F4C9';

const contractAddress = {
  rinkeby: '0xD22460D669B37b90fB5b1bC1855b2E43084CFb3D',
  kovan: contractAddressKovan,
};

const whitelist = [
  { address: { kovan: mockToken1Kovan }, name: 'MockToken', symbol: 'MOCK' },
  {
    address: { kovan: mockToken2Kovan },
    name: 'BananaToken',
    symbol: 'BANANA',
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
