import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { BankingService } from './banking.service';
import { CreateFinancialOperationDto } from './dto/create-operation.dto';
import { FinancialAccount } from './interfaces/banking-account.interface';
import { FinancialTransaction } from './interfaces/banking-operation.interface';

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
  listAccounts(@Req() req: AuthenticatedRequest): Promise<FinancialAccount[]> {
    return this.bankingService.listAccounts(req.user.email);
  }

  @Get('operations')
  @ApiOperation({ summary: 'List banking operations from external provider' })
  @ApiQuery({
    name: 'accountId',
    required: false,
    description:
      'Optional financial account ID. If omitted, returns all transactions from the authenticated user accounts.',
  })
  @ApiResponse({ status: 200, description: 'Operations listed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  listOperations(
    @Req() req: AuthenticatedRequest,
    @Query('accountId') accountId?: string,
  ): Promise<FinancialTransaction[]> {
    return this.bankingService.listOperations(req.user.email, accountId?.trim());
  }

  @Post('operations')
  @ApiOperation({
    summary: 'Create a financial operation and emit real-time event',
  })
  @ApiResponse({ status: 201, description: 'Financial operation created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createFinancialOperation(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateFinancialOperationDto,
  ): Promise<FinancialTransaction> {
    return this.bankingService.createFinancialOperation(
      req.user.email,
      dto.accountId.trim(),
      dto.currency.trim(),
      dto.amount,
    );
  }
}
