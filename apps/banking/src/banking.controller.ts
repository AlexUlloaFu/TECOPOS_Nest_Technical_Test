import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class BankingController {
  @MessagePattern({ cmd: 'banking_health' })
  healthCheck() {
    return {
      status: 'ok',
      service: 'banking',
      timestamp: new Date().toISOString(),
    };
  }
}
