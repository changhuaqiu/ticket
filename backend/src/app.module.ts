import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { CommentsModule } from './modules/comments/comments.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { HealthModule } from './modules/health/health.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get<string>('database.type');
        const config: any = {
          type: dbType,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get<boolean>('database.synchronize'),
          logging: configService.get<boolean>('database.logging'),
        };

        if (dbType === 'postgres') {
          // PostgreSQL 配置
          config.host = configService.get<string>('database.host');
          config.port = configService.get<number>('database.port');
          config.username = configService.get<string>('database.username');
          config.password = configService.get<string>('database.password');
          config.database = configService.get<string>('database.database');
        } else {
          // SQLite 配置
          config.database = configService.get<string>('database.database');
          config.extra = {
            // SQLite 特定配置
          };
        }

        return config;
      },
      inject: [ConfigService],
    }),
    AuthModule,
    TicketsModule,
    CommentsModule,
    AttachmentsModule,
    StatisticsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
