import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  AUTH_ACTION_LOGIN,
  AUTH_ACTION_REGISTER,
  AUTH_ACTION_VALIDATE_TOKEN,
  AUTH_COMMANDS,
} from '@libs/common';
import { SSO_SERVICE } from '../constants/injection-tokens';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { TenantPayload } from './interfaces/tenant-payload.interface';

type RpcErrorPayload = { statusCode: number; message: string };

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(@Inject(SSO_SERVICE) private readonly ssoClient: ClientKafka) {}

  async onModuleInit(): Promise<void> {
    this.ssoClient.subscribeToResponseOf(AUTH_COMMANDS);
    await this.ssoClient.connect();
  }

  register(dto: RegisterDto): Promise<AuthResponse> {
    return this.sendSso<{ action: string; data: RegisterDto }, AuthResponse>({
      action: AUTH_ACTION_REGISTER,
      data: { ...dto },
    });
  }

  login(dto: LoginDto): Promise<AuthResponse> {
    return this.sendSso<{ action: string; data: LoginDto }, AuthResponse>({
      action: AUTH_ACTION_LOGIN,
      data: { ...dto },
    });
  }

  async validateToken(token: string): Promise<TenantPayload> {
    try {
      return await firstValueFrom(
        this.ssoClient.send<
          TenantPayload,
          { action: string; data: { token: string } }
        >(AUTH_COMMANDS, {
          action: AUTH_ACTION_VALIDATE_TOKEN,
          data: { token },
        }),
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private async sendSso<TReq, TRes>(payload: TReq): Promise<TRes> {
    try {
      return await firstValueFrom(
        this.ssoClient.send<TRes, TReq>(AUTH_COMMANDS, payload),
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
        : 'Unexpected authentication error';
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
