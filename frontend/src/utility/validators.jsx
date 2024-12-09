// Utility function to sanitize input and check for illegal characters
const sanitizeInput = (value) => {
    const sanitizedValue = value.trim();
    // Check for illegal characters (e.g., control characters and < >)
    const illegalChars = /[\x00-\x1F\x7F<>]/g; // This regex matches control characters and <, >
    if (illegalChars.test(sanitizedValue)) {
      return 'Input contains illegal characters (<, >, control characters).'; // Return a descriptive error message
    }
    return sanitizedValue; // Otherwise, return the sanitized value
  };
  
  // Custom Validators with Error Messages
  const isNumber = (value) => {
    const sanitizedValue = sanitizeInput(value);
    if (sanitizedValue !== sanitizedValue.trim()) {
      return 'Input contains leading or trailing spaces.';
    }
    if (sanitizedValue === false) return 'Input contains illegal characters.';
    return !isNaN(sanitizedValue) && sanitizedValue !== '' ? null : 'Please enter a valid number.';
  };
  
  const isEmail = (value) => {
    const sanitizedValue = sanitizeInput(value);
    if (sanitizedValue === false) return 'Input contains illegal characters.';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zAZ]{2,}$/;
    return emailRegex.test(sanitizedValue) ? null : 'Please enter a valid email address.';
  };
  
  const isPhoneNumber = (value) => {
    const sanitizedValue = sanitizeInput(value);
    if (sanitizedValue === false) return 'Input contains illegal characters.';
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;  // E.164 phone number format
    return phoneRegex.test(sanitizedValue) ? null : 'Please enter a valid phone number.';
  };
  
  const isText = (value) => {
    const sanitizedValue = sanitizeInput(value);
    if (sanitizedValue === false) return 'Input contains illegal characters.';
    return sanitizedValue.length > 0 ? null : 'This field can not be empty.';
  };
  
  const isGoodPassword = (value) => {
    const sanitizedValue = sanitizeInput(value);
    if (sanitizedValue === false) return 'Input contains illegal characters.';
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(sanitizedValue) ? null : 'Password must be at least 8 characters long and contain both letters and numbers.';
  };
  
  const isMatch = (value, matchValue) => {
    const sanitizedValue = sanitizeInput(value);
    const sanitizedMatchValue = sanitizeInput(matchValue);
    if (sanitizedValue === false || sanitizedMatchValue === false) return 'Input contains illegal characters.';
    return sanitizedValue === sanitizedMatchValue ? null : 'Passwords do not match.';
  };
  
  const isDate = (value) => {
    const sanitizedValue = sanitizeInput(value);
    if (sanitizedValue === false) return 'Input contains illegal characters.';
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;  // YYYY-MM-DD format
    return dateRegex.test(sanitizedValue) ? null : 'Please enter a valid date (YYYY-MM-DD).';
  };

export {
    sanitizeInput,
    isNumber,
    isEmail,
    isPhoneNumber,
    isText,
    isGoodPassword,
    isMatch,
    isDate,
  };