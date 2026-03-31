import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { buildKafkaClientOptions } from '@libs/client/kafka';
import { SsoModule } from './sso.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    SsoModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          ...buildKafkaClientOptions('sso-service'),
        },
        consumer: {
          groupId: 'sso-service-group',
        },
      },
    },
  );
  await app.listen();
}

bootstrap();
