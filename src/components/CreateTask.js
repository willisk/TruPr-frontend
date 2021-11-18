import React from 'react';
import { useState, useContext } from 'react';
import { Stack, Checkbox, MenuItem, Button } from '@mui/material';
import { DStackColumn, DTextField, DTextFieldInfo, DDateTimePicker, DStackRow } from '../config/defaults';

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

import { ethers } from 'ethers';

import { TokenContext, WalletContext, Web3Context } from './context/context';

import { PLATFORM_TO_ID, DURATION_CHOICES, METRIC_TO_ID } from '../config/config';

// ================== Create Task ====================

export const CreateTask = () => {
  // console.log('rendering', 'Create')
  const [platform, setPlatform] = useState('Twitter');
  const [promoter, setPromoterAddress] = useState('');
  const [promoterUserId, setPromoterUserId] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('MOCK');
  const [depositAmount, setDepositAmount] = useState('0');
  const [startDate, setStartDate] = useState(new Date().getTime());
  const [endDate, setEndDate] = useState(new Date().getTime() + DURATION_CHOICES['One Week']);
  const [metric, setMetric] = useState('Time');
  const [vestingTerm, setVestingTerm] = useState(0);
  const [linearRate, setLinearRate] = useState(true);
  const [message, setMessage] = useState('');
  const [data, setData] = useState({ platform: 'Twitter', userId: '0', metric: 'Time', messageHash: '0' });

  const [touched, setTouched] = useState({});
  const isTouched = (key) => Object.keys(touched).includes(key);

  const { tokenWhitelist, tokenApprovals, tokenBalances, updateApprovals } = useContext(TokenContext);
  const { handleTx, handleTxError, signContract, walletProvider } = useContext(WalletContext);
  const { contract } = useContext(Web3Context);

  // const handleTx = handleTxWrapper(() => {});
  const token = tokenWhitelist[tokenSymbol];

  const updateMessage = (msg) => {
    setMessage(msg);
    let hash = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['string'], [msg.trim()]));
    setData({ ...data, messageHash: hash });
    // console.log('setting msg', msg, '\n', hash);
  };

  // parsing functions

  const isPositiveInt = (amt) => {
    const parsedAmt = parseInt(amt);
    return parsedAmt.toString() === amt && !isNaN(parsedAmt) && parsedAmt > 0;
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

  const isValidDepositAmount = () => {
    return parseInt(depositAmount) <= tokenBalances[tokenSymbol];
  };

  const isValidTask = () => {
    return (
      isValidAddress(promoter) &&
      isPositiveInt(promoterUserId) &&
      // isValidAddress(tokenAddress) &&
      isPositiveInt(depositAmount) &&
      // isValidStartDate() &&
      isValidEndDate() &&
      isValidMessage()
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
    const task = {
      // platform: platform,
      promoter: promoter,
      // promoterUserId: promoterUserId,
      tokenAddress: token.address,
      depositAmount: depositAmount,
      startDate: parseInt(startDate.toString() / 1000),
      endDate: parseInt(endDate.toString() / 1000),
      vestingTerm: parseInt(vestingTerm.toString() / 1000),
      linearRate: linearRate,
      xticks: [100],
      yticks: [depositAmount],
      data: JSON.stringify(data),
    };

    console.log('creating task');
    console.log(task);

    signContract
      .createTask(
        // platform,
        promoter,
        // promoterUserId,
        token.address,
        depositAmount,
        parseInt(startDate.toString() / 1000),
        parseInt(endDate.toString() / 1000),
        parseInt(vestingTerm.toString() / 1000),
        '0', // linear rate
        [100], // final x-tick: normed to 100
        [depositAmount],
        JSON.stringify(data)
        // data,  // XXX: test this out?
      )
      .then(handleTx)
      .catch(handleTxError);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DStackColumn>
        <h2>Create Task</h2>
        <DTextField
          select
          label="Platform"
          value={platform}
          onChange={({ target }) => {
            setPlatform(target.value);
            setData({ ...data, platform: target.value });
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
          value={promoter}
          error={isTouched('promoter') && !isValidAddress(promoter)}
          helperText={isTouched('promoter') && !isValidAddress(promoter) && 'Enter a valid address'}
          onChange={({ target }) => {
            setTouched({ ...touched, promoter: true });
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
            setData({ ...data, userId: target.value });
          }}
        />
        <DStackRow>
          <DTextField
            label="Amount"
            value={depositAmount}
            error={isTouched('depositAmount') && (!isPositiveInt(depositAmount) || !isValidDepositAmount())}
            helperText={
              isTouched('depositAmount') &&
              ((!isPositiveInt(depositAmount) && 'Enter a valid amount') ||
                (!isValidDepositAmount() && 'Amount exceeds balance'))
            }
            onChange={({ target }) => {
              setTouched({ ...touched, depositAmount: true });
              setDepositAmount(target.value);
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
        </DStackRow>
        <DStackRow>
          <DDateTimePicker
            label="Promotion Start Date"
            value={startDate}
            onChange={(newDate) => {
              setTouched({ ...touched, startDate: true });
              setStartDate(newDate.getTime());
            }}
            error={isTouched('startDate') && !isValidStartDate()}
            helperText={isTouched('startDate') && !isValidStartDate() && 'Start date is in the past'}
          />
          <DDateTimePicker
            label="Promotion End Date"
            value={endDate}
            onChange={(newDate) => {
              setTouched({ ...touched, endDate: true });
              setEndDate(newDate.getTime());
            }}
            error={isTouched('endDate') && !isValidEndDate()}
            helperText={isTouched('endDate') && !isValidEndDate() && 'End date must be after start date'}
          />
        </DStackRow>
        <DStackRow>
          <DTextField
            select
            label="Metric"
            value={metric}
            onChange={({ target }) => {
              setMetric(target.value);
              setData({ ...data, metric: target.value });
            }}
          >
            {Object.entries(METRIC_TO_ID).map(([choice, time]) => (
              <MenuItem key={time} value={time}>
                {choice}
              </MenuItem>
            ))}
          </DTextField>
          <DTextField
            select
            label="Vesting Term"
            value={vestingTerm}
            onChange={({ target }) => {
              setVestingTerm(target.value);
            }}
          >
            {Object.entries(DURATION_CHOICES).map(([choice, time]) => (
              <MenuItem key={time} value={time}>
                {choice}
              </MenuItem>
            ))}
          </DTextField>
          <div>
            <Checkbox checked={linearRate} onChange={({ target }) => setLinearRate(target.checked)} />
            {/* <span>Linear Rate</span> */}
            Linear Rate
          </div>
        </DStackRow>
        <DTextField
          multiline
          label="Exact Message"
          value={message}
          error={isTouched('message') && !isValidMessage()}
          helperText={isTouched('message') && !isValidMessage() && 'Enter a valid message'}
          onChange={({ target }) => {
            setTouched({ ...touched, message: true });
            updateMessage(target.value);
          }}
        />
        <DTextFieldInfo multiline label="Data Field" value={JSON.stringify(data)} disabled={true} />
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
      </DStackColumn>
      <DevTools />
    </LocalizationProvider>
  );
};

// ================== Dev Tools ====================

const mockMintInterface = ['function mint(uint256 amount)', 'function mintFor(address for, uint256 amount)'];

export const DevTools = () => {
  const [tokenSymbol, setTokenSymbol] = useState('MOCK');

  const { tokenWhitelist, tokenBalances, updateBalances } = useContext(TokenContext);
  const { handleTxError, handleTx, walletProvider, isConnected } = useContext(WalletContext);

  const token = tokenWhitelist[tokenSymbol];

  const mint = () => {
    const contract = new ethers.Contract(token.address, mockMintInterface);
    contract
      .connect(isConnected ? walletProvider.getSigner() : null)
      .mint('1000')
      .then(handleTx)
      .then(() => updateBalances(tokenSymbol))
      .catch(handleTxError);
  };

  return (
    <DStackColumn>
      <h2>Dev Tools</h2>
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
    </DStackColumn>
  );
};
