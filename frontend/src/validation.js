// Clinical data validation

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));

export const validatePHQ = (score) => score >= 0 && score <= 27;

export const validateGAD = (score) => score >= 0 && score <= 21;

export const validateAge = (age) => age >= 5 && age <= 120;

export const sanitizeText = (text) => {
  if (!text) return '';
  return text
    .replace(/[<>]/g, '')           // prevent XSS
    .replace(/\x00/g, '')           // remove null bytes
    .trim()
    .slice(0, 10000);               // max length
};

export const validatePassword = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
};

export const validateRequired = (fields) => {
  const missing = Object.entries(fields).filter(([k, v]) => !v || (typeof v === 'string' && !v.trim()));
  return missing.length > 0 ? `${missing[0][0]} is required` : null;
};
