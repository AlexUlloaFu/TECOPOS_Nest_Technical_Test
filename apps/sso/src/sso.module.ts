import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SequelizeConfigModule } from './sequelize/sequelize.module';
import { SsoController } from './sso.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeConfigModule,
    AuthModule,
  ],
  controllers: [SsoController],
})
export class SsoModule {}
