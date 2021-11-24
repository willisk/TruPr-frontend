import React from 'react';
import { useMemo, useState, useContext } from 'react';
import { InputAdornment } from '@mui/material';
import { DStackColumn, DTextFieldInfo } from '../config/defaults';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import { ethers } from 'ethers';

import { TaskContext, WalletContext, Web3Context } from './context/context';
import { getTaskState } from '../config/utils';

// ================== Contract Infos ====================

const MyTasks = () => {
  const { tasks } = useContext(TaskContext);
  const { walletAddress } = useContext(WalletContext);

  const myTasks = tasks.filter(
    (task) => task.promoter.toLowerCase() === walletAddress.toLowerCase() && getTaskState(task) === 'Open'
  );

  const myTasksComponent = myTasks.length ? (
    <List sx={{ width: '100%', bgcolor: 'paper', overflow: 'auto', maxHeight: 300 }}>
      {myTasks.map((task) => (
        <ListItemText
          key={task.id}
          primary={`Task ${task.id}`}
          secondary={
            <React.Fragment>
              <Typography sx={{ display: 'inline' }} component="span" variant="body2" color="text.primary">
                "Status: Open"
              </Typography>
              {' — Maybe go to a detail page on click?'}
            </React.Fragment>
          }
        >
          <Divider variant="inset" component="li" />
        </ListItemText>
      ))}
    </List>
  ) : (
    <div>No tasks yet.. look for open Tasks</div>
  );

  return (
    <Grid item xs={12} md={6} lg={4}>
      <DStackColumn>
        <h2>My Open Tasks</h2>
        {myTasksComponent}
      </DStackColumn>
    </Grid>
  );
};

const MyPreviousTasks = () => {
  const { tasks } = useContext(TaskContext);
  const { walletAddress } = useContext(WalletContext);

  const myTasks = tasks.filter(
    (task) => task.promoter.toLowerCase() === walletAddress.toLowerCase() && getTaskState(task) !== 'Open'
  );

  return (
    <Grid item xs={12} md={6} lg={4}>
      <DStackColumn>
        <h2>My Closed Tasks</h2>
        <List sx={{ width: '100%', bgcolor: 'background.paper', overflow: 'auto', maxHeight: 300 }}>
          {myTasks.map((task) => (
            <ListItem alignItems="flex-start" key={task.id}>
              <ListItemText
                primary={`Task ${task.id}`}
                secondary={
                  <React.Fragment>
                    <Typography sx={{ display: 'inline' }} component="span" variant="body2" color="text.primary">
                      {getTaskState(task)}
                    </Typography>
                    {' — Maybe go to a detail page on click?'}
                  </React.Fragment>
                }
              />
            </ListItem>
          ))}
        </List>
      </DStackColumn>
    </Grid>
  );
};

export const DashBoard = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <MyTasks />
        <MyPreviousTasks />
      </Grid>
    </Box>
  );
};

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
    // if (!isConnected) return;
    contract.owner().then(setContractOwner).catch(handleTxError);
    contract.taskCount().then(setTaskCount).catch(handleTxError);
    web3Provider.getBalance(contract.address).then(setContractBalance).catch(handleTxError);
  }, [contract, web3Provider]);

  return (
    <Grid item xs={12} md={6} lg={4}>
      <DStackColumn>
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
      </DStackColumn>
    </Grid>
  );
};
