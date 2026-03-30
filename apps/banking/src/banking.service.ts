import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { BankingAccount } from './interfaces/banking-account.interface';
import { BankingOperation } from './interfaces/banking-operation.interface';

/** MockAPI resource paths (fixed; only base URL is configurable). */
const ACCOUNTS_PATH = '/accounts';
const FINANCE_TRANSACTIONS_PATH = '/financeTransactions';

@Injectable()
export class BankingService {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('BANKING_API_BASE_URL', '');
  }

  async listAccounts(): Promise<BankingAccount[]> {
    this.ensureBaseUrl();

    try {
      const response = await firstValueFrom(
        this.httpService.get<BankingAccount[]>(
          this.buildUrl(this.baseUrl, ACCOUNTS_PATH),
        ),
      );
      return this.normalizeArray(response.data);
    } catch (error) {
      this.throwRpcFromHttpError(error, 'accounts');
    }
  }

  async listOperations(_tenantId: string): Promise<BankingOperation[]> {
    this.ensureBaseUrl();

    try {
      const response = await firstValueFrom(
        this.httpService.get<unknown>(
          this.buildUrl(this.baseUrl, FINANCE_TRANSACTIONS_PATH),
        ),
      );
      return this.normalizeArray<unknown>(response.data)
        .map((row) => this.mapOperationFromMock(row))
        .filter((op): op is BankingOperation => op !== null);
    } catch (error) {
      this.throwRpcFromHttpError(error, 'operations');
    }
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

  /** MockAPI may send extra fields and amount as string; we only expose BankingOperation. */
  private mapOperationFromMock(row: unknown): BankingOperation | null {
    if (typeof row !== 'object' || row === null) {
      return null;
    }
    const r = row as Record<string, unknown>;
    const transactionId = r.transactionId;
    const tid = r.tenantId;
    const currency = r.currency;
    if (
      typeof transactionId !== 'string' ||
      typeof tid !== 'string' ||
      typeof currency !== 'string'
    ) {
      return null;
    }
    const amount = this.coerceAmount(r.amount);
    return { transactionId, tenantId: tid, currency, amount };
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

      throw new RpcException({ statusCode, message });
    }

    throw new RpcException({
      statusCode: HttpStatus.BAD_GATEWAY,
      message: `Unexpected error while fetching ${resource}`,
    });
  }
}
