import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TransactionModule } from '@/modules/transaction.module';
import { WalletModule } from '@/modules/wallet.module';
import configuration from '@/shared/constants/blockchain.constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TransactionModule,
    WalletModule,
  ],
})
export class AppModule {}
