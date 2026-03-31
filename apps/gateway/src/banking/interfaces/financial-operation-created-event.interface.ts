export interface FinancialOperationCreatedEvent {
  email: string;
  transactionId: string;
  financialAccountId: string;
  currency: string;
  amount: number;
  createdAt: string;
}
