import React from 'react';
import { useMemo, useEffect, useState, useContext } from 'react';
import { Stack, MenuItem, Button, InputAdornment, LinearProgress, Chip } from '@mui/material';
import { DStack, DTextField, DTextFieldInfo, DDateTimePicker } from '../config/defaults';

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

import { ethers } from 'ethers';

import { Web3Context } from './Web3Connector';
import { TokenContext, WalletContext } from './WalletConnector';

import { PLATFORM_TO_ID, ID_TO_PLATFORM, ID_TO_STATUS, oneWeek, DURATION_CHOICES, parseTask } from '../config/config';
import { formatDuration } from '../config/utils';

// ================== Contract Infos ====================

export const ContractVitals = () => {
  // console.log('rendering', 'vitals');

  const [contractOwner, setContractOwner] = useState('');
  const [contractBalance, setContractBalance] = useState(0);
  const [taskCount, setTaskCount] = useState(0);

  const { web3Provider, contract } = useContext(Web3Context);

  const handleTxError = (e) => {
    console.error(e);
  };

  useMemo(() => {
    contract.owner().then(setContractOwner).catch(handleTxError);
    contract.taskCount().then(setTaskCount).catch(handleTxError);
    web3Provider.getBalance(contract.address).then(setContractBalance).catch(handleTxError);
  }, []);

  return (
    <DStack>
      <h2>Contract Infos</h2>
      <DTextFieldInfo label="Address" value={contract?.address} />
      <DTextFieldInfo label="Owner" value={contractOwner} />
      <DTextFieldInfo
        label="Balance"
        value={parseFloat(ethers.utils.formatEther(contractBalance)).toFixed(4)}
        InputProps={{
          startAdornment: <InputAdornment position="start">Ξ</InputAdornment>,
        }}
      />
      <DTextFieldInfo label="Task Count" value={taskCount} />
    </DStack>
  );
};

// ================== Open Tasks ====================

export const OpenTasks = () => {
  // console.log('rendering', 'Open');
  const [taskCount, setTaskCount] = useState(0);
  const [tasks, setTasks] = useState({});

  const { contract } = useContext(Web3Context);
  const { tokenWhitelistAddressToSymbol } = useContext(TokenContext);

  const updateTaskCount = () => {
    contract.taskCount().then(setTaskCount).catch(console.error);
  };

  useMemo(() => {
    updateTaskCount();
    contract.on(contract.filters.TaskCreated(), updateTaskCount);
  }, []);

  useEffect(() => {
    contract
      .getAllTasks()
      .then((tasks) => tasks.map(parseTask))
      .then(setTasks)
      .catch(console.error);
  }, [taskCount]);


  function dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  
    return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
  }

  const tasksList = () =>
    Object.entries(tasks).map(([id, task]) => (
      <DStack key={id}>
        <h3 style={{textAlign: 'left', marginTop: '0'}}>Task {id}</h3>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <Chip label={ID_TO_STATUS[task.status]} color="primary" style={{maxWidth: '70px', width: '100%', background: 'rgb(102 187 106)'}} />
          <span style={{marginTop: 'auto'}}>{dateDiffInDays(new Date(task.startDate * 1000), new Date(task.endDate * 1000))} days left</span>
        </div>
        <LinearProgress variant="determinate" value={Math.round(((new Date() - new Date(task.startDate * 1000)) / (new Date(task.endDate * 1000) - new Date(task.startDate * 1000))) * 100)} />
        <div style={{display: 'flex', marginTop: '35px', justifyContent: 'space-evenly'}}>
          <DTextFieldInfo style={{width: '50%'}} label="Token" value={tokenWhitelistAddressToSymbol[task.tokenAddress]} />
          <DTextFieldInfo style={{width: '50%'}} label="Token Amount" value={task.tokenAmount} />
        </div>
        <div style={{textAlign: 'left'}}>
        <h4>Description</h4>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas et rutrum mi. Vestibulum aliquam bibendum sodales. Donec faucibus malesuada magna vitae mattis. Nulla pharetra ultrices faucibus. Proin quis enim non purus pretium fermentum. Praesent ac elit tristique, suscipit dolor et, mattis ex. Nam in pharetra tellus. Nullam laoreet nibh non efficitur volutpat. Donec sodales est vitae dolor elementum, nec ultricies ante fringilla. Sed vitae egestas tortor, eu vehicula nunc. Aliquam erat volutpat. Suspendisse eu arcu mauris. Sed hendrerit ultricies porttitor.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas et rutrum mi. Vestibulum aliquam bibendum sodales. Donec faucibus malesuada magna vitae mattis. Nulla pharetra ultrices faucibus. Proin quis enim non purus pretium fermentum. Praesent ac elit tristique, suscipit dolor et, mattis ex. Nam in pharetra tellus. Nullam laoreet nibh non efficitur volutpat. Donec sodales est vitae dolor elementum, nec ultricies ante fringilla. Sed vitae egestas tortor, eu vehicula nunc. Aliquam erat volutpat. Suspendisse eu arcu mauris. Sed hendrerit ultricies porttitor.</p>
        </div>
        <DTextFieldInfo label="Status" value={ID_TO_STATUS[task.status]} />
        <DTextFieldInfo label="Platform" value={ID_TO_PLATFORM[task.platform]} />
        <DTextFieldInfo label="Sponsor Address" value={task.sponsorAddress} />
        <DTextFieldInfo label="Promoter Address" value={task.promoterAddress} />
        <DTextFieldInfo label="Promoter User Id" value={task.promoterUserId} />
        <DTextFieldInfo label="Start Date" value={new Date(task.startDate * 1000).toString()} />
        <DTextFieldInfo label="End Date" value={new Date(task.endDate * 1000).toString()} />
        <DTextFieldInfo label="Min Duration" value={formatDuration(task.minDuration)} />
        <DTextFieldInfo label="Hash" value={task.hash} />
      </DStack>
    ));

  return (
    <DStack>
      <h2>Open Tasks</h2>
      {tasksList()}
    </DStack>
  );
};

// ================== Create Task ====================

export const CreateTask = () => {
  // console.log('rendering', 'Create')
  const [platform, setPlatform] = useState('0');
  const [promoterAddress, setPromoterAddress] = useState('');
  const [promoterUserId, setPromoterUserId] = useState('');
  // const [tokenAddress, setTokenAddress] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('MOCK');
  const [tokenAmount, setTokenAmount] = useState('0');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date().getTime() + DURATION_CHOICES['One Week'] * 1000);
  const [minDuration, setMinDuration] = useState(0);
  const [message, setMessage] = useState('');
  const [hash, setHash] = useState('');

  const [touched, setTouched] = useState({});
  const isTouched = (key) => Object.keys(touched).includes(key);

  const { tokenWhitelist, tokenApprovals, tokenBalances, updateApprovals } = useContext(TokenContext);
  const { handleTx, handleTxError, walletAddress, signContract, walletProvider } = useContext(WalletContext);
  const { contract } = useContext(Web3Context);

  // const handleTx = handleTxWrapper(() => {});
  const token = tokenWhitelist[tokenSymbol];

  const updateMessage = (msg) => {
    setMessage(msg);
    let _hash = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['string'], [msg.trim()]));
    setHash(_hash);
    // console.log('setting msg', msg, '\n', _hash);
  };

  // parsing functions

  const isPositiveInt = (amt) => {
    const parsedAmt = parseInt(amt);
    return parsedAmt.toString() == amt && !isNaN(parsedAmt) && parsedAmt > 0;
  };

  const isValidAddress = (address) => {
    try {
      ethers.utils.defaultAbiCoder.encode(['address'], [address]);
      return true;
    } catch (e) {
      return false;
    }
  };

  // const checkIsTokenApproved = useEffect(() => {
  //   if (isValidAddress(tokenAddress)) {
  //   }
  // });

  const isValidMessage = (msg) => {
    return msg !== '';
  };

  const isValidStartDate = () => {
    return new Date() <= startDate;
  };

  const isValidEndDate = () => {
    return startDate <= endDate;
  };

  const isValidTokenAmount = () => {
    return tokenAmount < tokenBalances[tokenSymbol];
  };

  const isValidTask = () => {
    return (
      isValidAddress(promoterAddress) &&
      isPositiveInt(promoterUserId) &&
      // isValidAddress(tokenAddress) &&
      isPositiveInt(tokenAmount) &&
      // isValidStartDate() &&
      isValidEndDate() &&
      isValidMessage(message)
    );
  };

  const approveToken = () => {
    console.log('sending approve tx');
    token.contract
      .connect(walletProvider.getSigner())
      .approve(contract.address, ethers.constants.MaxUint256)
      .then(handleTx)
      .then(() => updateApprovals(tokenSymbol))
      .catch(handleTxError);
  };

  const createTask = () => {
    console.log('creating task');
    console.log({
      platform: platform,
      promoterAddress: promoterAddress,
      promoterUserId: promoterUserId,
      tokenAddress: token.address,
      tokenAmount: tokenAmount,
      startDate: parseInt(startDate / 1000).toString(),
      endDate: parseInt(endDate / 1000).toString(),
      minDuration: minDuration.toString(),
      hash: hash,
    });

    signContract
      .createTask(
        platform,
        promoterAddress,
        promoterUserId,
        token.address,
        tokenAmount,
        parseInt(startDate / 1000).toString(),
        parseInt(endDate / 1000).toString(),
        minDuration.toString(),
        hash
      )
      .then(handleTx)
      .catch(handleTxError);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DStack>
        <h2>Create Task</h2>
        <DTextField
          select
          label="Platform"
          value={platform}
          onChange={({ target }) => {
            setPlatform(target.value);
          }}
        >
          {Object.entries(PLATFORM_TO_ID).map(([platformName, platformId]) => (
            <MenuItem key={platformId} value={platformId}>
              {platformName}
            </MenuItem>
          ))}
        </DTextField>
        <DTextField
          label="Promoter Address"
          value={promoterAddress}
          error={isTouched('promoterAddress') && !isValidAddress(promoterAddress)}
          helperText={isTouched('promoterAddress') && !isValidAddress(promoterAddress) && 'Enter a valid address'}
          onChange={({ target }) => {
            setTouched({ ...touched, promoterAddress: true });
            setPromoterAddress(target.value);
          }}
        />
        <DTextField
          label="Promoter User Id"
          value={promoterUserId}
          error={isTouched('promoterUserId') && !isPositiveInt(promoterUserId)}
          helperText={isTouched('promoterUserId') && !isPositiveInt(promoterUserId) && 'Enter a valid User Id'}
          onChange={({ target }) => {
            setTouched({ ...touched, promoterUserId: true });
            setPromoterUserId(target.value);
          }}
        />
        <DTextField
          select
          label="Token"
          value={tokenSymbol}
          onChange={({ target }) => {
            setTokenSymbol(target.value);
          }}
        >
          {Object.entries(tokenWhitelist).map(([symbol, _token]) => (
            <MenuItem key={symbol} value={symbol}>
              {symbol + ' (balance: ' + tokenBalances[symbol] + ')'}
            </MenuItem>
          ))}
        </DTextField>
        <DTextField
          label="Token Amount"
          value={tokenAmount}
          error={isTouched('tokenAmount') && (!isPositiveInt(tokenAmount) || !isValidTokenAmount())}
          helperText={
            isTouched('tokenAmount') &&
            ((!isPositiveInt(tokenAmount) && 'Enter a valid amount') ||
              (!isValidTokenAmount() && 'Amount exceeds balance'))
          }
          onChange={({ target }) => {
            setTouched({ ...touched, tokenAmount: true });
            setTokenAmount(target.value);
          }}
        />
        <DDateTimePicker
          label="Promotion Start Date"
          value={startDate}
          onChange={(newDate) => {
            setTouched({ ...touched, startDate: true });
            setStartDate(newDate);
          }}
          error={isTouched('startDate') && !isValidStartDate()}
          helperText={isTouched('startDate') && !isValidStartDate() && 'Start date is in the past'}
        />
        <DDateTimePicker
          label="Promotion End Date"
          value={endDate}
          onChange={(newDate) => {
            setTouched({ ...touched, endDate: true });
            setEndDate(newDate);
          }}
          error={isTouched('endDate') && !isValidEndDate()}
          helperText={isTouched('endDate') && !isValidEndDate() && 'End date must be after start date'}
        />
        <DTextField
          select
          label="Minimum Persistence Duration"
          value={minDuration}
          onChange={({ target }) => {
            setMinDuration(target.value);
          }}
        >
          {Object.entries(DURATION_CHOICES).map(([choice, time]) => (
            <MenuItem key={time} value={time}>
              {choice}
            </MenuItem>
          ))}
        </DTextField>
        <DTextField
          multiline
          label="Exact Message"
          value={message}
          error={isTouched('message') && !isValidMessage(message)}
          helperText={isTouched('message') && !isValidMessage(message) && 'Enter a valid message'}
          onChange={({ target }) => {
            setTouched({ ...touched, message: true });
            updateMessage(target.value);
          }}
        />
        <DTextFieldInfo label="Message Hash" value={hash} disabled={true} />
        <Stack>
          {!tokenApprovals[tokenSymbol] && (
            <Button variant="contained" onClick={approveToken}>
              Approve Token
            </Button>
          )}

          <Button disabled={!isValidTask() || !tokenApprovals[tokenSymbol]} variant="contained" onClick={createTask}>
            Create
          </Button>
        </Stack>
      </DStack>
      <DevTools />
    </LocalizationProvider>
  );
};

// ================== Dev Tools ====================

const mockMintInterface = [
  'function mint(uint256 amount) public',
  'function mintFor(address for, uint256 amount) public',
];

export const DevTools = () => {
  const [tokenSymbol, setTokenSymbol] = useState('MOCK');

  const { tokenWhitelist, tokenBalances, updateBalances } = useContext(TokenContext);
  const { handleTxError, handleTx, walletAddress, walletProvider } = useContext(WalletContext);

  const token = tokenWhitelist[tokenSymbol];

  const mint = () => {
    const contract = new ethers.Contract(token.address, mockMintInterface);
    contract
      .connect(walletProvider.getSigner())
      .mint('1000')
      .then(handleTx)
      .then(() => updateBalances(tokenSymbol))
      .catch(handleTxError);
  };

  return (
    <DStack>
      <h2>// Dev Tools</h2>
      <DTextField
        select
        label="Token"
        value={tokenSymbol}
        onChange={({ target }) => {
          setTokenSymbol(target.value);
        }}
      >
        {Object.entries(tokenWhitelist).map(([symbol, _token]) => (
          <MenuItem key={symbol} value={symbol}>
            {symbol + ' (balance: ' + tokenBalances[symbol] + ')'}
          </MenuItem>
        ))}
      </DTextField>
      <Button variant="contained" onClick={mint}>
        Mint 1000
      </Button>
    </DStack>
  );
};
