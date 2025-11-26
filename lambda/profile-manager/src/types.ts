// Profile Types

export type ProfileType = 'family_member' | 'guest';
export type Role = 'adult' | 'child';
export type CookingExpertiseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface FamilyMemberProfile {
  profileId: string;
  type: 'family_member';
  name: string;
  age: number;
  role: Role;
  dietaryRestrictions: string[];
  allergies: string[];
  dislikes: string[];
  preferences: string[];
  cookingExpertiseLevel: CookingExpertiseLevel;
  calendarId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuestProfile {
  profileId: string;
  type: 'guest';
  name: string;
  dietaryRestrictions: string[];
  allergies: string[];
  dislikes: string[];
  preferences: string[];
  visitDates: string[];
  createdAt: string;
  updatedAt: string;
}

export type Profile = FamilyMemberProfile | GuestProfile;

export interface CreateFamilyMemberInput {
  name: string;
  age: number;
  role: Role;
  dietaryRestrictions?: string[];
  allergies?: string[];
  dislikes?: string[];
  preferences?: string[];
  cookingExpertiseLevel?: CookingExpertiseLevel;
  calendarId?: string;
}

export interface CreateGuestInput {
  name: string;
  dietaryRestrictions?: string[];
  allergies?: string[];
  dislikes?: string[];
  preferences?: string[];
  visitDates?: string[];
}

export interface UpdateProfileInput {
  name?: string;
  age?: number;
  role?: Role;
  dietaryRestrictions?: string[];
  allergies?: string[];
  dislikes?: string[];
  preferences?: string[];
  cookingExpertiseLevel?: CookingExpertiseLevel;
  calendarId?: string;
  visitDates?: string[];
}
