// import { Link } from '@mui/material';
import { WalletConnectButton } from './context/WalletContext';
import { ContractVitals } from './Dashboard';
import { CreateTask } from './CreateTask';
import { OpenTasks } from './OpenTasks';

import { ReactComponent as TwitterLogo } from '../images/twitter.svg';
import { ReactComponent as DiscordLogo } from '../images/discord.svg';
// import { ReactComponent as OpenseaLogo } from '../images/opensea.svg';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
// import { withRouter } from 'react-router';

import Button from '@mui/material/Button';

// import * as React from 'react';
import { useState, Fragment } from 'react';
import Box from '@mui/material/Box';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Grid } from '@mui/material';
import { NetworkButton } from './context/context';

const Socials = () => (
  <div className="socials">
    <Button variant="text" href="" target="_blank" rel="noreferrer" style={{ minWidth: 45 }}>
      <TwitterLogo style={{ height: 24, width: 20, fill: 'red' }} />
    </Button>
    <Button variant="text" href="" target="_blank" rel="noreferrer" style={{ minWidth: 45 }}>
      <DiscordLogo style={{ height: 24, width: 20 }} />
    </Button>
    {/* <Button variant="text" href="" target="_blank" rel="noreferrer">
      <SvgIcon>
        <OpenseaLogo />
      </SvgIcon>
    </Button> */}
  </div>
);

const Home = () => {
  const [tab, setTab] = useState(window.location?.pathname || '/');

  const handleChange = (event, newTab) => {
    setTab(newTab);
  };

  return (
    <div className="app">
      <BrowserRouter>
        <Fragment>
          <Grid
            container
            className="header"
            alignItems="center"
            sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default' }}
          >
            <Grid item sx={{ flexGrow: 1 }}>
              <Tabs value={tab} onChange={handleChange}>
                <Tab label="Dashboard" component={Link} value={'/'} to={'/'} />
                <Tab label="Open Tasks" component={Link} value={'/open-tasks'} to={'/open-tasks'} />
                <Tab label="Create Task" component={Link} value={'/create-task'} to={'/create-task'} />
              </Tabs>
            </Grid>
            <NetworkButton />
            <WalletConnectButton />
          </Grid>
          <Box component="main" className="background" sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              <Route path="/" element={<ContractVitals />} />
              <Route path="/open-tasks" element={<OpenTasks />} />
              <Route path="/create-task" element={<CreateTask />} />
            </Routes>
          </Box>
          <Grid
            container
            className="footer"
            sx={{ display: 'inline-block', borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}
          >
            <Socials />
          </Grid>
        </Fragment>
      </BrowserRouter>
    </div>
  );
};

export default Home;
