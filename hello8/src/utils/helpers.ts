/**
 * Helper utilities for the MCP server
 */

/**
 * Formats a date as an ISO string
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Generates a random ID
 */
export function generateId(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
