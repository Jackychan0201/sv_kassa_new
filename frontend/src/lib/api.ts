import { DailyRecord, Shop } from "@/lib/types";

export const login = async (username: string, password: string) => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: username, password }),
    credentials: "include", 
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Login failed");
  }

  return res.json();
};

export const logout = async () => {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include", 
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }

  return res.json();
};

export const getDailyRecords = async (): Promise<DailyRecord[]> => {
  const res = await fetch("/api/daily-records", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch daily records");
  return res.json();
};

export const getRecordByDate = async (date: string): Promise<DailyRecord[]> => {
  const res = await fetch(
    `/api/daily-records/by-date?fromDate=${date}&toDate=${date}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );

  if (!res.ok) throw new Error("Failed to fetch daily record");
  return res.json();
};

export const getRecordsByRange = async (fromDate: string, toDate: string): Promise<DailyRecord[]> => {
  const res = await fetch(
    `/api/daily-records/by-date?fromDate=${fromDate}&toDate=${toDate}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );

  if (!res.ok) throw new Error("Failed to fetch daily records by range");
  return res.json();
};


export const updateDailyRecord = async (record: {
  id: string;
  mainStockValue: number;
  orderStockValue: number;
  revenueMainWithMargin: number;
  revenueMainWithoutMargin: number;
  revenueOrderWithMargin: number;
  revenueOrderWithoutMargin: number;
}) => {
  const res = await fetch(`/api/daily-records/${record.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(record),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to update daily record");
  }

  return res.json();
}

export const postDailyRecord = async (record: {
  shopId: string;
  mainStockValue: number;
  orderStockValue: number;
  revenueMainWithMargin: number;
  revenueMainWithoutMargin: number;
  revenueOrderWithMargin: number;
  revenueOrderWithoutMargin: number;
  recordDate: string;
}) => {
  const res = await fetch("/api/daily-records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(record),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to save daily record");
  }

  return res.json();
};

export const saveReminderTime = async (shopId: string, time: string) => {
  const res = await fetch(`/api/shops/${shopId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ id: shopId, timer: time }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to save reminder");
  }

  return res.json();
};

export const getShopById = async (id: string): Promise<Shop> => {
  const res = await fetch(`/api/shops/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch shop with id ${id}`);
  }

  return res.json();
};


export const getAllShops = async (): Promise<Shop[]> => {
  const res = await fetch('/api/shops', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to fetch shops');
  }

  return res.json();
};

export const createShop = async (shop: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) => {

  const res = await fetch('/api/shops', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(shop),
  });
  

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to create shop');
  }

  return res.json();
};

export const deleteShop = async (shopId: string) => {
  const res = await fetch(`/api/shops/${shopId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to delete shop');
  }

  return res.json();
};
