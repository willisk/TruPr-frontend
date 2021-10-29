import './App.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { WalletProvider } from './components/WalletConnector';
import { Web3Provider } from './components/Web3Connector';
import Home from './components/Home';

const theme = createTheme({
  palette: {
    primary: {
      main: '#006400',
    },
    secondary: {
      main: '#ffa500',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Web3Provider>
        <WalletProvider>
          <Home />
        </WalletProvider>
      </Web3Provider>
    </ThemeProvider>
  );
}

export default App;
