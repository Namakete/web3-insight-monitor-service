import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TransactionService } from '../services/transaction.service';
import { TransactionController } from '../controllers/transaction.controller';

@Module({
  imports: [HttpModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
