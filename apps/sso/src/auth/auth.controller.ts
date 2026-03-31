import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import {
  AUTH_ACTION_LOGIN,
  AUTH_ACTION_REGISTER,
  AUTH_ACTION_VALIDATE_TOKEN,
  AUTH_COMMANDS,
} from '@libs/common';
import { AuthService } from './auth.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { LoginTenantDto } from './dto/login-tenant.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_COMMANDS)
  handleAuthCommand(
    @Payload() payload: { action?: string; data?: unknown },
  ): Promise<unknown> {
    switch (payload.action) {
      case AUTH_ACTION_REGISTER:
        return this.authService.register(payload.data as RegisterTenantDto);
      case AUTH_ACTION_LOGIN:
        return this.authService.login(payload.data as LoginTenantDto);
      case AUTH_ACTION_VALIDATE_TOKEN:
        return this.authService.validateToken(
          (payload.data as { token: string }).token,
        );
      default:
        throw new RpcException({
          statusCode: 400,
          message: `Unsupported auth action: ${payload.action ?? 'missing'}`,
        });
    }
  }
}
