import './App.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Web3Connector, WalletConnector, TokenConnector } from './components/context/context';
import { TaskConnector, TaskContext } from './components/context/TaskContext';
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
        <TaskConnector>
          <WalletConnector>
            <TokenConnector>
              <Home />
            </TokenConnector>
          </WalletConnector>
        </TaskConnector>
      </Web3Connector>
    </ThemeProvider>
  );
}

export default App;
