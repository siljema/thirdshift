// Inventory Types

export type ItemCategory = 'dairy' | 'meat' | 'produce' | 'grains' | 'pantry' | 'frozen' | 'beverages' | 'other';
export type ItemLocation = 'fridge' | 'freezer' | 'pantry' | 'counter';

export interface InventoryItem {
  itemId: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  unit: string;
  expirationDate: string; // ISO date string YYYY-MM-DD
  location: ItemLocation;
  addedDate: string; // ISO timestamp
  cost?: number;
  barcode?: string;
  notes?: string;
}

export interface AddInventoryInput {
  name: string;
  category: ItemCategory;
  quantity: number;
  unit: string;
  expirationDate: string;
  location: ItemLocation;
  cost?: number;
  barcode?: string;
  notes?: string;
}

export interface UpdateInventoryInput {
  name?: string;
  category?: ItemCategory;
  quantity?: number;
  unit?: string;
  expirationDate?: string;
  location?: ItemLocation;
  cost?: number;
  barcode?: string;
  notes?: string;
}

export interface ConsumeItemInput {
  itemId: string;
  quantityUsed: number;
  mealPlanId?: string;
}

export interface WasteEvent {
  wasteId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  expirationDate: string;
  wastedDate: string;
  reason: 'expired' | 'spoiled' | 'other';
  cost?: number;
}

export interface ExpiringItem {
  item: InventoryItem;
  daysUntilExpiration: number;
}

export interface FridgeDeviceData {
  deviceId: string;
  items: Array<{
    barcode?: string;
    name: string;
    quantity: number;
    unit: string;
    addedDate: string;
  }>;
  timestamp: string;
}
