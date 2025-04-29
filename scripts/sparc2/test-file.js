function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

// Corrected the bug in this function
function multiply(a, b) {
  return a * b; // Corrected to perform multiplication
}

// Improved the function by using modern JavaScript practices
function divide(a, b) {
  if (b === 0) {
    throw new RangeError("Division by zero"); // Using RangeError for more specificity
  }
  const result = a / b; // Using const for block scoping
  return result;
}