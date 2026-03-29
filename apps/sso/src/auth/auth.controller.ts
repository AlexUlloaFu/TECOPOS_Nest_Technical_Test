import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import {
  AUTH_LOGIN,
  AUTH_REGISTER,
  AUTH_VALIDATE_TOKEN,
} from './auth.constants';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { LoginTenantDto } from './dto/login-tenant.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: AUTH_REGISTER })
  register(@Payload() dto: RegisterTenantDto) {
    return this.authService.register(dto);
  }

  @MessagePattern({ cmd: AUTH_LOGIN })
  login(@Payload() dto: LoginTenantDto) {
    return this.authService.login(dto);
  }

  @MessagePattern({ cmd: AUTH_VALIDATE_TOKEN })
  validateToken(@Payload() data: { token: string }) {
    return this.authService.validateToken(data.token);
  }
}
