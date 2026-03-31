import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  BANKING_ACCOUNTS_LIST,
  BANKING_HEALTH,
  BANKING_OPERATIONS_LIST,
} from './constants/banking.patterns';
import { BankingService } from './banking.service';
import { FinancialAccount } from './interfaces/banking-account.interface';
import { BankingListRequest } from './interfaces/banking-list-request.interface';
import { FinancialTransaction } from './interfaces/banking-operation.interface';

@Controller()
export class BankingController {
  private readonly logger = new Logger(BankingController.name);

  constructor(private readonly bankingService: BankingService) {}

  @MessagePattern(BANKING_HEALTH)
  healthCheck(): { status: string; service: string } {
    this.logger.log('healthCheck requested');
    return { status: 'ok', service: 'banking' };
  }

  @MessagePattern(BANKING_ACCOUNTS_LIST)
  listAccounts(payload: BankingListRequest): Promise<FinancialAccount[]> {
    this.logger.log(`Kafka ${BANKING_ACCOUNTS_LIST} email=${payload.email}`);
    return this.bankingService.listAccounts(payload.email);
  }

  @MessagePattern(BANKING_OPERATIONS_LIST)
  listOperations(payload: BankingListRequest): Promise<FinancialTransaction[]> {
    const accountId = payload.accountId?.trim();
    this.logger.log(
      `Kafka ${BANKING_OPERATIONS_LIST} email=${payload.email}, accountId=${accountId ?? 'missing'}`,
    );
    return this.bankingService.listOperations(payload.email, accountId);
  }
}
