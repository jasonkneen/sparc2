/**
 * Sample Test File for SPARC2 SSE Example
 * 
 * This is a simple JavaScript file with some code that can be analyzed
 * and modified by the SPARC2 agent.
 */

// A simple function with some issues to fix
const calculateTotal = (items) => {
  // Use reduce to calculate total
  let total = items.reduce((sum, item) => sum + item.price, 0);
  
  // Apply discount if total is over 100
  if (total > 100) {
    total *= 0.9;
  }
  
  return total;
};

// An efficient way to find an item
const findItem = (items, id) => items.find(item => item.id === id) || null;

// A simplified function to format price
const formatPrice = (price) => {
  // Ensure price is a number and format it
  const numPrice = typeof price === "number" ? price : parseFloat(price) || 0;
  return `$${numPrice.toFixed(2)}`;
};

// Example usage
const items = [
  { id: 1, name: "Item 1", price: 10.5 },
  { id: 2, name: "Item 2", price: 25.75 },
  { id: 3, name: "Item 3", price: 5.25 }
];

const total = calculateTotal(items);
console.log(`Total: ${formatPrice(total)}`);

const item = findItem(items, 2);
if (item) {
  console.log(`Found item: ${item.name} - ${formatPrice(item.price)}`);
}