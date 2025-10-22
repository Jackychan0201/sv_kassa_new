import { SetMetadata } from '@nestjs/common';
import { ShopRole } from '../shops/shop.role';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ShopRole[]) => SetMetadata(ROLES_KEY, roles);
