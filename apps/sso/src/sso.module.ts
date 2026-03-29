import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { parse, toClientConfig } from 'pg-connection-string';
import { AuthModule } from './auth/auth.module';
import { SsoController } from './sso.controller';

function buildSequelizeOptions(config: ConfigService): SequelizeModuleOptions {
  const url = config.get<string>('DATABASE_URL')?.trim();

  const base: Partial<SequelizeModuleOptions> = {
    autoLoadModels: true,
    synchronize: false,
    logging: false,
  };

  if (url) {
    const parsed = toClientConfig(parse(url, { useLibpqCompat: true }));
    const dialectOptions: Record<string, unknown> = {};
    if (parsed.ssl !== undefined) dialectOptions.ssl = parsed.ssl;
    if (config.get('DATABASE_USE_IPV4') === 'true') dialectOptions.family = 4;

    return {
      ...base,
      dialect: 'postgres',
      host: parsed.host ?? undefined,
      port: parsed.port,
      username: parsed.user,
      password: parsed.password,
      database: parsed.database ?? undefined,
      dialectOptions:
        Object.keys(dialectOptions).length > 0 ? dialectOptions : undefined,
      pool: { max: 5, acquire: 60000, idle: 10000 },
    };
  }

  return {
    ...base,
    dialect: 'postgres',
    host: config.get('DB_HOST', 'localhost'),
    port: config.get<number>('DB_PORT', 5432),
    username: config.get('DB_USER', 'tecopos'),
    password: config.get('DB_PASSWORD', 'tecopos123'),
    database: config.get('DB_NAME', 'tecopos_sso'),
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      useFactory: buildSequelizeOptions,
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [SsoController],
})
export class SsoModule {}
