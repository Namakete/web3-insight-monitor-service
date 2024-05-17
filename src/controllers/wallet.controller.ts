import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { WalletService } from '@/services/wallet.service';
import { Wallet } from '@/models/wallet.model';

@Controller('api/v2/wallets')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get(':address')
  async getWallet(
    @Param('address') address: string,
    @Query('network') network: string,
  ): Promise<Wallet> {
    try {
      return await this.walletService.getWalletDetails(address, network);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('all/:address')
  async getAllWallets(
    @Param('address') address: string,
  ): Promise<{ network: string; details: Wallet }[]> {
    try {
      return await this.walletService.getAllWalletDetails(address);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
