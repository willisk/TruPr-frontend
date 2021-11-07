import './App.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { WalletConnector, TokenConnector } from './components/WalletConnector';
import { Web3Connector } from './components/Web3Connector';
import Home from './components/Home';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#dfe1ef',
    },
    // secondary: {
    //   // main: '#481c07',
    //   main: '#fff',
    // },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Web3Connector>
        <WalletConnector>
          <TokenConnector>
            <Home />
          </TokenConnector>
        </WalletConnector>
      </Web3Connector>
    </ThemeProvider>
  );
}

export default App;
