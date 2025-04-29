function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

// Fixed the bug in this function
function multiply(a, b) {
  return a * b; // Corrected to use multiplication
}

// Improved the code quality and error message
function divide(a, b) {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }
  let result = a / b; // Changed var to let
  return result;
}