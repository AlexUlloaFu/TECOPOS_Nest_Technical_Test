import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BankingController } from './banking.controller';
import { BANKING_EVENTS_CLIENT } from './constants/injection-tokens';
import { BankingService } from './banking.service';

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'kafka:9092')
  .split(',')
  .map((broker) => broker.trim())
  .filter(Boolean);

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    ClientsModule.register([
      {
        name: BANKING_EVENTS_CLIENT,
        transport: Transport.KAFKA,
        options: {
          producerOnlyMode: true,
          client: {
            clientId: 'banking-events-producer',
            brokers: KAFKA_BROKERS,
          },
        },
      },
    ]),
  ],
  controllers: [BankingController],
  providers: [BankingService],
})
export class BankingModule {}
