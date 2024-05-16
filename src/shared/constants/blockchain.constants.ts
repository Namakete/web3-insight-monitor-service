export default () => ({
  networks: {
    ethereum: {
      apiKey: process.env.ETHEREUM_API_KEY,
      apiUrl: 'https://api.etherscan.io/api',
      coinSymbol: 'ETH',
    },
    zksync: {
      apiKey: process.env.ZKSYNC_API_KEY,
      apiUrl: 'https://api-era.zksync.network/api',
      coinSymbol: 'ETH',
    },
    arbitrum: {
      apiKey: process.env.ARBITRUM_API_KEY,
      apiUrl: 'https://api.arbiscan.io/api',
      coinSymbol: 'ETH',
    },
    bnbchain: {
      apiKey: process.env.BNBCHAIN_API_KEY,
      apiUrl: 'https://api.bscscan.com/api',
      coinSymbol: 'BNB',
    },
    base: {
      apiKey: process.env.BASE_API_KEY,
      apiUrl: 'https://api.basescan.org/api',
      coinSymbol: 'ETH',
    },
    arbitrum_nova: {
      apiKey: process.env.ARBITRUM_NOVA_API_KEY,
      apiUrl: 'https://api-nova.arbiscan.io/api',
      coinSymbol: 'ETH',
    },
    polygon: {
      apiKey: process.env.POLYGON_API_KEY,
      apiUrl: 'https://api.polygonscan.com/api',
      coinSymbol: 'MATIC',
    },
    scroll: {
      apiKey: process.env.SCROLL_API_KEY,
      apiUrl: 'https://api.scrollscan.com/api',
      coinSymbol: 'ETH',
    },
    core: {
      apiKey: process.env.CORE_API_KEY,
      apiUrl: 'https://openapi.coredao.org/api',
      coinSymbol: 'CORE',
    },
    celo: {
      apiKey: process.env.CELO_API_KEY,
      apiUrl: 'https://api.celoscan.io/api',
      coinSymbol: 'CELO',
    },
    gnosis: {
      apiKey: process.env.GNOSIS_API_KEY,
      apiUrl: 'https://api.gnosisscan.io/api',
      coinSymbol: 'GNO',
    },
    op: {
      apiKey: process.env.OP_API_KEY,
      apiUrl: 'https://api-optimistic.etherscan.io/api',
      coinSymbol: 'ETH',
    },
  },
});
