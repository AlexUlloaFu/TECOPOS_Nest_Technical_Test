import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { AuthService } from '../apps/gateway/src/auth/auth.service';
import { BankingService } from '../apps/gateway/src/banking/banking.service';
import { GatewayModule } from '../apps/gateway/src/gateway.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let authService: { login: jest.Mock };

  beforeAll(async () => {
    authService = {
      login: jest.fn(async (dto: { email: string; password: string }) => {
        if (
          dto.email === 'test@example.com' &&
          dto.password === 'Password123'
        ) {
          return {
            accessToken: 'mock-jwt-token',
            tenant: {
              id: 'tenant-1',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
              role: 'user',
            },
          };
        }

        throw new UnauthorizedException('Invalid credentials');
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GatewayModule],
    })
      .overrideProvider(AuthService)
      .useValue(authService)
      .overrideProvider(BankingService)
      .useValue({
        listAccounts: jest.fn(),
        listOperations: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/login', () => {
    it('should return 201 and access token with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        })
        .expect(201);

      expect(res.body).toMatchObject({
        accessToken: 'mock-jwt-token',
        tenant: {
          email: 'test@example.com',
          role: 'user',
        },
      });
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should return 401 with invalid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword',
        })
        .expect(401);

      expect(res.body.message).toBe('Invalid credentials');
      expect(authService.login).toHaveBeenCalledTimes(2);
    });

    it('should return 400 with missing fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);

      expect(res.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('password')]),
      );
      expect(authService.login).toHaveBeenCalledTimes(2);
    });
  });
});
