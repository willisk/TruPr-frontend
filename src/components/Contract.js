import React from 'react';
import { useMemo, useEffect, useState, useContext } from 'react';
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

const PLATFORMS_TO_ID = {
  Twitter: 0,
  Instagram: 1,
};

const ID_TO_PLATFORMS = {
  0: 'Twitter',
  1: 'Instagram',
};

const oneWeek = 7 * 24 * 60 * 60 * 1000;

const DURATION_CHOICES = {
  None: 0,
  'One Day': 1 * 24 * 60 * 60 * 1000,
  'Three Days': 3 * 24 * 60 * 60 * 1000,
  'One Week': 1 * 7 * 24 * 60 * 60 * 1000,
  'Two Weeks': 2 * 7 * 24 * 60 * 60 * 1000,
};

const StyledStack = styled(Stack)(({ theme }) => ({
  padding: '2em 1em',
  maxWidth: 600,
  margin: 'auto',
  textAlign: 'center',
}));

const SStack = (props) => <StyledStack spacing={2} {...props} />;
const STextField = (props) => <TextField variant="outlined" {...props} />;
const STextFieldInfo = (props) => <STextField InputProps={{ readOnly: true }} {...props} />;
const SDateTimePicker = ({ error, helperText, ...props }) => (
  <DateTimePicker
    {...props}
    renderInput={(params) => <STextField {...params} error={error} helperText={helperText} />}
  />
);

const parseError = (e) => {
  // console.error(e);
  try {
    return JSON.parse(/\(error\=(.+), method.+\)/g.exec(e.message)[1]).message;
  } catch (error) {
    return e?.message;
  }
};
export const web3Component = (WrappedComponent) => {
  return (props) => {
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
        message: parseError(e),
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
        <WrappedComponent
          handleTxError={handleTxError}
          handleTxWrapper={handleTxWrapper}
          {...props}
        />
        <Snackbar open={alertState.open} autoHideDuration={6000} onClose={handleAlertClose}>
          <MuiAlert onClose={handleAlertClose} severity={alertState.severity}>
            {alertState.message}
          </MuiAlert>
        </Snackbar>
      </div>
    );
  };
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
    <details>
      <summary>Contract Infos</summary>
      <SStack>
        <STextFieldInfo label="Address" value={contract?.address} />
        <STextFieldInfo label="Owner" value={contractOwner} />
        <STextFieldInfo
          label="Balance"
          value={parseFloat(ethers.utils.formatEther(contractBalance)).toFixed(4)}
          InputProps={{
            startAdornment: <InputAdornment position="start">Ξ</InputAdornment>,
          }}
        />
        <STextFieldInfo label="agreementCount" value={agreementCount} />
      </SStack>
    </details>
  );
};

export const HistoricalAgreements = () => {
  const [agreementCount, setAgreementCount] = useState(0);
  const [agreements, setAgreements] = useState({});

  const { contract } = useContext(Web3Context);

  const handleTxError = (e) => {
    console.error(e);
  };

  const updateAgreementCount = () => {
    contract.agreementCount().then(setAgreementCount).catch(handleTxError);
  };

  useMemo(() => {
    updateAgreementCount();
    contract.on(contract.filters.AgreementCreated(), updateAgreementCount);
  }, []);

  useEffect(() => {
    for (let id = 0; id < agreementCount; id++) {
      contract
        .getAgreement(id)
        .then((agreement) => {
          setAgreements((agreements) => {
            var agreementState = { ...agreements };
            agreementState[id] = {
              platform: agreement[0],
              isAgreement: agreement[1],
              sponsorAddress: agreement[2],
              promoterAddress: agreement[3],
              tokenAddress: agreement[4],
              tokenAmount: agreement[5],
              startDate: agreement[6],
              endDate: agreement[7],
              minDuration: agreement[8],
              hash: agreement[9],
            };
            return agreementState;
          });
        })
        .catch(handleTxError);
    }
  }, [agreementCount]);

  const agreementsList = () =>
    Object.entries(agreements).map(([id, agreement]) => (
      <SStack key={id}>
        <h3>id {id}</h3>
        <STextFieldInfo label="Platform" value={agreement.platform} />
        <STextFieldInfo label="Valid" value={agreement.isAgreement} />
        <STextFieldInfo label="Sponsor Address" value={agreement.sponsorAddress} />
        <STextFieldInfo label="Promoter Address" value={agreement.promoterAddress} />
        <STextFieldInfo label="Token Address" value={agreement.tokenAddress} />
        <STextFieldInfo label="Token Amount" value={agreement.tokenAmount} />
        <STextFieldInfo label="Start Date" value={agreement.startDate} />
        <STextFieldInfo label="End Date" value={agreement.endDate} />
        <STextFieldInfo label="Min Duration" value={agreement.minDuration} />
        <STextFieldInfo label="Hash" value={agreement.hash} />
      </SStack>
    ));

  return (
    <SStack>
      <h2>Historical Agreements {agreementCount.toString()}</h2>
      {agreementsList()}
    </SStack>
  );
};

export const CreateAgreement = web3Component(({ handleTxError, handleTxWrapper }) => {
  const [platform, setPlatform] = useState('0');
  const [promoterAddress, setPromoterAddress] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenAmount, setTokenAmount] = useState('0');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date().getTime() + oneWeek);
  const [minDuration, setMinDuration] = useState(oneWeek);
  const [message, setMessage] = useState('');
  const [hash, setHash] = useState('');

  const [touched, setTouched] = useState({});
  const isTouched = (key) => Object.keys(touched).includes(key);

  const { signContract } = useContext(WalletContext);

  const handleTx = handleTxWrapper(() => {});

  const updateMessage = (msg) => {
    setMessage(msg);
    setHash(ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['string'], [message])));
  };

  const isValidTokenAmount = () => {
    const amt = parseInt(tokenAmount);
    if (isNaN(amt)) return false;
    if (amt <= 0) return false;
    return true;
  };

  const isValidAddress = (address) => {
    try {
      ethers.utils.defaultAbiCoder.encode(['address'], [address]);
      return true;
    } catch (e) {
      return false;
    }
  };

  const isValidMessage = () => {
    return message !== '';
  };

  const isValidStartDate = () => {
    return new Date() <= startDate;
  };

  const isValidEndDate = () => {
    return startDate <= endDate;
  };

  const isValidAgreement = () => {
    return (
      isValidAddress(promoterAddress) &&
      isValidAddress(tokenAddress) &&
      isValidTokenAmount() &&
      isValidStartDate() &&
      isValidEndDate() &&
      isValidMessage()
    );
  };

  const createAgreement = () => {
    console.log('creating agreement');
    console.log({
      platform: platform,
      promoterAddress: promoterAddress,
      tokenAddress: tokenAddress,
      tokenAmount: tokenAmount,
      startDate: startDate,
      endDate: endDate,
      minDuration: minDuration,
      hash: hash,
    });

    signContract
      .createAgreement(
        platform,
        promoterAddress,
        tokenAddress,
        tokenAmount,
        parseInt(startDate / 1000),
        parseInt(endDate / 1000),
        parseInt(minDuration / 1000),
        hash
      )
      .then(handleTx)
      .catch(handleTxError);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <SStack>
        <h2>Create Agreement</h2>
        <STextField
          select
          label="Platform"
          value={platform}
          onChange={({ target }) => {
            setPlatform(target.value);
          }}
        >
          {Object.entries(PLATFORMS_TO_ID).map(([platformName, platformId]) => (
            <MenuItem key={platformId} value={platformId}>
              {platformName}
            </MenuItem>
          ))}
        </STextField>
        <STextField
          label="Promoter Address"
          value={promoterAddress}
          error={!isValidAddress(promoterAddress) && isTouched('promoterAddress')}
          helperText={
            !isValidAddress(promoterAddress) &&
            isTouched('promoterAddress') &&
            'Enter a valid address'
          }
          onChange={({ target }) => {
            setTouched({ ...touched, promoterAddress: true });
            setPromoterAddress(target.value);
          }}
        />
        <STextField
          label="Token Address"
          value={tokenAddress}
          error={!isValidAddress(tokenAddress) && isTouched('tokenAddress')}
          helperText={
            !isValidAddress(tokenAddress) && isTouched('tokenAddress') && 'Enter a valid address'
          }
          onChange={({ target }) => {
            setTouched({ ...touched, tokenAddress: true });
            setTokenAddress(target.value);
          }}
        />
        <STextField
          label="Token Amount"
          value={tokenAmount}
          error={!isValidTokenAmount() && isTouched('tokenAmount')}
          helperText={!isValidTokenAmount() && isTouched('tokenAmount') && 'Enter a valid amount'}
          onChange={({ target }) => {
            setTouched({ ...touched, tokenAmount: true });
            setTokenAmount(target.value);
          }}
        />
        <SDateTimePicker
          label="Promotion Start Date"
          value={startDate}
          onChange={(newDate) => {
            setTouched({ ...touched, startDate: true });
            setStartDate(newDate);
          }}
          error={!isValidStartDate() && isTouched('startDate')}
          helperText={
            !isValidStartDate() && isTouched('startDate') && "Start date can't lie in the past"
          }
        />
        <SDateTimePicker
          label="Promotion End Date"
          value={endDate}
          error={!isValidEndDate() && isTouched('endDate')}
          helperText={
            !isValidAddress(tokenAddress) && isTouched('tokenAddress') && 'Enter a valid amount'
          }
          onChange={(newDate) => {
            setTouched({ ...touched, endDate: true });
            setEndDate(newDate);
          }}
          error={!isValidEndDate() && isTouched('endDate')}
          helperText={
            !isValidEndDate() && isTouched('endDate') && 'End date must be after start date'
          }
        />
        <STextField
          select
          label="Minimum Persistence Duration"
          value={platform}
          onChange={({ target }) => {
            setMinDuration(target.value);
          }}
        >
          {Object.entries(DURATION_CHOICES).map(([choice, time]) => (
            <MenuItem key={time} value={time}>
              {choice}
            </MenuItem>
          ))}
        </STextField>
        <STextField
          multiline
          label="Exact Message"
          value={message}
          error={!isValidMessage() && isTouched('message')}
          helperText={!isValidMessage() && isTouched('message') && 'Enter a valid message'}
          onChange={({ target }) => {
            setTouched({ ...touched, message: true });
            updateMessage(target.value);
          }}
        />
        <STextFieldInfo label="Message Hash" value={hash} disabled={true} />
        <Button disabled={!isValidAgreement()} variant="contained" onClick={createAgreement}>
          Create
        </Button>
      </SStack>
    </LocalizationProvider>
  );
});
