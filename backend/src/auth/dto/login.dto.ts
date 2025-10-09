import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({},{ message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  @ApiProperty({ example: 'shop1@example.com', description: 'Shop login email' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password should not be empty' })
  @ApiProperty({ example: '1111', description: 'Shop password' })
  password: string;
}
