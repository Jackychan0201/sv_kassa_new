import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import { Shop } from './shops/shop.entity';
import { DailyRecord } from './daily-records/daily-record.entity';
import { ShopsModule } from './shops/shops.module';
import { AuthModule } from './auth/auth.module';
import { DailyRecordsModule } from './daily-records/daily-records.module';
import jwtConfig from './config/jwt.config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
      load: [databaseConfig, jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        return {
          ...dbConfig,
        };
      },
    }),
    ThrottlerModule.forRoot([{
        ttl: 60,
        limit: 5,        
    }]),
    TypeOrmModule.forFeature([Shop, DailyRecord]),
    ShopsModule,
    AuthModule,
    DailyRecordsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ]
})
export class AppModule {}
