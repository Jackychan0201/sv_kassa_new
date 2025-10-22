import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './shop.entity';
import { ShopRole } from './shop.role';
import * as bcrypt from 'bcrypt';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { JwtShop } from '../auth/jwt-shop.type';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    private readonly jwtService: JwtService,
  ) {}

  async createShop(dto: CreateShopDto): Promise<Shop> {
    const existingShop = await this.shopRepository.findOne({
      where: { email: dto.email },
    });
    if (existingShop) {
      throw new BadRequestException('Shop with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const shop = this.shopRepository.create({
      ...dto,
      password: hashedPassword,
      role: dto.role || ShopRole.SHOP,
      timer: dto.timer || null,
    });

    const savedShop = await this.shopRepository.save(shop);
    const { password, ...result } = savedShop;
    return result as Shop;
  }

  async updateShop(
    user: JwtShop,
    id: string,
    dto: UpdateShopDto,
  ): Promise<{ shop: Shop; token?: string }> {
    if (user.role !== ShopRole.CEO && user.shopId !== id) {
      throw new ForbiddenException('You are not allowed to update this shop');
    }

    if (dto.role && user.role !== ShopRole.CEO) {
      throw new ForbiddenException('Only CEO can change shop roles');
    }

    const shop = await this.shopRepository.findOne({ where: { id } });
    if (!shop) throw new NotFoundException(`Shop with id ${id} not found`);

    const updatedFields: Partial<Shop> = { ...dto };

    if (dto.password) {
      updatedFields.password = await bcrypt.hash(dto.password, 10);
    }

    const updatedShop = await this.shopRepository.save({
      ...shop,
      ...updatedFields,
    });

    const { password, ...result } = updatedShop;

    let token: string | undefined;
    if (user.shopId === updatedShop.id) {
      const payload = {
        sub: updatedShop.id,
        name: updatedShop.name,
        email: updatedShop.email,
        role: updatedShop.role,
        timer: updatedShop.timer,
      };
      token = this.jwtService.sign(payload);
    }

    return { shop: result as Shop, token };
  }

  async deleteShop(user: JwtShop, id: string): Promise<void> {
    if (user.role !== ShopRole.CEO && user.shopId !== id) {
      throw new ForbiddenException('You are not allowed to delete this shop');
    }

    const result = await this.shopRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Shop with id ${id} not found`);
    }
  }

  findAll(): Promise<Shop[]> {
    return this.shopRepository.find({
      select: ['id', 'name', 'email', 'role', 'timer', 'createdAt', 'updatedAt'],
    });
  }

  async findById(user: JwtShop, id: string): Promise<Shop> {
    if (user.role !== ShopRole.CEO && user.shopId !== id) {
      throw new ForbiddenException('You are not allowed to fetch another shop info');
    }

    const shop = await this.shopRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'timer', 'createdAt', 'updatedAt'],
    });

    if (!shop) {
      throw new NotFoundException(`Shop with id ${id} not found`);
    }

    return shop;
  }

  async findByIdForAuth(id: string): Promise<Shop | null> {
    return this.shopRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'timer'],
    });
  }

  async findByEmail(email: string): Promise<Shop | null> {
    const shop = await this.shopRepository.findOne({ where: { email } });
    return shop ?? null;
  }

  async findByName(user: JwtShop, name: string): Promise<Shop> {
    if (user.role !== ShopRole.CEO && user.name !== name) {
      throw new ForbiddenException('You are not allowed to fetch another shop info');
    }

    const shop = await this.shopRepository.findOne({
      where: { name },
      select: ['id', 'name', 'email', 'role', 'timer', 'createdAt', 'updatedAt'],
    });

    if (!shop) {
      throw new NotFoundException(`Shop with name "${name}" not found`);
    }

    return shop;
  }
}
