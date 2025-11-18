import { DailyRecord, Shop } from "@/lib/types"; 
import { handleError } from "@/lib/utils"; 

export const login = async (username: string, password: string) => { 
  try { 
    const timestamp = Date.now();
    
    // Clear any local storage first
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    }
    
    const res = await fetch(`/api/auth/login?t=${timestamp}`, { 
      method: "POST", 
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      }, 
      body: JSON.stringify({ email: username, password }), 
      credentials: "include",
      cache: 'no-store' as RequestCache,
    }); 
    
    if (!res.ok) { 
      const errorData = await res.json().catch(() => null); 
      const message = (errorData && errorData.message) || "Login failed"; 
      const err = new Error(message); 
      handleError(err, message); 
      throw err; 
    } 
    
    const result = await res.json();
    
    // Verify the new session
    const user = await verifyAuthState();
    if (!user) {
      throw new Error('Login verification failed');
    }
    
    return { ...result, user };
  } catch (error) { 
    handleError(error, "Login failed"); 
    throw error; 
  } 
}; 

export const logout = async () => { 
  try { 
    // Clear any local storage or state first
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    }
    
    const timestamp = Date.now();
    const res = await fetch(`/api/auth/logout?t=${timestamp}`, { 
      method: "POST", 
      credentials: "include",
      cache: 'no-store' as RequestCache,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    }); 
    
    if (!res.ok) { 
      const errorData = await res.json().catch(() => null); 
      const message = (errorData && errorData.message) || "Logout failed"; 
      const err = new Error(message); 
      handleError(err, message); 
      throw err; 
    } 
    
    // Verify logout was successful
    const user = await verifyAuthState();
    if (user) {
      console.warn('Logout verification: User session still exists');
    }
    
    // Force a hard refresh to clear any cached state
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    
    return await res.json(); 
  } catch (error) { 
    handleError(error, "Logout failed"); 
    // Still redirect even if there's an error
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw error; 
  } 
}; 

// Add this utility function
export const verifyAuthState = async () => {
  try {
    const timestamp = Date.now();
    const res = await fetch(`/api/auth/me?t=${timestamp}`, {
      credentials: "include",
      cache: 'no-store' as RequestCache,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
};

export const getDailyRecords = async (): Promise<DailyRecord[]> => { 
  try { 
    const timestamp = Date.now();
    const res = await fetch(`/api/daily-records?t=${timestamp}`, { 
      method: "GET", 
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
      }, 
      credentials: "include", 
      cache: 'no-store' as RequestCache,
    }); 
    if (!res.ok) { 
      const errorData = await res.json().catch(() => null); 
      const message = (errorData && errorData.message) || "Failed to fetch daily records"; 
      const err = new Error(message); 
      handleError(err, message); 
      throw err; 
    } 
    return res.json(); 
  } catch (error) { 
    handleError(error, "Failed to fetch daily records"); 
    throw error; 
  } 
}; 

export const getRecordByDate = async (date: string): Promise<DailyRecord[]> => { 
  try { 
    const timestamp = Date.now();
    const res = await fetch( 
      `/api/daily-records/by-date?fromDate=${date}&toDate=${date}&t=${timestamp}`, 
      { 
        method: "GET", 
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        }, 
        credentials: "include", 
        cache: 'no-store' as RequestCache,
      } 
    ); 
    if (!res.ok) { 
      const errorData = await res.json().catch(() => null); 
      const message = (errorData && errorData.message) || "Failed to fetch daily record"; 
      const err = new Error(message); 
      handleError(err, message); 
      throw err; 
    } 
    return res.json(); 
  } catch (error) { 
    handleError(error, "Failed to fetch daily record"); 
    throw error; 
  } 
}; 

export const getRecordsByRange = async (fromDate: string, toDate: string): Promise<DailyRecord[]> => { 
  try { 
    const timestamp = Date.now();
    const res = await fetch( 
      `/api/daily-records/by-date?fromDate=${fromDate}&toDate=${toDate}&t=${timestamp}`, 
      { 
        method: "GET", 
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        }, 
        credentials: "include", 
        cache: 'no-store' as RequestCache,
      } 
    ); 
    if (!res.ok) { 
      const errorData = await res.json().catch(() => null); 
      const message = (errorData && errorData.message) || "Failed to fetch daily records by range"; 
      const err = new Error(message); 
      handleError(err, message); 
      throw err; 
    } 
    return res.json(); 
  } catch (error) { 
    handleError(error, "Failed to fetch daily records by range"); 
    throw error; 
  } 
}; 

export const updateDailyRecord = async (record: { id: string; mainStockValue: number; orderStockValue: number; revenueMainWithMargin: number; revenueMainWithoutMargin: number; revenueOrderWithMargin: number; revenueOrderWithoutMargin: number; }) => { 
  try { 
    const timestamp = Date.now();
    const res = await fetch(`/api/daily-records/${record.id}?t=${timestamp}`, { 
      method: "PATCH", 
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
      }, 
      credentials: "include", 
      body: JSON.stringify(record), 
      cache: 'no-store' as RequestCache,
    }); 
    if (!res.ok) { 
      const errorData = await res.json().catch(() => null); 
      const message = (errorData && errorData.message) || "Failed to update daily record"; 
      const err = new Error(message); 
      handleError(err, message); 
      throw err; 
    } 
    return res.json(); 
  } catch (error) { 
    handleError(error, "Failed to update daily record"); 
    throw error; 
  } 
} 

export const postDailyRecord = async (record: { shopId: string; mainStockValue: number; orderStockValue: number; revenueMainWithMargin: number; revenueMainWithoutMargin: number; revenueOrderWithMargin: number; revenueOrderWithoutMargin: number; recordDate: string; }) => { 
  try { 
    const timestamp = Date.now();
    const res = await fetch(`/api/daily-records?t=${timestamp}`, { 
      method: "POST", 
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
      }, 
      credentials: "include", 
      body: JSON.stringify(record), 
      cache: 'no-store' as RequestCache,
    }); 
    if (!res.ok) { 
      const errorData = await res.json().catch(() => null); 
      const message = (errorData && errorData.message) || "Failed to save daily record"; 
      const err = new Error(message); 
      handleError(err, message); 
      throw err; 
    } 
    return res.json(); 
  } catch (error) { 
    handleError(error, "Failed to save daily record"); 
    throw error; 
  } 
}; 

export const saveReminderTime = async (shopId: string, time: string) => { 
  try { 
    const timestamp = Date.now();
    const res = await fetch(`/api/shops/${shopId}?t=${timestamp}`, { 
      method: "PATCH", 
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
      }, 
      credentials: "include", 
      body: JSON.stringify({ id: shopId, timer: time }), 
      cache: 'no-store' as RequestCache,
    }); 
    if (!res.ok) { 
      const errorData = await res.json().catch(() => null); 
      const message = (errorData && errorData.message) || "Failed to save reminder"; 
      const err = new Error(message); 
      handleError(err, message); 
      throw err; 
    } 
    return res.json(); 
  } catch (error) { 
    handleError(error, "Failed to save reminder"); 
    throw error; 
  } 
}; 

export const getShopById = async (id: string): Promise<Shop> => { 
  try { 
    const timestamp = Date.now();
    const res = await fetch(`/api/shops/${id}?t=${timestamp}`, { 
      method: "GET", 
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
      }, 
      credentials: "include", 
      cache: 'no-store' as RequestCache,
    }); 
    if (!res.ok) { 
      const errorData = await res.json().catch(() => null); 
      const message = (errorData && errorData.message) || `Failed to fetch shop with id ${id}`; 
      const err = new Error(message); 
      handleError(err, message); 
      throw err; 
    } 
    return res.json(); 
  } catch (error) { 
    handleError(error, `Failed to fetch shop with id ${id}`); 
    throw error; 
  } 
}; 

export const getAllShops = async (): Promise<Shop[]> => { 
  try { 
    const timestamp = Date.now();
    const res = await fetch(`/api/shops?t=${timestamp}`, { 
      method: 'GET', 
      headers: { 
        'Content-Type': 'application/json',
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
      }, 
      credentials: 'include', 
      cache: 'no-store' as RequestCache,
    }); 
    if (!res.ok) { 
      const errorData = await res.json().catch(() => null); 
      const message = (errorData && errorData.message) || 'Failed to fetch shops'; 
      const err = new Error(message); 
      handleError(err, message); 
      throw err; 
    } 
    return res.json(); 
  } catch (error) { 
    handleError(error, 'Failed to fetch shops'); 
    throw error; 
  } 
}; 

export const createShop = async (shop: { name: string; email: string; password: string; role?: string; }) => { 
  try { 
    const timestamp = Date.now();
    const res = await fetch(`/api/shops?t=${timestamp}`, { 
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/json',
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
      }, 
      credentials: 'include', 
      body: JSON.stringify(shop), 
      cache: 'no-store' as RequestCache,
    }); 
    if (!res.ok) { 
      const errorData = await res.json().catch(() => null); 
      const message = (errorData && errorData.message) || 'Failed to create shop'; 
      handleError(message); 
    } 
    return res.json(); 
  } catch (error) { 
    handleError(error, 'Failed to create shop'); 
  } 
}; 

export const deleteShop = async (shopId: string) => { 
  try { 
    const timestamp = Date.now();
    const res = await fetch(`/api/shops/${shopId}?t=${timestamp}`, { 
      method: 'DELETE', 
      headers: { 
        'Content-Type': 'application/json',
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
      }, 
      credentials: 'include', 
      cache: 'no-store' as RequestCache,
    }); 
    if (!res.ok) { 
      const errorData = await res.json().catch(() => null); 
      const message = (errorData && errorData.message) || 'Failed to delete shop'; 
      handleError(message); 
    } 
    return res.json(); 
  } catch (error) { 
    handleError(error, 'Failed to delete shop'); 
  } 
}; 

interface UpdateShopAccountData { 
  name?: string; 
  email?: string; 
  password?: string; 
  role?: string; 
} 

export const updateShopAccount = async (shopId: string, data: UpdateShopAccountData) => { 
  try { 
    const timestamp = Date.now();
    const res = await fetch(`/api/shops/${shopId}?t=${timestamp}`, { 
      method: "PATCH", 
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
      }, 
      credentials: "include", 
      body: JSON.stringify(data), 
      cache: 'no-store' as RequestCache,
    }); 
    if (!res.ok) { 
      const errorData = await res.json().catch(() => null); 
      const message = (errorData && errorData.message) || "Failed to update account"; 
      handleError(message); 
    } 
    return res.json(); 
  } catch (error) { 
    handleError(error, "Failed to update account"); 
  } 
};