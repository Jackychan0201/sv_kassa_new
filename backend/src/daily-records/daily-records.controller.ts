import { Body, Controller, Post, UseGuards, Req, ForbiddenException, Get, NotFoundException, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DailyRecordsService } from './daily-records.service';
import { CreateDailyRecordDto } from './dto/create-daily-record.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import type { Request } from 'express';
import { JwtShop } from 'src/auth/jwt-shop.type';
import { Query } from '@nestjs/common';
import { ShopRole } from 'src/shops/shop.entity';
import { UpdateDailyRecordDto } from './dto/update-daily-record.dto';


@ApiTags('daily-records')
@Controller('daily-records')
export class DailyRecordsController {
  constructor(private readonly dailyRecordsService: DailyRecordsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a daily record (CEO can choose shop, shops only for themselves)' })
  async createDailyRecord(@Body() dto: CreateDailyRecordDto, @Req() req: Request) {
    const user = req.user as JwtShop;
    return await this.dailyRecordsService.create(dto, user);
  }


  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all daily records by id of the shop (CEO can see all, shops only their own)' })
  @ApiParam({ name: 'shopId', required: false, description: 'Shop ID to filter records (CEO only)' })
  async getDailyRecords(@Req() req: Request, @Query('shopId') shopId?: string) {
    const user = req.user as JwtShop;
    return await this.dailyRecordsService.findAll(user, shopId);
  }

  @Get('by-date')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get daily records by date range and optional shopId (CEO can get any, shops only their own)' })
  @ApiQuery({ name: 'fromDate', required: true, description: 'Start date in DD.MM.YYYY format' })
  @ApiQuery({ name: 'toDate', required: true, description: 'End date in DD.MM.YYYY format' })
  @ApiQuery({ name: 'shopId', required: false, description: 'Shop ID to filter records (CEO only)' })
  async getDailyRecordsByDate(
    @Req() req: Request,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('shopId') shopId?: string,
  ) {
    const user = req.user as JwtShop;
    return this.dailyRecordsService.findByDateRange(user, fromDate, toDate, shopId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific daily record by ID (CEO can see all, shops only their own)' })
  @ApiParam({ name: 'id', description: 'Daily record ID (UUID)' })
  async getDailyRecordById(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as JwtShop;
    return await this.dailyRecordsService.findOneById(user, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a daily record by ID (CEO can update any, shops only their own)' })
  @ApiParam({ name: 'id', description: 'Daily record ID (UUID)' })
  async updateDailyRecord(
    @Param('id') id: string,
    @Body() dto: UpdateDailyRecordDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtShop;
    return this.dailyRecordsService.updateById(user, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a daily record by ID (CEO can delete any, shops only their own)' })
  @ApiParam({ name: 'id', description: 'Daily record ID (UUID)' })
  async deleteDailyRecord(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const user = req.user as JwtShop;
    await this.dailyRecordsService.deleteById(user, id);
    return { message: `Daily record with id ${id} deleted successfully` };
  }
}
