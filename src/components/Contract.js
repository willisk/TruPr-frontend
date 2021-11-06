import React from 'react';
import { useMemo, useEffect, useState, useContext } from 'react';
import { Stack, MenuItem, Button, InputAdornment } from '@mui/material';
import { DStack, DTextField, DTextFieldInfo, DDateTimePicker } from '../config/defaults';

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

import { ethers } from 'ethers';

import { Web3Context } from './Web3Connector';
import { TokenContext, WalletContext } from './WalletConnector';

import { PLATFORMS_TO_ID, ID_TO_PLATFORMS, oneWeek, DURATION_CHOICES } from '../config/config';
import { copyAddKeyValue } from '../config/utils';

// ================== Contract Infos ====================

export const ContractVitals = () => {
  console.log('rendering', 'vitals');

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
  console.log('rendering', 'Open');
  const [taskCount, setTaskCount] = useState(0);
  const [tasks, setTasks] = useState({});

  const { contract } = useContext(Web3Context);

  const handleTxError = (e) => {
    console.error(e);
  };

  const updateTaskCount = () => {
    contract.taskCount().then(setTaskCount).catch(handleTxError);
  };

  useMemo(() => {
    updateTaskCount();
    contract.on(contract.filters.TaskCreated(), updateTaskCount);
  }, []);

  useEffect(() => {
    for (let id = 0; id < taskCount; id++) {
      contract
        .getTask(id)
        .then((task) => {
          setTasks((tasks) =>
            copyAddKeyValue(tasks, id, {
              status: task[0],
              platform: task[1],
              sponsorAddress: task[2],
              promoterAddress: task[3],
              promoterUserId: task[4],
              tokenAddress: task[5],
              tokenAmount: task[6],
              startDate: task[7],
              endDate: task[8],
              minDuration: task[9],
              hash: task[10],
            })
          );
        })
        .catch(handleTxError);
    }
  }, [taskCount]);

  const tasksList = () =>
    Object.entries(tasks).map(([id, task]) => (
      <DStack key={id}>
        <h3>Task {id}</h3>
        <DTextFieldInfo label="Status" value={task.status} />
        <DTextFieldInfo label="Platform" value={task.platform} />
        <DTextFieldInfo label="Sponsor Address" value={task.sponsorAddress} />
        <DTextFieldInfo label="Promoter Address" value={task.promoterAddress} />
        <DTextFieldInfo label="Promoter User Id" value={task.promoterUserId} />
        <DTextFieldInfo label="Token Address" value={task.tokenAddress} />
        <DTextFieldInfo label="Token Amount" value={task.tokenAmount} />
        <DTextFieldInfo label="Start Date" value={task.startDate} />
        <DTextFieldInfo label="End Date" value={task.endDate} />
        <DTextFieldInfo label="Min Duration" value={task.minDuration} />
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
  console.log('rendering', 'Create');
  const [platform, setPlatform] = useState('0');
  const [promoterAddress, setPromoterAddress] = useState('');
  const [promoterUserId, setPromoterUserId] = useState('');
  // const [tokenAddress, setTokenAddress] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('MOCK');
  const [tokenAmount, setTokenAmount] = useState('0');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date().getTime() + oneWeek);
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
      .then(updateApprovals)
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
      minDuration: parseInt(minDuration / 1000).toString(),
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
        parseInt(minDuration / 1000).toString(),
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
          {Object.entries(PLATFORMS_TO_ID).map(([platformName, platformId]) => (
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
      .then(() => {
        updateBalances(tokenSymbol);
      })
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
