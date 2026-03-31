import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GatewayModule } from './gateway.module';

const GATEWAY_PORT = Number(process.env.PORT || 3000);
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'kafka:9092')
  .split(',')
  .map((broker) => broker.trim())
  .filter(Boolean);

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'gateway-events-consumer',
        brokers: KAFKA_BROKERS,
      },
      consumer: {
        groupId: 'gateway-events-consumer-group',
      },
    },
  });

  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('TECOPOS Gateway')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig), {
    useGlobalPrefix: true,
  });

  await app.startAllMicroservices();
  await app.listen(GATEWAY_PORT);
}

bootstrap();
