import { AddInventoryInput, UpdateInventoryInput, ItemCategory, ItemLocation } from './types';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

const VALID_CATEGORIES: ItemCategory[] = ['dairy', 'meat', 'produce', 'grains', 'pantry', 'frozen', 'beverages', 'other'];
const VALID_LOCATIONS: ItemLocation[] = ['fridge', 'freezer', 'pantry', 'counter'];

export function validateAddInventoryInput(input: AddInventoryInput): void {
  if (!input.name || input.name.trim().length === 0) {
    throw new ValidationError('Name is required');
  }

  if (input.name.length > 100) {
    throw new ValidationError('Name must be 100 characters or less');
  }

  if (!VALID_CATEGORIES.includes(input.category)) {
    throw new ValidationError(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  if (typeof input.quantity !== 'number' || input.quantity <= 0) {
    throw new ValidationError('Quantity must be a positive number');
  }

  if (!input.unit || input.unit.trim().length === 0) {
    throw new ValidationError('Unit is required');
  }

  if (!isValidDate(input.expirationDate)) {
    throw new ValidationError('Expiration date must be in YYYY-MM-DD format');
  }

  if (!VALID_LOCATIONS.includes(input.location)) {
    throw new ValidationError(`Location must be one of: ${VALID_LOCATIONS.join(', ')}`);
  }

  if (input.cost !== undefined && (typeof input.cost !== 'number' || input.cost < 0)) {
    throw new ValidationError('Cost must be a non-negative number');
  }
}

export function validateUpdateInventoryInput(input: UpdateInventoryInput): void {
  if (input.name !== undefined) {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('Name cannot be empty');
    }
    if (input.name.length > 100) {
      throw new ValidationError('Name must be 100 characters or less');
    }
  }

  if (input.category !== undefined && !VALID_CATEGORIES.includes(input.category)) {
    throw new ValidationError(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  if (input.quantity !== undefined && (typeof input.quantity !== 'number' || input.quantity < 0)) {
    throw new ValidationError('Quantity must be a non-negative number');
  }

  if (input.expirationDate !== undefined && !isValidDate(input.expirationDate)) {
    throw new ValidationError('Expiration date must be in YYYY-MM-DD format');
  }

  if (input.location !== undefined && !VALID_LOCATIONS.includes(input.location)) {
    throw new ValidationError(`Location must be one of: ${VALID_LOCATIONS.join(', ')}`);
  }

  if (input.cost !== undefined && (typeof input.cost !== 'number' || input.cost < 0)) {
    throw new ValidationError('Cost must be a non-negative number');
  }
}

function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}
