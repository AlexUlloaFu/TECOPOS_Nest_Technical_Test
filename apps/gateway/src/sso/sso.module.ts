import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SSO_SERVICE } from '../constants/injection-tokens';

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'kafka:9092')
  .split(',')
  .map((broker) => broker.trim())
  .filter(Boolean);

@Module({
  imports: [
    ClientsModule.register([
      {
        name: SSO_SERVICE,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'gateway-sso-client',
            brokers: KAFKA_BROKERS,
          },
          consumer: {
            groupId: 'gateway-sso-consumer',
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class SsoModule {}
