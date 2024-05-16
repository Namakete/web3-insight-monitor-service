import { Module } from '@nestjs/common';
import { ConfigModule } from '@modules/config.module';
import { Web3Module } from '@modules/web3.module';

@Module({
  imports: [ConfigModule, Web3Module],
})
export class AppModule {}
