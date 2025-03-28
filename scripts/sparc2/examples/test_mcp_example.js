// Simple test file for MCP server with basic tests and input validation

function add(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  return a + b;
}

function subtract(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  return a - b;
}

function multiply(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  return a * b;
}

console.log("Test file loaded");

// Test cases
try {
  console.log("Add 2 + 3:", add(2, 3)); // Expected output: 5
  console.log("Subtract 5 - 2:", subtract(5, 2)); // Expected output: 3
  console.log("Multiply 4 * 3:", multiply(4, 3)); // Expected output: 12

  // Test with invalid inputs
  console.log("Add '2' + 3:", add('2', 3)); // Expected to throw an error
} catch (error) {
  console.error("Error:", error.message);
}

try {
  console.log("Subtract 5 - '2':", subtract(5, '2')); // Expected to throw an error
} catch (error) {
  console.error("Error:", error.message);
}

try {
  console.log("Multiply 4 * '3':", multiply(4, '3')); // Expected to throw an error
} catch (error) {
  console.error("Error:", error.message);
}