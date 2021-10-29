import React from 'react';
import { useMemo, useState, useContext } from 'react';
import {
  styled,
  MenuItem,
  Snackbar,
  Button,
  TextField,
  Stack,
  InputAdornment,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
// import Box from '@mui/material/Box';

import DateTimePicker from '@mui/lab/DateTimePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

import { ethers } from 'ethers';

import { Web3Context } from './Web3Connector';
import { WalletContext, TransactionLink } from './WalletConnector';
import { parse } from 'date-fns';

const PLATFORMS = {
  Twitter: 0,
  Instagram: 1,
};

const oneWeek = 7 * 24 * 60 * 60 * 1000;

const DURATION_CHOICES = {
  None: 0,
  'One Day': 1 * 24 * 60 * 60 * 1000,
  'Three Days': 7 * 24 * 60 * 60 * 1000,
  'One Week': 7 * 24 * 60 * 60 * 1000,
};

const StyledStack = styled(Stack)(({ theme }) => ({
  padding: '2em 1em',
  maxWidth: 600,
  margin: 'auto',
  textAlign: 'center',
}));

export const Web3Component = ({ children }) => {
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
      message: e.message,
      severity: 'error',
    });
  };

  const handleTxWrapper = (callback) => {
    return async (tx) => {
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
      callback();
    };
  };

  return (
    <div>
      {React.cloneElement(children, {
        handleTxError: handleTxError,
        handleTxWrapper: handleTxWrapper,
      })}
      <Snackbar open={alertState.open} autoHideDuration={6000} onClose={handleAlertClose}>
        <MuiAlert onClose={handleAlertClose} severity={alertState.severity}>
          {alertState.message}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export const ContractVitals = () => {
  const [contractOwner, setContractOwner] = useState('');
  const [contractBalance, setContractBalance] = useState(0);
  const [agreementCount, setAgreementCount] = useState(0);

  const { web3Provider, contract } = useContext(Web3Context);

  const handleTxError = (e) => {
    console.log(e);
  };

  useMemo(() => {
    contract.owner().then(setContractOwner).catch(handleTxError);
    contract.agreementCount().then(setAgreementCount).catch(handleTxError);
    web3Provider.getBalance(contract.address).then(setContractBalance).catch(handleTxError);
  }, []);

  return (
    <StyledStack spacing={2} sx={{ padding: '0 1em', maxWidth: '600px', margin: 'auto' }}>
      <details>
        <summary>Contract Infos</summary>
        <TextField
          label="Owner"
          variant="standard"
          value={contractOwner}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Balance"
          variant="standard"
          value={parseFloat(ethers.utils.formatEther(contractBalance)).toFixed(4)}
          InputProps={{
            readOnly: true,
            startAdornment: <InputAdornment position="start">Ξ</InputAdornment>,
          }}
        />
        <TextField
          label="agreementCount"
          variant="standard"
          value={agreementCount}
          InputProps={{ readOnly: true }}
        />
      </details>
    </StyledStack>
  );
};

export const CreateAgreement = ({ handleTxError, handleTxWrapper }) => {
  const [platform, setPlatform] = useState('0');
  const [promoterAddress, setPromoterAddress] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenAmount, setTokenAmount] = useState('0');
  const [startDate, setStartDate] = useState(new Date().getTime());
  const [endDate, setEndDate] = useState(new Date().getTime() + oneWeek);
  const [minDuration, setMinDuration] = useState(oneWeek);
  const [message, setMessage] = useState('');
  const [hash, setHash] = useState('');

  const { signContract } = useContext(WalletContext);

  const handleTx = handleTxWrapper(() => {});

  const updateMessage = (msg) => {
    setMessage(msg);
    setHash(ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['string'], [message])));
  };

  const isValidAgreement = () => {
    console.log(
      'platform',
      platform,
      'promoterAddress',
      promoterAddress,
      'tokenAddress',
      tokenAddress,
      'tokenAmount',
      tokenAmount,
      'startDate',
      startDate,
      'endDate',
      endDate,
      'minDuration',
      minDuration,
      'hash',
      hash
    );

    if (message === '') return false;
    if (tokenAmount === '0') return false;

    return true;
  };

  const isValidTokenAmount = (amount) => {
    if (isNaN(parseInt(amount))) return false;
    return true;
  };

  const parseTokenAmount = (amount) => {
    // if (isValidTokenAmount(amount))
    setTokenAmount(amount);
  };

  const createAgreement = () => {
    if (!isValidAgreement()) return;

    signContract
      .createAgreement(
        platform,
        promoterAddress,
        tokenAddress,
        tokenAmount,
        startDate,
        endDate,
        minDuration,
        hash
      )
      .then(handleTx)
      .catch(handleTxError);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <StyledStack spacing={2}>
        <h2>Create Agreement</h2>
        <TextField
          variant="standard"
          select
          label="Platform"
          value={platform}
          onChange={({ target }) => {
            setPlatform(target.value);
          }}
        >
          {Object.entries(PLATFORMS).map(([platformName, platformId]) => (
            <MenuItem value={platformId}>{platformName}</MenuItem>
          ))}
        </TextField>
        <TextField
          variant="standard"
          label="Promoter Address"
          value={promoterAddress}
          onChange={({ target }) => {
            setPromoterAddress(target.value);
          }}
        />
        <TextField
          variant="standard"
          label="Token Address"
          value={tokenAddress}
          onChange={({ target }) => {
            setTokenAddress(target.value);
          }}
        />
        <TextField
          error={!isValidTokenAmount(tokenAmount)}
          variant="standard"
          label="Token Amount"
          value={tokenAmount}
          onChange={({ target }) => {
            parseTokenAmount(target.value);
          }}
        />
        <DateTimePicker
          label="Promotion Start Date"
          value={endDate}
          onChange={({ target }) => {
            setStartDate(target.value);
          }}
          renderInput={(params) => <TextField {...params} />}
        />
        <DateTimePicker
          label="Promotion End Date"
          value={endDate}
          onChange={({ target }) => {
            setEndDate(target.value);
          }}
          renderInput={(params) => <TextField {...params} />}
        />
        <TextField
          select
          variant="standard"
          label="Minimum Persistence Duration"
          value={platform}
          onChange={({ target }) => {
            setMinDuration(target.value);
          }}
        >
          {Object.entries(DURATION_CHOICES).map(([choice, time]) => (
            <MenuItem value={time}>{choice}</MenuItem>
          ))}
        </TextField>
        <TextField
          multiline
          variant="standard"
          label="Exact Message"
          value={message}
          onChange={({ target }) => {
            updateMessage(target.value);
          }}
        />
        <TextField variant="standard" label="Message Hash" value={hash} disabled={true} />
        <Button variant="contained" onClick={createAgreement}>
          Create
        </Button>
      </StyledStack>
    </LocalizationProvider>
  );
};
