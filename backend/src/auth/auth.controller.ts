import { Controller, Post, Body, Res, Req, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './auth.guard';
import { JwtShop } from './jwt-shop.type';
import { Throttle } from '@nestjs/throttler';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 1 * 60 * 1000 } })
  @ApiOperation({ summary: 'Login as a shop' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const isProduction = process.env.NODE_ENV === 'production';
    const baseOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      path: '/',
    };

    if (isProduction && process.env.NEXT_PUBLIC_COOKIE_DOMAIN) {
      res.clearCookie('Authentication', {
        ...baseOptions,
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN
      });
    }
    res.clearCookie('Authentication', baseOptions);

    const { token, expiresInMs } = await this.authService.login(dto.email, dto.password);

    res.cookie('Authentication', token, {
      ...baseOptions,
      maxAge: expiresInMs,
      ...(isProduction && process.env.NEXT_PUBLIC_COOKIE_DOMAIN
        ? { domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN }
        : {}),
    });

    return {
      message: 'Login successful',
      expiresInMs,
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout the current shop' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const isProduction = process.env.NODE_ENV === 'production';

    const baseOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      path: '/',
    };

    if (isProduction && process.env.NEXT_PUBLIC_COOKIE_DOMAIN) {
      res.clearCookie('Authentication', {
        ...baseOptions,
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN
      });
    }

    res.clearCookie('Authentication', baseOptions);

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