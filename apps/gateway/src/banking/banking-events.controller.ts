import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { BANKING_FINANCIAL_OPERATION_CREATED_EVENT } from './constants/banking.patterns';
import { FinancialOperationCreatedEvent } from './interfaces/financial-operation-created-event.interface';

@Controller()
export class BankingEventsController {
  private readonly logger = new Logger(BankingEventsController.name);

  @EventPattern(BANKING_FINANCIAL_OPERATION_CREATED_EVENT)
  handleFinancialOperationCreated(
    @Payload() payload: FinancialOperationCreatedEvent,
  ): void {
    this.logger.log(
      `Consumed ${BANKING_FINANCIAL_OPERATION_CREATED_EVENT} transactionId=${payload.transactionId} accountId=${payload.financialAccountId} email=${payload.email}`,
    );
  }
}
