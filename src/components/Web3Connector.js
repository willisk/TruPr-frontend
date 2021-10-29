import { ethers } from 'ethers';
import { useState, createContext } from 'react';

const contractABI = require('../Escrow.json').abi;
const validChainIds = JSON.parse(process.env.REACT_APP_VALID_CHAIN_IDS);

const contractAddressRinkeby = process.env.REACT_APP_CONTRACT_ADDRESS_RINKEBY;
const web3ProviderRinkeby = new ethers.providers.AlchemyWebSocketProvider(
  'rinkeby',
  process.env.REACT_APP_ALCHEMY_KEY_RINKEBY
);

export const Web3Context = createContext({
  contract: undefined,
  web3Provider: undefined,
  isValidChainId: undefined,
  setChainId: undefined,
});

export const Web3Provider = ({ children }) => {
  const [chainId, setChainId] = useState(4);

  const isValidChainId = validChainIds.includes(chainId);

  // if (chainId == '4')
  const contractAddress = contractAddressRinkeby;
  const web3Provider = web3ProviderRinkeby;

  const contract = new ethers.Contract(contractAddress, contractABI, web3Provider);

  const context = {
    contract: contract,
    web3Provider: web3Provider,
    isValidChainId: isValidChainId,
    setChainId: setChainId,
  };

  console.log('THIS SHOULDNT BE CALLED MORE THAN ONCE');

  return (
    <Web3Context.Provider value={context}>
      {!isValidChainId && (
        <div className="invalid-network-banner">Warning: Connected to unknown network.</div>
      )}
      {children}
    </Web3Context.Provider>
  );
};
