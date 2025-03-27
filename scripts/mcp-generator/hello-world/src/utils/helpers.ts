/**
 * Helper functions for the MCP server
 */

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse(json: string) {
  try {
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
