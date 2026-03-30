import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TenantModule } from '../tenant/tenant.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

const JWT_SECRET = 'change_me';
const JWT_EXPIRATION_SECONDS = 3600;

@Module({
  imports: [
    TenantModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: {
        expiresIn: `${JWT_EXPIRATION_SECONDS}s`,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
