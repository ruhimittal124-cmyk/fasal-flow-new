import { User } from '../types';
import { MOCK_USERS } from '../data/mockData';

const PROFILES_STORAGE_KEY = 'fasalflow_user_profiles';

/**
 * Normalizes phone number to standard 10-digit Indian format
 */
export function normalizePhoneNumber(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

/**
 * Formats a 10-digit string into standard display format: +91 98XXX XXXXX
 */
export function formatIndianPhoneNumber(digits10: string): string {
  const clean = normalizePhoneNumber(digits10);
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return `+91 ${clean}`;
}

/**
 * Validates Indian 10-digit mobile number format
 * Valid numbers are 10 digits and start with 6, 7, 8, or 9
 */
export function validateIndianPhoneNumber(phone: string): { isValid: boolean; error?: string } {
  const clean = normalizePhoneNumber(phone);
  if (!clean) {
    return { isValid: false, error: 'Phone number is required' };
  }
  if (clean.length < 10) {
    return { isValid: false, error: `Enter complete 10-digit number (${clean.length}/10 digits)` };
  }
  if (clean.length > 10) {
    return { isValid: false, error: 'Phone number cannot exceed 10 digits' };
  }
  if (!/^[6-9]\d{9}$/.test(clean)) {
    return { isValid: false, error: 'Enter a valid Indian mobile number (must start with 6, 7, 8, or 9)' };
  }
  return { isValid: true };
}

/**
 * Initializes and retrieves all stored profiles from localStorage
 */
export function getAllUserProfiles(): Record<string, User> {
  try {
    const saved = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to read user profiles from localStorage:', err);
  }

  // Pre-seed with mock users indexed by their 10-digit phone
  const initialProfiles: Record<string, User> = {};
  MOCK_USERS.forEach((user) => {
    const phone10 = normalizePhoneNumber(user.phone);
    if (phone10) {
      initialProfiles[phone10] = {
        ...user,
        phone: formatIndianPhoneNumber(phone10),
      };
    }
  });

  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(initialProfiles));
  } catch (err) {
    console.error('Failed to seed initial user profiles:', err);
  }

  return initialProfiles;
}

/**
 * Finds an existing profile by 10-digit phone number
 */
export function getUserProfileByPhone(rawPhone: string): User | null {
  const cleanPhone = normalizePhoneNumber(rawPhone);
  if (!cleanPhone || cleanPhone.length !== 10) return null;

  const profiles = getAllUserProfiles();
  return profiles[cleanPhone] || null;
}

/**
 * Saves or updates a user profile associated with their phone number
 */
export function saveUserProfile(user: User): User {
  const cleanPhone = normalizePhoneNumber(user.phone);
  const profiles = getAllUserProfiles();
  
  const updatedUser: User = {
    ...user,
    phone: formatIndianPhoneNumber(cleanPhone),
  };

  profiles[cleanPhone] = updatedUser;

  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error('Failed to save user profile to localStorage:', err);
  }

  return updatedUser;
}
