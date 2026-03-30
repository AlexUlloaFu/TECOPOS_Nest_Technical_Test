import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { BankingModule } from './banking/banking.module';
import { GatewayController } from './gateway.controller';
import { SsoModule } from './sso/sso.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SsoModule,
    AuthModule,
    BankingModule,
  ],
  controllers: [GatewayController, AuthController],
})
export class GatewayModule {}
