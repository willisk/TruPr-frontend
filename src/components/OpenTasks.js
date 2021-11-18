import React from 'react';
import { useState, useContext } from 'react';
import { Checkbox } from '@mui/material';
import Input from '@mui/material/Input';
import { DTextField } from '../config/defaults';

import { TaskContext, WalletContext } from './context/context';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import { Task } from './Task';

let entries = null

export const OpenTasks = () => {
  const [viewAll, setViewAll] = useState(true);

  const { walletAddress } = useContext(WalletContext);
  const { tasks } = useContext(TaskContext);
  const [search, setSearch] = useState('');

  const taskEntries = () => {
    if (!tasks?.length) return null;
    entries = tasks;
    if (search !== '') entries = doFilterByText(entries, search)
    if (!viewAll) entries = entries.filter((task) => task.address === 0 || task.address === walletAddress);

    return entries.map((task, id) => (
      <Grid item key={id} xs={12} md={6} lg={4}>
        <Task task={task} taskId={id} detailedTaskView />
      </Grid>
    ));
  };

  const doFilterByText = (tasks, search) => {
    return tasks.filter(function (item) {
      return item.data.includes(search)
    })
  }

  return (
    <div>
      <div>
        <Checkbox checked={viewAll} onChange={(event) => setViewAll(event.target.checked)} />
        View all tasks
      </div>
      <div>
        <DTextField
          label="Search"
          value={search}
          onChange={({ target }) => {
            setSearch(target.value);
            taskEntries()
            doFilterByText(entries, target.value)
          }}
        />
      </div>
      <h2>Open Tasks</h2>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          {taskEntries()}
        </Grid>
      </Box>
    </div>
  );
};
