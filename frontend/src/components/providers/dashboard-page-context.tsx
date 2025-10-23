// dashboard-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getRecordByDate, getAllShops, getShopById } from "@/lib/api";
import { DailyRecord, Shop } from "@/lib/types";
import { handleError } from "@/lib/utils";
import { useUser } from "@/components/providers/user-provider";
import { useRouter } from "next/navigation";

interface DashboardContextType {
  record: DailyRecord[] | null;
  allRecords: DailyRecord[] | null;
  shops: Shop[];
  notClosedShopNames: string[];
  selectedShopId: string;
  setSelectedShopId: (id: string) => void;
  reloadData: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within DashboardProvider");
  return context;
};

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const router = useRouter();
  const formattedDate = new Intl.DateTimeFormat("de-DE").format(new Date());

  const [record, setRecord] = useState<DailyRecord[] | null>(null);
  const [allRecords, setAllRecords] = useState<DailyRecord[] | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [notClosedShopNames, setNotClosedShopNames] = useState<string[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>("ALL");

  const loadRecord = async () => {
    if (!user) return;
    try {
      const data = await getRecordByDate(formattedDate);
      setRecord(data || []);
      if (user.role === "CEO") setAllRecords(data || []);
    } catch (err) {
      handleError(err);
      router.push("/login");
    }
  };

  const loadShops = async () => {
    if (!user || user.role !== "CEO") return;
    try {
      const allShops = await getAllShops();
      setShops(
        allShops
          .filter((s) => s.role === "SHOP")
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (err) {
      handleError(err, "Failed to fetch shops");
      router.push("/login");
    }
  };

  const resolveNotClosedShops = async () => {
    if (!user || user.role !== "CEO" || !allRecords || shops.length === 0) return;

    const closedShopIds = allRecords.map((r) => r.shopId);
    const notClosed = shops.filter((s) => !closedShopIds.includes(s.id));

    const names = await Promise.all(
      notClosed.map(async (shop) => {
        try {
          const shopData = await getShopById(shop.id);
          return shopData.name;
        } catch (err) {
          handleError(err, `Failed to fetch shop name for ${shop.id}:`);
          return shop.id;
        }
      })
    );

    setNotClosedShopNames(names);
  };

  const reloadData = () => {
    if (!user) return;
    if (user.role === "CEO") loadShops();
    loadRecord();
  };

  useEffect(() => {
    if (user) reloadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    resolveNotClosedShops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRecords, shops]);

  return (
    <DashboardContext.Provider
      value={{
        record,
        allRecords,
        shops,
        notClosedShopNames,
        selectedShopId,
        setSelectedShopId,
        reloadData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
