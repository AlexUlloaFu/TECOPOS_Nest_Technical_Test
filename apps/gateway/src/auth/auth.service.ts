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
import { SSO_SERVICE } from '../constants/injection-tokens';
import {
  AUTH_LOGIN,
  AUTH_REGISTER,
  AUTH_VALIDATE_TOKEN,
} from './constants/auth.patterns';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { TenantPayload } from './interfaces/tenant-payload.interface';

type RpcErrorPayload = { statusCode: number; message: string };

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(@Inject(SSO_SERVICE) private readonly ssoClient: ClientKafka) {}

  async onModuleInit(): Promise<void> {
    this.ssoClient.subscribeToResponseOf(AUTH_REGISTER);
    this.ssoClient.subscribeToResponseOf(AUTH_LOGIN);
    this.ssoClient.subscribeToResponseOf(AUTH_VALIDATE_TOKEN);
    await this.ssoClient.connect();
  }

  register(dto: RegisterDto): Promise<AuthResponse> {
    return this.sendSso<RegisterDto, AuthResponse>(AUTH_REGISTER, { ...dto });
  }

  login(dto: LoginDto): Promise<AuthResponse> {
    return this.sendSso<LoginDto, AuthResponse>(AUTH_LOGIN, { ...dto });
  }

  async validateToken(token: string): Promise<TenantPayload> {
    try {
      return await firstValueFrom(
        this.ssoClient.send<TenantPayload, { token: string }>(AUTH_VALIDATE_TOKEN, {
          token,
        }),
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private async sendSso<TReq, TRes>(pattern: string, payload: TReq): Promise<TRes> {
    try {
      return await firstValueFrom(
        this.ssoClient.send<TRes, TReq>(pattern, payload),
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
      error instanceof Error ? error.message : 'Unexpected authentication error';
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
    return (
      typeof v.statusCode === 'number' &&
      typeof v.message === 'string'
    );
  }
}
