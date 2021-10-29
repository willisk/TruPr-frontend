import React from 'react';
import { useMemo, useState, useContext } from 'react';
import { Snackbar, Button, TextField, Stack } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
// import Box from '@mui/material/Box';

import { ethers } from 'ethers';

import { web3Provider, contract } from './Web3Connector';
import { WalletContext, TransactionLink } from './WalletConnector';

const AdminPanel = () => {
  const [contractOwner, setContractOwner] = useState(null);

  const [saleIsActive, setSaleIsActive] = useState(false);
  const [contractBalance, setContractBalance] = useState(0);
  const [contractSymbol, setContractSymbol] = useState('');
  const [contractName, setContractName] = useState('');
  const [contractBaseURI, setContractBaseURI] = useState('');

  const [alertState, setAlertState] = useState({
    open: false,
    message: '',
    severity: undefined,
  });

  const { walletAddress, signContract, isConnected, network } = useContext(WalletContext);

  const isContractOwner =
    true ||
    (walletAddress && contractOwner && walletAddress.toLowerCase() === contractOwner.toLowerCase());

  const updateContractState = () => {
    contract.isActive().then(setSaleIsActive);
    contract.name().then(setContractName);
    contract.symbol().then(setContractSymbol);
    contract.baseURI().then(setContractBaseURI);
    web3Provider.getBalance(contract.address).then(setContractBalance);
  };

  const handleAlertClose = (event, reason) => {
    if (reason !== 'clickaway') setAlertState({ ...alertState, open: false });
  };

  const handleError = (e) => {
    setAlertState({
      open: true,
      message: e.message,
      severity: 'error',
    });
  };

  useMemo(() => {
    contract.owner().then(setContractOwner).catch(handleError);
    updateContractState();
  }, []);

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
    updateContractState();
  };

  return isContractOwner ? (
    <div className="adminPanel">
      <details>
        <summary>Admin Panel</summary>
        <h2>Contract Details</h2>
        <Stack spacing={2} sx={{ padding: '0 1em', maxWidth: '600px', margin: 'auto' }}>
          <TextField label="Address" variant="standard" value={contract.address} disabled={true} />
          <TextField label="Name" variant="standard" value={contractName} disabled={true} />
          <TextField label="Symbol" variant="standard" value={contractSymbol} disabled={true} />
          <TextField
            label="Sale State"
            variant="standard"
            value={saleIsActive ? 'live' : 'paused'}
            disabled={true}
            InputProps={{
              endAdornment: (
                <Button
                  onClick={() =>
                    signContract.setSaleState(!saleIsActive).then(handleTx).catch(handleError)
                  }
                  disabled={!isConnected}
                  variant="contained"
                >
                  {saleIsActive ? 'pause' : 'activate'}
                </Button>
              ),
            }}
          />
          <TextField
            label="Balance"
            variant="standard"
            value={' Ξ ' + parseFloat(ethers.utils.formatEther(contractBalance)).toFixed(4)}
            disabled={true}
            InputProps={{
              endAdornment: (
                <Button
                  variant="contained"
                  onClick={() =>
                    signContract.withdrawContractBalance().then(handleTx).catch(handleError)
                  }
                  disabled={!isConnected}
                >
                  withdraw
                </Button>
              ),
            }}
          />
          <TextField
            label="Base URI"
            variant="standard"
            value={contractBaseURI}
            onChange={(event) => setContractBaseURI(event.target.value)}
            InputProps={{
              endAdornment: (
                <Button
                  onClick={() =>
                    signContract.setBaseURI(contractBaseURI).then(handleTx).catch(handleError)
                  }
                  disabled={!isConnected}
                  variant="contained"
                >
                  set
                </Button>
              ),
            }}
          />
        </Stack>
      </details>
      <Snackbar open={alertState.open} autoHideDuration={6000} onClose={handleAlertClose}>
        <MuiAlert onClose={handleAlertClose} severity={alertState.severity}>
          {alertState.message}
        </MuiAlert>
      </Snackbar>
    </div>
  ) : (
    <div />
  );
};
export default AdminPanel;
