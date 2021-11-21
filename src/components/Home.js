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

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Grid } from '@mui/material';
import { NetworkButton } from './context/context';

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

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
const drawerWidth = 220;

const Home = (props) => {
  const [tab, setTab] = useState(window.location?.pathname || '/');

  const handleChange = (event, newTab) => {
    setTab(newTab);
  };
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const container = props.window !== undefined ? () => props.window().document.body : undefined;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {['Dashboard', 'Open Tasks', 'Create Task'].map((text, index) => (
          <ListItem button key={text} onClick={() => setTab(index)}>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

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

          {/* <AppBar
            position="fixed"
            sx={{
              width: { sm: `calc(100% - ${drawerWidth}px)` },
              ml: { sm: `${drawerWidth}px` },
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { sm: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                Responsive drawer
              </Typography>
            </Toolbar>
          </AppBar>
          <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="mailbox folders">
            <Drawer
              container={container}
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                display: { xs: 'block', sm: 'none' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
              }}
            >
              {drawer}
            </Drawer>
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: 'none', sm: 'block' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
              }}
              open
            >
              {drawer}
            </Drawer>
          </Box> */}

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
