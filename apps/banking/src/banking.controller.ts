import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  BANKING_ACCOUNTS_LIST,
  BANKING_HEALTH,
  BANKING_OPERATIONS_LIST,
} from './constants/banking.patterns';
import { BankingService } from './banking.service';
import { BankingAccount } from './interfaces/banking-account.interface';
import { BankingListRequest } from './interfaces/banking-list-request.interface';
import { BankingOperation } from './interfaces/banking-operation.interface';

@Controller()
export class BankingController {
  constructor(private readonly bankingService: BankingService) {}

  @MessagePattern(BANKING_HEALTH)
  healthCheck(): { status: string; service: string } {
    return { status: 'ok', service: 'banking' };
  }

  @MessagePattern(BANKING_ACCOUNTS_LIST)
  listAccounts(_payload: BankingListRequest): Promise<BankingAccount[]> {
    return this.bankingService.listAccounts();
  }

  @MessagePattern(BANKING_OPERATIONS_LIST)
  listOperations(payload: BankingListRequest): Promise<BankingOperation[]> {
    return this.bankingService.listOperations(payload.tenantId);
  }
}
