import React from 'react';
import { useMemo, useEffect, useState, useContext } from 'react';
import { Stack, MenuItem, Button, InputAdornment, LinearProgress, Chip } from '@mui/material';
import { DStack, DTextField, DTextFieldInfo, DDateTimePicker } from '../config/defaults';

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
