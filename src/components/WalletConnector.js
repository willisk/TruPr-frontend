import './styles/Connector.css';
import { createContext, useMemo, useEffect, useState, useContext, useCallback } from 'react';
import { Snackbar, Button, Link } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

import { ethers } from 'ethers';

import { Web3Context } from './Web3Connector';
import { getNetworkName, getTransactionLink } from '../config/chainIds';

import { getErc20TokenWhitelist } from '../config/config';
import { copyAddKeyValue } from '../config/utils';

function getProvider() {
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
}

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

export const TransactionLink = ({ txHash, message }) => {
  const { chainId } = useContext(Web3Context);
  return (
    <Link href={getTransactionLink(txHash, chainId)} target="_blank" rel="noreferrer">
      {message}
    </Link>
  );
};

const parseTxError = (e) => {
  // console.error('error', e);
  try {
    return JSON.parse(/\(error=(.+), method.+\)/g.exec(e.message)[1]).message;
  } catch (error) {
    return e?.message;
  }
};

export const WalletContext = createContext({
  walletAddress: '',
  walletProvider: undefined,
  isConnected: undefined,
  signContract: undefined,
  requestAccount: undefined,
});

export function WalletConnector({ children }) {
  const { contract, isValidChainId, setChainId } = useContext(Web3Context);

  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);
  const [signContract, setSignContract] = useState(null);

  const [alertState, setAlertState] = useState({
    open: false,
    message: '',
    severity: undefined,
  });

  const handleAlertClose = (event, reason) => {
    if (reason !== 'clickaway') setAlertState({ ...alertState, open: false });
  };

  const handleTxError = (e) => {
    setAlertState({
      open: true,
      message: parseTxError(e),
      severity: 'error',
    });
  };

  const handleTx = async (tx) => {
    setAlertState({
      open: true,
      message: <TransactionLink txHash={tx.hash} message="Processing Transaction" />,
      severity: 'info',
    });
    const { transactionHash } = await tx.wait();
    setAlertState({
      open: true,
      message: <TransactionLink txHash={transactionHash} message="Transaction successful!" />,
      severity: 'success',
    });
    return tx;
  };

  const updateAccounts = (accounts) => {
    if (accounts?.length > 0) setAddress(ethers.utils.getAddress(accounts?.[0]));
  };

  const requestAccount = (ctx) => {
    if (provider) {
      provider.send('eth_requestAccounts').then(updateAccounts).catch(handleTxError);
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
        // setProvider(getProvider());
        setChainId(networkId.toString());
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
      provider
        .getNetwork()
        .then((network) => setChainId(network?.chainId?.toString()))
        .catch(handleTxError);
      provider.send('eth_accounts').then(updateAccounts).catch(handleTxError);
    }
  }, [provider]);

  const isConnected = address && isValidChainId;

  const context = {
    walletAddress: address,
    walletProvider: provider,
    isConnected: isConnected,
    signContract: signContract,
    requestAccount: requestAccount,
    handleTx: handleTx,
    handleTxError: handleTxError,
  };

  return (
    <WalletContext.Provider value={context}>
      {children}
      <Snackbar open={alertState.open} autoHideDuration={6000} onClose={handleAlertClose}>
        <MuiAlert onClose={handleAlertClose} severity={alertState.severity}>
          {alertState.message}
        </MuiAlert>
      </Snackbar>
    </WalletContext.Provider>
  );
}

export const TokenContext = createContext({});

export function TokenConnector({ children }) {
  const [tokenApprovals, setTokenApprovals] = useState({});
  const [tokenBalances, setTokenBalances] = useState({});

  const { contract, networkName, web3Provider, isValidChainId } = useContext(Web3Context);
  const { walletAddress } = useContext(WalletContext);

  const tokenWhitelist = isValidChainId && getErc20TokenWhitelist(networkName, web3Provider);

  const updateApprovals = useCallback(
    (_symbol) => {
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
    },
    [walletAddress]
  );

  const updateBalances = useCallback(
    (_symbol) => {
      console.log('called update');
      if (!walletAddress) return;
      Object.entries(tokenWhitelist).forEach(([symbol, token]) => {
        if (!_symbol || _symbol === symbol) {
          token.contract.balanceOf(walletAddress).then((balance) => {
            setTokenBalances((balances) => copyAddKeyValue(balances, symbol, balance));
          });
        }
      });
    },
    [walletAddress]
  );

  useMemo(() => {
    console.log('calling init Token');
    updateApprovals();
    updateBalances();
  }, [walletAddress]);

  const context = {
    tokenWhitelist: tokenWhitelist,
    tokenApprovals: tokenApprovals,
    tokenBalances: tokenBalances,
    updateApprovals: updateApprovals,
    updateBalances: updateBalances,
  };

  return <TokenContext.Provider value={context}>{children}</TokenContext.Provider>;
}
