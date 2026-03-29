import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { Tenant } from '../tenant/tenant.model';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { LoginTenantDto } from './dto/login-tenant.dto';
import { TenantPayload } from './interfaces/tenant-payload.interface';
import { AuthResponse, SafeTenant } from './interfaces/auth-response.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Tenant) private readonly tenantModel: typeof Tenant,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterTenantDto): Promise<AuthResponse> {
    const exists = await this.tenantModel.findOne({
      where: { email: dto.email },
    });
    if (exists) {
      throw new RpcException({
        statusCode: 409,
        message: 'Email already registered',
      });
    }

    const tenant = await this.tenantModel.create({
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    return {
      accessToken: this.signToken(tenant),
      tenant: this.sanitize(tenant),
    };
  }

  async login(dto: LoginTenantDto): Promise<AuthResponse> {
    const tenant = await this.tenantModel.findOne({
      where: { email: dto.email },
    });
    if (!tenant || !(await bcrypt.compare(dto.password, tenant.password))) {
      throw new RpcException({
        statusCode: 401,
        message: 'Invalid credentials',
      });
    }
    return {
      accessToken: this.signToken(tenant),
      tenant: this.sanitize(tenant),
    };
  }

  async validateToken(token: string): Promise<TenantPayload> {
    try {
      return this.jwtService.verify<TenantPayload>(token);
    } catch {
      throw new RpcException({
        statusCode: 401,
        message: 'Invalid or expired token',
      });
    }
  }

  private signToken(tenant: Tenant): string {
    const payload: TenantPayload = {
      sub: tenant.id,
      email: tenant.email,
      role: tenant.role,
    };
    return this.jwtService.sign(payload);
  }

  private sanitize(tenant: Tenant): SafeTenant {
    return {
      id: tenant.id,
      email: tenant.email,
      firstName: tenant.firstName,
      lastName: tenant.lastName,
      role: tenant.role,
    };
  }
}
