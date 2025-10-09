import { ApiProperty } from '@nestjs/swagger';
import { ShopRole } from '../shop.entity';
import { IsOptional, IsString, IsEmail, IsEnum, Matches } from 'class-validator';

export class CreateShopDto {
  @ApiProperty({ example: 'Shop 1', description: 'Name of the shop' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'shop1@example.com', description: 'Login email of the shop' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1111', description: 'Password for the shop' })
  @IsString()
  password: string;

  @ApiProperty({
    example: ShopRole.SHOP,
    description: 'Role of the shop (default is SHOP)',
    enum: ShopRole,
  })
  @IsEnum(ShopRole)
  role: ShopRole;

  @ApiProperty({ example: "17:30", description: 'Timer for the shop', required: false })
  @IsOptional()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Timer must be in HH:mm format',
  })
  timer?: string | null;
}
