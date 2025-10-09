import { Controller, Post, Body, Get, UseGuards, Patch, Param, Delete, Req, ForbiddenException } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { Shop, ShopRole } from './shop.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateShopDto } from './dto/create-shop.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateShopDto } from './dto/update-shop.dto';
import type { Request } from 'express';
import { JwtShop } from 'src/auth/jwt-shop.type';
import { JwtService } from '@nestjs/jwt';
import { Res } from '@nestjs/common';


@ApiTags('shops')
@Controller('shops')
export class ShopsController {
  constructor(
    private readonly shopsService: ShopsService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ShopRole.CEO) 
  @ApiOperation({ summary: 'Get all shops (Allowed only by CEO)' })
  @ApiResponse({ status: 200, description: 'List of shops.', type: [Shop] })
  findAll(): Promise<Shop[]> {
    return this.shopsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ShopRole.CEO)  
  @ApiOperation({ summary: 'Create a new shop (Allowed only by CEO)' })
  @ApiResponse({ status: 201, description: 'Shop created successfully.', type: Shop })
  async create(@Body() dto: CreateShopDto): Promise<Shop> {
    return this.shopsService.createShop(dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a shop by ID (Each shop can get info only about itself, CEO gets info about everyone)' })
  @ApiParam({ name: 'id', type: 'string', description: 'Shop ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Shop found successfully.', type: Shop })
  async findById(@Param('id') id: string, @Req() req: Request): Promise<Shop> {
    const user = req.user as JwtShop;
    return this.shopsService.findById(user, id);
  }

  @Get('by-name/:name')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a shop by name (Each shop can get info only about itself, CEO gets info about everyone)' })
  @ApiParam({ name: 'name', type: 'string', description: 'Shop name' })
  @ApiResponse({ status: 200, description: 'Shop found successfully.', type: Shop })
  async findByName(@Param('name') name: string, @Req() req: Request): Promise<Shop> {
    const user = req.user as JwtShop;
    return this.shopsService.findByName(user, name);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update shop credentials (CEO can update any, shops only their own)' })
  @ApiResponse({ status: 200, description: 'Shop updated successfully.', type: Shop })
  async update(@Param('id') id: string, @Body() dto: UpdateShopDto, @Req() req: Request, @Res({ passthrough: true }) res: any) {
    const user = req.user as JwtShop;
    const { shop, token } = await this.shopsService.updateShop(user, id, dto);

    if (token) {
      res.cookie('Authentication', token, {
        httpOnly: true,
        path: '/',
        maxAge: 86400 * 1000,
      });
    }

    return shop;
  }


  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a shop (CEO can delete any, shops only themselves)' })
  @ApiResponse({ status: 200, description: 'Shop deleted successfully.' })
  async delete(@Param('id') id: string, @Req() req: Request): Promise<{ message: string }> {
    const user = req.user as JwtShop;
    await this.shopsService.deleteShop(user, id);
    return { message: `Shop with id ${id} deleted successfully` };
  }
}
