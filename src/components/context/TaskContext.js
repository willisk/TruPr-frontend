import './connector.css';
import { createContext, useMemo, useState, useContext, useCallback } from 'react';

import { Web3Context } from './Web3Context';

export const TaskContext = createContext({
  tasks: null,
  updateTasks: null,
});

export const TaskConnector = ({ children }) => {
  // console.log('rendering', 'TaskConnector');
  const [tasks, setTasks] = useState([]);

  const { contract, chainId } = useContext(Web3Context);
  // const { walletAddress } = useContext(WalletContext);

  const updateTasks = () => {
    console.log('calling updateTasks');
    // updateTaskCount();
    contract
      .getAllTasks()
      .then((_tasks) => {
        _tasks = _tasks.map((task) => {
          // console.log('parsing', task);
          return {
            ...task,
            startDate: task.startDate * 1000,
            endDate: task.endDate * 1000,
            vestingTerm: task.vestingTerm * 1000,
            // task.state = getTaskState(task);
          };
        });
        console.log('Setting', _tasks);
        setTasks((t) => [...t, _tasks]);
      })
      .catch(console.error);
  };

  console.log('TaskContext tasks', tasks);

  useMemo(() => {
    // console.log('calling init Tasks');
    updateTasks();
    contract.on(contract.filters.TaskCreated(), updateTasks);
  }, [contract]);

  const context = {
    tasks: tasks,
    updateTasks: updateTasks,
  };

  return <TaskConnector.Provider value={context}>{children}</TaskConnector.Provider>;
};
