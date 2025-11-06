
// Utility function to fix UTF-8 encoding issues
// This handles cases where filenames were stored with incorrect encoding
export function fixUnicodeEncoding(str) {
    if (!str) return str
    try {
      // Check if the string appears to have encoding issues (contains ? or other replacement chars)
      // If it looks like latin1 that should be utf8, convert it
      if (str.includes('�') || /[\x80-\xFF]/.test(str)) {
        // Try to convert from latin1 to utf8
        return Buffer.from(str, 'latin1').toString('utf8')
      }
      return str
    } catch (error) {
      // If any error occurs, return the original string
      return str
    }
  }