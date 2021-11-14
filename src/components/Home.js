// import { Link } from '@mui/material';
import { WalletConnectButton } from './WalletConnector';
import { ContractVitals } from './Dashboard';
import { CreateTask } from './CreateTask';
import { OpenTasks } from './OpenTasks';

import { ReactComponent as TwitterLogo } from '../images/twitter.svg';
import { ReactComponent as DiscordLogo } from '../images/discord.svg';
// import { ReactComponent as OpenseaLogo } from '../images/opensea.svg';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
// import { withRouter } from 'react-router';

import Button from '@mui/material/Button';

// import * as React from 'react';
import { useState, memo, Fragment } from 'react';
import Box from '@mui/material/Box';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Grid } from '@mui/material';
import { NetworkButton } from './Web3Connector';

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

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function Home() {
  const [tab, setTab] = useState(0);

  const handleChange = (event, newTab) => {
    setTab(newTab);
  };

  // XXX: why does this not prevent re-rendering?
  const PanelOne = memo(() => {});
  const PanelTwo = memo(() => {
    return <OpenTasks />;
  });
  const PanelThree = memo(() => {
    return <CreateTask />;
  });

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
              <Tabs value={0}>
                <Tab label="Dashboard" component={Link} to={'/'} />
                <Tab label="Open Tasks" component={Link} to={'/open-tasks'} />
                <Tab label="Create Task" component={Link} to={'/create-task'} />
              </Tabs>
              {/* <Routes>
                <Route
                  path={'/'}
                  render={({ location }) => {
                    console.log('tab', 'loc', location);
                    return (
                      <Tabs value={'/'}>
                        <Tab label="Dashboard" component={Link} to={'/'} />
                        <Tab label="Open Tasks" component={Link} to={'/open-tasks'} />
                        <Tab label="Create Task" component={Link} to={'/create-task'} />
                      </Tabs>
                    );
                  }}
                />
              </Routes> */}
              {/* <Route
                  path={'/'}
                  render={({ location }) => {
                    console.log('tab', 'loc', location);
                    return (
                      // <Tabs value={location?.pathname}>
                      <Tabs value={'/'}>
                        <Tab label="Dashboard" component={Link} to={'/'} />
                        <Tab label="Open Tasks" component={Link} to={'/open-tasks'} />
                        <Tab label="Create Task" component={Link} to={'/create-task'} />
                      </Tabs>
                    );
                  }}
                /> */}
              {/* {['/', '/open-tasks', '/create-task'].map((tab) => (
                  <Route
                    path={tab}
                    render={({ location }) => {
                      console.log('tab', tab, 'loc', location);
                      return (
                        // <Tabs value={location?.pathname}>
                        <Tabs value={'/'}>
                          <Tab label="Dashboard" component={Link} to={'/'} />
                          <Tab label="Open Tasks" component={Link} to={'/open-tasks'} />
                          <Tab label="Create Task" component={Link} to={'/create-task'} />
                        </Tabs>
                      );
                    }}
                  ></Route>
                ))} */}
              {/* </Routes> */}
              {/* <Route
                  path="/"
                  render={({ location }) => {
                    console.log('sdlfjlsjkfd', location);
                    return null;
                  }}
                  // element={
                  //   <Tabs value={'/'}>
                  //     <Tab label="Dashboard" component={Link} to={'/'} />
                  //     <Tab label="Open Tasks" component={Link} to={'/open-tasks'} />
                  //     <Tab label="Create Task" component={Link} to={'/create-task'} />
                  //   </Tabs>
                  // }
                ></Route>
              </Routes> */}
            </Grid>
            <NetworkButton />
            <WalletConnectButton />
          </Grid>
          <Box
            component="main"
            className="background"
            sx={{
              flexGrow: 1,
              // bgcolor: 'background.default',
              p: 3,
              // width: '100%',
            }}
          >
            <Routes>
              <Route path="/" element={<ContractVitals />} />
              <Route path="/open-tasks" element={<OpenTasks />} />
              <Route path="/create-task" element={<CreateTask />} />
            </Routes>
            {/* {(tab === 0 && <PanelOne />) || (tab === 1 && <PanelTwo />) || (tab === 2 && <PanelThree />)} */}
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
}

export default Home;
