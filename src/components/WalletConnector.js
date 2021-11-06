import './styles/Connector.css';
import { createContext, useMemo, useEffect, useState, useContext } from 'react';
import { Snackbar, Button } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

import { ethers } from 'ethers';

import { Web3Context } from './Web3Connector';

import { getErc20TokenWhitelist } from '../config/config';
import { copyAddKeyValue } from '../config/utils';

function getProvider() {
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
}

export const WalletContext = createContext({
  network: undefined,
  walletAddress: '',
  walletProvider: undefined,
  isConnected: undefined,
  signContract: undefined,
  requestAccount: undefined,
});

export const WalletConnectButton = () => {
  const { walletAddress, requestAccount } = useContext(WalletContext);

  const addressInfo = walletAddress
    ? walletAddress.substring(0, 6) + '...' + walletAddress.substring(38)
    : 'Connect Wallet';

  return (
    <Button className="wallet-button" variant="outlined" onClick={requestAccount}>
      {addressInfo}
    </Button>
  );
};

export function WalletConnector({ children }) {
  const { contract, isValidChainId } = useContext(Web3Context);

  const [network, setNetwork] = useState(null);
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);
  const [signContract, setSignContract] = useState(null);

  const [alertState, setAlertState] = useState({
    open: false,
    message: '',
    severity: undefined,
  });

  const handleError = (e) => {
    setAlertState({
      open: true,
      message: e.message,
      severity: 'error',
    });
  };

  const updateAccounts = (accounts) => {
    if (accounts?.length > 0) setAddress(ethers.utils.getAddress(accounts?.[0]));
  };

  const requestAccount = (ctx) => {
    if (provider) {
      provider.send('eth_requestAccounts').then(updateAccounts).catch(handleError);
    } else {
      setAlertState({
        open: true,
        message: 'Please install Metamask',
        severity: 'error',
      });
    }
  };

  const addAccountListener = () => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        updateAccounts(accounts);
      });
    }
  };

  const addNetworkListener = () => {
    if (window.ethereum) {
      window.ethereum.on('networkChanged', (networkId) => {
        setProvider(getProvider());
      });
    }
  };

  useMemo(() => {
    setProvider(getProvider());
    addAccountListener();
    addNetworkListener();
  }, []);

  useEffect(() => {
    if (provider) {
      setSignContract(contract.connect(provider.getSigner()));
      provider.getNetwork().then(setNetwork).catch(handleError);
      provider.send('eth_accounts').then(updateAccounts).catch(handleError);
    }
  }, [provider]);

  const isConnected = address && isValidChainId;

  const context = {
    network: network,
    walletAddress: address,
    walletProvider: provider,
    isConnected: isConnected,
    signContract: signContract,
    requestAccount: requestAccount,
  };

  const handleAlertClose = (event, reason) => {
    if (reason !== 'clickaway') setAlertState({ ...alertState, open: false });
  };

  return (
    <WalletContext.Provider value={context}>
      <Snackbar open={alertState.open} autoHideDuration={6000} onClose={handleAlertClose}>
        <MuiAlert onClose={handleAlertClose} severity={alertState.severity}>
          {alertState.message}
        </MuiAlert>
      </Snackbar>
      {children}
    </WalletContext.Provider>
  );
}

export const TokenContext = createContext({});

export function TokenConnector({ children }) {
  const [tokenApprovals, setTokenApprovals] = useState({});
  const [tokenBalances, setTokenBalances] = useState({});

  const { contract, networkName, web3Provider } = useContext(Web3Context);
  const { walletAddress } = useContext(WalletContext);

  const tokenWhitelist = getErc20TokenWhitelist(networkName, web3Provider);

  const updateApprovals = (_symbol) => {
    if (!walletAddress) return;
    Object.entries(tokenWhitelist).forEach(([symbol, token]) => {
      //optional filter
      if (!_symbol || _symbol === symbol) {
        token.contract.allowance(walletAddress, contract.address).then((allowance) => {
          const approved = allowance.toString() === ethers.constants.MaxUint256.toString(); // XXX: why doesn't normal compare work
          setTokenApprovals((approvals) => copyAddKeyValue(approvals, symbol, approved));
        });
      }
    });
  };

  const updateBalances = (_symbol) => {
    console.log('called update');
    if (!walletAddress) return;
    Object.entries(tokenWhitelist).forEach(([symbol, token]) => {
      if (!_symbol || _symbol === symbol) {
        token.contract.balanceOf(walletAddress).then((balance) => {
          setTokenBalances((balances) => copyAddKeyValue(balances, symbol, balance));
        });
      }
    });
  };

  useMemo(() => {
    updateApprovals();
    updateBalances();
  }, []);

  const context = {
    tokenWhitelist: tokenWhitelist,
    tokenApprovals: tokenApprovals,
    tokenBalances: tokenBalances,
    updateApprovals: updateApprovals,
    updateBalances: updateBalances,
  };

  return <TokenContext.Provider value={context}>{children}</TokenContext.Provider>;
}
