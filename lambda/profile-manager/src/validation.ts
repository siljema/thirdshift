import { CreateFamilyMemberInput, CreateGuestInput, UpdateProfileInput, CookingExpertiseLevel, Role } from './types';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

const VALID_COOKING_LEVELS: CookingExpertiseLevel[] = ['beginner', 'intermediate', 'advanced'];
const VALID_ROLES: Role[] = ['adult', 'child'];

export function validateFamilyMemberInput(input: CreateFamilyMemberInput): void {
  if (!input.name || input.name.trim().length === 0) {
    throw new ValidationError('Name is required');
  }

  if (input.name.length > 100) {
    throw new ValidationError('Name must be 100 characters or less');
  }

  if (typeof input.age !== 'number' || input.age < 0 || input.age > 150) {
    throw new ValidationError('Age must be a number between 0 and 150');
  }

  if (!VALID_ROLES.includes(input.role)) {
    throw new ValidationError(`Role must be one of: ${VALID_ROLES.join(', ')}`);
  }

  if (input.cookingExpertiseLevel && !VALID_COOKING_LEVELS.includes(input.cookingExpertiseLevel)) {
    throw new ValidationError(`Cooking expertise level must be one of: ${VALID_COOKING_LEVELS.join(', ')}`);
  }

  validateArrayField(input.dietaryRestrictions, 'dietaryRestrictions');
  validateArrayField(input.allergies, 'allergies');
  validateArrayField(input.dislikes, 'dislikes');
  validateArrayField(input.preferences, 'preferences');
}

export function validateGuestInput(input: CreateGuestInput): void {
  if (!input.name || input.name.trim().length === 0) {
    throw new ValidationError('Name is required');
  }

  if (input.name.length > 100) {
    throw new ValidationError('Name must be 100 characters or less');
  }

  validateArrayField(input.dietaryRestrictions, 'dietaryRestrictions');
  validateArrayField(input.allergies, 'allergies');
  validateArrayField(input.dislikes, 'dislikes');
  validateArrayField(input.preferences, 'preferences');

  if (input.visitDates) {
    if (!Array.isArray(input.visitDates)) {
      throw new ValidationError('visitDates must be an array');
    }
    input.visitDates.forEach(date => {
      if (!isValidDate(date)) {
        throw new ValidationError(`Invalid date format: ${date}. Use YYYY-MM-DD`);
      }
    });
  }
}

export function validateUpdateInput(input: UpdateProfileInput): void {
  if (input.name !== undefined) {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('Name cannot be empty');
    }
    if (input.name.length > 100) {
      throw new ValidationError('Name must be 100 characters or less');
    }
  }

  if (input.age !== undefined) {
    if (typeof input.age !== 'number' || input.age < 0 || input.age > 150) {
      throw new ValidationError('Age must be a number between 0 and 150');
    }
  }

  if (input.role !== undefined && !VALID_ROLES.includes(input.role)) {
    throw new ValidationError(`Role must be one of: ${VALID_ROLES.join(', ')}`);
  }

  if (input.cookingExpertiseLevel !== undefined && !VALID_COOKING_LEVELS.includes(input.cookingExpertiseLevel)) {
    throw new ValidationError(`Cooking expertise level must be one of: ${VALID_COOKING_LEVELS.join(', ')}`);
  }

  validateArrayField(input.dietaryRestrictions, 'dietaryRestrictions');
  validateArrayField(input.allergies, 'allergies');
  validateArrayField(input.dislikes, 'dislikes');
  validateArrayField(input.preferences, 'preferences');

  if (input.visitDates) {
    if (!Array.isArray(input.visitDates)) {
      throw new ValidationError('visitDates must be an array');
    }
    input.visitDates.forEach(date => {
      if (!isValidDate(date)) {
        throw new ValidationError(`Invalid date format: ${date}. Use YYYY-MM-DD`);
      }
    });
  }
}

function validateArrayField(field: any, fieldName: string): void {
  if (field !== undefined) {
    if (!Array.isArray(field)) {
      throw new ValidationError(`${fieldName} must be an array`);
    }
    if (field.some(item => typeof item !== 'string')) {
      throw new ValidationError(`${fieldName} must contain only strings`);
    }
  }
}

function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}
