import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class GatewayController {
  @Get('health')
  @ApiOperation({ summary: 'Gateway health check' })
  healthCheck(): { status: string; service: string } {
    return { status: 'ok', service: 'gateway' };
  }
}
