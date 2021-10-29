// import Dashboard from './Dashboard';
import { WalletConnectButton } from './WalletConnector';
import { ContractVitals, CreateAgreement, Web3Component } from './Contract';
// import { createContext, useContext } from "react";

// import TwitterIcon from "@mui/icons-material/Twitter";
import { SvgIcon } from '@mui/material';

import { ReactComponent as TwitterLogo } from '../images/twitter.svg';
import { ReactComponent as DiscordLogo } from '../images/discord.svg';
import { ReactComponent as OpenseaLogo } from '../images/opensea.svg';

import Button from '@mui/material/Button';
import { Web3Context } from './Web3Connector';
// import { Dashboard } from '@mui/icons-material';
// import Stack from '@mui/material/Stack';
// import { useContext } from 'react';

// const TwitterSvg = require("../images/twitter.svg");

const Socials = () => (
  <div className="socials">
    <Button variant="outlined" href="" target="_blank" rel="noreferrer">
      <SvgIcon>
        <TwitterLogo />
      </SvgIcon>
    </Button>
    <Button variant="outlined" href="" target="_blank" rel="noreferrer">
      <SvgIcon>
        <DiscordLogo />
      </SvgIcon>
    </Button>
    {/* <Button variant="outlined" href="" target="_blank" rel="noreferrer">
      <SvgIcon>
        <OpenseaLogo />
      </SvgIcon>
    </Button> */}
  </div>
);

function Home() {
  return (
    <div className="app">
      <div className="home">
        <div className="header">
          <Socials />
          <WalletConnectButton />
        </div>
        <div className="container">
          <ContractVitals />

          <Web3Component>
            <CreateAgreement />
          </Web3Component>

          {/* <Dashboard
          startDate={startDate}
          contractDefaults={{
            supplyMinted: 0,
            supplyTotal: contractSupplyTotal,
            supplyReserve: contractSupplyReserve,
            mintPrice: contractMintPrice,
            purchaseLimit: contractPurchaseLimit,
          }}
          goLive={goLive}
        /> */}
        </div>
        <div className="footer"></div>
      </div>
    </div>
  );
}

export default Home;
