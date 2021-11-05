import React from 'react';
import { useMemo, useEffect, useState, useContext } from 'react';
import { MenuItem, Button, InputAdornment } from '@mui/material';
import {} from '@mui/material';
import { DStack, DTextField, DTextFieldInfo, DDateTimePicker } from './defaults';

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

import { ethers } from 'ethers';

import { Web3Context } from './Web3Connector';
import { WalletContext } from './WalletConnector';

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

export const ContractVitals = () => {
  const [contractOwner, setContractOwner] = useState('');
  const [contractBalance, setContractBalance] = useState(0);
  const [taskCount, setTaskCount] = useState(0);

  const { web3Provider, contract } = useContext(Web3Context);

  const handleTxError = (e) => {
    console.log(e);
  };

  useMemo(() => {
    console.log('rendering', 'vitals');

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

export const OpenTasks = () => {
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
    console.log('rendering', 'Open');
    updateTaskCount();
    contract.on(contract.filters.TaskCreated(), updateTaskCount);
  }, []);

  useEffect(() => {
    for (let id = 0; id < taskCount; id++) {
      contract
        .getTask(id)
        .then((task) => {
          setTasks((tasks) => {
            var taskState = { ...tasks };
            taskState[id] = {
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
            };
            return taskState;
          });
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

export const CreateTask = () => {
  useMemo(() => {
    console.log('rendering', 'Create');
  }, []);
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
  const { handleTxError, handleTxWrapper } = useContext(Web3Context);

  const handleTx = handleTxWrapper(() => {});

  const updateMessage = (msg) => {
    setMessage(msg);
    console.log('setting msg', msg);
    let _hash = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['string'], [message]));
    console.log('hash', _hash);
    setHash(_hash);
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

  const isValidTask = () => {
    return (
      isValidAddress(promoterAddress) &&
      isValidAddress(tokenAddress) &&
      isValidTokenAmount() &&
      isValidStartDate() &&
      isValidEndDate() &&
      isValidMessage()
    );
  };

  const createTask = () => {
    console.log('creating task');
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
      .createTask(
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
          error={!isValidAddress(promoterAddress) && isTouched('promoterAddress')}
          helperText={!isValidAddress(promoterAddress) && isTouched('promoterAddress') && 'Enter a valid address'}
          onChange={({ target }) => {
            setTouched({ ...touched, promoterAddress: true });
            setPromoterAddress(target.value);
          }}
        />
        <DTextField
          label="Token Address"
          value={tokenAddress}
          error={!isValidAddress(tokenAddress) && isTouched('tokenAddress')}
          helperText={!isValidAddress(tokenAddress) && isTouched('tokenAddress') && 'Enter a valid address'}
          onChange={({ target }) => {
            setTouched({ ...touched, tokenAddress: true });
            setTokenAddress(target.value);
          }}
        />
        <DTextField
          label="Token Amount"
          value={tokenAmount}
          error={!isValidTokenAmount() && isTouched('tokenAmount')}
          helperText={!isValidTokenAmount() && isTouched('tokenAmount') && 'Enter a valid amount'}
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
          error={!isValidStartDate() && isTouched('startDate')}
          helperText={!isValidStartDate() && isTouched('startDate') && "Start date can't lie in the past"}
        />
        <DDateTimePicker
          label="Promotion End Date"
          value={endDate}
          error={!isValidEndDate() && isTouched('endDate')}
          helperText={!isValidAddress(tokenAddress) && isTouched('tokenAddress') && 'Enter a valid amount'}
          onChange={(newDate) => {
            setTouched({ ...touched, endDate: true });
            setEndDate(newDate);
          }}
          error={!isValidEndDate() && isTouched('endDate')}
          helperText={!isValidEndDate() && isTouched('endDate') && 'End date must be after start date'}
        />
        <DTextField
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
        </DTextField>
        <DTextField
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
        <DTextFieldInfo label="Message Hash" value={hash} disabled={true} />
        <Button disabled={!isValidTask()} variant="contained" onClick={createTask}>
          Create
        </Button>
      </DStack>
    </LocalizationProvider>
  );
};
