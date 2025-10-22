import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyRecord } from './daily-record.entity';
import { Module } from '@nestjs/common';
import { DailyRecordsService } from './daily-records.service';
import { DailyRecordsController } from './daily-records.controller';
import { ShopsModule } from '../shops/shops.module';

@Module({
  imports: [TypeOrmModule.forFeature([DailyRecord]), ShopsModule],
  providers: [DailyRecordsService],
  controllers: [DailyRecordsController],
  exports: [DailyRecordsService],
})
export class DailyRecordsModule {}
