
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email.trim()) {
    return { isValid: false, error: "Email is required" };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: "Email address is too long" };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters long" };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: "Password is too long" };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    return { 
      isValid: false, 
      error: "Password must contain uppercase, lowercase, number, and special character" 
    };
  }
  
  return { isValid: true };
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .trim()
    .substring(0, 1000); // Limit length
};

export const validateBundleName = (name: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(name);
  
  if (!sanitized) {
    return { isValid: false, error: "Bundle name is required" };
  }
  
  if (sanitized.length < 1 || sanitized.length > 100) {
    return { isValid: false, error: "Bundle name must be between 1 and 100 characters" };
  }
  
  // Check for potentially dangerous patterns
  const dangerousPatterns = /[<>'"\\]/;
  if (dangerousPatterns.test(sanitized)) {
    return { isValid: false, error: "Bundle name contains invalid characters" };
  }
  
  return { isValid: true };
};

export const validateChatMessage = (message: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(message);
  
  if (!sanitized) {
    return { isValid: false, error: "Message cannot be empty" };
  }
  
  if (sanitized.length > 2000) {
    return { isValid: false, error: "Message is too long (max 2000 characters)" };
  }
  
  return { isValid: true };
};
