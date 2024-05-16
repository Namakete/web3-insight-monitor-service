import { Controller, Get, Param, Query } from '@nestjs/common';
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
    return this.walletService.getWalletDetails(address, network);
  }

  @Get('all/:address')
  async getAllWallets(
    @Param('address') address: string,
  ): Promise<{ network: string; details: Wallet }[]> {
    return this.walletService.getAllWalletDetails(address);
  }
}
