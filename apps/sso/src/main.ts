import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SsoModule } from './sso.module';

async function bootstrap() {
  const port = parseInt(process.env.SSO_PORT ?? '3001', 10);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    SsoModule,
    { transport: Transport.TCP, options: { host: '0.0.0.0', port } },
  );
  await app.listen();
}

bootstrap();
