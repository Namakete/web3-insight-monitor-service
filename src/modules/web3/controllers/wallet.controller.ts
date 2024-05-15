import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { AlchemyService } from '@web3Services/alchemy.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly alchemyService: AlchemyService) {}

  @Get('balances')
  async getBalances(@Query('address') address: string) {
    if (!address) throw new BadRequestException('Address is required');

    try {
      const balances = await this.alchemyService.getBalances(address);
      return balances;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('transactions')
  async getTransactions(@Query('address') address: string) {
    if (!address) throw new BadRequestException('Address is required');

    try {
      const transactions = await this.alchemyService.getTransactions(address);
      return transactions;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
