import React from 'react';
import { useMemo, useEffect, useState, useContext } from 'react';
import { Stack, MenuItem, Button, InputAdornment, LinearProgress, Chip } from '@mui/material';
import { DStack, DTextField, DTextFieldInfo, DDateTimePicker } from '../config/defaults';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import { ethers } from 'ethers';

import { Web3Context } from './Web3Connector';

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

  const myPreviousTaskList = () => {
    return (
      <Grid item xs={12} md={6} lg={4}>
        <DStack>
          <h2>My closed tasks</h2>
          <List sx={{ width: '100%', bgcolor: 'background.paper', overflow: 'auto', maxHeight: 300 }}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary="Task 0"
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      Status: CLOSED
                    </Typography>
                    {" — Maybe go to a detail page on click?"}
                  </React.Fragment>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem alignItems="flex-start">
              <ListItemText
                primary="Task 0"
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      Status: CLOSED
                    </Typography>
                    {" — Maybe go to a detail page on click?"}
                  </React.Fragment>
                }
              />
            </ListItem>
          </List>
        </DStack>
      </Grid>
    );
  }

  const myOpenTaskList = () => {
    return (
      <Grid item xs={12} md={6} lg={4}>
        <DStack>
          <h2>My open tasks</h2>
          <List sx={{ width: '100%', bgcolor: 'background.paper', overflow: 'auto', maxHeight: 300 }}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary="Task 0"
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      Status: OPEN
                    </Typography>
                    {" — Maybe go to a detail page on click?"}
                  </React.Fragment>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem alignItems="flex-start">
              <ListItemText
                primary="Task 0"
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      Status: OPEN
                    </Typography>
                    {" — Maybe go to a detail page on click?"}
                  </React.Fragment>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem alignItems="flex-start">
              <ListItemText
                primary="Task 0"
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      Status: OPEN
                    </Typography>
                    {" — Maybe go to a detail page on click?"}
                  </React.Fragment>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem alignItems="flex-start">
              <ListItemText
                primary="Task 0"
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      Status: OPEN
                    </Typography>
                    {" — Maybe go to a detail page on click?"}
                  </React.Fragment>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem alignItems="flex-start">
              <ListItemText
                primary="Task 0"
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      Status: OPEN
                    </Typography>
                    {" — Maybe go to a detail page on click?"}
                  </React.Fragment>
                }
              />
            </ListItem>
          </List>
        </DStack>
      </Grid>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={4}>
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
        </Grid>
        {myOpenTaskList()}
        {myPreviousTaskList()}
      </Grid>
    </Box>
  );
};
