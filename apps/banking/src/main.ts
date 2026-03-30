import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { BankingModule } from './banking.module';

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'kafka:9092')
  .split(',')
  .map((broker) => broker.trim())
  .filter(Boolean);

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    BankingModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'banking-service',
          brokers: KAFKA_BROKERS,
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
