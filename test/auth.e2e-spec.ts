import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { GatewayModule } from '../apps/gateway/src/gateway.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GatewayModule],
    }).compile();

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
    it.todo('should return 401 with invalid credentials');
    it.todo('should return access token with valid credentials');
    it.todo('should return 400 with missing fields');
  });

  describe('POST /api/auth/register', () => {
    it.todo('should register a new user');
    it.todo('should return 409 if user already exists');
  });

  describe('GET /api/auth/profile', () => {
    it.todo('should return 401 without token');
    it.todo('should return user profile with valid token');
  });
});
