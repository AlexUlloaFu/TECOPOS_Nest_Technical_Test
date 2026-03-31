import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  BANKING_ACTION_FINANCIAL_OPERATION_CREATED_EVENT,
  BANKING_EVENTS,
} from '@libs/client/kafka';
import { FinancialOperationCreatedEvent } from './interfaces/financial-operation-created-event.interface';

@Controller()
export class BankingEventsController {
  private readonly logger = new Logger(BankingEventsController.name);

  @EventPattern(BANKING_EVENTS)
  handleFinancialOperationCreated(
    @Payload()
    payload: {
      action?: string;
      data?: FinancialOperationCreatedEvent;
    },
  ): void {
    if (
      payload.action !== BANKING_ACTION_FINANCIAL_OPERATION_CREATED_EVENT ||
      !payload.data
    ) {
      return;
    }

    this.logger.log(
      `Consumed ${BANKING_EVENTS}/${payload.action} transactionId=${payload.data.transactionId} accountId=${payload.data.financialAccountId} email=${payload.data.email}`,
    );
  }
}
