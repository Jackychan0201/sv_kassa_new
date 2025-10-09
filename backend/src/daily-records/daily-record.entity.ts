import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Shop } from '../shops/shop.entity';
import { Transform } from 'class-transformer';

@Entity('daily_records')
export class DailyRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shopId: string;

  @ManyToOne(() => Shop, (shop) => shop.dailyRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  @Column('bigint', { default: 0 })
  revenueMainWithMargin: number;

  @Column('bigint', { default: 0 })
  revenueMainWithoutMargin: number;

  @Column('bigint', { default: 0 })
  revenueOrderWithMargin: number;

  @Column('bigint', { default: 0 })
  revenueOrderWithoutMargin: number;

  @Column('bigint', { default: 0 })
  mainStockValue: number;

  @Column('bigint', { default: 0 })
  orderStockValue: number;

  @Column({ type: 'date' })
  @Transform(({ value }) => {
    if (!value) return value;
    const [year, month, day] = value.split('-');
    return `${day}.${month}.${year}`;
  })
  recordDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
