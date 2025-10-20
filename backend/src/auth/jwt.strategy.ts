import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ShopsService } from '../shops/shops.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly shopsService: ShopsService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.Authentication,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const shop = await this.shopsService.findByIdForAuth(payload.sub);
    if (!shop) {
      throw new UnauthorizedException('Shop not found or has been deleted');
    }

    return {
      shopId: shop.id,
      name: shop.name,
      email: shop.email,
      role: shop.role,
      timer: shop.timer,
    };
  }
}
