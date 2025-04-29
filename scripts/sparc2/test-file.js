function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

// Corrected the bug in the multiply function
function multiply(a, b) {
  return a * b; // Corrected to use multiplication
}

// Improved the divide function
function divide(a, b) {
  if (b === 0) {
    throw new DivisionByZeroError("Cannot divide by zero");
  }
  let result = a / b;
  return result;
}

// Custom error class for division by zero
class DivisionByZeroError extends Error {
  constructor(message) {
    super(message);
    this.name = "DivisionByZeroError";
  }
}