import { AppController } from '@controllers/app.controller';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
})
export class TransactionModule {}
