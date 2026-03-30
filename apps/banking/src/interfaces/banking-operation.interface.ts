export interface BankingOperation {
  transactionId: string;
  tenantId: string;
  currency: string;
  amount: number;
}
