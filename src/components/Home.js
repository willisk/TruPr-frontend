import { WalletConnectButton } from './WalletConnector';
import { ContractVitals, CreateTask, DevTools, OpenTasks } from './Contract';

import { ReactComponent as TwitterLogo } from '../images/twitter.svg';
import { ReactComponent as DiscordLogo } from '../images/discord.svg';
// import { ReactComponent as OpenseaLogo } from '../images/opensea.svg';

import Button from '@mui/material/Button';

// import * as React from 'react';
import { useState, memo } from 'react';
import Box from '@mui/material/Box';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Grid } from '@mui/material';
import { NetworkButton } from './Web3Connector';

const Socials = () => (
  <div className="socials">
    <Button variant="text" href="" target="_blank" rel="noreferrer" style={{ minWidth: 45 }}>
      <TwitterLogo style={{ height: 24, width: 20 }} />
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

function Home({ classes }) {
  const [tab, setTab] = useState(0);

  const handleChange = (event, newTab) => {
    setTab(newTab);
  };

  // XXX: why does this not prevent re-rendering?
  const PanelOne = memo(() => {
    return <ContractVitals />;
  });
  const PanelTwo = memo(() => {
    return <OpenTasks />;
  });
  const PanelThree = memo(() => {
    return <CreateTask />;
  });

  return (
    <div className="app">
      <div className="home">
        {/* XXX: Grid container is not calculating height accurately, border is misplaced */}
        <Grid container className="header" alignItems="center" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Grid item sx={{ flexGrow: 1 }}>
            <Tabs value={tab} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="Dashboard" {...a11yProps(0)} />
              <Tab label="Open Tasks" {...a11yProps(1)} />
              <Tab label="Create Task" {...a11yProps(2)} />
            </Tabs>
          </Grid>
          <NetworkButton />
          <WalletConnectButton />
        </Grid>
        <Box
          component="main"
          className="background"
          sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, width: '100%' }}
        >
          {(tab === 0 && <PanelOne />) || (tab === 1 && <PanelTwo />) || (tab === 2 && <PanelThree />)}
        </Box>
        <Box className="footer" sx={{ flexGrow: 1, borderTop: 1, borderColor: 'divider' }}>
          <Socials />
        </Box>
      </div>
    </div>
  );
}

export default Home;
