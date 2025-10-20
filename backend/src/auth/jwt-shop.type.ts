import { ShopRole } from '../shops/shop.role';

export interface JwtShop {
  shopId: string; 
  role: ShopRole;
  name: string;
  email: string;
}
