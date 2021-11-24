import { Fragment, useContext, useState } from 'react';
import { Button, LinearProgress, Chip, InputAdornment, Paper, Tooltip } from '@mui/material';
import { DStackColumn, Row, StyledTextFieldInfo, LabelWith, StyledTextField } from '../config/defaults';
import { Link, useParams } from 'react-router-dom';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import { LabelWithText } from '../config/defaults';

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

  const isPublic = task.promoter == 0;
  const now = new Date().getTime();

  const canFulfillTask =
    isPositiveInt(userId) &&
    task.startDate < now &&
    now < task.endDate &&
    (isPublic || walletAddress === task.promoter) &&
    task.status === 1;

  const fulfillTask = (id) => {
    if (isPublic) signContract.fulfillTaskPublic(id, userId).then(handleTx).then(updateTasks).catch(handleTxError);
    else signContract.fulfillTask(id).then(handleTx).then(updateTasks).catch(handleTxError);
  };
  // console.log(task);

  // console.log(task.startDate < now, now < task.endDate, isPublic || walletAddress === task.promoter, task.status == 1);

  const progress = clamp(((now - task.startDate) / (task.endDate - task.startDate)) * 100, 0, 100);
  const taskState = getTaskState(task);

  const description =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas et rutrum mi. Vestibulum aliquam bibendum sodales. Donec faucibus malesuada magna vitae mattis. Nulla pharetra ultrices faucibus. Proin quis enim non purus pretium fermentum. Praesent ac elit tristique, suscipit dolor et, mattis ex. Nam in pharetra tellus. Nullam laoreet nibh non efficitur volutpat. Donec sodales est vitae dolor elementum, nec ultricies ante fringilla. Sed vitae egestas tortor, eu vehicula nunc. Aliquam erat volutpat. Suspendisse eu arcu mauris. Sed hendrerit ultricies porttitor.';

  return (
    <DStackColumn style={{ position: 'relative' }}>
      <Row>
        <LabelWithText
          label={isPublic ? 'Public task' : 'For ' + shortenAddress(task.promoter)}
          tooltip={!isPublic && task.promoter}
        />
        <Row>
          <LabelWithText label="Created by" text="Username#1237" tooltip={task.sponsor} />
          {/* <LabelWith label="Created by">
            <Tooltip title={task.sponsor} placement="top">
              <Typography>Username#1237</Typography>
            </Tooltip>
          </LabelWith> */}
          {getIcon('Twitter')}
        </Row>
      </Row>

      {/* <div style={{ display: 'flex', justifyContent: 'space-between' }}> */}
      <Row>
        <LabelWith placement="right" label={taskTimeDeltaInfo(task)}>
          <Chip label={taskState} color={taskState === 'Open' ? 'success' : 'error'} />
        </LabelWith>
        <LabelWithText
          // placement="top"
          label="Reward"
          text={task.depositAmount.toString() + ' ' + tokenWhitelistAddressToSymbol[task.erc20Token].toString()}
        />
      </Row>
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
      <h3>{'Task ' + taskId}</h3>

      <Paper elevation={4} sx={{ padding: '1em' }}>
        <Row>
          {/* <LabelWith placement="top" label="Description" text={descriptionShort}></LabelWith> */}
          <LabelWithText
            placement="top"
            label="Description"
            text={detailed ? description : description.slice(0, 90) + ' ...'}
          />
          {/* <LabelWith placement="top" label="Description">
            <Typography style={{ textAlign: 'left' }}>
              {detailed ? description : description.slice(0, 90) + ' ...'}
            </Typography>
          </LabelWith> */}
          {/* <LabelWithText placement="top" label="Description" text={descriptionShort} /> */}
        </Row>
        {!detailed && (
          <Button component={Link} to={'/task/' + taskId}>
            view details
          </Button>
        )}
      </Paper>
      {detailed && (
        <Fragment>
          <Row>
            <LabelWith
              variant="standard"
              label="Enter your Twitter user id"
              tooltip="This is the user id of the Twitter account you made the Tweet with."
              tooltipPlacement="?"
              placement="top"
            >
              <StyledTextField
                label="Twitter User Id"
                value={userId}
                error={userIdTouched && !isPositiveInt(userId)}
                helperText={userIdTouched && !isPositiveInt(userId) && 'Enter a valid user id'}
                onChange={({ target }) => {
                  setUserIdTouched(true);
                  setUserId(target.value);
                }}
              />
            </LabelWith>
          </Row>
          <Button variant="contained" onClick={() => fulfillTask(taskId, task)} disabled={!canFulfillTask}>
            Fulfill Task
          </Button>
        </Fragment>
      )}
    </DStackColumn>
  );
};
