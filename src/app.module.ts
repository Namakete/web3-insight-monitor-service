import { AppController } from '@/controllers/app.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TransactionModule } from '@/modules/transaction.module';
import { WalletModule } from '@/modules/wallet.module';
import configuration from '@/shared/constants/blockchain.constants';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TransactionModule,
    WalletModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
