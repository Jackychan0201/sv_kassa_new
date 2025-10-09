import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { DailyRecord } from '../daily-records/daily-record.entity';
import { Exclude } from 'class-transformer';

export enum ShopRole {
  CEO = 'CEO',
  SHOP = 'SHOP',
}

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: ShopRole,
    default: ShopRole.SHOP,
  })
  role: ShopRole;

  @Column({ type: 'varchar', nullable: true })
  timer: string | null;

  @OneToMany(() => DailyRecord, (record) => record.shop)
  dailyRecords: DailyRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
