import { Module } from '@nestjs/common';
import { WalletController } from '@controllers/wallet.controller';
import { AlchemyService } from '@services/alchemy.service';
import { PriceService } from '@services/price.service';
import { NetworksConfigService } from '@configs/networks.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [WalletController],
  providers: [AlchemyService, PriceService, NetworksConfigService],
  exports: [AlchemyService, PriceService],
})
export class Web3Module {}
