export type DailyRecord = {
  id: string;
  shopId: string;
  revenueMainWithMargin: number;
  revenueMainWithoutMargin: number;
  revenueOrderWithMargin: number;
  revenueOrderWithoutMargin: number;
  mainStockValue: number;
  orderStockValue: number;
  recordDate: string;
  createdAt: string;
  updatedAt: string;
};

export type Shop = {
  id: string;
  name: string;
  role: string;
}