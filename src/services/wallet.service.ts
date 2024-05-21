import { Injectable, Logger } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Wallet } from '@/models/wallet.model';
import Web3 from 'web3';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  private web3 = new Web3();

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  private getApiUrl(network: string, action: string, params: string): string {
    const apiUrl = this.configService.get<string>(`networks.${network}.apiUrl`);
    return `${apiUrl}?module=${action}&${params}`;
  }

  private async fetchData(url: string): Promise<any> {
    try {
      const response = await lastValueFrom(this.httpService.get(url));

      return response.data;
    } catch (error) {
      this.logger.error(
        `Error fetching data from ${url}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async fetchTokenPrice(
    network: string,
    apiKey: string,
  ): Promise<number | null> {
    const action =
      network === 'bnbchain'
        ? 'bnbprice'
        : network === 'celo'
          ? 'celoprice'
          : 'ethprice';
    const url = this.getApiUrl(
      network,
      'stats',
      `action=${action}&apikey=${apiKey}`,
    );

    try {
      const data = await this.fetchData(url);
      const priceInUsd =
        network === 'celo' ? data.result?.usd : data.result?.ethusd;

      if (!priceInUsd) {
        this.logger.error(`${network.toUpperCase()} price is undefined`);
        return null;
      }

      return parseFloat(priceInUsd);
    } catch {
      return null;
    }
  }

  private async fetchBalance(
    address: string,
    network: string,
    apiKey: string,
  ): Promise<string | null> {
    const url = this.getApiUrl(
      network,
      'account',
      `action=balance&address=${address}&tag=latest&apikey=${apiKey}`,
    );

    try {
      const data = await this.fetchData(url);
      return data.result || null;
    } catch {
      return null;
    }
  }

  async getWalletDetails(address: string, network: string): Promise<Wallet> {
    const networkConfig = this.configService.get<{
      apiKey: string;
      apiUrl: string;
      coinSymbol: string;
    }>(`networks.${network}`);

    if (!networkConfig || !networkConfig.apiKey || !networkConfig.apiUrl) {
      this.logger.error(
        `API Key or URL not configured for network: ${network}`,
      );
      return { address, balance: '0', value: '0', coin: '' };
    }

    this.logger.log(
      `Using API Key: ${networkConfig.apiKey} and API URL: ${networkConfig.apiUrl} for network: ${network}`,
    );

    const balanceInWei = await this.fetchBalance(
      address,
      network,
      networkConfig.apiKey,
    );
    if (!balanceInWei) {
      return { address, balance: '0', value: '0', coin: '' };
    }

    const priceInUsd = await this.fetchTokenPrice(
      network,
      networkConfig.apiKey,
    );
    const balanceInEth = this.web3.utils.fromWei(balanceInWei, 'ether');
    const balanceValueInUSD = priceInUsd
      ? (parseFloat(balanceInEth) * priceInUsd).toFixed(2)
      : '0';

    return {
      address,
      balance: balanceInEth,
      value: `${balanceValueInUSD}`,
      coin: `${networkConfig.coinSymbol}`,
    };
  }

  async getAllWalletDetails(
    address: string,
  ): Promise<{ network: string; details: Wallet }[]> {
    const networksConfig =
      this.configService.get<
        Record<string, { apiKey: string; apiUrl: string; coinSymbol: string }>
      >('networks');
    const results = await Promise.all(
      Object.keys(networksConfig).map(async (network) => {
        try {
          const details = await this.getWalletDetails(address, network);
          return { network, details };
        } catch (error) {
          this.logger.error(
            `Failed to fetch details for network: ${network}`,
            error.stack,
          );
          return {
            network,
            details: { address, balance: '0', value: '0', coin: '' },
          };
        }
      }),
    );
    return results;
  }
}
