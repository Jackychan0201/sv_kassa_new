import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsUUID, IsInt, Min, Matches } from 'class-validator';

export class CreateDailyRecordDto {
  @ApiProperty({
    description: 'Shop ID for which the record is created (CEO only, ignored for shops)',
    example: '8a5b0a9e-5f87-45c3-88f5-36d5e92c30f2',
  })
  @IsUUID()
  shopId: string;

  @ApiProperty({ example: 123.45, description: 'Revenue from main with margin (decimal)' })
  @Transform(({ value }) => Math.round(parseFloat(value) * 100))
  @IsInt()
  @Min(0)
  revenueMainWithMargin: number;

  @ApiProperty({ example: 110.0, description: 'Revenue from main without margin (decimal)' })
  @Transform(({ value }) => Math.round(parseFloat(value) * 100))
  @IsInt()
  @Min(0)
  revenueMainWithoutMargin: number;

  @ApiProperty({ example: 45.0, description: 'Revenue from order with margin (decimal)' })
  @Transform(({ value }) => Math.round(parseFloat(value) * 100))
  @IsInt()
  @Min(0)
  revenueOrderWithMargin: number;

  @ApiProperty({ example: 40.0, description: 'Revenue from order without margin (decimal)' })
  @Transform(({ value }) => Math.round(parseFloat(value) * 100))
  @IsInt()
  @Min(0)
  revenueOrderWithoutMargin: number;

  @ApiProperty({ example: 2500.0, description: 'Value of main stock (decimal)' })
  @Transform(({ value }) => Math.round(parseFloat(value) * 100))
  @IsInt()
  @Min(0)
  mainStockValue: number;

  @ApiProperty({ example: 800.0, description: 'Value of order stock (decimal)' })
  @Transform(({ value }) => Math.round(parseFloat(value) * 100))
  @IsInt()
  @Min(0)
  orderStockValue: number;

  @ApiProperty({ example: '26.09.2025', description: 'Date of the daily record (DD.MM.YYYY)' })
  @Matches(/^\d{2}\.\d{2}\.\d{4}$/, { message: 'Date must be in DD.MM.YYYY format' })
  recordDate: string;
}
