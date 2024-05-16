import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './shared/constants/blockchain.constants';
import { TransactionModule } from './modules/transaction.module';
import { WalletModule } from './modules/wallet.module';

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
