import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { buildKafkaClientOptions } from '@libs/common';
import { AuthModule } from '../auth/auth.module';
import { BANKING_SERVICE } from '../constants/injection-tokens';
import { BankingController } from './banking.controller';
import { BankingService } from './banking.service';

@Module({
  imports: [
    AuthModule,
    ClientsModule.register([
      {
        name: BANKING_SERVICE,
        transport: Transport.KAFKA,
        options: {
          client: {
            ...buildKafkaClientOptions('gateway-banking-client'),
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
