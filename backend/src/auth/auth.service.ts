import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ShopsService } from '../shops/shops.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly shopsService: ShopsService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtTokenConfig: ConfigType<typeof jwtConfig>,
  ) {}

  private static readonly DUMMY_BCRYPT_HASH =
    '$2b$10$zCwDPhE4SPXyXKCNwqkECuDq/CkpoAmuZsYZ3MIrUZCzXcU4A9p8W';

  async login(email: string, password: string) {
    const shop = await this.shopsService.findByEmail(email);

    const hashToCompare = shop?.password ?? AuthService.DUMMY_BCRYPT_HASH;

    const passwordMatch = await bcrypt.compare(password, hashToCompare);

    if (!shop || !passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: shop.id,
      name: shop.name,
      email: shop.email,
      role: shop.role,
      timer: shop.timer,
    };

    const token = this.jwtService.sign(payload);

    const expiresInSeconds = this.jwtTokenConfig.signOptions?.expiresIn ?? 0;
    const expiresInMs = expiresInSeconds * 1000;

    return { token, expiresInMs };
  }
}
