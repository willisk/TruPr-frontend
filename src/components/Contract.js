import React from 'react';
import { useMemo, useEffect, useState, useContext } from 'react';
import { Stack, MenuItem, Button, InputAdornment, LinearProgress, Chip } from '@mui/material';
import { DStack, DTextField, DTextFieldInfo, DDateTimePicker } from '../config/defaults';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

import { ethers } from 'ethers';

import { Web3Context } from './Web3Connector';
import { TokenContext, WalletContext } from './WalletConnector';

import { PLATFORM_TO_ID, ID_TO_PLATFORM, ID_TO_STATUS, oneWeek, DURATION_CHOICES } from '../config/config';
import { formatDuration, getTaskState } from '../config/utils';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import { getIcon, getProgressValue, dateDiffInDays, getReadableDate } from '../config/utils';

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
  const { walletAddress, signContract, handleTx, handleTxError } = useContext(WalletContext);
  const { tokenWhitelistAddressToSymbol } = useContext(TokenContext);

  const updateTaskCount = () => {
    contract.taskCount().then(setTaskCount).catch(console.error);
  };

  useMemo(() => {
    updateTaskCount();
    contract.on(contract.filters.TaskCreated(), updateTaskCount);
  }, []);

  useEffect(() => {
    contract.getAllTasks().then(setTasks).catch(console.error);
  }, [taskCount]);

  const now = new Date().getTime();

  const fulfillTask = (id) => {
    console.log(id);
    signContract.fulfillTask(id).then(handleTx).then(updateTaskCount).catch(handleTxError);
  };

  const tasksList = () =>
    Object.entries(tasks).map(([id, task]) => {
      // console.log('id', id, task);
      const isPublic = task.promoter == 0;
      return (
        <Grid item key={id} xs={12} md={6} lg={4}>
          <DStack style={{ position: 'relative' }}>
            <h3 style={{ textAlign: 'left', marginTop: '0' }}>
              <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>Task {id}</span>{' '}
              <span style={{ position: 'absolute', right: '20px', top: '20px' }}>
                {getIcon('Twitter')}
                {/* {getIcon(ID_TO_PLATFORM[task.platform])} */}
              </span>
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Chip
                label={getTaskState(task)}
                color={getProgressValue(task) === 100 ? 'error' : 'success'}
                style={{ maxWidth: '70px', width: '100%' }}
              />
              <span style={{ marginTop: 'auto' }}>{dateDiffInDays(task)}</span>
            </div>
            <LinearProgress variant="determinate" value={getProgressValue(task)} />
            <Typography
              variant="h4"
              style={{
                textAlign: 'left',
                fontSize: '12px',
                marginTop: '30px',
                fontWeight: '400',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Reward
            </Typography>
            <Typography variant="body1" style={{ textAlign: 'left', marginTop: '5px' }}>
              {task.depositAmount.toString()} {tokenWhitelistAddressToSymbol[task.erc20Token].toString()}
            </Typography>
            <div style={{ display: 'flex', marginTop: '35px', marginBottom: '20px', justifyContent: 'space-evenly' }}>
              <DTextFieldInfo
                style={{ width: '50%' }}
                label="Starts on"
                value={getReadableDate(new Date(task.startDate * 1000))}
              />
              <DTextFieldInfo
                style={{ width: '50%' }}
                label="Ends on"
                value={getReadableDate(new Date(task.endDate * 1000))}
              />
            </div>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                <Typography>Description</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div style={{ textAlign: 'left' }}>
                  <Typography>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas et rutrum mi. Vestibulum aliquam
                    bibendum sodales. Donec faucibus malesuada magna vitae mattis. Nulla pharetra ultrices faucibus.
                    Proin quis enim non purus pretium fermentum. Praesent ac elit tristique, suscipit dolor et, mattis
                    ex. Nam in pharetra tellus. Nullam laoreet nibh non efficitur volutpat. Donec sodales est vitae
                    dolor elementum, nec ultricies ante fringilla. Sed vitae egestas tortor, eu vehicula nunc. Aliquam
                    erat volutpat. Suspendisse eu arcu mauris. Sed hendrerit ultricies porttitor.
                  </Typography>
                  <Typography>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas et rutrum mi. Vestibulum aliquam
                    bibendum sodales. Donec faucibus malesuada magna vitae mattis. Nulla pharetra ultrices faucibus.
                    Proin quis enim non purus pretium fermentum. Praesent ac elit tristique, suscipit dolor et, mattis
                    ex. Nam in pharetra tellus. Nullam laoreet nibh non efficitur volutpat. Donec sodales est vitae
                    dolor elementum, nec ultricies ante fringilla. Sed vitae egestas tortor, eu vehicula nunc. Aliquam
                    erat volutpat. Suspendisse eu arcu mauris. Sed hendrerit ultricies porttitor.
                  </Typography>
                </div>
              </AccordionDetails>
            </Accordion>
            {/* <DTextFieldInfo label="Status" value={ID_TO_STATUS[task.status]} />
          <DTextFieldInfo label="Platform" value={ID_TO_PLATFORM[task.platform]} />
          <DTextFieldInfo label="Sponsor Address" value={task.sponsor} />
          <DTextFieldInfo label="Promoter Address" value={task.promoter} />
          <DTextFieldInfo label="Promoter User Id" value={task.promoterUserId} />
          <DTextFieldInfo label="Start Date" value={new Date(task.startDate * 1000).toString()} />
          <DTextFieldInfo label="End Date" value={new Date(task.endDate * 1000).toString()} />
          <DTextFieldInfo label="Min Duration" value={formatDuration(task.minDuration)} />
          <DTextFieldInfo label="Hash" value={task.hash} /> */}
            <Button
              variant="contained"
              onClick={() => fulfillTask(id, task)}
              disabled={
                !(
                  task.startDate < now &&
                  now < task.endDate &&
                  task.promoter != 0 &&
                  walletAddress === task.promoter &&
                  task.status === 1
                )
              }
            >
              Fulfill Task
            </Button>
          </DStack>
        </Grid>
      );
    });

  return (
    <div>
      <h2>Open Tasks</h2>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          {tasksList()}
        </Grid>
      </Box>
    </div>
  );
};

// ================== Create Task ====================

export const CreateTask = () => {
  // console.log('rendering', 'Create')
  const [platform, setPlatform] = useState('0');
  const [promoter, setPromoterAddress] = useState('');
  // const [promoterUserId, setPromoterUserId] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('MOCK');
  const [depositAmount, setDepositAmount] = useState('0');
  const [startDate, setStartDate] = useState(parseInt(new Date().getTime() / 1000));
  const [endDate, setEndDate] = useState(parseInt(new Date().getTime() / 1000) + DURATION_CHOICES['One Week']);
  const [vestingTerm, setVestingTerm] = useState(0);
  const [data, setMessage] = useState('');
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

  const isValidDepositAmount = () => {
    return parseInt(depositAmount) <= tokenBalances[tokenSymbol];
  };

  const isValidTask = () => {
    return (
      isValidAddress(promoter) &&
      // isPositiveInt(promoterUserId) &&
      // isValidAddress(tokenAddress) &&
      isPositiveInt(depositAmount) &&
      // isValidStartDate() &&
      isValidEndDate()
      // isValidMessage(data)
    );
  };

  // const data =

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
      // platform: platform,
      promoter: promoter,
      // promoterUserId: promoterUserId,
      tokenAddress: token.address,
      depositAmount: depositAmount,
      startDate: startDate.toString(),
      endDate: endDate.toString(),
      vestingTerm: vestingTerm.toString(),
      hash: hash,
    });

    signContract
      .createTask(
        // platform,
        promoter,
        // promoterUserId,
        token.address,
        depositAmount,
        startDate.toString(),
        endDate.toString(),
        vestingTerm.toString(),
        '0', // linear rate
        [100], // final x-tick: normed to 100
        [depositAmount],
        data
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
          value={promoter}
          error={isTouched('promoter') && !isValidAddress(promoter)}
          helperText={isTouched('promoter') && !isValidAddress(promoter) && 'Enter a valid address'}
          onChange={({ target }) => {
            setTouched({ ...touched, promoter: true });
            setPromoterAddress(target.value);
          }}
        />
        {/* <DTextField
          label="Promoter User Id"
          value={promoterUserId}
          error={isTouched('promoterUserId') && !isPositiveInt(promoterUserId)}
          helperText={isTouched('promoterUserId') && !isPositiveInt(promoterUserId) && 'Enter a valid User Id'}
          onChange={({ target }) => {
            setTouched({ ...touched, promoterUserId: true });
            setPromoterUserId(target.value);
          }}
        /> */}
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
        <DDateTimePicker
          label="Promotion Start Date"
          value={startDate}
          onChange={(newDate) => {
            setTouched({ ...touched, startDate: true });
            setStartDate(parseInt(newDate.getTime() / 1000));
          }}
          error={isTouched('startDate') && !isValidStartDate()}
          helperText={isTouched('startDate') && !isValidStartDate() && 'Start date is in the past'}
        />
        <DDateTimePicker
          label="Promotion End Date"
          value={endDate}
          onChange={(newDate) => {
            setTouched({ ...touched, endDate: true });
            setEndDate(parseInt(newDate.getTime() / 1000));
          }}
          error={isTouched('endDate') && !isValidEndDate()}
          helperText={isTouched('endDate') && !isValidEndDate() && 'End date must be after start date'}
        />
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
        <DTextField
          multiline
          label="Data"
          value={data}
          // error={isTouched('data') && !isValidMessage(data)}
          // helperText={isTouched('data') && !isValidMessage(data) && 'Enter a valid message'}
          onChange={({ target }) => {
            setTouched({ ...touched, data: true });
            updateMessage(target.value);
          }}
        />
        {/* <DTextFieldInfo label="Message Hash" value={hash} disabled={true} /> */}
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

const mockMintInterface = ['function mint(uint256 amount)', 'function mintFor(address for, uint256 amount)'];

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
