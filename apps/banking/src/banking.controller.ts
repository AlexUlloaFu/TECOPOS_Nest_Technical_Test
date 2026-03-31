import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import {
  BANKING_ACTION_ACCOUNTS_LIST,
  BANKING_ACTION_FINANCIAL_OPERATIONS_CREATE,
  BANKING_ACTION_OPERATIONS_LIST,
  BANKING_COMMANDS,
  BANKING_HEALTH,
} from '@libs/client/kafka';
import { BankingService } from './banking.service';
import { CreateFinancialOperationRequest } from './interfaces/create-operation-request.interface';
import { FinancialAccount } from './interfaces/banking-account.interface';
import { BankingListRequest } from './interfaces/banking-list-request.interface';
import { FinancialTransaction } from './interfaces/banking-operation.interface';

@Controller()
export class BankingController {
  private readonly logger = new Logger(BankingController.name);

  constructor(private readonly bankingService: BankingService) {}

  private healthCheck(): { status: string; service: string } {
    this.logger.log('healthCheck requested');
    return { status: 'ok', service: 'banking' };
  }

  @MessagePattern(BANKING_COMMANDS)
  handleBankingCommand(payload: {
    action?: string;
    data?: unknown;
  }):
    | { status: string; service: string }
    | Promise<FinancialAccount[]>
    | Promise<FinancialTransaction[]>
    | Promise<FinancialTransaction> {
    switch (payload.action) {
      case BANKING_HEALTH:
        return this.healthCheck();
      case BANKING_ACTION_ACCOUNTS_LIST: {
        const request = payload.data as BankingListRequest;
        this.logger.log(
          `Kafka ${BANKING_ACTION_ACCOUNTS_LIST} email=${request.email}`,
        );
        return this.bankingService.listAccounts(request.email);
      }
      case BANKING_ACTION_OPERATIONS_LIST: {
        const request = payload.data as BankingListRequest;
        const accountId = request.accountId?.trim();
        this.logger.log(
          `Kafka ${BANKING_ACTION_OPERATIONS_LIST} email=${request.email}, accountId=${accountId ?? 'missing'}`,
        );
        return this.bankingService.listOperations(request.email, accountId);
      }
      case BANKING_ACTION_FINANCIAL_OPERATIONS_CREATE: {
        const request = payload.data as CreateFinancialOperationRequest;
        this.logger.log(
          `Kafka ${BANKING_ACTION_FINANCIAL_OPERATIONS_CREATE} email=${request.email}, accountId=${request.accountId}`,
        );
        return this.bankingService.createFinancialOperation(request);
      }
      default:
        throw new RpcException({
          statusCode: 400,
          message: `Unsupported banking action: ${payload.action ?? 'missing'}`,
        });
    }
  }
}
