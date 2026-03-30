import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { parse, toClientConfig } from 'pg-connection-string';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL')?.trim();
        if (!url) {
          throw new Error('DATABASE_URL is required for SSO');
        }

        const parsed = toClientConfig(parse(url, { useLibpqCompat: true }));
        return {
          autoLoadModels: true,
          synchronize: false,
          logging: false,
          dialect: 'postgres' as const,
          host: parsed.host ?? undefined,
          port: parsed.port,
          username: parsed.user,
          password: parsed.password,
          database: parsed.database ?? undefined,
          dialectOptions: parsed.ssl ? { ssl: parsed.ssl } : undefined,
          pool: { max: 5, acquire: 60000, idle: 10000 },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class SequelizeConfigModule {}
