import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('api/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('prophet')
  async getProphet(@Req() req: Request, @Query('shopId') shopId?: string, @Query('periods') periods?: string, @Query('metric') metric?: string) {
    const user = (req as any).user;
    const p = parseInt(periods || '7', 10);
    return await this.analyticsService.getProphetForecast(user, shopId, p, metric);
  }
}
