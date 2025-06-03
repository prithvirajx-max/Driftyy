/**
 * Validation utilities for input fields
 */

/**
 * Validates a phone number according to international formatting standards
 * Supports multiple formats including:
 * - 10-digit numbers (e.g., 1234567890)
 * - Numbers with country codes (e.g., +11234567890)
 * - Formatted numbers with spaces or dashes (e.g., +1 123-456-7890)
 * 
 * @param phoneNumber The phone number string to validate
 * @returns An object with validation result and formatted phone number
 */
export const validatePhoneNumber = (phoneNumber: string): { 
  isValid: boolean;
  formattedNumber: string;
  errorMessage?: string;
} => {
  // First, strip all non-digit characters except the leading +
  const stripped = phoneNumber.replace(/[^\d+]/g, '');
  
  // Basic validation for empty string
  if (!stripped) {
    return {
      isValid: false,
      formattedNumber: '',
      errorMessage: 'Phone number is required'
    };
  }
  
  // Check if it's a valid format
  // Valid formats: 
  // 1. 10 digits (standard US/Canada number without country code)
  // 2. 11-15 digits with optional + prefix (international)
  const hasCountryCode = stripped.startsWith('+');
  const digits = hasCountryCode ? stripped.substring(1) : stripped;
  
  // Check digit count
  if (!hasCountryCode && digits.length !== 10) {
    return {
      isValid: false,
      formattedNumber: stripped,
      errorMessage: 'Please enter a valid 10-digit phone number'
    };
  }
  
  if (hasCountryCode && (digits.length < 10 || digits.length > 14)) {
    return {
      isValid: false,
      formattedNumber: stripped,
      errorMessage: 'Please enter a valid international phone number'
    };
  }
  
  // All validation passed
  return {
    isValid: true,
    formattedNumber: stripped
  };
};

/**
 * Formats a phone number for display
 * @param phoneNumber Raw phone number string
 * @returns Formatted phone number for display
 */
export const formatPhoneForDisplay = (phoneNumber: string): string => {
  // Remove all non-digits except leading +
  const stripped = phoneNumber.replace(/[^\d+]/g, '');
  
  // If it's empty, return empty string
  if (!stripped) return '';
  
  // Check if it has a country code
  const hasCountryCode = stripped.startsWith('+');
  
  // For 10-digit US/Canada numbers without country code
  if (!hasCountryCode && stripped.length === 10) {
    return `(${stripped.substring(0, 3)}) ${stripped.substring(3, 6)}-${stripped.substring(6)}`;
  }
  
  // For international numbers, try to format appropriately
  if (hasCountryCode) {
    const countryCode = '+' + stripped.substring(1, stripped.length >= 3 ? 2 : stripped.length);
    const remaining = stripped.substring(countryCode.length);
    
    // Simple international format
    if (remaining.length > 0) {
      return `${countryCode} ${remaining.substring(0, 3)} ${remaining.substring(3)}`;
    }
    
    return countryCode;
  }
  
  // If not a standard format, return as is
  return stripped;
};
