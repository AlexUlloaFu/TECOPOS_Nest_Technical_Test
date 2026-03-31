import { HttpService } from '@nestjs/axios';
import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { BANKING_EVENTS_CLIENT } from './constants/injection-tokens';
import { BANKING_FINANCIAL_OPERATION_CREATED_EVENT } from './constants/banking.patterns';
import { FinancialAccount } from './interfaces/banking-account.interface';
import { CreateFinancialOperationRequest } from './interfaces/create-operation-request.interface';
import { FinancialTransaction } from './interfaces/banking-operation.interface';
import { FinancialOperationCreatedEvent } from './interfaces/operation-created-event.interface';

/** MockAPI resource paths (fixed; only base URL is configurable). */
const ACCOUNTS_PATH = '/account';
const FINANCE_TRANSACTIONS_PATH = '/financeTransactions';

@Injectable()
export class BankingService implements OnModuleInit {
  private readonly baseUrl: string;
  private readonly logger = new Logger(BankingService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(BANKING_EVENTS_CLIENT) private readonly eventsClient: ClientKafka,
  ) {
    this.baseUrl = this.configService.get<string>('BANKING_API_BASE_URL', '');
  }

  async onModuleInit(): Promise<void> {
    await this.eventsClient.connect();
  }

  async listAccounts(email: string): Promise<FinancialAccount[]> {
    this.ensureBaseUrl();
    const endpoint = this.buildUrl(this.baseUrl, ACCOUNTS_PATH);
    this.logger.log(`listAccounts requested email=${email}, endpoint=${endpoint}`);

    try {
      const accounts = await this.loadFinancialAccounts();
      const filtered = accounts.filter((account) => account.userEmail === email);
      this.logger.log(
        `listAccounts resolved: totalAccounts=${accounts.length}, matchedAccounts=${filtered.length}, email=${email}`,
      );
      return filtered;
    } catch (error) {
      this.throwRpcFromHttpError(error, 'accounts');
    }
  }

  async listOperations(
    email: string,
    accountId?: string,
  ): Promise<FinancialTransaction[]> {
    this.ensureBaseUrl();
    const accountEndpoint = this.buildUrl(this.baseUrl, ACCOUNTS_PATH);
    const txEndpoint = this.buildUrl(this.baseUrl, FINANCE_TRANSACTIONS_PATH);
    this.logger.log(
      `listOperations requested for email=${email}, accountId=${accountId ?? 'all-user-accounts'}, accountsEndpoint=${accountEndpoint}, transactionsEndpoint=${txEndpoint}`,
    );

    try {
      const accounts = await this.loadFinancialAccounts();
      const accountsById = new Map(
        accounts.map((account) => [account.financialAccountId, account] as const),
      );
      const response = await firstValueFrom(
        this.httpService.get<unknown>(
          this.buildUrl(this.baseUrl, FINANCE_TRANSACTIONS_PATH),
        ),
      );
      const filtered = this.normalizeArray<unknown>(response.data)
        .map((row) => this.mapTransactionFromMock(row, accountsById, email))
        .filter((op): op is FinancialTransaction => op !== null)
        .filter((op) =>
          accountId ? op.financialAccountId === accountId : true,
        );
      this.logger.log(
        `listOperations resolved: totalAccounts=${accounts.length}, matchedTransactions=${filtered.length}, email=${email}, accountId=${accountId ?? 'all-user-accounts'}`,
      );
      return filtered;
    } catch (error) {
      this.throwRpcFromHttpError(error, 'operations');
    }
  }

  async createFinancialOperation(
    payload: CreateFinancialOperationRequest,
  ): Promise<FinancialTransaction> {
    this.ensureBaseUrl();
    const accountId = payload.accountId.trim();
    const email = payload.email.trim();

    this.logger.log(
      `createFinancialOperation requested email=${email}, accountId=${accountId}, amount=${payload.amount}, currency=${payload.currency}`,
    );

    try {
      const accounts = await this.loadFinancialAccounts();
      const account = accounts.find(
        (candidate) =>
          candidate.financialAccountId === accountId && candidate.userEmail === email,
      );

      if (!account) {
        throw new RpcException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Account does not belong to authenticated user',
        });
      }

      const response = await firstValueFrom(
        this.httpService.post<unknown>(
          this.buildUrl(this.baseUrl, FINANCE_TRANSACTIONS_PATH),
          {
            accountId,
            financialAccountId: accountId,
            currency: payload.currency,
            amount: payload.amount,
          },
        ),
      );

      const created = this.mapTransactionFromMock(
        response.data,
        new Map([[account.financialAccountId, account]]),
        email,
      );

      if (!created) {
        throw new RpcException({
          statusCode: HttpStatus.BAD_GATEWAY,
          message: 'Unable to map created operation from provider response',
        });
      }

      await this.publishOperationCreated({
        email,
        transactionId: created.transactionId,
        financialAccountId: created.financialAccountId,
        currency: created.currency,
        amount: created.amount,
        createdAt: new Date().toISOString(),
      });

      this.logger.log(
        `createFinancialOperation success email=${email}, accountId=${accountId}, transactionId=${created.transactionId}`,
      );
      return created;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.throwRpcFromHttpError(error, 'financial operation creation');
    }
  }

  private async loadFinancialAccounts(): Promise<FinancialAccount[]> {
    const response = await firstValueFrom(
      this.httpService.get<unknown>(this.buildUrl(this.baseUrl, ACCOUNTS_PATH)),
    );
    return this.normalizeArray<unknown>(response.data)
      .map((row) => this.mapAccountFromMock(row))
      .filter((account): account is FinancialAccount => account !== null);
  }

  private ensureBaseUrl(): void {
    if (!this.baseUrl) {
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'BANKING_API_BASE_URL is not configured',
      });
    }
  }

  private buildUrl(baseUrl: string, path: string): string {
    const trimmedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${trimmedBase}${normalizedPath}`;
  }

  private normalizeArray<T>(value: T[] | unknown): T[] {
    if (Array.isArray(value)) {
      return value;
    }
    return [];
  }

  private mapAccountFromMock(row: unknown): FinancialAccount | null {
    if (typeof row !== 'object' || row === null) {
      return null;
    }
    const r = row as Record<string, unknown>;
    const financialAccountId = this.extractString(
      r,
      'financialAccountId',
      'accountId',
      'id',
      'financial_account_id',
      'account_id',
    );
    const userEmail = this.extractString(
      r,
      'userEmail',
      'email',
      'accountEmail',
      'user_email',
      'owner_email',
    );

    if (!financialAccountId || !userEmail) {
      return null;
    }

    return { ...r, financialAccountId, userEmail };
  }

  private mapTransactionFromMock(
    row: unknown,
    accountsById: Map<string, FinancialAccount>,
    userEmail: string,
  ): FinancialTransaction | null {
    if (typeof row !== 'object' || row === null) {
      return null;
    }
    const r = row as Record<string, unknown>;
    const transactionId = this.extractString(
      r,
      'transactionId',
      'id',
      'transaction_id',
    );
    const financialAccountId = this.extractString(
      r,
      'financialAccountId',
      'accountId',
      'financial_account_id',
      'account_id',
    );
    const currency = this.extractString(r, 'currency');

    if (!transactionId || !financialAccountId || !currency) {
      return null;
    }

    const account = accountsById.get(financialAccountId);
    if (!account || account.userEmail !== userEmail) {
      return null;
    }

    const amount = this.coerceAmount(r.amount);
    return { transactionId, financialAccountId, currency, amount };
  }

  private extractString(
    source: Record<string, unknown>,
    ...keys: string[]
  ): string | null {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
    return null;
  }

  private coerceAmount(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const n = Number.parseFloat(value);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  }

  private throwRpcFromHttpError(error: unknown, resource: string): never {
    if (error instanceof AxiosError) {
      const statusCode = error.response?.status ?? HttpStatus.BAD_GATEWAY;
      const message =
        error.response?.statusText ||
        error.message ||
        `Failed to fetch ${resource}`;
      this.logger.error(
        `Error fetching ${resource}: statusCode=${statusCode}, message=${message}`,
      );

      throw new RpcException({ statusCode, message });
    }

    this.logger.error(`Unexpected error while fetching ${resource}`);
    throw new RpcException({
      statusCode: HttpStatus.BAD_GATEWAY,
      message: `Unexpected error while fetching ${resource}`,
    });
  }

  private async publishOperationCreated(
    eventPayload: FinancialOperationCreatedEvent,
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.eventsClient.emit<FinancialOperationCreatedEvent>(
          BANKING_FINANCIAL_OPERATION_CREATED_EVENT,
          eventPayload,
        ),
      );
      this.logger.log(
        `event published topic=${BANKING_FINANCIAL_OPERATION_CREATED_EVENT}, transactionId=${eventPayload.transactionId}`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown event publish error';
      this.logger.error(
        `failed to publish ${BANKING_FINANCIAL_OPERATION_CREATED_EVENT}: ${message}`,
      );
    }
  }
}
