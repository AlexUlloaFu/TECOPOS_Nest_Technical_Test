import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { buildKafkaClientOptions } from '@libs/common';
import { GatewayModule } from './gateway.module';

const GATEWAY_PORT = Number(process.env.PORT || 3000);

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        ...buildKafkaClientOptions('gateway-events-consumer'),
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
