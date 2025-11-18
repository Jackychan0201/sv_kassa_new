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
  @Throttle({ default: { limit: 10, ttl: (1 * 60 * 1000) } })
  @ApiOperation({ summary: 'Login as a shop' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const { token, expiresInMs } = await this.authService.login(dto.email, dto.password);

    const isProduction = process.env.NODE_ENV === 'production';
    
    // IMPORTANT: sameSite must be "none" for cross-domain cookies
    res.cookie('Authentication', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: expiresInMs,
      ...(isProduction && { domain: '.vercel.app' }) // Note the leading dot for subdomains
    });

    return {
      message: 'Login successful',
      expiresInMs: expiresInMs,
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout the current shop' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const isProduction = process.env.NODE_ENV === 'production';
    
    // Clear cookie with same attributes as set, including domain
    res.clearCookie('Authentication', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      ...(isProduction && { domain: '.vercel.app' })
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