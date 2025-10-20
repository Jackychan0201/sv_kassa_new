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
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
  @Matches(/(?=.*[@$!%*?&])/, { message: 'Password must contain at least one special character (@$!%*?&)' })
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
