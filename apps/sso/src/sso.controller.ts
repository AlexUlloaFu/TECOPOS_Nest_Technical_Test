import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class SsoController {
  @MessagePattern({ cmd: 'sso_health' })
  healthCheck() {
    return { status: 'ok', service: 'sso' };
  }
}
