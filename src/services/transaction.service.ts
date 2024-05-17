import { Injectable, Logger } from '@nestjs/common';
import { MappedTransaction, Transaction } from '@/models/transaction.model';

import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import Web3 from 'web3';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);
  private web3: Web3;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.web3 = new Web3();
  }

  private async fetchTransactionData(url: string) {
    const response = await lastValueFrom(this.httpService.get(url));
    return response.data.result;
  }

  private async fetchTransactionsData(url: string) {
    const response = await lastValueFrom(this.httpService.get(url));
    return response.data.result;
  }

  private mapTransactionData(
    transactionHash: Transaction,
    coinSymbol: string,
  ): MappedTransaction {
    const {
      hash,
      isError,
      blockNumber,
      timeStamp,
      from,
      to,
      value,
      gasUsed,
      gasPrice,
    } = transactionHash;

    const status = isError === '0' ? 'Success' : 'Failed';
    const block = parseInt(blockNumber, 10);
    const timestamp = new Date(timeStamp * 1000);
    const transactionValue = this.web3.utils.fromWei(value, 'ether');
    const transactionFee = this.web3.utils.fromWei(
      (BigInt(gasUsed) * BigInt(gasPrice)).toString(),
      'ether',
    );
    const gasPriceInGwei = this.web3.utils.fromWei(gasPrice, 'gwei');

    return {
      transactionHash: hash,
      status,
      block,
      timestamp,
      from,
      to,
      value: transactionValue,
      coin: coinSymbol,
      transactionFee,
      gasPrice: gasPriceInGwei,
    };
  }

  private getNetworkConfig(network: string) {
    const apiKey = this.configService.get<string>(`networks.${network}.apiKey`);
    const apiUrl = this.configService.get<string>(`networks.${network}.apiUrl`);
    const coinSymbol = this.configService.get<string>(
      `networks.${network}.coinSymbol`,
    );

    return { apiKey, apiUrl, coinSymbol };
  }

  async getTransactionsByAddress(
    address: string,
    network: string,
  ): Promise<Transaction[]> {
    const { apiKey, apiUrl, coinSymbol } = this.getNetworkConfig(network);

    this.logger.log(`Using API Key: ${apiKey}`);
    this.logger.log(`Using API URL: ${apiUrl}`);

    const url = `${apiUrl}?module=account&action=txlist&address=${address}&sort=asc&apikey=${apiKey}`;
    const transactionsData = await this.fetchTransactionsData(url);

    this.logger.log(
      `Transactions Response: ${JSON.stringify(transactionsData)}`,
    );

    return transactionsData.map((transactionHash) =>
      this.mapTransactionData(transactionHash, coinSymbol),
    );
  }

  async getAllTransactionsByAddress(
    address: string,
  ): Promise<{ network: string; transactions: Transaction[] }[]> {
    const networksConfig =
      this.configService.get<
        Record<string, { apiKey: string; apiUrl: string; coinSymbol: string }>
      >('networks');
    const results = await Promise.all(
      Object.keys(networksConfig).map(async (network) => {
        try {
          const transactions = await this.getTransactionsByAddress(
            address,
            network,
          );
          return { network, transactions };
        } catch (error) {
          this.logger.error(
            `Failed to fetch transactions for network: ${network}`,
            error.stack,
          );
          return { network, transactions: [] };
        }
      }),
    );

    return results;
  }
}
