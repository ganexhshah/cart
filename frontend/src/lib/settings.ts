// Settings utilities and constants

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'ru', label: 'Русский' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'zh', label: '中文' },
];

export const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (UTC-5)', region: 'North America' },
  { value: 'America/Chicago', label: 'Central Time (UTC-6)', region: 'North America' },
  { value: 'America/Denver', label: 'Mountain Time (UTC-7)', region: 'North America' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (UTC-8)', region: 'North America' },
  { value: 'America/Toronto', label: 'Toronto (UTC-5)', region: 'North America' },
  { value: 'America/Vancouver', label: 'Vancouver (UTC-8)', region: 'North America' },
  { value: 'Europe/London', label: 'London (UTC+0)', region: 'Europe' },
  { value: 'Europe/Paris', label: 'Paris (UTC+1)', region: 'Europe' },
  { value: 'Europe/Berlin', label: 'Berlin (UTC+1)', region: 'Europe' },
  { value: 'Europe/Rome', label: 'Rome (UTC+1)', region: 'Europe' },
  { value: 'Europe/Madrid', label: 'Madrid (UTC+1)', region: 'Europe' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (UTC+1)', region: 'Europe' },
  { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)', region: 'Asia' },
  { value: 'Asia/Shanghai', label: 'Shanghai (UTC+8)', region: 'Asia' },
  { value: 'Asia/Kolkata', label: 'India (UTC+5:30)', region: 'Asia' },
  { value: 'Asia/Dubai', label: 'Dubai (UTC+4)', region: 'Asia' },
  { value: 'Asia/Singapore', label: 'Singapore (UTC+8)', region: 'Asia' },
  { value: 'Australia/Sydney', label: 'Sydney (UTC+11)', region: 'Australia' },
  { value: 'Australia/Melbourne', label: 'Melbourne (UTC+11)', region: 'Australia' },
  { value: 'Pacific/Auckland', label: 'Auckland (UTC+13)', region: 'Pacific' },
];

export const DATE_FORMAT_OPTIONS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)', example: '01/26/2026' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)', example: '26/01/2026' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)', example: '2026-01-26' },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (DE)', example: '26.01.2026' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY', example: '26-01-2026' },
];

export const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR (₹) - Indian Rupee', symbol: '₹' },
  { value: 'USD', label: 'USD ($) - US Dollar', symbol: '$' },
  { value: 'EUR', label: 'EUR (€) - Euro', symbol: '€' },
  { value: 'GBP', label: 'GBP (£) - British Pound', symbol: '£' },
  { value: 'CAD', label: 'CAD (C$) - Canadian Dollar', symbol: 'C$' },
  { value: 'AUD', label: 'AUD (A$) - Australian Dollar', symbol: 'A$' },
  { value: 'JPY', label: 'JPY (¥) - Japanese Yen', symbol: '¥' },
  { value: 'CNY', label: 'CNY (¥) - Chinese Yuan', symbol: '¥' },
  { value: 'CHF', label: 'CHF (Fr) - Swiss Franc', symbol: 'Fr' },
  { value: 'SEK', label: 'SEK (kr) - Swedish Krona', symbol: 'kr' },
];

export function formatCurrency(amount: number, currency: string): string {
  const option = CURRENCY_OPTIONS.find(c => c.value === currency);
  const symbol = option?.symbol || currency;
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch {
    return `${symbol}${amount.toFixed(2)}`;
  }
}

export function formatDate(date: Date, format: string): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  
  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD.MM.YYYY':
      return `${day}.${month}.${year}`;
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    default:
      return date.toLocaleDateString();
  }
}

export function getTimezoneOffset(timezone: string): string {
  try {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
    const offset = (targetTime.getTime() - utc.getTime()) / (1000 * 60 * 60);
    
    const sign = offset >= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(offset));
    const minutes = Math.round((Math.abs(offset) - hours) * 60);
    
    return `UTC${sign}${hours}${minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : ''}`;
  } catch {
    return 'UTC+0';
  }
}

export function validateSettings(settings: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!settings.language || typeof settings.language !== 'string') {
    errors.push('Language is required');
  }
  
  if (!settings.timezone || typeof settings.timezone !== 'string') {
    errors.push('Timezone is required');
  }
  
  if (!settings.dateFormat || typeof settings.dateFormat !== 'string') {
    errors.push('Date format is required');
  }
  
  if (!settings.currency || typeof settings.currency !== 'string') {
    errors.push('Currency is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}