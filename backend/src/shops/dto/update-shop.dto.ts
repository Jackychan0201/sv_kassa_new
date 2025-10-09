import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { ShopRole } from '../shop.entity';

export class UpdateShopDto {
  @ApiProperty({ example: 'shop11@example.com', required: false })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '9999', required: false })
  @IsOptional()
  @IsString()
  @MinLength(4)
  password?: string;

  @ApiProperty({ example: 'NewShop', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({example: ShopRole.SHOP, required: false, enum: ShopRole})
  @IsOptional()
  role?: ShopRole;

  @ApiProperty({ example: "17:30", description: 'Timer for the shop', required: false })
  @IsOptional()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Timer must be in HH:mm format',
  })
  timer?: string | null;
}
