import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Min, Matches, IsOptional } from 'class-validator';

export class UpdateDailyRecordDto {
  @ApiPropertyOptional({ example: 12345, description: 'Revenue from main with margin (cents)' })
  @Transform(({ value }) => Math.round(parseFloat(value) * 100))
  @IsOptional()
  @IsInt()
  @Min(0)
  revenueMainWithMargin?: number;

  @ApiPropertyOptional({ example: 11000, description: 'Revenue from main without margin (cents)' })
  @Transform(({ value }) => Math.round(parseFloat(value) * 100))
  @IsOptional()
  @IsInt()
  @Min(0)
  revenueMainWithoutMargin?: number;

  @ApiPropertyOptional({ example: 4500, description: 'Revenue from order with margin (cents)' })
  @Transform(({ value }) => Math.round(parseFloat(value) * 100))
  @IsOptional()
  @IsInt()
  @Min(0)
  revenueOrderWithMargin?: number;

  @ApiPropertyOptional({ example: 4000, description: 'Revenue from order without margin (cents)' })
  @Transform(({ value }) => Math.round(parseFloat(value) * 100))
  @IsOptional()
  @IsInt()
  @Min(0)
  revenueOrderWithoutMargin?: number;

  @ApiPropertyOptional({ example: 250000, description: 'Value of main stock (cents)' })
  @Transform(({ value }) => Math.round(parseFloat(value) * 100))
  @IsOptional()
  @IsInt()
  @Min(0)
  mainStockValue?: number;

  @ApiPropertyOptional({ example: 80000, description: 'Value of order stock (cents)' })
  @Transform(({ value }) => Math.round(parseFloat(value) * 100))
  @IsOptional()
  @IsInt()
  @Min(0)
  orderStockValue?: number;

  @ApiPropertyOptional({ example: '26.09.2025', description: 'Date of the daily record (DD.MM.YYYY)' })
  @IsOptional()
  @Matches(/^\d{2}\.\d{2}\.\d{4}$/)
  recordDate?: string;
}
