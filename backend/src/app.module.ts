import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './shops/shop.entity';
import { DailyRecord } from './daily-records/daily-record.entity';
import { ShopsModule } from './shops/shops.module';
import { AuthModule } from './auth/auth.module';
import { DailyRecordsModule } from './daily-records/daily-records.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '../.env',
     }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        retryAttempts: 3,
        retryDelay: 3000,
      }),
    }),
    TypeOrmModule.forFeature([Shop, DailyRecord]),
    ShopsModule,
    AuthModule,
    DailyRecordsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
