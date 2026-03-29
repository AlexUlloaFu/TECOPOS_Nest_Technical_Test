import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { BankingModule } from './banking.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    BankingModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: parseInt(process.env.BANKING_PORT ?? '3002', 10),
      },
    },
  );

  await app.listen();
  console.log(
    `Banking microservice is listening on port ${process.env.BANKING_PORT || 3002}`,
  );
}

bootstrap();
