import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { buildKafkaClientOptions } from '@libs/client/kafka';
import { BankingModule } from './banking.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    BankingModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          ...buildKafkaClientOptions('banking-service'),
        },
        consumer: {
          groupId: 'banking-service-group',
        },
      },
    },
  );
  await app.listen();
}

bootstrap();
