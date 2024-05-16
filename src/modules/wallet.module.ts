import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WalletService } from '../services/wallet.service';
import { WalletController } from '../controllers/wallet.controller';

@Module({
  imports: [HttpModule],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
