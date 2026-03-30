import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SsoModule } from './sso.module';

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'kafka:9092')
  .split(',')
  .map((broker) => broker.trim())
  .filter(Boolean);

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    SsoModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'sso-service',
          brokers: KAFKA_BROKERS,
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
