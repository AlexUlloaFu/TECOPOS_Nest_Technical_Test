import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { buildKafkaClientOptions } from '@libs/client/kafka';
import { SSO_SERVICE } from '../constants/injection-tokens';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: SSO_SERVICE,
        transport: Transport.KAFKA,
        options: {
          client: {
            ...buildKafkaClientOptions('gateway-sso-client'),
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
