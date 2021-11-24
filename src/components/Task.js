import { Fragment, useContext, useState } from 'react';
import { Button, LinearProgress, Chip, InputAdornment, Paper, Tooltip } from '@mui/material';
import { DStackColumn, Row, DTextFieldInfo, LabelWith, DTextField } from '../config/defaults';
import { Link, useParams } from 'react-router-dom';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import { LabelWithText } from '../config/defaults';

import { useMoralisQuery } from 'react-moralis';
import Moralis from 'moralis';

import { TokenContext, TaskContext, WalletContext } from './context/context';
import { isPositiveInt, isValidAddress, shortenAddress, clamp, getTaskState, taskTimeDeltaInfo } from '../config/utils';

import { getIcon, getProgressValue, dateDiffInDays, getReadableDate } from '../config/utils';
import { Box } from '@mui/system';

export const DisplayTask = () => {
  const { id } = useParams();
  const { tasks } = useContext(TaskContext);
  if (!tasks.length) return null;
  return <Task detailed task={tasks[id]} taskId={id} />;
};

export const Task = ({ task, taskId, detailed }) => {
  const { walletAddress, signContract, handleTx, handleTxError } = useContext(WalletContext);
  const { tokenWhitelistAddressToSymbol } = useContext(TokenContext);
  const { updateTasks } = useContext(TaskContext);
  const [userId, setUserId] = useState('');
  const [userIdTouched, setUserIdTouched] = useState(false);
  let description, name;

  const { data, error, isLoading } = useMoralisQuery('Task', (query) =>
    query.exists('taskId').equalTo('taskId', taskId.toString()).select('description', 'name', 'taskId')
  );

  if (data[0]) {
    const parsedData = JSON.parse(JSON.stringify(data[0]));
    description = parsedData.description;
    name = parsedData.name;
  } else {
    description = 'No description found';
    name = `Task ${taskId}`;
  }

  const isPublic = task.promoter == 0;
  const now = new Date().getTime();

  const canFulfillTask =
    isPositiveInt(userId) &&
    task.startDate < now &&
    now < task.endDate &&
    (isPublic || walletAddress === task.promoter) &&
    task.status === 1;

  const fulfillTask = (id) => {
    signContract.fulfillTask(id).then(handleTx).then(updateTasks).catch(handleTxError);
  };
  // console.log(task);

  // console.log(task.startDate < now, now < task.endDate, isPublic || walletAddress === task.promoter, task.status == 1);

  const progress = clamp(((now - task.startDate) / (task.endDate - task.startDate)) * 100, 0, 100);
  const taskState = getTaskState(task);

  return (
    <DStackColumn style={{ position: 'relative' }}>
      <Row>
        <LabelWithText
          // placement="right"
          // text={'Task ' + taskId}
          label={isPublic ? 'Public task' : 'For ' + shortenAddress(task.promoter)}
          tooltip={!isPublic && task.promoter}
        />
        {/* <Typography>Task {taskId}</Typography> */}
        {/* <h3 style={{ textAlign: 'left', marginTop: '0' }}>
          <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>Task {taskId}</span>{' '}
          <span style={{ position: 'absolute', right: '20px', top: '20px' }}>{getIcon('Twitter')}</span>
        </h3> */}
        <Row>
          <LabelWith label="Created by">
            <Tooltip title={task.sponsor} placement="top">
              <Typography>Username#1237</Typography>
            </Tooltip>
          </LabelWith>
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
      <LinearProgress variant="determinate" value={progress} />
      <Row>
        <LabelWithText
          // placement="top"
          label="Reward"
          text={task.depositAmount.toString() + ' ' + tokenWhitelistAddressToSymbol[task.erc20Token].toString()}
        />
      </Row>
      <h3>{name}</h3>

      <Row>
        <Paper elevation={4} sx={{ padding: '1em' }} style={{ width: '100%' }}>
          {/* <LabelWith placement="top" label="Description" text={descriptionShort}></LabelWith> */}
          <LabelWith placement="top" label="Description">
            <Typography style={{ textAlign: 'left' }}>
              {detailed ? description : description.slice(0, 90) + ' ...'}
            </Typography>
            {!detailed && (
              <Button component={Link} to={'/task/' + taskId}>
                view details
              </Button>
            )}
          </LabelWith>
          {/* <LabelWithText placement="top" label="Description" text={descriptionShort} /> */}
        </Paper>
      </Row>
      {detailed && (
        <Fragment>
          <DTextField
            label="Twitter User Id"
            value={userId}
            error={userIdTouched && !isPositiveInt(userId)}
            helperText={userIdTouched && !isPositiveInt(userId) && 'Enter a valid user id'}
            onChange={({ target }) => {
              setUserIdTouched(true);
              setUserId(target.value);
            }}
          />
          <Button variant="contained" onClick={() => fulfillTask(taskId, task)} disabled={!canFulfillTask}>
            Fulfill Task
          </Button>
        </Fragment>
      )}
    </DStackColumn>
  );
};
