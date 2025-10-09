import { ShopRole } from '../shops/shop.entity';

export interface JwtShop {
  shopId: string; 
  role: ShopRole;
  name: string;
  email: string;
}
