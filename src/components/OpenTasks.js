import React from 'react';
import { useMemo, useEffect, useState, useContext } from 'react';
import { Stack, MenuItem, Button, InputAdornment, LinearProgress, Chip } from '@mui/material';
import { DStack, DTextField, DTextFieldInfo, DDateTimePicker } from '../config/defaults';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';

import { Web3Context } from './Web3Connector';
import { TokenContext, WalletContext } from './WalletConnector';

import { formatDuration, getTaskState } from '../config/utils';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import { getIcon, getProgressValue, dateDiffInDays, getReadableDate } from '../config/utils';

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
