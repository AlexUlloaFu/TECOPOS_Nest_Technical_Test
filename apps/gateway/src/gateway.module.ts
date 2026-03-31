import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { BankingModule } from './banking/banking.module';
import { GatewayController } from './gateway.controller';
import { SsoModule } from './sso/sso.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        // NOTE: Fine for now; consider env vars for environment-specific tuning.
        ttl: 60000,
        limit: 60,
      },
    ]),
    SsoModule,
    AuthModule,
    BankingModule,
  ],
  controllers: [GatewayController, AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class GatewayModule {}
