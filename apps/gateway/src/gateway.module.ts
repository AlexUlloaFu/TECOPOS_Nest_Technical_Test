import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { BANKING_SERVICE, SSO_SERVICE } from './constants/injection-tokens';
import { GatewayController } from './gateway.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: SSO_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('SSO_HOST', 'localhost'),
            port: configService.get<number>('SSO_PORT', 3001),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: BANKING_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('BANKING_HOST', 'localhost'),
            port: configService.get<number>('BANKING_PORT', 3002),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [GatewayController, AuthController],
  providers: [AuthService, JwtAuthGuard],
})
export class GatewayModule {}
