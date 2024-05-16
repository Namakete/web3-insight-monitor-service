import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import Web3 from 'web3';
import { Transaction } from '@/models/transaction.model';

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

  private mapTransactionData(tx, coinSymbol: string) {
    return {
      transactionHash: tx.hash,
      status: tx.isError === '0' ? 'Success' : 'Failed',
      block: parseInt(tx.blockNumber, 10),
      timestamp: new Date(tx.timeStamp * 1000),
      from: tx.from,
      to: tx.to,
      value: `${this.web3.utils.fromWei(tx.value, 'ether')}`,
      coin: `${coinSymbol}`,
      transactionFee: `${this.web3.utils.fromWei((tx.gasUsed * tx.gasPrice).toString(), 'ether')}`,
      gasPrice: this.web3.utils.fromWei(tx.gasPrice, 'gwei'),
    };
  }

  async getTransactionDetails(
    transactionHash: string,
    network: string,
  ): Promise<Transaction> {
    const apiKey = this.configService.get<string>(`networks.${network}.apiKey`);
    const apiUrl = this.configService.get<string>(`networks.${network}.apiUrl`);
    const coinSymbol = this.configService.get<string>(
      `networks.${network}.coinSymbol`,
    );

    this.logger.log(`Using API Key: ${apiKey}`);
    this.logger.log(`Using API URL: ${apiUrl}`);

    const url = `${apiUrl}?module=proxy&action=eth_getTransactionByHash&txhash=${transactionHash}&apikey=${apiKey}`;
    const transactionData = await this.fetchTransactionData(url);

    this.logger.log(`Transaction Response: ${JSON.stringify(transactionData)}`);

    return {
      transactionHash: transactionData.hash,
      status: transactionData.status,
      block: parseInt(transactionData.blockNumber, 16),
      timestamp: new Date(),
      from: transactionData.from,
      to: transactionData.to,
      value: `${this.web3.utils.fromWei(transactionData.value, 'ether')}`,
      coin: `${coinSymbol}`,
      transactionFee: '',
      gasPrice: this.web3.utils.fromWei(transactionData.gasPrice, 'gwei'),
    };
  }

  async getTransactionsByAddress(
    address: string,
    network: string,
  ): Promise<Transaction[]> {
    const apiKey = this.configService.get<string>(`networks.${network}.apiKey`);
    const apiUrl = this.configService.get<string>(`networks.${network}.apiUrl`);
    const coinSymbol = this.configService.get<string>(
      `networks.${network}.coinSymbol`,
    );

    this.logger.log(`Using API Key: ${apiKey}`);
    this.logger.log(`Using API URL: ${apiUrl}`);

    const url = `${apiUrl}?module=account&action=txlist&address=${address}&sort=asc&apikey=${apiKey}`;
    const transactionsData = await this.fetchTransactionsData(url);

    this.logger.log(
      `Transactions Response: ${JSON.stringify(transactionsData)}`,
    );

    return transactionsData.map((tx) =>
      this.mapTransactionData(tx, coinSymbol),
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
