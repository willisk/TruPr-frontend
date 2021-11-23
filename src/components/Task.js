import { Fragment, useContext, useState } from 'react';
import { Button, LinearProgress, Chip, InputAdornment, Paper, Tooltip } from '@mui/material';
import { DStackColumn, Row, DTextFieldInfo, LabelWith } from '../config/defaults';
import { Link } from 'react-router-dom';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import { LabelWithText } from '../config/defaults';

import { TokenContext, TaskContext, WalletContext } from './context/context';
import { clamp, getTaskState, taskTimeDeltaInfo } from '../config/utils';

import { getIcon, getProgressValue, dateDiffInDays, getReadableDate } from '../config/utils';
import { Box } from '@mui/system';

export const DisplayTask = ({ match }) => {
  console.log('rendering TASK');
  console.log(match);
  return null;
};

export const Task = ({ task, taskId, detailed }) => {
  const { walletAddress, signContract, handleTx, handleTxError } = useContext(WalletContext);
  const { tokenWhitelistAddressToSymbol } = useContext(TokenContext);
  const { updateTasks } = useContext(TaskContext);

  const [promoterUserId, setPromoterUserId] = useState('');

  const fulfillTask = (id) => {
    signContract.fulfillTask(id).then(handleTx).then(updateTasks).catch(handleTxError);
  };

  // console.log(task);

  const isPublic = task.promoter === 0;
  const now = new Date().getTime();
  // console.log(task.startDate < now, now < task.endDate, isPublic || walletAddress === task.promoter, task.status == 1);

  const progress = clamp(((now - task.startDate) / (task.endDate - task.startDate)) * 100, 0, 100);
  const taskState = getTaskState(task);

  const description =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas et rutrum mi. Vestibulum aliquam bibendum sodales. Donec faucibus malesuada magna vitae mattis. Nulla pharetra ultrices faucibus. Proin quis enim non purus pretium fermentum. Praesent ac elit tristique, suscipit dolor et, mattis ex. Nam in pharetra tellus. Nullam laoreet nibh non efficitur volutpat. Donec sodales est vitae dolor elementum, nec ultricies ante fringilla. Sed vitae egestas tortor, eu vehicula nunc. Aliquam erat volutpat. Suspendisse eu arcu mauris. Sed hendrerit ultricies porttitor.';

  const descriptionComp = detailed ? (
    <Fragment>
      <Row>
        <Paper sx={{ padding: '1em' }}>
          {/* <LabelWith placement="top" label="Description" text={descriptionShort}></LabelWith> */}
          <LabelWith placement="top" label="Description">
            <Typography style={{ textAlign: 'left' }}>{description.slice(0, 90) + ' ...'}</Typography>
            <Button component={Link} to={'/task/' + taskId}>
              view details
            </Button>
          </LabelWith>
          {/* <LabelWithText placement="top" label="Description" text={descriptionShort} /> */}
        </Paper>
      </Row>
      <Button
        variant="contained"
        onClick={() => fulfillTask(taskId, task)}
        disabled={
          !(
            task.startDate < now &&
            now < task.endDate &&
            (isPublic || walletAddress === task.promoter) &&
            task.status === 1
          )
        }
      >
        Fulfill Task
      </Button>
    </Fragment>
  ) : (
    <Fragment>
      <Row>
        <Paper sx={{ padding: '1em' }}>
          <LabelWith placement="top" label="Description">
            <Typography style={{ textAlign: 'left' }}>{description}</Typography>
          </LabelWith>
          {/* <LabelWithText placement="top" label="Description" text={description} /> */}
        </Paper>
      </Row>
      <Button
        variant="contained"
        onClick={() => fulfillTask(taskId, task)}
        disabled={
          !(
            task.startDate < now &&
            now < task.endDate &&
            (isPublic || walletAddress === task.promoter) &&
            task.status === 1
          )
        }
      >
        Fulfill Task
      </Button>
    </Fragment>
  );

  return (
    <DStackColumn style={{ position: 'relative' }}>
      <Row>
        <LabelWithText text={'Task ' + taskId} />
        {/* <Typography>Task {taskId}</Typography> */}
        {/* <h3 style={{ textAlign: 'left', marginTop: '0' }}>
          <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>Task {taskId}</span>{' '}
          <span style={{ position: 'absolute', right: '20px', top: '20px' }}>{getIcon('Twitter')}</span>
        </h3> */}
        <Row>
          <LabelWithText label="Created by" text="Username#1237" />
          {getIcon('Twitter')}
        </Row>
      </Row>

      {/* <div style={{ display: 'flex', justifyContent: 'space-between' }}> */}
      <Row>
        <LabelWith placement="right" label={taskTimeDeltaInfo(task)}>
          <Chip label={taskState} color={taskState === 'Open' ? 'success' : 'error'} />
        </LabelWith>
      </Row>
      {/* </div> */}
      <LinearProgress variant="determinate" value={progress} />
      <Row>
        <Tooltip title={new Date(task.startDate).toString()} placement="top">
          <Box>
            <LabelWithText label="Starts" text={getReadableDate(new Date(task.startDate))} />{' '}
          </Box>
        </Tooltip>
        <Tooltip title={new Date(task.endDate).toString()} placement="top">
          <Box>
            <LabelWithText label="Ends" text={getReadableDate(new Date(task.endDate))} />
          </Box>
        </Tooltip>
      </Row>
      <Row>
        <LabelWithText
          // placement="top"
          label="Reward"
          text={task.depositAmount.toString() + ' ' + tokenWhitelistAddressToSymbol[task.erc20Token].toString()}
        />
      </Row>
      <Row>
        <LabelWithText placement="top" label="Promoter address" text={task.promoter} />
      </Row>

      {descriptionComp}
    </DStackColumn>
  );
};
