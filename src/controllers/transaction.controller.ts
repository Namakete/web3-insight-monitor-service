import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TransactionService } from '@/services/transaction.service';
import { Transaction } from '@/models/transaction.model';

@Controller('api/v2/transactions')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get('address/:address')
  async getTransactionsByAddress(
    @Param('address') address: string,
    @Query('network') network: string,
  ): Promise<Transaction[]> {
    try {
      return await this.transactionService.getTransactionsByAddress(
        address,
        network,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('address/all/:address')
  async getAllTransactionsByAddress(
    @Param('address') address: string,
  ): Promise<{ network: string; transactions: Transaction[] }[]> {
    try {
      return await this.transactionService.getAllTransactionsByAddress(address);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
