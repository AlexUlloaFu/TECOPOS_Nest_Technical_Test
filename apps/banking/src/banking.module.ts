import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { BankingController } from './banking.controller';
import { BankingService } from './banking.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  controllers: [BankingController],
  providers: [BankingService],
})
export class BankingModule {}
