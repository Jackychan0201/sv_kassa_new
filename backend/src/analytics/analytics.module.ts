import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { DailyRecordsModule } from '../daily-records/daily-records.module';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [DailyRecordsModule],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
