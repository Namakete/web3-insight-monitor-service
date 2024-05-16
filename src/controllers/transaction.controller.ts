import { Controller, Get, Param, Query } from '@nestjs/common';
import { TransactionService } from '@/services/transaction.service';
import { Transaction } from '@/models/transaction.model';

@Controller('api/v2/transactions')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get(':transactionHash')
  async getTransaction(
    @Param('transactionHash') transactionHash: string,
    @Query('network') network: string,
  ): Promise<Transaction> {
    return this.transactionService.getTransactionDetails(
      transactionHash,
      network,
    );
  }

  @Get('address/:address')
  async getTransactionsByAddress(
    @Param('address') address: string,
    @Query('network') network: string,
  ): Promise<Transaction[]> {
    return this.transactionService.getTransactionsByAddress(address, network);
  }

  @Get('address/all/:address')
  async getAllTransactionsByAddress(
    @Param('address') address: string,
  ): Promise<{ network: string; transactions: Transaction[] }[]> {
    return this.transactionService.getAllTransactionsByAddress(address);
  }
}
