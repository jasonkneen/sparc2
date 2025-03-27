/**
 * Sample test file for SPARC2 code analysis
 * This file contains some intentional issues for demonstration
 */

// Global variable - could be better scoped
let counter = 0;

/**
 * Adds two numbers together
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Sum of a and b
 */
function add(a, b) {
  return a + b;
}

/**
 * Multiplies two numbers - has a bug
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Product of a and b
 */
function multiply(a, b) {
  // Bug: using addition instead of multiplication
  return a + b;
}

/**
 * Inefficient function with nested loops
 * @param {Array} arr - Input array
 * @returns {Array} Processed array
 */
function processArray(arr) {
  const result = [];
  
  // Inefficient nested loops
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (i !== j && arr[i] === arr[j]) {
        result.push(arr[i]);
      }
    }
  }
  
  return result;
}

/**
 * Function with memory leak potential
 */
function createElements() {
  // Potential memory leak - event listeners not removed
  for (let i = 0; i < 10; i++) {
    const element = document.createElement('div');
    element.innerHTML = `Element ${i}`;
    element.addEventListener('click', function() {
      console.log(`Clicked element ${i}`);
    });
    document.body.appendChild(element);
  }
}

// Unused function
function unusedFunction() {
  return "This function is never called";
}

// Main execution
console.log("Starting application...");
counter++;
console.log(`Counter: ${counter}`);

const sum = add(5, 3);
console.log(`Sum: ${sum}`);

const product = multiply(5, 3);
console.log(`Product: ${product}`); // Will show incorrect result

const numbers = [1, 2, 3, 2, 4, 1, 5];
const duplicates = processArray(numbers);
console.log(`Duplicates: ${duplicates}`);

// Uncomment to test memory leak
// createElements();

console.log("Application finished.");