import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ShopsService } from '../shops/shops.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly shopsService: ShopsService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const shop = await this.shopsService.findByEmail(email);
    if (!shop) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(password, shop.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: shop.id, name: shop.name, email: shop.email, role: shop.role, timer: shop.timer };

    const token = this.jwtService.sign(payload);

    const decoded = this.jwtService.decode(token) as { exp: number; iat: number };
    const expiresInMs = (decoded.exp - decoded.iat) * 1000;

    return { token, expiresInMs };
    }
}
