import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { NetworksConfigService } from '@configs/networks.config';

@Module({
  imports: [NestConfigModule.forRoot()],
  providers: [NetworksConfigService],
  exports: [NetworksConfigService, NestConfigModule],
})
export class ConfigModule {}
