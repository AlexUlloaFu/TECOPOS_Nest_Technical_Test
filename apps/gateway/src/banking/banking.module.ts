import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from '../auth/auth.module';
import { BANKING_SERVICE } from '../constants/injection-tokens';
import { BankingController } from './banking.controller';
import { BankingService } from './banking.service';

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'kafka:9092')
  .split(',')
  .map((broker) => broker.trim())
  .filter(Boolean);

@Module({
  imports: [
    AuthModule,
    ClientsModule.register([
      {
        name: BANKING_SERVICE,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'gateway-banking-client',
            brokers: KAFKA_BROKERS,
          },
          consumer: {
            groupId: 'gateway-banking-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [BankingController],
  providers: [BankingService],
})
export class BankingModule {}
