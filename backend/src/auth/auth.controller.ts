import { Controller, Post, Body, Res, Req, UseGuards, BadRequestException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import type { Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './auth.guard';
import { JwtShop } from './jwt-shop.type';
import { Throttle } from '@nestjs/throttler';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 3, ttl: (1 * 60 * 1000) } })
  @ApiOperation({ summary: 'Login as a shop' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    
    const { token, expiresInMs } = await this.authService.login(dto.email, dto.password);

    res.cookie('Authentication', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresInMs,
    });

    return { message: 'Login successful', expiresInMs: expiresInMs};
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout the current shop' })
  async logout(@Res({ passthrough: true }) res: Response) {

    res.clearCookie('Authentication', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    const user = req.user as JwtShop;
    return {
      shopId: user.shopId,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

}
