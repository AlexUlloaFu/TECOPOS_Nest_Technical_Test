import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { buildKafkaClientOptions } from '@libs/client/kafka';
import { BankingController } from './banking.controller';
import { BANKING_EVENTS_CLIENT } from './constants/injection-tokens';
import { BankingService } from './banking.service';

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
            ...buildKafkaClientOptions('banking-events-producer'),
          },
        },
      },
    ]),
  ],
  controllers: [BankingController],
  providers: [BankingService],
})
export class BankingModule {}
