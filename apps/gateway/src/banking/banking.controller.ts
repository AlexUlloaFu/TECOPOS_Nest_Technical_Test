import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { BankingService } from './banking.service';
import { BankingAccount } from './interfaces/banking-account.interface';
import { BankingOperation } from './interfaces/banking-operation.interface';

@ApiTags('Banking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('banking')
export class BankingController {
  constructor(private readonly bankingService: BankingService) {}

  @Get('accounts')
  @ApiOperation({ summary: 'List banking accounts from external provider' })
  @ApiResponse({ status: 200, description: 'Accounts listed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  listAccounts(@Req() req: AuthenticatedRequest): Promise<BankingAccount[]> {
    return this.bankingService.listAccounts(req.user.sub);
  }

  @Get('operations')
  @ApiOperation({ summary: 'List banking operations from external provider' })
  @ApiResponse({ status: 200, description: 'Operations listed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  listOperations(
    @Req() req: AuthenticatedRequest,
  ): Promise<BankingOperation[]> {
    return this.bankingService.listOperations(req.user.sub);
  }
}
