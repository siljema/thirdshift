import { v4 as uuidv4 } from 'uuid';
import { InventoryRepository } from './repository';
import { FridgeAdapter } from './fridge-adapter';
import { 
  InventoryItem, 
  AddInventoryInput, 
  UpdateInventoryInput,
  ConsumeItemInput,
  ExpiringItem,
  WasteEvent
} from './types';
import { 
  validateAddInventoryInput, 
  validateUpdateInventoryInput,
  ValidationError 
} from './validation';

const repository = new InventoryRepository();
const fridgeAdapter = new FridgeAdapter();

interface LambdaEvent {
  action: 'add' | 'get' | 'update' | 'delete' | 'list' | 'sync' | 'consume' | 'check-expiring' | 'remove-expired';
  itemId?: string;
  data?: any;
}

interface LambdaResult {
  statusCode: number;
  body: any;
}

export const handler = async (event: LambdaEvent): Promise<LambdaResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const action = event.action;

    switch (action) {
      case 'add':
        return await addItem(event.data);
      case 'get':
        return await getItem(event.itemId!);
      case 'update':
        return await updateItem(event.itemId!, event.data);
      case 'delete':
        return await deleteItem(event.itemId!);
      case 'list':
        return await listItems();
      case 'sync':
        return await syncWithFridge();
      case 'consume':
        return await consumeItem(event.data);
      case 'check-expiring':
        return await checkExpiringItems();
      case 'remove-expired':
        return await removeExpiredItems();
      default:
        return {
          statusCode: 400,
          body: { error: 'Invalid action' }
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return handleError(error);
  }
};

async function addItem(input: AddInventoryInput): Promise<LambdaResult> {
  validateAddInventoryInput(input);

  const item: InventoryItem = {
    itemId: uuidv4(),
    name: input.name,
    category: input.category,
    quantity: input.quantity,
    unit: input.unit,
    expirationDate: input.expirationDate,
    location: input.location,
    addedDate: new Date().toISOString(),
    cost: input.cost,
    barcode: input.barcode,
    notes: input.notes
  };

  const created = await repository.add(item);

  return {
    statusCode: 201,
    body: created
  };
}

async function getItem(itemId: string): Promise<LambdaResult> {
  const item = await repository.getByItemId(itemId);

  if (!item) {
    return {
      statusCode: 404,
      body: { error: 'Item not found' }
    };
  }

  return {
    statusCode: 200,
    body: item
  };
}

async function updateItem(itemId: string, updates: UpdateInventoryInput): Promise<LambdaResult> {
  validateUpdateInventoryInput(updates);

  const existing = await repository.getByItemId(itemId);
  if (!existing) {
    return {
      statusCode: 404,
      body: { error: 'Item not found' }
    };
  }

  const updated = await repository.update(itemId, existing.expirationDate, updates);

  return {
    statusCode: 200,
    body: updated
  };
}

async function deleteItem(itemId: string): Promise<LambdaResult> {
  const existing = await repository.getByItemId(itemId);
  if (!existing) {
    return {
      statusCode: 404,
      body: { error: 'Item not found' }
    };
  }

  await repository.delete(itemId, existing.expirationDate);

  return {
    statusCode: 204,
    body: null
  };
}

async function listItems(): Promise<LambdaResult> {
  const items = await repository.list();

  return {
    statusCode: 200,
    body: { items, count: items.length }
  };
}

async function syncWithFridge(): Promise<LambdaResult> {
  await fridgeAdapter.initialize();
  const fridgeData = await fridgeAdapter.syncInventory();

  if (!fridgeData) {
    return {
      statusCode: 200,
      body: { message: 'Fridge integration not configured', synced: 0 }
    };
  }

  // Process fridge data and update inventory
  const syncedItems: InventoryItem[] = [];
  
  for (const fridgeItem of fridgeData.items) {
    // Estimate expiration date based on category (simplified logic)
    const expirationDate = estimateExpirationDate(fridgeItem.name);
    
    const item: InventoryItem = {
      itemId: uuidv4(),
      name: fridgeItem.name,
      category: categorizeItem(fridgeItem.name),
      quantity: fridgeItem.quantity,
      unit: fridgeItem.unit,
      expirationDate,
      location: 'fridge',
      addedDate: fridgeItem.addedDate,
      barcode: fridgeItem.barcode
    };

    await repository.add(item);
    syncedItems.push(item);
  }

  return {
    statusCode: 200,
    body: { 
      message: 'Sync completed', 
      synced: syncedItems.length,
      items: syncedItems
    }
  };
}

async function consumeItem(input: ConsumeItemInput): Promise<LambdaResult> {
  const item = await repository.getByItemId(input.itemId);
  
  if (!item) {
    return {
      statusCode: 404,
      body: { error: 'Item not found' }
    };
  }

  if (item.quantity < input.quantityUsed) {
    return {
      statusCode: 400,
      body: { error: 'Insufficient quantity' }
    };
  }

  const newQuantity = item.quantity - input.quantityUsed;

  if (newQuantity === 0) {
    // Remove item completely
    await repository.delete(item.itemId, item.expirationDate);
    
    // Report to fridge device
    await fridgeAdapter.initialize();
    await fridgeAdapter.reportConsumption(item.itemId, input.quantityUsed);

    return {
      statusCode: 200,
      body: { message: 'Item fully consumed and removed', item }
    };
  } else {
    // Update quantity
    const updated = await repository.update(item.itemId, item.expirationDate, {
      quantity: newQuantity
    });

    // Report to fridge device
    await fridgeAdapter.initialize();
    await fridgeAdapter.reportConsumption(item.itemId, input.quantityUsed);

    return {
      statusCode: 200,
      body: { message: 'Item quantity updated', item: updated }
    };
  }
}

async function checkExpiringItems(): Promise<LambdaResult> {
  const expiringItems = await repository.getExpiringItems(3);
  
  const today = new Date();
  const itemsWithDays: ExpiringItem[] = expiringItems.map(item => {
    const expDate = new Date(item.expirationDate);
    const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      item,
      daysUntilExpiration
    };
  });

  return {
    statusCode: 200,
    body: {
      expiringItems: itemsWithDays,
      count: itemsWithDays.length
    }
  };
}

async function removeExpiredItems(): Promise<LambdaResult> {
  const expiredItems = await repository.getExpiredItems();
  const wasteEvents: WasteEvent[] = [];

  for (const item of expiredItems) {
    // Log waste event
    const wasteEvent: WasteEvent = {
      wasteId: uuidv4(),
      itemId: item.itemId,
      itemName: item.name,
      quantity: item.quantity,
      unit: item.unit,
      expirationDate: item.expirationDate,
      wastedDate: new Date().toISOString(),
      reason: 'expired',
      cost: item.cost
    };

    await repository.logWaste(wasteEvent);
    wasteEvents.push(wasteEvent);

    // Remove from inventory
    await repository.delete(item.itemId, item.expirationDate);
  }

  return {
    statusCode: 200,
    body: {
      message: 'Expired items removed',
      removed: expiredItems.length,
      wasteEvents
    }
  };
}

function handleError(error: any): LambdaResult {
  if (error instanceof ValidationError) {
    return {
      statusCode: 400,
      body: { error: error.message }
    };
  }

  return {
    statusCode: 500,
    body: { error: 'Internal server error' }
  };
}

// Helper functions
function estimateExpirationDate(itemName: string): string {
  // Simplified logic - in production, use a proper database or ML model
  const name = itemName.toLowerCase();
  const today = new Date();
  let daysToAdd = 7; // default

  if (name.includes('milk') || name.includes('cream')) {
    daysToAdd = 7;
  } else if (name.includes('meat') || name.includes('chicken') || name.includes('fish')) {
    daysToAdd = 3;
  } else if (name.includes('vegetable') || name.includes('fruit')) {
    daysToAdd = 5;
  } else if (name.includes('egg')) {
    daysToAdd = 21;
  } else if (name.includes('cheese')) {
    daysToAdd = 14;
  }

  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + daysToAdd);
  
  return expirationDate.toISOString().split('T')[0];
}

function categorizeItem(itemName: string): any {
  // Simplified categorization
  const name = itemName.toLowerCase();
  
  if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt')) {
    return 'dairy';
  } else if (name.includes('meat') || name.includes('chicken') || name.includes('fish')) {
    return 'meat';
  } else if (name.includes('vegetable') || name.includes('fruit')) {
    return 'produce';
  } else if (name.includes('bread') || name.includes('rice') || name.includes('pasta')) {
    return 'grains';
  }
  
  return 'other';
}
