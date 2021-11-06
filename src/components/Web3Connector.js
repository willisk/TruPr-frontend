import { ethers } from 'ethers';
import { useState, createContext, useContext } from 'react';
import { Snackbar, Button, Link } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

import { WalletContext } from './WalletConnector';
import { getNetworkName, getTransactionLink } from '../config/chainIds';

import { A_VALID_NETWORK, VALID_CHAIN_IDS, getContractAddress } from '../config/config';

const { abi: contractABI } = require('../contracts/PrivateEscrow.json');

const web3ProviderRinkeby = new ethers.providers.AlchemyWebSocketProvider(
  'rinkeby',
  process.env.REACT_APP_ALCHEMY_KEY_RINKEBY
);
const web3ProviderKovan = new ethers.providers.AlchemyWebSocketProvider(
  'kovan',
  process.env.REACT_APP_ALCHEMY_KEY_KOVAN
);

const getProvider = (networkName) => {
  if (networkName === 'rinkeby') return web3ProviderRinkeby;
  if (networkName === 'kovan') return web3ProviderKovan;
};

export const TransactionLink = ({ txHash, message }) => {
  const { network } = useContext(WalletContext);
  return (
    <Link href={getTransactionLink(txHash, network?.chainId)} target="_blank" rel="noreferrer">
      {message}
    </Link>
  );
};

export const NetworkButton = () => {
  const { networkName } = useContext(Web3Context);
  return (
    <Button className="network-button" variant="outlined">
      {networkName}
    </Button>
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

export const Web3Context = createContext({});

export const Web3Connector = ({ children }) => {
  const [chainId, setChainId] = useState(VALID_CHAIN_IDS[0]);
  const [alertState, setAlertState] = useState({
    open: false,
    message: '',
    severity: undefined,
  });

  const network = ethers.providers.getNetwork(chainId);
  const isValidChainId = VALID_CHAIN_IDS.includes(chainId);

  const networkName = getNetworkName(chainId);

  // XXX: memoize this
  const contractAddress = getContractAddress(networkName);
  const web3Provider = getProvider(networkName);

  const contract = new ethers.Contract(contractAddress, contractABI, web3Provider);

  window.contract = contract; // XXX: REMOVE THIS!!!!

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

  // const handleTx = async (tx) => {
  async function handleTx(tx) {
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
  }

  const context = {
    contract: contract,
    web3Provider: web3Provider,
    networkName: networkName,
    isValidChainId: isValidChainId,
    setChainId: setChainId,
    handleTx: handleTx,
    handleTxError: handleTxError,
  };

  return (
    <Web3Context.Provider value={context}>
      {!isValidChainId && (
        <div className="invalid-network-banner">
          Warning: connected to {network?.name} network. Please switch to {A_VALID_NETWORK.name} network.
        </div>
      )}
      {children}
      <Snackbar open={alertState.open} autoHideDuration={6000} onClose={handleAlertClose}>
        <MuiAlert onClose={handleAlertClose} severity={alertState.severity}>
          {alertState.message}
        </MuiAlert>
      </Snackbar>
    </Web3Context.Provider>
  );
};
