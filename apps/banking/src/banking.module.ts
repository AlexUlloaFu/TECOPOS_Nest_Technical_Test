import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BankingController } from './banking.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [BankingController],
})
export class BankingModule {}
