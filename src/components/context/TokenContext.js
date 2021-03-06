import './connector.css';
import { createContext, useMemo, useState, useContext, useCallback } from 'react';

import { ethers } from 'ethers';

import { Web3Context } from './Web3Context';
import { WalletContext } from './WalletContext';

import { getErc20TokenWhitelist, getWhitelistAddressToSymbol } from '../../config/config';
import { copyAddKeyValue } from '../../config/utils';

export const TokenContext = createContext({});

export const TokenConnector = ({ children }) => {
  // console.log('rendering', 'TokenConnector');
  const [tokenApprovals, setTokenApprovals] = useState({});
  const [tokenBalances, setTokenBalances] = useState({});

  const { contract, chainName, chainId, web3Provider } = useContext(Web3Context);
  const { walletAddress } = useContext(WalletContext);

  const tokenWhitelist = getErc20TokenWhitelist(chainName, web3Provider);
  const tokenWhitelistAddressToSymbol = getWhitelistAddressToSymbol(chainName);

  const updateApprovals = useCallback(
    (_symbol) => {
      if (!walletAddress) return;
      // console.log('calling updateApprovals');
      Object.entries(tokenWhitelist).forEach(([symbol, token]) => {
        if (!_symbol || _symbol === symbol) {
          token.contract.allowance(walletAddress, contract.address).then((allowance) => {
            const approved = allowance.toString() === ethers.constants.MaxUint256.toString();
            setTokenApprovals((approvals) => copyAddKeyValue(approvals, symbol, approved));
          });
        }
      });
    },
    [walletAddress, chainId]
  );

  const updateBalances = useCallback(
    (_symbol) => {
      if (!walletAddress) return;
      // console.log('calling updateBalances');
      Object.entries(tokenWhitelist).forEach(([symbol, token]) => {
        if (!_symbol || _symbol === symbol) {
          token.contract.balanceOf(walletAddress).then((balance) => {
            setTokenBalances((balances) => copyAddKeyValue(balances, symbol, balance));
          });
        }
      });
    },
    [walletAddress, chainId]
  );

  useMemo(() => {
    // console.log('calling init Token');
    updateApprovals();
    updateBalances();
  }, [walletAddress, updateApprovals, updateBalances]);

  const context = {
    tokenWhitelist: tokenWhitelist,
    tokenWhitelistAddressToSymbol: tokenWhitelistAddressToSymbol,
    tokenApprovals: tokenApprovals,
    tokenBalances: tokenBalances,
    updateApprovals: updateApprovals,
    updateBalances: updateBalances,
  };

  return <TokenContext.Provider value={context}>{children}</TokenContext.Provider>;
};
