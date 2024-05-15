import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Alchemy,
  Network,
  AssetTransfersCategory,
  SortingOrder,
} from 'alchemy-sdk';
import { PriceService } from '@/price/services/price.service';
import { NETWORKS_CONFIG } from '@configs/networks/networks.config';
import { NetworkBalance, Balance, Transaction } from './types';

@Injectable()
export class AlchemyService {
  private readonly logger = new Logger(AlchemyService.name);
  private readonly alchemyInstances: { [key: string]: Alchemy } = {};

  constructor(
    private configService: ConfigService,
    private priceService: PriceService,
  ) {
    this.initAlchemyInstances();
  }

  private initAlchemyInstances() {
    Object.entries(NETWORKS_CONFIG).forEach(([network, config]) => {
      this.alchemyInstances[network] = new Alchemy({
        apiKey: this.configService.get<string>(config.apiKeyEnv),
        network: Network[config.network],
      });
    });
  }

  async getBalances(address: string): Promise<NetworkBalance[]> {
    return this.processNetworkRequests<NetworkBalance>((network) =>
      this.getNetworkBalances(address, network),
    );
  }

  async getTransactions(address: string): Promise<Transaction[]> {
    const transactionsResults = await this.processNetworkRequests<
      Transaction[]
    >((network) => this.getNetworkTransactions(address, network));
    return transactionsResults.flat();
  }

  private async processNetworkRequests<T>(
    requestFn: (network: string) => Promise<T>,
  ): Promise<T[]> {
    const results = await Promise.all(
      Object.keys(NETWORKS_CONFIG).map((network) => requestFn(network)),
    );
    return results.filter(Boolean);
  }

  private async getNetworkBalances(
    address: string,
    network: string,
  ): Promise<NetworkBalance | null> {
    try {
      const alchemy = this.alchemyInstances[network];
      const config = NETWORKS_CONFIG[network];

      const nativeTokenBalance = await this.getTokenBalance(
        alchemy,
        address,
        config.symbol,
      );
      const tokenBalances = await this.getTokenBalances(alchemy, address);
      const allBalances = [nativeTokenBalance, ...tokenBalances];

      const tokenSymbols = allBalances.map((balance) =>
        balance.Token.toUpperCase(),
      );
      const prices = await this.priceService.getPrices(tokenSymbols);

      this.updateBalancesWithPrices(allBalances, prices);

      return { network: config.name, Value: allBalances };
    } catch (error) {
      this.logger.error(
        `Error fetching balances for network ${network}: ${error.message}`,
        error,
      );
      return null;
    }
  }

  private async getNetworkTransactions(
    address: string,
    network: string,
  ): Promise<Transaction[]> {
    try {
      const alchemy = this.alchemyInstances[network];

      const supportedCategories = this.getSupportedCategories(network);

      const transactions = await alchemy.core.getAssetTransfers({
        fromAddress: address,
        category: supportedCategories,
        maxCount: 100,
        order: SortingOrder.DESCENDING,
      });

      return transactions.transfers as Transaction[];
    } catch (error) {
      this.logger.error(
        `Error fetching transactions for network ${network}: ${error.message}`,
        error,
      );
      return [];
    }
  }

  private getSupportedCategories(network: string): AssetTransfersCategory[] {
    const categories = [
      AssetTransfersCategory.EXTERNAL,
      AssetTransfersCategory.ERC20,
      AssetTransfersCategory.ERC721,
      AssetTransfersCategory.ERC1155,
    ];

    if (network !== 'arbitrum' && network !== 'zksync') {
      categories.push(AssetTransfersCategory.INTERNAL);
    }

    return categories;
  }

  private async getTokenBalance(
    alchemy: Alchemy,
    address: string,
    tokenSymbol: string,
  ): Promise<Balance> {
    const balanceInWei = await alchemy.core.getBalance(address);
    return this.createBalanceData(tokenSymbol, Number(balanceInWei) / 1e18);
  }

  private async getTokenBalances(
    alchemy: Alchemy,
    address: string,
  ): Promise<Balance[]> {
    const tokenBalances = await alchemy.core.getTokenBalances(address);
    return tokenBalances.tokenBalances.map((tokenBalance) => {
      const balanceInWei = tokenBalance.tokenBalance
        ? Number(tokenBalance.tokenBalance)
        : 0;
      return this.createBalanceData(
        tokenBalance.contractAddress.toLowerCase(),
        balanceInWei / 1e18,
      );
    });
  }

  private createBalanceData(token: string, amount: number): Balance {
    return {
      Token: token,
      Data: { Amount: amount, Price: 0, USD: 0 },
    };
  }

  private updateBalancesWithPrices(
    balances: Balance[],
    prices: { [key: string]: number },
  ) {
    balances.forEach((balance) => {
      const tokenId = balance.Token.toUpperCase();
      const priceInUSD = prices[tokenId] || 0;
      balance.Data.Price = priceInUSD;
      balance.Data.USD = balance.Data.Amount * priceInUSD;
    });
  }
}
