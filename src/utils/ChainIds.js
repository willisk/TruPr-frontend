const chains = {
  1: 'ETH Mainnet',
  3: 'Ropsten Testnet',
  4: 'Rinkeby Testnet',
  42: 'Kovan Testnet',
  137: 'Polygon Network',
  56: 'Binance Smartchain',
  43114: 'AVAX Network',
};

export const getNetworkName = (chain) => chains[chain];

const blockExplorerURLs = {
  1: 'https://etherscan.io/tx/',
  3: 'https://ropsten.etherscan.io/tx/',
  4: 'https://rinkeby.etherscan.io/tx/',
  42: 'https://kovan.etherscan.io/tx/',
  137: 'https://polygonscan.com/tx/',
};

export const getTransactionLink = (txHash, chainId) => {
  if (blockExplorerURLs.includes(chainId)) return blockExplorerURLs[chainId] + txHash;
  return 'https://etherscan.io/tx/' + txHash;
};
