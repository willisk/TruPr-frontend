import React, { Fragment } from 'react';
import { useState, useContext } from 'react';
import {
  Stack,
  Checkbox,
  MenuItem,
  Button,
  Stepper,
  StepLabel,
  Tooltip,
  Table,
  TableContainer,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { DStackColumn, DTextField, DTextFieldInfo, DDateTimePicker, DStackRow } from '../config/defaults';

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

import { ethers } from 'ethers';

import { TokenContext, WalletContext, Web3Context } from './context/context';

import { PLATFORM_TO_ID, DURATION_CHOICES, METRIC_TO_ID } from '../config/config';

import Box from '@mui/material/Box';
// import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
// import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const steps = ['Task Details', 'Rewards', 'Finalize'];

// ================== Create Task ====================

export const CreateTask = () => {
  // console.log('rendering', 'Create')
  const [activeStep, setActiveStep] = useState(0);

  const [platform, setPlatform] = useState('Twitter');
  const [promoter, setPromoterAddress] = useState('');
  const [promoterUserId, setPromoterUserId] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [message, setMessage] = useState('');

  const [tokenSymbol, setTokenSymbol] = useState('MOCK');
  const [depositAmount, setDepositAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date().getTime());
  const [endDate, setEndDate] = useState(new Date().getTime() + DURATION_CHOICES['One Week']);
  const [metric, setMetric] = useState('Time');
  const [cliffPeriod, setCliffPeriod] = useState(0);
  const [linearRate, setLinearRate] = useState(true);

  const [touched, setTouched] = useState({});
  const isTouched = (key) => Object.keys(touched).includes(key);

  const { tokenWhitelist, tokenApprovals, tokenBalances, updateApprovals } = useContext(TokenContext);
  const { handleTx, handleTxError, signContract, walletProvider } = useContext(WalletContext);
  const { contract } = useContext(Web3Context);

  // const handleTx = handleTxWrapper(() => {});
  const token = tokenWhitelist[tokenSymbol];

  const data = JSON.stringify({
    platform: platform,
    userId: promoterUserId,
    metric: metric,
    messageHash: ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['string'], [message.trim()])),
  });

  // parsing functions

  const isPositiveInt = (amt) => {
    const parsedAmt = parseInt(amt);
    return parsedAmt.toString() === amt && !isNaN(parsedAmt) && parsedAmt > 0;
  };

  const isValidAddress = (address) => {
    try {
      return ethers.utils.defaultAbiCoder.encode(['address'], [address]) !== ethers.constants.AddressZero;
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
    return stepIsComplete(0) && stepIsComplete(1);
  };

  const stepIsComplete = (step) => {
    return (
      (step === 0 && (isPublic || (isValidAddress(promoter) && isPositiveInt(promoterUserId))) && isValidMessage()) ||
      (step === 1 &&
        // isValidStartDate() &&
        isValidEndDate() &&
        isPositiveInt(depositAmount)) ||
      (step === 2 && stepIsComplete(0) && stepIsComplete(1))
    );
  };

  const approveToken = () => {
    token.contract
      .connect(walletProvider.getSigner())
      .approve(contract.address, ethers.constants.MaxUint256)
      .then(handleTx)
      .then(() => updateApprovals(tokenSymbol))
      .catch(handleTxError);
  };

  const getTask = () => ({
    promoter: isPublic ? ethers.constants.AddressZero : promoter,
    tokenAddress: token.address,
    depositAmount: depositAmount,
    startDate: parseInt(startDate.toString() / 1000),
    endDate: parseInt(endDate.toString() / 1000),
    cliffPeriod: parseInt(cliffPeriod.toString() / 1000),
    linearRate: linearRate,
    xticks: [100],
    yticks: [depositAmount],
    data: data,
  });

  const createTask = () => {
    const task = getTask();

    console.log('creating task', task);

    signContract
      .createTask(
        task.promoter,
        task.tokenAddress,
        task.depositAmount,
        task.startDate,
        task.endDate,
        task.cliffPeriod,
        task.linearRate,
        task.xticks,
        task.yticks,
        task.data
      )
      .then(handleTx)
      .catch(handleTxError);
  };

  const touch = (key) => {
    var t = touched;
    t[key.toString()] = true;
    setTouched(t);
  };

  const handleStep = (step) => {
    touch('step' + activeStep);
    setActiveStep(step);
  };

  const nextStep = () => {
    handleStep(activeStep + 1);
  };
  const previousStep = () => {
    handleStep(activeStep - 1);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DStackColumn>
        <Stepper nonLinear activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label} completed={stepIsComplete(index)}>
              <StepButton color="inherit" onClick={() => handleStep(index)}>
                <StepLabel
                  error={index !== activeStep && index !== 2 && isTouched('step' + index) && !stepIsComplete(index)}
                >
                  {label}
                </StepLabel>
              </StepButton>
            </Step>
          ))}
        </Stepper>
        {activeStep == 0 && (
          <>
            <Tooltip title="This is the platform the promoter will use to complete the task on">
              <Typography>Choose the platform.</Typography>
            </Tooltip>
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
            <Tooltip title="This is the address that will receive the tokens after the task has been fulfilled">
              <Typography>Enter the promoter's wallet address.</Typography>
            </Tooltip>
            <DStackRow>
              {isPublic ? (
                <DTextField label="Promoter Address" disabled value={'-'} />
              ) : (
                <DTextField
                  label="Promoter Address"
                  value={promoter}
                  error={isTouched('promoter') && !isValidAddress(promoter)}
                  helperText={isTouched('promoter') && !isValidAddress(promoter) && 'Enter a valid address'}
                  onChange={({ target }) => {
                    touch('promoter');
                    setPromoterAddress(target.value);
                  }}
                />
              )}
              <div style={{ margin: 'auto' }}>
                <Checkbox checked={isPublic} onChange={({ target }) => setIsPublic(target.checked)} />
                Public
              </div>
            </DStackRow>
            {!isPublic && (
              <>
                <Tooltip title="This is the user id of the promoter's account on the specified social network platform">
                  <Typography>Enter the promoter's {platform} user id.</Typography>
                </Tooltip>
                <DTextField
                  label="Promoter User Id"
                  value={promoterUserId}
                  error={isTouched('promoterUserId') && !isPositiveInt(promoterUserId)}
                  helperText={isTouched('promoterUserId') && !isPositiveInt(promoterUserId) && 'Enter a valid User Id'}
                  onChange={({ target }) => {
                    touch('promoterUserId');
                    setPromoterUserId(target.value);
                  }}
                />
              </>
            )}
            <Tooltip title="The exact message the promoter must relay. The promoter will not be able to complete the task if the message does not match exactly.">
              <Typography>Enter the exact mesage for the promotion.</Typography>
            </Tooltip>
            <DTextField
              multiline
              label="Message"
              value={message}
              error={isTouched('message') && !isValidMessage()}
              helperText={isTouched('message') && !isValidMessage() && 'Enter a valid message'}
              onChange={({ target }) => {
                touch('message');
                setMessage(target.value);
              }}
            />
          </>
        )}
        {activeStep == 1 && (
          <>
            <Tooltip title="The time frame the promoter will be given to fulfill his task. If the task is fulfilled in this time window, the promoter will still be able to get paid, even after the end date.">
              <Typography>Enter the start and end date for the promotion.</Typography>
            </Tooltip>
            <DStackRow>
              <DDateTimePicker
                label="Promotion Start Date"
                value={startDate}
                onChange={(newDate) => {
                  touch('startDate');
                  setStartDate(newDate.getTime());
                }}
                error={isTouched('startDate') && !isValidStartDate()}
                helperText={isTouched('startDate') && !isValidStartDate() && 'Start date is in the past'}
              />
              <DDateTimePicker
                label="Promotion End Date"
                value={endDate}
                onChange={(newDate) => {
                  touch('endDate');
                  setEndDate(newDate.getTime());
                }}
                error={isTouched('endDate') && !isValidEndDate()}
                helperText={isTouched('endDate') && !isValidEndDate() && 'End date must be after start date'}
              />
            </DStackRow>
            <Tooltip title="The token and the amount to be paid out to the promoter upon fulfilling the task">
              <Typography>Enter the rewards set for the promotion.</Typography>
            </Tooltip>
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
                  touch('depositAmount');
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
            <Tooltip title="The metric the promoter will be evaluated on for their payout. Setting this to 'Time' means the promoter will get paid out over time once the task is complete.">
              <Typography>Enter the metric to be tracked.</Typography>
            </Tooltip>
            <DStackRow>
              <DTextField
                select
                label="Metric"
                value={metric}
                onChange={({ target }) => {
                  setMetric(target.value);
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
                label="Cliff period"
                value={cliffPeriod}
                onChange={({ target }) => {
                  setCliffPeriod(target.value);
                }}
              >
                {Object.entries(DURATION_CHOICES).map(([choice, time]) => (
                  <MenuItem key={time} value={time}>
                    {choice}
                  </MenuItem>
                ))}
              </DTextField>
              <div style={{ margin: 'auto' }}>
                <Checkbox checked={linearRate} onChange={({ target }) => setLinearRate(target.checked)} />
                Linear Rate
              </div>
            </DStackRow>
          </>
        )}
        {activeStep == 2 && (
          <>
            <TableContainer>
              <Table>
                <TableBody>
                  {Object.entries(getTask()).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>{key}</TableCell>
                      <TableCell>{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Stack>
              {!tokenApprovals[tokenSymbol] && (
                <Button variant="contained" onClick={approveToken}>
                  Approve Token
                </Button>
              )}
              <Button
                disabled={!isValidTask() || !tokenApprovals[tokenSymbol]}
                variant="contained"
                onClick={createTask}
              >
                Create Task
              </Button>
            </Stack>
          </>
        )}
        <DStackRow>
          <Button disabled={activeStep === 0} style={{ marginRight: 'auto' }} onClick={previousStep}>
            BACK
          </Button>
          <Button disabled={activeStep === 2} style={{ marginLeft: 'auto' }} onClick={nextStep}>
            NEXT
          </Button>
        </DStackRow>
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
