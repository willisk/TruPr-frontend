import React, { Fragment } from 'react';
import { useState, useContext, useEffect } from 'react';
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
import { DStackColumn, DTextField, DTextFieldInfo, DDateTimePicker, Row, Label } from '../config/defaults';
import TruPrContract from '../contracts/TruPr.json';
import tokenContract from '../contracts/ERC20.json';
import { useNewMoralisObject, useMoralis, useMoralisQuery } from 'react-moralis';
import Moralis from 'moralis';
import { useMoralisDapp } from '../providers/MoralisDappProvider/MoralisDappProvider';

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

import { isPositiveInt, isValidAddress } from '../config/utils';

const steps = ['Task Details', 'Rewards', 'Finalize'];

// ================== Create Task ====================

export const CreateTask = () => {
  const { isSaving, error, save } = useNewMoralisObject('Task');
  const { refetchUserData, setUserData, userError, isUserUpdating, user, isAuthUndefined } = useMoralis();
  const { walletAddress } = useMoralisDapp();

  // console.log('rendering', 'Create')
  const [activeStep, setActiveStep] = useState(0);

  const [platform, setPlatform] = useState('Twitter');
  const [promoter, setPromoterAddress] = useState('');
  const [promoterUserId, setPromoterUserId] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [message, setMessage] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');

  const [tokenSymbol, setTokenSymbol] = useState('MOCK');
  const [depositAmount, setDepositAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date().getTime());
  const [endDate, setEndDate] = useState(new Date().getTime() + DURATION_CHOICES['One Week']);
  const [metric, setMetric] = useState('Time');
  const [cliffPeriod, setCliffPeriod] = useState(0);
  const [linearRate, setLinearRate] = useState(true);
  const [xticks, setXticks] = useState([]);
  const [yticks, setYticks] = useState([]);

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

  if (isAuthUndefined) {
    return <div>loading</div>;
  }

  // parsing functions

  const isValidMessage = () => {
    return message !== '';
  };

  const isValidPromoter = () => {
    return isValidAddress(promoter) && promoter.toLowerCase() !== walletAddress.toLowerCase();
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
      (step === 0 && (isPublic || (isValidPromoter() && isPositiveInt(promoterUserId))) && isValidMessage()) ||
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
      .then((receipt) => {
        let taskId = receipt.events.at(-1).args.taskId.toString();

        console.log('Task id should be:', taskId);

        save({
          taskId: taskId,
          status: 1,
          name: name,
          message: isPublic ? message : '',
          description: isPublic ? `Promotion content: \n${message}\nDescription: \n${description}` : description,
          type: isPublic ? 'Public' : 'Personal',
          platform: platform,
          sponsor: user,
          sponsorAddress: user.attributes.ethAddress,
          promoterId: promoterUserId,
          promoterAddress: promoter,
          token: token.address,
          depositAmount: depositAmount,
          startDate: startDate,
          endDate: endDate,
          cliff: cliffPeriod,
          linearRate: linearRate,
          xticks: [100],
          yticks: [depositAmount],
        });
      })
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
            {/* <Tooltip title="This is the platform the promoter will use to complete the task on">
              <Typography>Choose the platform.</Typography>
            </Tooltip> */}
            <Label
              description="Choose the platform."
              tooltip="This is the platform the promoter will use to complete the task on"
            >
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
            </Label>
            <Label description="Enter the name of your promotion" tooltip=" ">
              <DTextField
                label="Name"
                value={name}
                onChange={({ target }) => {
                  setName(target.value);
                }}
              />
            </Label>
            <Label
              description="Enter your promotion description"
              tooltip="You can describe who you are, what your goals are, what target group you're aiming for etc."
            >
              <DTextField
                label="Name"
                value={description}
                onChange={({ target }) => {
                  setDescription(target.value);
                }}
              />
            </Label>
            <div style={{ margin: 'auto' }}>
              <Checkbox checked={isPublic} onChange={({ target }) => setIsPublic(target.checked)} />
              Public
            </div>
            <Label
              description="Enter the promoter's wallet address."
              tooltip="This is the address that will receive the tokens after the task has been fulfilled"
            >
              {/* <Row> */}
              {isPublic ? (
                <DTextField label="Promoter Address" disabled value={''} />
              ) : (
                <DTextField
                  label="Promoter Address"
                  value={promoter}
                  error={isTouched('promoter') && !isValidPromoter()}
                  helperText={
                    isTouched('promoter') &&
                    !isValidPromoter() &&
                    ((!isValidAddress(promoter) && 'Enter a valid address') ||
                      'Address must differ from wallet address')
                  }
                  onChange={({ target }) => {
                    touch('promoter');
                    setPromoterAddress(target.value);
                  }}
                />
              )}
              {/* </Row> */}
            </Label>
            <Label
              // style={{ color: 'red' }}
              disabled={isPublic}
              description={`Enter the promoter's ${platform} user id.`}
              tooltip="This is the user id of the promoter's account on the specified social network platform"
            >
              <>
                {isPublic ? (
                  <DTextField label="Promoter User Id" disabled value={''} />
                ) : (
                  <DTextField
                    label="Promoter User Id"
                    value={promoterUserId}
                    error={isTouched('promoterUserId') && !isPositiveInt(promoterUserId)}
                    helperText={
                      isTouched('promoterUserId') && !isPositiveInt(promoterUserId) && 'Enter a valid User Id'
                    }
                    onChange={({ target }) => {
                      touch('promoterUserId');
                      setPromoterUserId(target.value);
                    }}
                  />
                )}
              </>
            </Label>
            <Label
              description="Enter the exact mesage for the promotion."
              tooltip="The exact message the promoter must relay. The promoter will not be able to complete the task if the message does not match exactly."
            >
              <></>
            </Label>
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
            <Tooltip title="">
              <Typography></Typography>
            </Tooltip>
            <Label
              description="Enter the start and end date for the promotion."
              tooltip="The time frame the promoter will be given to fulfill his task. If the task is fulfilled in this time window, the promoter will still be able to get paid, even after the end date."
            />
            <Row>
              <DDateTimePicker
                label="Start Date"
                value={startDate}
                onChange={(newDate) => {
                  touch('startDate');
                  setStartDate(newDate.getTime());
                }}
                error={isTouched('startDate') && !isValidStartDate()}
                helperText={isTouched('startDate') && !isValidStartDate() && 'Start date is in the past'}
              />
              <DDateTimePicker
                label="End Date"
                value={endDate}
                onChange={(newDate) => {
                  touch('endDate');
                  setEndDate(newDate.getTime());
                }}
                error={isTouched('endDate') && !isValidEndDate()}
                helperText={isTouched('endDate') && !isValidEndDate() && 'End date must be after start date'}
              />
            </Row>
            <Label
              description="Enter the rewards set for the promotion."
              tooltip="The token and the amount to be paid out to the promoter upon fulfilling the task"
            >
              <Row>
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
              </Row>
            </Label>
            <Label
              description="Enter the metric to be tracked."
              tooltip="The metric the promoter will be evaluated on for their payout. Setting this to 'Time' means the promoter will get paid out over time once the task is complete."
            />
            <Row>
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
              <div style={{ margin: 'auto' }}>
                <Checkbox checked={linearRate} onChange={({ target }) => setLinearRate(target.checked)} />
                Linear Rate
              </div>
              <DTextField
                select
                label="Cliff Period"
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
            </Row>
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
                      <TableCell>{value.toString()}</TableCell>
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
        <Row>
          <Button disabled={activeStep === 0} style={{ marginRight: 'auto' }} onClick={previousStep}>
            BACK
          </Button>
          <Button disabled={activeStep === 2} style={{ marginLeft: 'auto' }} onClick={nextStep}>
            NEXT
          </Button>
        </Row>
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
