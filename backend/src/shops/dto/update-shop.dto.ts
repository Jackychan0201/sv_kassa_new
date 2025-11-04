import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMilitaryTime, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { ShopRole } from '../shop.role';

export class UpdateShopDto {
  @ApiProperty({ example: 'shop11@example.com', required: false })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'P@ssw0rd123!', required: false })
  @IsOptional()
  @IsString()
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
  @IsMilitaryTime({ message: 'Timer must be a valid 24-hour time in HH:mm format' })
  timer?: string | null;
}
