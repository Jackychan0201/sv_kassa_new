import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DailyRecordsService } from '../daily-records/daily-records.service';
import { JwtShop } from '../auth/jwt-shop.type';

@Injectable()
export class AnalyticsService {
  private readonly prophetServiceUrl = 'https://sv-kassa-prophet.onrender.com/forecast';

  constructor(private readonly dailyRecordsService: DailyRecordsService) {}

  async getProphetForecast(user: JwtShop, shopId?: string, periods = 30, metric?: string) {
    // fetch historical records (service already enforces ACL)
    const records = await this.dailyRecordsService.findAll(user, shopId);

    // helper to pick metric value from a record
    const getMetricValue = (rec: any, m?: string) => {
      switch (m) {
        case 'mainStockValue':
          return rec.mainStockValue ?? 0
        case 'orderStockValue':
          return rec.orderStockValue ?? 0
        case 'revenueMainWithMargin':
          return rec.revenueMainWithMargin ?? 0
        case 'revenueMainWithoutMargin':
          return rec.revenueMainWithoutMargin ?? 0
        case 'mainMargin':
          return (rec.revenueMainWithMargin ?? 0) - (rec.revenueMainWithoutMargin ?? 0)
        case 'revenueOrderWithMargin':
          return rec.revenueOrderWithMargin ?? 0
        case 'revenueOrderWithoutMargin':
          return rec.revenueOrderWithoutMargin ?? 0
        case 'orderMargin':
          return (rec.revenueOrderWithMargin ?? 0) - (rec.revenueOrderWithoutMargin ?? 0)
        case 'totalRevenueWithMargin':
          return (rec.revenueMainWithMargin ?? 0) + (rec.revenueOrderWithMargin ?? 0)
        case 'totalRevenueWithoutMargin':
          return (rec.revenueMainWithoutMargin ?? 0) + (rec.revenueOrderWithoutMargin ?? 0)
        case 'totalMargin':
          return (
            (rec.revenueMainWithMargin ?? 0) + (rec.revenueOrderWithMargin ?? 0) - (rec.revenueMainWithoutMargin ?? 0) - (rec.revenueOrderWithoutMargin ?? 0)
          )
        default:
          return rec.revenueMainWithMargin ?? 0
      }
    }

    // prepare data for Prophet: ds -> YYYY-MM-DD, values -> array of metric values
    const dates: string[] = [];
    const values: number[] = [];

    records.forEach((r) => {
      const [day, month, year] = r.recordDate.split('.');
      const iso = `${year}-${month}-${day}`;
      dates.push(iso);
      values.push(Number((getMetricValue(r, metric) ?? 0).toFixed(2)));
    });

    // Sort by date
    const sorted = dates
      .map((d, i) => ({ d, v: values[i] }))
      .sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0));

    const sortedDates = sorted.map((x) => x.d);
    const sortedValues = sorted.map((x) => x.v);

    // Reconstruct sorted data for logging
    const inputData = sortedDates.map((d, i) => ({ ds: d, y: sortedValues[i] }));

    // Log request details
    // eslint-disable-next-line no-console
    console.debug(`[Analytics] Calling Prophet service with ${sortedDates.length} data points, requesting ${periods} periods`);

    try {
      const response = await fetch(this.prophetServiceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dates: sortedDates,
          values: sortedValues,
        }),
      });

      if (!response.ok) {
        // eslint-disable-next-line no-console
        console.warn(`[Analytics] Prophet service returned ${response.status}: ${response.statusText}`);
        return { input: inputData, forecast: [] };
      }

      const result = await response.json();

      // Log forecast summary
      // eslint-disable-next-line no-console
      console.debug(`[Analytics] Prophet forecast received: ${result.forecast?.length || 0} periods`);

      return { input: inputData, forecast: result.forecast || [] };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[Analytics] Failed to call Prophet service:', error instanceof Error ? error.message : String(error));
      // Return empty forecast gracefully so UI continues to work
      return { input: inputData, forecast: [] };
    }
  }
}
