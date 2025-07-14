
export const validateCSVFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: "File size must be less than 10MB" };
  }
  
  // Check file type
  if (file.type !== "text/csv" && file.type !== "application/csv") {
    return { isValid: false, error: "File must be a CSV file" };
  }
  
  // Check file extension
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.csv')) {
    return { isValid: false, error: "File must have a .csv extension" };
  }
  
  // Check for suspicious file names
  const suspiciousPatterns = /[<>:"/\\|?*]/;
  if (suspiciousPatterns.test(file.name)) {
    return { isValid: false, error: "File name contains invalid characters" };
  }
  
  return { isValid: true };
};

export const validateCSVContent = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
  try {
    const text = await file.text();
    
    // Check for minimum content
    if (text.length < 10) {
      return { isValid: false, error: "File appears to be empty or too small" };
    }
    
    // Check for basic CSV structure
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return { isValid: false, error: "CSV file must have at least a header and one data row" };
    }
    
    // Check header row
    const headers = lines[0].split(',');
    if (headers.length < 1) {
      return { isValid: false, error: "CSV file must have at least one column" };
    }
    
    // Check for excessively large files (content-wise)
    if (lines.length > 50000) {
      return { isValid: false, error: "CSV file has too many rows (max 50,000)" };
    }
    
    if (headers.length > 100) {
      return { isValid: false, error: "CSV file has too many columns (max 100)" };
    }
    
    // Basic malware pattern detection
    const malwarePatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /eval\s*\(/i,
      /document\.write/i
    ];
    
    for (const pattern of malwarePatterns) {
      if (pattern.test(text)) {
        return { isValid: false, error: "File contains potentially malicious content" };
      }
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: "Failed to validate file content" };
  }
};
