import React from 'react';
import { useState, useContext } from 'react';
import { Checkbox } from '@mui/material';
import { DTextField } from '../config/defaults';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

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
  const [ sort, setSort ] = useState('');

  const taskEntries = () => {
    if (!tasks?.length) return null;
    entries = tasks;
    if (search !== '') entries = doFilterByText(entries, search)
    if (sort !== '') entries = doFilterBySort(entries, sort)
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

  const doFilterBySort = (tasks, search) => {
    if (search === 'createdat_down') {
      return tasks.sort((a,b) => (a.startDate > b.startDate) ? 1 : ((b.startDate > a.startDate) ? -1 : 0))
    } else if (search === 'createdat_up') {
      return tasks.sort((a,b) => (a.startDate < b.startDate) ? 1 : ((b.startDate < a.startDate) ? -1 : 0))
    }
  }

  return (
    <div>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}
      >
        <div>
          <Checkbox checked={viewAll} onChange={(event) => setViewAll(event.target.checked)} />
          View all tasks
        </div>
        <FormControl
          style={{width: '150px'}}
        >
          <InputLabel id="task-sort-label">Sort by</InputLabel>
          <Select
            labelId="task-sort-label"
            id="task-sort-select"
            value={sort}
            label="Sort by"
            onChange={({ target }) => {
              setSort(target.value);
              taskEntries()
              doFilterBySort(entries, target.value)
            }}
          >
            <MenuItem value='createdat_down'>Created ASC</MenuItem>
            <MenuItem value='createdat_up'>Created DESC</MenuItem>
          </Select>
        </FormControl>
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
