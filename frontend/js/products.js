// js/products.js

// Load products from localStorage or initialize empty
let PRODUCTS = JSON.parse(localStorage.getItem('vf_products')) || [];

// Save to localStorage
function saveProducts() {
  localStorage.setItem('vf_products', JSON.stringify(PRODUCTS));
}

// Add new product
function addProduct(product) {
  product.id = 'prd' + Date.now();
  PRODUCTS.push(product);
  saveProducts();
}

// Delete product by ID
function deleteProduct(id) {
  PRODUCTS = PRODUCTS.filter(p => p.id !== id);
  saveProducts();
}

// Update existing product
function updateProduct(id, data) {
  const index = PRODUCTS.findIndex(p => p.id === id);
  if (index !== -1) {
    PRODUCTS[index] = { ...PRODUCTS[index], ...data };
    saveProducts();
  }
}
// let PRODUCTS = JSON.parse(localStorage.getItem('vf_products')) || [];

// function saveProducts() {
//   localStorage.setItem('vf_products', JSON.stringify(PRODUCTS));
// }

// function addProduct(product) {
//   product.id = 'prd' + Date.now();
//   PRODUCTS.push(product);
//   saveProducts();
// }

// function deleteProduct(id) {
//   PRODUCTS = PRODUCTS.filter(p => p.id !== id);
//   saveProducts();
// }

// function updateProduct(id, data) {
//   const index = PRODUCTS.findIndex(p => p.id === id);
//   if (index !== -1) {
//     PRODUCTS[index] = { ...PRODUCTS[index], ...data };
//     saveProducts();
//   }
// }
