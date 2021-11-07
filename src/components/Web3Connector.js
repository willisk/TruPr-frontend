import { ethers } from 'ethers';
import { useState, createContext, useContext } from 'react';
import { Button } from '@mui/material';

import { getNetworkName } from '../config/chainIds';
import { A_VALID_CHAIN_ID, VALID_CHAIN_IDS, getContractAddress } from '../config/config';

const { abi: contractABI } = require('../contracts/PrivateEscrow.json');

const web3ProviderRinkeby = new ethers.providers.AlchemyWebSocketProvider(
  'rinkeby',
  process.env.REACT_APP_ALCHEMY_KEY_RINKEBY
);
const web3ProviderKovan = new ethers.providers.AlchemyWebSocketProvider(
  'kovan',
  process.env.REACT_APP_ALCHEMY_KEY_KOVAN
);

const getProvider = (chainName) => {
  if (chainName === 'rinkeby') return web3ProviderRinkeby;
  if (chainName === 'kovan') return web3ProviderKovan;
};

export const NetworkButton = () => {
  const { chainName } = useContext(Web3Context);
  return (
    <Button className="network-button" variant="outlined">
      {chainName}
    </Button>
  );
};

export const Web3Context = createContext({});

export const Web3Connector = ({ children }) => {
  const [chainId, setChainId] = useState(A_VALID_CHAIN_ID);

  const chainName = getNetworkName(chainId);
  const contractAddress = getContractAddress(chainName);
  const web3Provider = getProvider(chainName);

  const isValidChainId = VALID_CHAIN_IDS.includes(chainId);
  const contract = isValidChainId && new ethers.Contract(contractAddress, contractABI, web3Provider);

  window.contract = contract; // XXX: REMOVE THIS!!!!

  const context = {
    contract: contract,
    web3Provider: web3Provider,
    chainName: chainName,
    chainId: chainId,
    isValidChainId: isValidChainId,
    setChainId: setChainId,
  };

  return (
    <Web3Context.Provider value={context}>
      {!isValidChainId && (
        <div className="invalid-network-banner">
          Warning: connected to {chainName || 'unknown'} network. Please switch to {getNetworkName(A_VALID_CHAIN_ID)}{' '}
          network.
        </div>
      )}
      {children}
    </Web3Context.Provider>
  );
};
