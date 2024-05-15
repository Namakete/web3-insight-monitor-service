import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AlchemyService } from '@/web3/services/alchemy.service';
import { PriceService } from '@/price/services/price.service';
import { WalletController } from '@/web3/controllers/wallet.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [WalletController],
  providers: [AlchemyService, PriceService],
})
export class AppModule {}
