import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { BANKING_SERVICE } from '../constants/injection-tokens';
import {
  BANKING_ACTION_ACCOUNTS_LIST,
  BANKING_ACTION_FINANCIAL_OPERATIONS_CREATE,
  BANKING_ACTION_OPERATIONS_LIST,
  BANKING_COMMANDS,
} from '@libs/common';
import { CreateFinancialOperationRequest } from './interfaces/create-operation-request.interface';
import { FinancialAccount } from './interfaces/banking-account.interface';
import { BankingListRequest } from './interfaces/banking-list-request.interface';
import { FinancialTransaction } from './interfaces/banking-operation.interface';

type RpcErrorPayload = { statusCode: number; message: string };

@Injectable()
export class BankingService implements OnModuleInit {
  constructor(
    @Inject(BANKING_SERVICE) private readonly bankingClient: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    this.bankingClient.subscribeToResponseOf(BANKING_COMMANDS);
    await this.bankingClient.connect();
  }

  listAccounts(email: string): Promise<FinancialAccount[]> {
    return this.sendBanking<
      { action: string; data: BankingListRequest },
      FinancialAccount[]
    >({
      action: BANKING_ACTION_ACCOUNTS_LIST,
      data: { email },
    });
  }

  listOperations(
    email: string,
    accountId?: string,
  ): Promise<FinancialTransaction[]> {
    return this.sendBanking<
      { action: string; data: BankingListRequest },
      FinancialTransaction[]
    >({
      action: BANKING_ACTION_OPERATIONS_LIST,
      data: {
        email,
        ...(accountId ? { accountId } : {}),
      },
    });
  }

  createFinancialOperation(
    email: string,
    accountId: string,
    currency: string,
    amount: number,
  ): Promise<FinancialTransaction> {
    return this.sendBanking<
      { action: string; data: CreateFinancialOperationRequest },
      FinancialTransaction
    >({
      action: BANKING_ACTION_FINANCIAL_OPERATIONS_CREATE,
      data: { email, accountId, currency, amount },
    });
  }

  private async sendBanking<TReq, TRes>(payload: TReq): Promise<TRes> {
    try {
      return await firstValueFrom(
        this.bankingClient.send<TRes, TReq>(BANKING_COMMANDS, payload),
      );
    } catch (error) {
      this.mapRpcToHttp(error);
    }
  }

  private mapRpcToHttp(error: unknown): never {
    const payload = this.extractRpcPayload(error);
    if (payload) {
      throw new HttpException(payload.message, payload.statusCode);
    }

    const message =
      error instanceof Error
        ? error.message
        : 'Unexpected banking service error';
    throw new HttpException(message, HttpStatus.BAD_GATEWAY);
  }

  private extractRpcPayload(error: unknown): RpcErrorPayload | null {
    if (error instanceof RpcException) {
      const inner = error.getError();
      if (this.isRpcErrorPayload(inner)) {
        return inner;
      }
    }

    if (typeof error === 'object' && error !== null) {
      const candidate = error as Partial<RpcErrorPayload>;
      if (
        typeof candidate.statusCode === 'number' &&
        typeof candidate.message === 'string'
      ) {
        return {
          statusCode: candidate.statusCode,
          message: candidate.message,
        };
      }
    }

    return null;
  }

  private isRpcErrorPayload(value: unknown): value is RpcErrorPayload {
    if (typeof value !== 'object' || value === null) {
      return false;
    }
    const v = value as Partial<RpcErrorPayload>;
    return typeof v.statusCode === 'number' && typeof v.message === 'string';
  }
}
