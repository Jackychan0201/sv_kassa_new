"use client"

import { useEffect, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/atoms/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select"
import { toast } from "sonner"
import { Button } from "@/components/atoms/button"
import { getRecordByDate, postDailyRecord, updateDailyRecord, getAllShops } from "@/lib/api"
import type { DailyRecord, Shop } from "@/lib/types"
import { useUser } from "@/components/providers/user-provider"
import { handleError } from "@/lib/utils"
import { SheetFormField } from "@/components/molecules/sheet-form-field"
import { DatePicker } from "@/components/molecules/date-picker"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react" // Using lucide-react for spinner icon

interface EditDaySheetProps {
  onSaved?: () => void
}

export function EditDaySheet({ onSaved }: EditDaySheetProps) {
  const router = useRouter()
  const { user } = useUser()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [shops, setShops] = useState<Shop[]>([])
  const [record, setRecord] = useState<DailyRecord[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingDate, setLoadingDate] = useState(false) // separate loading for date picker
  const [dataLoaded, setDataLoaded] = useState(false)

  const [form, setForm] = useState({
    mainStockValue: "",
    orderStockValue: "",
    mainRevenueWithMargin: "",
    mainRevenueWithoutMargin: "",
    orderRevenueWithMargin: "",
    orderRevenueWithoutMargin: "",
  })

  const today = new Date()
  const formattedToday = `${today.getDate().toString().padStart(2, "0")}.${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}.${today.getFullYear()}`

  // Load shops when sheet opens
  useEffect(() => {
    const loadShops = async () => {
      if (!user || !sheetOpen) return

      if (user.role === "CEO") {
        try {
          const allShops = await getAllShops()
          setShops(
            allShops
              .filter((s) => s.role === "SHOP")
              .sort((a, b) => a.name.localeCompare(b.name))
          )
        } catch (err) {
          handleError(err, "Failed to load shops")
          router.push("/login")
        }
      } else if (user.role === "SHOP" && user.shopId) {
        const shopData = {
          id: user.shopId,
          name: user.name || "My Shop",
          role: "SHOP",
        }
        setShops([shopData])
        setSelectedShop(shopData)
      }
    }

    loadShops()
  }, [user, sheetOpen])

  // Automatically load record when date or shop changes
  useEffect(() => {
    const autoLoadRecord = async () => {
      if (!selectedDate || (user?.role === "CEO" && !selectedShop)) return

      const formattedDate = `${selectedDate.getDate().toString().padStart(2, "0")}.${(
        selectedDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}.${selectedDate.getFullYear()}`

      try {
        setLoadingDate(true)
        const data = await getRecordByDate(formattedDate)
        const shopRecord = data.find((r) => r.shopId === selectedShop?.id)
        setRecord(shopRecord ? [shopRecord] : [])
        setDataLoaded(true)
      } catch (err) {
        handleError(err)
        router.push("/login")
      } finally {
        setLoadingDate(false)
      }
    }

    autoLoadRecord()
  }, [selectedDate, selectedShop, user])

  useEffect(() => {
    if (!record || record.length === 0) {
      handleReset()
    } else {
      const r = record[0]
      setForm({
        mainStockValue: r.mainStockValue.toFixed(2),
        orderStockValue: r.orderStockValue.toFixed(2),
        mainRevenueWithMargin: r.revenueMainWithMargin.toFixed(2),
        mainRevenueWithoutMargin: r.revenueMainWithoutMargin.toFixed(2),
        orderRevenueWithMargin: r.revenueOrderWithMargin.toFixed(2),
        orderRevenueWithoutMargin: r.revenueOrderWithoutMargin.toFixed(2),
      })
    }
  }, [record])

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleReset = () => {
    setForm({
      mainStockValue: "",
      orderStockValue: "",
      mainRevenueWithMargin: "",
      mainRevenueWithoutMargin: "",
      orderRevenueWithMargin: "",
      orderRevenueWithoutMargin: "",
    })
  }

  const handleSheetOpenChange = (isOpen: boolean) => {
    setSheetOpen(isOpen)
    if (!isOpen) {
      setSelectedDate(null)
      if (user?.role === "CEO") setSelectedShop(null)
      setRecord(null)
      setDataLoaded(false)
      handleReset()
    }
  }

  const handleSave = async () => {
    if (!selectedDate || !selectedShop) {
      toast.error("Please select date and shop first.")
      return
    }

    const formattedDate = `${selectedDate.getDate().toString().padStart(2, "0")}.${(
      selectedDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}.${selectedDate.getFullYear()}`

    try {
      for (const [key, value] of Object.entries(form)) {
        if (value.trim() !== "" && isNaN(Number(value))) {
          toast.error(`${key} must be a valid number`)
          return
        }
      }

      setLoading(true)

      if (record && record.length > 0) {
        await updateDailyRecord({
          id: record[0].id,
          mainStockValue: Number(form.mainStockValue),
          orderStockValue: Number(form.orderStockValue),
          revenueMainWithMargin: Number(form.mainRevenueWithMargin),
          revenueMainWithoutMargin: Number(form.mainRevenueWithoutMargin),
          revenueOrderWithMargin: Number(form.orderRevenueWithMargin),
          revenueOrderWithoutMargin: Number(form.orderRevenueWithoutMargin),
        })
      } else {
        await postDailyRecord({
          shopId: selectedShop.id,
          mainStockValue: Number(form.mainStockValue),
          orderStockValue: Number(form.orderStockValue),
          revenueMainWithMargin: Number(form.mainRevenueWithMargin),
          revenueMainWithoutMargin: Number(form.mainRevenueWithoutMargin),
          revenueOrderWithMargin: Number(form.orderRevenueWithMargin),
          revenueOrderWithoutMargin: Number(form.orderRevenueWithoutMargin),
          recordDate: formattedDate,
        })
      }

      toast.success("Data saved successfully!")
      handleSheetOpenChange(false)
      if (formattedDate === formattedToday) onSaved?.()
    } catch (err) {
      handleError(err, "Failed to save record")
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const inputFields = [
    { key: "mainStockValue", label: "Main stock value", placeholder: "e.g. 12345.00" },
    { key: "orderStockValue", label: "Order stock value", placeholder: "e.g. 5678.00" },
    { key: "mainRevenueWithMargin", label: "Revenue main stock (with margin)", placeholder: "e.g. 8000.00" },
    { key: "mainRevenueWithoutMargin", label: "Revenue main stock (without margin)", placeholder: "e.g. 7000.00" },
    { key: "orderRevenueWithMargin", label: "Revenue order stock (with margin)", placeholder: "e.g. 4000.00" },
    { key: "orderRevenueWithoutMargin", label: "Revenue order stock (without margin)", placeholder: "e.g. 3500.00" },
  ] as const

  return (
    <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>
        <Button className="w-50 transition text-[var(--color-text-primary)] delay-150 duration-300 ease-in-out hover:scale-105 hover:bg-[var(--color-bg-select-hover)]">
          Edit Data
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex flex-col h-full bg-[var(--color-bg-secondary)] border-l border-[var(--color-border)] overflow-y-auto"
      >
        <SheetHeader className="pb-4 border-b border-[var(--color-border)]">
          <SheetTitle className="text-xl text-[var(--color-text-primary)]">Edit Daily Data</SheetTitle>
          <SheetDescription className="text-[var(--color-text-primary)]">
            Choose a date and shop to load or edit data.
          </SheetDescription>
        </SheetHeader>

        {/* Selection Section */}
        <div className="flex flex-row items-center">
          <div className="flex flex-col gap-4">
            <div className="flex items-center py-0 ml-6 gap-x-15 text-[var(--color-text-primary)]">
              <DatePicker
                title="Select Date"
                value={selectedDate}
                onChange={setSelectedDate}
              />
            </div>

            {user?.role === "CEO" && (
              <div className="ml-6">
                <p className="text-sm mb-2 text-[var(--color-text-primary)]">Select Shop</p>
                <Select
                  value={selectedShop?.id ?? ""}
                  onValueChange={(val) => setSelectedShop(shops.find((s) => s.id === val) || null)}
                >
                  <SelectTrigger className="w-48 bg-[var(--color-bg-select-trigger)] border-0 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-select-hover)] py-3 px-4">
                    <SelectValue placeholder="Choose a shop" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--color-bg-select-content)] text-[var(--color-text-primary)] border border-[var(--color-border)]">
                    {shops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>
                        {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

          </div>
          {loadingDate && <Loader2 className="ml-16 animate-spin w-10 h-10 text-[var(--color-text-primary)]" />}
        </div>

        {/* Form Section */}
        <div className="flex flex-col gap-4 py-6 border-t border-[var(--color-border)]">
          {inputFields.map((f) => (
            <SheetFormField
              key={f.key}
              id={f.key}
              label={f.label}
              value={form[f.key]}
              placeholder={f.placeholder}
              onChange={(value) => handleChange(f.key, value)}
              disabled={!selectedDate || !selectedShop}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex flex-col items-center gap-2 py-4 border-t border-[var(--color-border)]">
          <Button
            onClick={handleSave}
            disabled={!selectedDate || !selectedShop || loading}
            className="w-[90%] transition text-[var(--color-text-primary)] hover:bg-[var(--color-bg-select-hover)]"
          >
            {loading ? "Saving..." : "Save Data"}
          </Button>
          <Button
            onClick={handleReset}
            disabled={!selectedDate || !selectedShop}
            className="w-[90%] transition text-[var(--color-text-primary)] hover:bg-[var(--color-bg-select-hover)]"
          >
            Reset
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
