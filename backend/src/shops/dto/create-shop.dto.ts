import { ApiProperty } from '@nestjs/swagger';
import { ShopRole } from '../shop.role';
import { IsOptional, IsString, IsEmail, IsEnum, Matches, MinLength, IsMilitaryTime } from 'class-validator';

export class CreateShopDto {
  @ApiProperty({ example: 'Shop 1', description: 'Name of the shop' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'shop1@example.com', description: 'Login email of the shop' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd123!',
    description: 'Password for the shop',
  })
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
  @IsMilitaryTime({ message: 'Timer must be a valid 24-hour time in HH:mm format' })
  timer?: string | null;
}
