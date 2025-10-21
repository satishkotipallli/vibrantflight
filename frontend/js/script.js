import API from "../api";

const CONFIG= {
  CART_KEY: 'vf_cart_v3',
  WISHLIST_KEY: 'vf_wishlist_v1',
  CART_COUNT_KEY: 'vf_cart_count',
  AUTO_SLIDE_MS: 4000,
  CURRENCY: '₹',
  LOCALE: 'en-IN'
};

// ✅ js/products.js
// Handles product storage for admin + homepage

// Try loading products from localStorage
let PRODUCTS = JSON.parse(localStorage.getItem('vf_products'));

// If storage is empty or broken, load your original 8 default products
if (!PRODUCTS || PRODUCTS.length === 0) {
  PRODUCTS = [
    { id: 'prd1', name: 'Aurora Silk Saree', price: 8999, old: 10999, category: 'womens', img: './images/f4.jpg', desc: 'Handwoven pure silk saree with golden zari border.', stock: 12 },
    { id: 'prd2', name: 'Zephyr Denim Jacket', price: 4999, old: 6999, category: 'mens', img: './images/f6.jpg', desc: 'Classic blue denim jacket with a modern slim fit.', stock: 8 },
    { id: 'prd3', name: 'Nimbus Cotton Kurta', price: 1999, old: 2599, category: 'mens', img: './images/f1.jpg', desc: 'Soft cotton kurta perfect for festive and casual wear.', stock: 24 },
    { id: 'prd4', name: 'Atlas Linen Shirt', price: 2499, old: 2999, category: 'mens', img: './images/f2.jpg', desc: 'Breathable linen shirt ideal for summer comfort.', stock: 11 },
    { id: 'prd5', name: 'Halo Leather Jacket', price: 8999, old: 9999, category: 'mens', img: './images/f3.jpg', desc: 'Premium brown leather jacket with soft inner lining.', stock: 5 },
    { id: 'prd6', name: 'Lumen Floral Dress', price: 3499, old: 4499, category: 'womens', img: './images/f5.jpg', desc: 'Elegant floral print midi dress with flared hem.', stock: 20 },
    { id: 'prd7', name: 'Voyage Hoodie', price: 2999, old: 3799, category: 'unisex', img: './images/f8.jpg', desc: 'Comfy cotton hoodie with front pocket and relaxed fit.', stock: 30 },
    { id: 'prd8', name: 'Aero Sports Shoes', price: 5999, old: 7499, category: 'footwear', img: './images/f7.jpg', desc: 'Lightweight running shoes designed for all-day comfort.', stock: 15 }
  ];

  // Save them to localStorage so admin & homepage both use them
  localStorage.setItem('vf_products', JSON.stringify(PRODUCTS));
}

// ✅ Functions for Admin Panel
function saveProducts() {
  localStorage.setItem('vf_products', JSON.stringify(PRODUCTS));
}

function addProduct(product) {
  product.id = 'prd' + Date.now();
  PRODUCTS.push(product);
  saveProducts();
}

function deleteProduct(id) {
  PRODUCTS = PRODUCTS.filter(p => p.id !== id);
  saveProducts();
}

function updateProduct(id, data) {
  const index = PRODUCTS.findIndex(p => p.id === id);
  if (index !== -1) {
    PRODUCTS[index] = { ...PRODUCTS[index], ...data };
    saveProducts();
  }
}


/* =========================
   SMALL HELPERS
   ========================= */
function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function formatPrice(n) {
  if (typeof n !== 'number') n = Number(n) || 0;
  return CONFIG.CURRENCY + n.toLocaleString(CONFIG.LOCALE);
}

/* safe event binder */
function on(selector, event, handler, root = document) {
  const el = $(selector, root);
  if (!el) return;
  el.addEventListener(event, handler);
}

/* debounce utility */
function debounce(fn, wait = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/* simple unique id */
function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 9);
}

/* toast notification */
function toast(msg, opts = {}) {
  const { duration = 2200 } = opts;
  const containerId = 'vf_toast_container';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.cssText = 'position:fixed;z-index:99999;left:50%;bottom:28px;transform:translateX(-50%);display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'background:rgba(0,0,0,0.8);color:white;padding:10px 14px;border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,0.5);pointer-events:auto;font-weight:500;';
  container.appendChild(t);
  requestAnimationFrame(() => t.style.opacity = '1');
  setTimeout(() => {
    t.style.transition = 'opacity .25s ease, transform .25s ease';
    t.style.opacity = '0';
    t.style.transform = 'translateY(8px)';
    setTimeout(() => t.remove(), 300);
  }, duration);
}


   

/* focus trap for modals */
function trapFocus(modalEl) {
  if (!modalEl) return;
  const focusableSelectors = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
  let focusable = Array.from(modalEl.querySelectorAll(focusableSelectors)).filter(el => el.offsetParent !== null);
  if (!focusable.length) return function cleanup() {};
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function keyHandler(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
  modalEl.addEventListener('keydown', keyHandler);
  return function cleanup() { modalEl.removeEventListener('keydown', keyHandler); };
}

/* safe open/close modal helper that returns cleanup function */
function openModal(modalEl) {
  if (!modalEl) return null;
  modalEl.classList.remove('hidden');
  modalEl.setAttribute('aria-hidden', 'false');
  document.body.classList.add('overflow-hidden');
  const cleanup = trapFocus(modalEl);
  // focus first focusable element
  setTimeout(() => {
    const first = modalEl.querySelector('input,button,select,textarea,a[href],[tabindex]:not([tabindex="-1"])');
    if (first) first.focus();
  }, 60);
  return cleanup;
}
function closeModal(modalEl, cleanup) {
  if (!modalEl) return;
  modalEl.classList.add('hidden');
  modalEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('overflow-hidden');
  if (typeof cleanup === 'function') cleanup();
}

/* safe element creation for product/cards */
function el(tag = 'div', attrs = {}, inner = '') {
  const e = document.createElement(tag);
  Object.keys(attrs || {}).forEach(k => {
    if (k === 'class') e.className = attrs[k];
    else if (k === 'style') e.style.cssText = attrs[k];
    else e.setAttribute(k, attrs[k]);
  });
  if (inner !== null) e.innerHTML = inner;
  return e;
}

/* =========================
   APP STATE: CART & WISHLIST
   ========================= */
let CART = (function loadCart() {
  try {
    const raw = localStorage.getItem(CONFIG.CART_KEY);
    if (!raw) return {}; // mapping pid -> qty
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) { return {}; }
})();

let WISHLIST = (function loadWishlist() {
  try {
    const raw = localStorage.getItem(CONFIG.WISHLIST_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) { return {}; }
})();

/* persist helpers */
function saveCartToStorage() {
  try { localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(CART)); }
  catch (e) { console.warn('Cart persist failed', e); }
  // set count badge
  updateCartBadge();
}
function saveWishlistToStorage() {
  try { localStorage.setItem(CONFIG.WISHLIST_KEY, JSON.stringify(WISHLIST)); }
  catch (e) { console.warn('Wishlist persist failed', e); }
}

/* compute cart totals */
function cartSummary() {
  let subtotal = 0, count = 0;
  Object.keys(CART).forEach(pid => {
    const p = PRODUCTS.find(x => x.id === pid);
    if (!p) return;
    const qty = Number(CART[pid] || 0);
    subtotal += p.price * qty;
    count += qty;
  });
  return { subtotal, count };
}

/* cart badge update */
function updateCartBadge() {
  const badge = document.getElementById('cartCount');
  if (!badge) return;
  const { count } = cartSummary();
  badge.textContent = String(count || 0);
  localStorage.setItem(CONFIG.CART_COUNT_KEY, String(count || 0));
}

/* =========================
   RENDER PRODUCTS GRID
   ========================= */
const productsGrid = document.getElementById('productsGrid') || null;
const showCount = document.getElementById('showCount') || null;

/* build product card markup */
function buildProductCard(p) {
  const discountPercent = p.old ? Math.round(((p.old - p.price) / p.old) * 100) : 0;
  // outer container
  const card = el('div', { class: 'panel rounded-xl overflow-hidden relative' });

  // image wrapper
  const imgWrap = el('div', { class: 'relative' });
  const img = el('img', { src: p.img, alt: p.name, class: 'w-full h-48 object-cover card-img' });
  img.onerror = () => { img.src = logoFallback(); };
  imgWrap.appendChild(img);

  // stock badge
  const stockBadge = el('div', { class: 'absolute left-3 top-3 badge' }, p.stock > 0 ? `${p.stock} in stock` : 'Out of stock');
  imgWrap.appendChild(stockBadge);

  // discount badge
  if (discountPercent > 0) {
    imgWrap.appendChild(el('div', { class: 'absolute right-3 top-3 badge' }, `-${discountPercent}%`));
  }

  // quick view button
  const qBtn = el('button', { class: 'absolute right-3 bottom-3 panel px-2 py-1 text-xs', type: 'button' }, 'Quick view');
  qBtn.addEventListener('click', () => quickView(p.id));
  imgWrap.appendChild(qBtn);

  // details
  const body = el('div', { class: 'p-3' });
  const oldPrice = el('div', { class: 'text-xs text-gray-400 line-through' }, p.old ? formatPrice(p.old) : '');
  const row = el('div', { class: 'flex items-center justify-between mt-1' });
  const left = el('div', {}, `
    <div class="font-semibold">${escapeHtml(p.name)}</div>
    <div class="text-xs text-gray-400">${escapeHtml(p.desc)}</div>
  `);
  const right = el('div', { class: 'text-right' });
  right.appendChild(el('div', { class: 'font-semibold gold-text' }, formatPrice(p.price)));
  const addBtn = el('button', { class: 'mt-2 gold-btn px-3 py-1 rounded-md text-sm', type: 'button' }, 'Add');
  addBtn.addEventListener('click', () => addToCart(p.id, 1));
  right.appendChild(addBtn);
  row.appendChild(left);
  row.appendChild(right);
  body.appendChild(oldPrice);
  body.appendChild(row);

  // wishlist icon
  const wishBtn = el('button', { class: 'absolute left-3 bottom-3 panel px-2 py-1 text-xs', title: 'Add to wishlist', type: 'button' }, '♡');
  wishBtn.addEventListener('click', e => {
    toggleWishlist(p.id);
    wishBtn.classList.toggle('text-[var(--gold)]', !!WISHLIST[p.id]);
    wishBtn.textContent = WISHLIST[p.id] ? '♥' : '♡';
  });

  // initial wish icon state
  if (WISHLIST[p.id]) wishBtn.textContent = '♥';

  card.appendChild(imgWrap);
  card.appendChild(body);
  card.appendChild(wishBtn);
  return card;
}

/* renderProducts: accepts list array */
function renderProducts(list = PRODUCTS) {
  if (!productsGrid) return;
  productsGrid.innerHTML = '';
  showCount && (showCount.textContent = String(list.length));
  const frag = document.createDocumentFragment();
  list.forEach(p => frag.appendChild(buildProductCard(p)));
  productsGrid.appendChild(frag);
}

/* =========================
   FILTERS / SEARCH / SORT
   ========================= */
const filterCategory = document.getElementById('filterCategory');
const priceFilter = document.getElementById('priceFilter');
const sortBy = document.getElementById('sortBy');
const siteSearch = document.getElementById('siteSearch');

/* ensure elements exist before binding */
function getFilterValues() {
  const cat = filterCategory ? filterCategory.value : '';
  const price = priceFilter ? priceFilter.value : 'any';
  const sort = sortBy ? sortBy.value : 'featured';
  const q = siteSearch ? siteSearch.value.trim().toLowerCase() : '';
  return { cat, price, sort, q };
}

function applyFilters() {
  let list = PRODUCTS.slice();
  const { cat, price, sort, q } = getFilterValues();
  if (cat) list = list.filter(p => p.category === cat);
  if (price && price !== 'any') {
    if (price === '0-699') list = list.filter(p => p.price <= 699);
    if (price === '700-999') list = list.filter(p => p.price >= 700 && p.price <= 999);
    if (price === '1000-9999') list = list.filter(p => p.price >= 1000);
  }
  if (q) {
    list = list.filter(p => (p.name + ' ' + p.desc).toLowerCase().includes(q));
  }
  if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  renderProducts(list);
}

/* attach events with debounce for search input */
if (filterCategory) filterCategory.addEventListener('change', applyFilters);
if (priceFilter) priceFilter.addEventListener('change', applyFilters);
if (sortBy) sortBy.addEventListener('change', applyFilters);
if (siteSearch) siteSearch.addEventListener('input', debounce(applyFilters, 250));
if (document.getElementById('searchBtn')) {
  document.getElementById('searchBtn').addEventListener('click', applyFilters);
}

/* =========================
   QUICK VIEW MODAL
   ========================= */
const quickModal = document.getElementById('quickModal') || null;
let quickModalCleanup = null;

function quickView(pid) {
  const p = PRODUCTS.find(x => x.id === pid);
  if (!p) { toast('Product not found'); return; }
  if (!quickModal) {
    // fallback: simple alert
    const payload = `${p.name}\n${formatPrice(p.price)}\n\n${p.desc}`;
    alert(payload);
    return;
  }

  const quickImg = quickModal.querySelector('#quickImg');
  const quickName = quickModal.querySelector('#quickName');
  const quickPrice = quickModal.querySelector('#quickPrice');
  const quickOld = quickModal.querySelector('#quickOld');
  const quickStock = quickModal.querySelector('#quickStock');
  const quickDesc = quickModal.querySelector('#quickDesc');
  const quickQty = quickModal.querySelector('#quickQty');
  const quickAdd = quickModal.querySelector('#quickAdd');

  if (quickImg) quickImg.src = p.img;
  if (quickName) quickName.textContent = p.name;
  if (quickPrice) quickPrice.textContent = formatPrice(p.price);
  if (quickOld) quickOld.textContent = p.old ? formatPrice(p.old) : '';
  if (quickStock) quickStock.textContent = p.stock > 0 ? `${p.stock} in stock` : 'Out of stock';
  if (quickDesc) quickDesc.textContent = p.desc;
  if (quickQty) quickQty.value = 1;

  if (quickAdd) {
    quickAdd.onclick = () => {
      const qty = Number(quickQty?.value || 1);
      addToCart(pid, qty);
      closeQuick();
      toast('Added to cart');
    };
  }

  quickModalCleanup = openModal(quickModal);
}

function closeQuick() {
  closeModal(quickModal, quickModalCleanup);
}

/* =========================
   CART FUNCTIONS
   ========================= */
function addToCart(pid, qty = 1) {
  const product = PRODUCTS.find(p => p.id === pid);
  if (!product) {
    toast('Product not found');
    return;
  }
  qty = Number(qty) || 1;
  CART[pid] = (CART[pid] || 0) + qty;
  if (CART[pid] <= 0) delete CART[pid];
  saveCartToStorage();
  renderCart();
  openCartDrawer();
}

function removeFromCart(pid) {
  if (CART[pid]) delete CART[pid];
  saveCartToStorage();
  renderCart();
}

/* render cart items in sidebar */
const cartSidebar = document.getElementById('cartSidebar') || null;
function renderCart() {
  const container = document.getElementById('cartItems');
  if (!container) return;
  container.innerHTML = '';
  const entries = Object.keys(CART);
  if (!entries.length) {
    container.appendChild(el('div', { class: 'p-4 text-sm text-gray-400' }, 'Your cart is empty.'));
    document.getElementById('cartSub') && (document.getElementById('cartSub').textContent = formatPrice(0));
    updateCartBadge();
    return;
  }

  let subtotal = 0;
  entries.forEach(pid => {
    const p = PRODUCTS.find(x => x.id === pid);
    if (!p) return;
    const qty = Number(CART[pid] || 0);
    const itemWrap = el('div', { class: 'flex items-center gap-3 border-b border-white/5 py-3' });
    const img = el('img', { src: p.img, alt: p.name, class: 'w-16 h-16 object-cover rounded' });
    img.onerror = () => img.src = logoFallback();
    const info = el('div', { class: 'flex-1' }, `<div class="font-semibold">${escapeHtml(p.name)}</div><div class="text-sm text-gray-400">${formatPrice(p.price)} × ${qty}</div>`);
    const right = el('div', { class: 'text-right' });
    right.appendChild(el('div', { class: 'font-semibold' }, formatPrice(p.price * qty)));
    const controls = el('div', { class: 'mt-2 flex gap-1 justify-end' });
    const dec = el('button', { class: 'panel px-2', type: 'button' }, '−');
    const inc = el('button', { class: 'panel px-2', type: 'button' }, '+');
    const rm = el('button', { class: 'panel px-2', type: 'button' }, 'Remove');
    dec.addEventListener('click', () => addToCart(pid, -1));
    inc.addEventListener('click', () => addToCart(pid, 1));
    rm.addEventListener('click', () => removeFromCart(pid));
    controls.appendChild(dec); controls.appendChild(inc); controls.appendChild(rm);
    right.appendChild(controls);
    itemWrap.appendChild(img); itemWrap.appendChild(info); itemWrap.appendChild(right);
    container.appendChild(itemWrap);
    subtotal += p.price * qty;
  });
  document.getElementById('cartSub') && (document.getElementById('cartSub').textContent = formatPrice(subtotal));
  updateCartBadge();
}

/* open/close cart drawer with classes (Tailwind helper) */
function openCartDrawer() {
  if (!cartSidebar) return;
  cartSidebar.style.transform = 'translateX(0)';
  cartSidebar.setAttribute('aria-hidden', 'false');
  renderCart();
  document.body.classList.add('overflow-hidden');
}
function closeCartDrawer() {
  if (!cartSidebar) return;
  cartSidebar.style.transform = 'translateX(100%)';
  cartSidebar.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('overflow-hidden');
}

/* attach cart UI handlers */
document.getElementById('openCart')?.addEventListener('click', openCartDrawer);
document.getElementById('closeCart')?.addEventListener('click', closeCartDrawer);
document.getElementById('clearCart')?.addEventListener('click', () => {
  CART = {};
  saveCartToStorage();
  renderCart();
  toast('Cart cleared');
});

/* checkout button (demo) */
document.getElementById('checkoutBtn')?.addEventListener('click', async () => {
  try {
    if (!Object.keys(CART).length) { alert('Your cart is empty'); return; }
    const items = Object.keys(CART).map(pid => {
      const p = PRODUCTS.find(x => x.id === pid);
      return { productId: pid, name: p.name, unitPrice: p.price, qty: CART[pid] };
    });
    const subtotal = Object.keys(CART).reduce((s, k) => s + (PRODUCTS.find(x => x.id === k).price * CART[k]), 0);
    const payload = { items, subtotal };
    // demo: try to call API, otherwise fallback
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      toast('Order created: ' + (data.orderId || 'demo-order'));
      CART = {}; saveCartToStorage(); renderCart(); closeCartDrawer();
    } else {
      const err = await res.json().catch(() => ({ message: 'Server error' }));
      alert('Checkout error: ' + (err.message || 'Server error'));
    }
  } catch (e) {
    console.log('Checkout demo:', e);
    toast('Checkout endpoint not available — demo mode');
    console.info('Checkout payload prepared:', { items: Object.keys(CART).length, subtotal: cartSummary().subtotal });
  }
});

/* =========================
   WISHLIST
   ========================= */
function toggleWishlist(pid) {
  if (WISHLIST[pid]) { delete WISHLIST[pid]; toast('Removed from wishlist'); }
  else { WISHLIST[pid] = Date.now(); toast('Added to wishlist'); }
  saveWishlistToStorage();
  renderWishlistBadge();
}

function renderWishlistBadge() {
  const el = document.getElementById('wishlistCount');
  if (!el) return;
  el.textContent = Object.keys(WISHLIST).length || 0;
}
renderWishlistBadge();

/* =========================
   AUTH MODAL (demo skeleton)
   ========================= */
const authModal = document.getElementById('authModal') || null;
const authInner = document.getElementById('authInner') || null;
let authCleanup = null;

function openAuth(mode = 'login') {
  if (!authModal || !authInner) return alert('Auth UI not available');
  authInner.innerHTML = '';
  if (mode === 'login') authInner.innerHTML = loginHTML();
  else if (mode === 'signup') authInner.innerHTML = signupHTML();
  else if (mode === 'forgot') authInner.innerHTML = forgotHTML();
  authCleanup = openModal(authModal);
  // bind inner form events
  bindAuthInner(mode);
}
function closeAuth() {
  closeModal(authModal, authCleanup);
  authInner && (authInner.innerHTML = '');
  authCleanup = null;
}

function bindAuthInner(mode) {
  if (!authInner) return;
  if (mode === 'login') {
    const form = authInner.querySelector('#loginFormPop');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.querySelector('#popEmail')?.value.trim().toLowerCase();
      const pw = form.querySelector('#popPw')?.value;
      if (!email || !pw) return alert('Please enter email & password');
      // demo attempt
      try {
        const res = await API.post('/login', { email, password: pw });
        if (res.ok) {
          const data = await res.json();
          if (data.token) localStorage.setItem('vf_token', data.token);
          toast('Login successful');
          closeAuth();
        } else {
          const err = await res.json().catch(() => ({ message: 'Login failed' }));
          alert('Login error: ' + (err.message || 'Invalid credentials'));
        }
      } catch (err) {
        console.log('Login demo payload:', { email, password: pw });
        alert('Login endpoint not available — demo mode.');
      }
    });
    authInner.querySelector('#showLoginPw')?.addEventListener('click', () => togglePw('popPw', 'showLoginPw'));
    authInner.querySelector('#toSignupFromLogin')?.addEventListener('click', () => openAuth('signup'));
    authInner.querySelector('#toForgotFromLogin')?.addEventListener('click', () => openAuth('forgot'));
  } else if (mode === 'signup') {
    const form = authInner.querySelector('#signupFormPop');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = form.querySelector('#popName')?.value.trim();
      const email = form.querySelector('#popEmailS')?.value.trim().toLowerCase();
      const mobile = form.querySelector('#popMobile')?.value.trim();
      const pw = form.querySelector('#popPwS')?.value;
      const pw2 = form.querySelector('#popPwS2')?.value;
      if (!name || name.length < 2) return alert('Enter full name');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return alert('Invalid email');
      if (!/^[0-9]{10}$/.test(mobile)) return alert('Mobile must be 10 digits');
      if (pw.length < 8) return alert('Password must be at least 8 characters');
      if (pw !== pw2) return alert('Passwords do not match');
      try {
        const res = await fetch('/api/signup', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name, email, mobile, password: pw })});
        if (res.ok) {
          const data = await res.json();
          alert('Account created: ' + (data.userId || 'demo-id'));
          closeAuth();
        } else {
          const err = await res.json().catch(() => ({ message: 'Signup failed' }));
          alert('Signup error: ' + (err.message || 'Unable to create account'));
        }
      } catch (err) {
        console.log('Signup demo payload:', { name, email, mobile, password: pw });
        alert('Signup endpoint not available — demo mode.');
      }
    });
    authInner.querySelector('#showSignupPw')?.addEventListener('click', () => togglePw('popPwS', 'showSignupPw'));
    authInner.querySelector('#showSignupPw2')?.addEventListener('click', () => togglePw('popPwS2', 'showSignupPw2'));
    authInner.querySelector('#toLoginFromSignup')?.addEventListener('click', () => openAuth('login'));
  } else if (mode === 'forgot') {
    const form = authInner.querySelector('#forgotFormPop');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.querySelector('#popForgotEmail')?.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return alert('Enter valid email');
      try {
        const res = await fetch('/api/forgot', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email })});
        if (res.ok) {
          alert('Password reset link sent (check email).');
          closeAuth();
        } else {
          const err = await res.json().catch(() => ({ message: 'Error sending reset link' }));
          alert('Error: ' + (err.message || 'Unable to send reset link'));
        }
      } catch (err) {
        console.log('Forgot demo payload:', { email });
        alert('Forgot-password endpoint not available — demo mode.');
      }
    });
    authInner.querySelector('#toLoginFromForgot')?.addEventListener('click', () => openAuth('login'));
  }
}

function togglePw(id, btnId) {
  const el = document.getElementById(id);
  if (!el) return;
  el.type = el.type === 'password' ? 'text' : 'password';
  const b = document.getElementById(btnId);
  if (b) b.textContent = el.type === 'password' ? 'Show' : 'Hide';
}

/* HTML templates for auth modal */
function loginHTML() {
  return `
    <h3 class="text-xl font-semibold mb-2">Sign in</h3>
    <form id="loginFormPop" class="grid gap-3">
      <input id="popEmail" type="email" class="p-3 rounded-md bg-transparent border border-white/10" placeholder="Email" required />
      <div class="relative">
        <input id="popPw" type="password" class="p-3 rounded-md bg-transparent border border-white/10 w-full" placeholder="Password" required />
        <button type="button" id="showLoginPw" class="absolute right-3 top-3 text-sm text-gray-300">Show</button>
      </div>
      <button class="gold-btn py-2 rounded-md">Sign In</button>
    </form>
    <div class="text-sm mt-2 flex justify-between">
      <button id="toSignupFromLogin" type="button" class="text-[var(--gold)] underline">Create account</button>
      <button id="toForgotFromLogin" type="button" class="text-gray-400 underline">Forgot?</button>
    </div>
  `;
}
function signupHTML() {
  return `
    <h3 class="text-xl font-semibold mb-2">Create account</h3>
    <form id="signupFormPop" class="grid gap-3">
      <input id="popName" class="p-3 rounded-md bg-transparent border border-white/10" placeholder="Full name" required />
      <input id="popEmailS" type="email" class="p-3 rounded-md bg-transparent border border-white/10" placeholder="Email" required />
      <input id="popMobile" class="p-3 rounded-md bg-transparent border border-white/10" placeholder="Mobile number (10 digits)" required />
      <div class="relative">
        <input id="popPwS" type="password" class="p-3 rounded-md bg-transparent border border-white/10 w-full" placeholder="Password (min 8 chars)" required />
        <button type="button" id="showSignupPw" class="absolute right-3 top-3 text-sm text-gray-300">Show</button>
      </div>
      <div class="relative">
        <input id="popPwS2" type="password" class="p-3 rounded-md bg-transparent border border-white/10 w-full" placeholder="Confirm password" required />
        <button type="button" id="showSignupPw2" class="absolute right-3 top-3 text-sm text-gray-300">Show</button>
      </div>
      <button class="gold-btn py-2 rounded-md">Create Account</button>
    </form>
    <div class="text-sm mt-2">
      <button id="toLoginFromSignup" type="button" class="text-gray-400 underline">Already have an account? Sign in</button>
    </div>
  `;
}
function forgotHTML() {
  return `
    <h3 class="text-xl font-semibold mb-2">Reset password</h3>
    <form id="forgotFormPop" class="grid gap-3">
      <input id="popForgotEmail" type="email" class="p-3 rounded-md bg-transparent border border-white/10" placeholder="Registered email" required />
      <button class="gold-btn py-2 rounded-md">Send Reset Link</button>
    </form>
    <div class="text-sm mt-2">
      <button id="toLoginFromForgot" type="button" class="text-gray-400 underline">Back to sign in</button>
    </div>
  `;
}

/* =========================
   TRACK ORDER MODAL (demo)
   ========================= */
const trackModal = document.getElementById('trackModal') || null;
let trackCleanup = null;
function openTrack() {
  if (!trackModal) return alert('Track UI not present');
  trackCleanup = openModal(trackModal);
}
function closeTrack() {
  closeModal(trackModal, trackCleanup);
  trackCleanup = null;
}
document.getElementById('trackBtn')?.addEventListener('click', openTrack);
document.getElementById('closeTrack')?.addEventListener('click', closeTrack);
document.getElementById('trackForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('trackOrderId')?.value.trim();
  const email = document.getElementById('trackEmail')?.value.trim();
  if (!id || !email) { alert('Please enter order ID and email'); return; }
  alert('Tracking request submitted (demo): ' + id + ', ' + email);
  closeTrack();
});

/* =========================
   NEWSLETTER SUBMIT (demo)
   ========================= */
document.getElementById('newsletterForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('newsletterEmail')?.value.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    alert('Enter a valid email'); return;
  }
  // demo: pretend to send
  toast('Subscribed (demo): ' + email);
  e.target.reset();
});

/* =========================
   HERO CAROUSEL
   ========================= */
(function initCarousel() {
  const carousel = document.getElementById('heroCarousel');
  if (!carousel) return;
  const slidesContainer = carousel.querySelector('.carousel-slides');
  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  if (!slidesContainer || slides.length === 0) return;

  let current = 0;
  const total = slides.length;
  let interval = null;
  let isPaused = false;

  function show(index) {
    current = ((index % total) + total) % total;
    slidesContainer.style.transform = `translateX(-${current * 100}%)`;
    // update any indicators if present
    const indicators = carousel.querySelectorAll('[data-carousel-indicator]');
    indicators.forEach((ind, i) => ind.classList.toggle('opacity-100', i === current));
  }

  function next() { show(current + 1); }
  function prev() { show(current - 1); }

  // auto slide
  interval = setInterval(() => { if (!isPaused) next(); }, CONFIG.AUTO_SLIDE_MS);

  // pause on hover
  carousel.addEventListener('mouseenter', () => isPaused = true);
  carousel.addEventListener('mouseleave', () => isPaused = false);

  // optional prev/next buttons
  carousel.querySelectorAll('[data-carousel-next]').forEach(b => b.addEventListener('click', next));
  carousel.querySelectorAll('[data-carousel-prev]').forEach(b => b.addEventListener('click', prev));

  // indicator click
  carousel.querySelectorAll('[data-carousel-indicator]').forEach((el, idx) => {
    el.addEventListener('click', () => show(idx));
  });

  // initial
  show(0);
})();

/* =========================
   REFLECTION / AMBIENT EFFECT (mouse-follow)
   ========================= */
(function initReflect() {
  const reflect = document.getElementById('reflect');
  if (!reflect) return;
  let last = 0;
  const throttleMs = 12;
  if (window.matchMedia && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - last < throttleMs) return;
      last = now;
      const x = e.clientX;
      const y = e.clientY - 40;
      reflect.style.left = `${x}px`;
      reflect.style.top = `${y}px`;
      reflect.style.opacity = 0.28;
      reflect.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    window.addEventListener('mouseleave', () => { reflect.style.opacity = 0; });
  } else {
    // static position for touch devices
    reflect.style.left = '60%';
    reflect.style.top = '8%';
    reflect.style.opacity = 0.16;
  }
})();

/* =========================
   HEADER ICONS (search, login, cart, menu)
   ========================= */
(function headerBindings() {
  // SEARCH OVERLAY
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const existing = document.getElementById('searchOverlay');
      if (existing) {
        existing.classList.toggle('hidden');
        existing.querySelector('input')?.focus();
      } else {
        const overlay = el('div', { id: 'searchOverlay', class: 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50' }, `
          <div class="bg-[#111]/90 border border-white/10 rounded-2xl p-6 w-[90%] max-w-md shadow-xl">
            <input id="searchInputOverlay" type="text" class="w-full bg-transparent border-b border-gray-600 text-white text-center focus:outline-none focus:border-[#D4AF37] placeholder-gray-500 py-2" placeholder="Search products or collections..." />
            <div class="flex justify-center mt-4">
              <button id="closeSearch" class="px-4 py-2 text-sm bg-[#D4AF37] text-black rounded-lg hover:brightness-110 transition">Close</button>
            </div>
          </div>
        `);
        document.body.appendChild(overlay);
        overlay.querySelector('#closeSearch')?.addEventListener('click', () => overlay.remove());
        overlay.querySelector('#searchInputOverlay')?.focus();
      }
    });
  }

  // LOGIN BTN
  document.getElementById('loginBtn')?.addEventListener('click', () => openAuth('login'));

  // CART BTN (also provided elsewhere)
  document.getElementById('cartBtn')?.addEventListener('click', () => {
    openCartDrawer();
    renderCart();
  });

  // MOBILE MENU toggle
  document.getElementById('menuBtn')?.addEventListener('click', () => {
    const nav = document.querySelector('nav');
    if (!nav) return;
    nav.classList.toggle('hidden');
    nav.classList.toggle('flex');
    nav.classList.add('flex-col', 'bg-black/90', 'p-4', 'absolute', 'top-full', 'left-0', 'w-full', 'z-40');
  });
})();

/* =========================
   COLLECTIONS MENU (outside click to close)
   ========================= */
document.addEventListener('click', (e) => {
  const cm = document.getElementById('collectionsMenu'), btn = document.getElementById('collectionsBtn');
  if (!cm || !btn) return;
  if (!btn.contains(e.target) && !cm.contains(e.target)) cm.classList.add('hidden');
});

/* =========================
   SEARCH SHORTCUT (press / to focus)
   ========================= */
window.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
    e.preventDefault();
    const s = document.getElementById('siteSearch') || document.getElementById('searchInputOverlay');
    if (s) s.focus();
  }
});

/* =========================
   UTILITY: Logo fallback (data URI)
   ========================= */
function logoFallback() {
  return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="100%" height="100%" fill="%23D4AF37"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Playfair Display, serif" font-size="48" fill="%230b0b0b">VF</text></svg>';
}

/* =========================
   SAFE ESC KEY CLOSE FOR MODALS
   ========================= */
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // close quick
    if (quickModal && !quickModal.classList.contains('hidden')) closeQuick();
    if (authModal && !authModal.classList.contains('hidden')) closeAuth();
    if (trackModal && !trackModal.classList.contains('hidden')) closeTrack();
    if (cartSidebar && cartSidebar.style.transform === 'translateX(0)') closeCartDrawer();
    const overlay = document.getElementById('searchOverlay');
    if (overlay && !overlay.classList.contains('hidden')) overlay.remove();
  }
});

/* =========================
   PROGRESSIVE INIT (on load)
   ========================= */
window.addEventListener('load', () => {
  // set cart count
  const storedCount = Number(localStorage.getItem(CONFIG.CART_COUNT_KEY) || 0);
  document.getElementById('cartCount') && (document.getElementById('cartCount').textContent = String(storedCount));

  // initial render
  renderProducts(PRODUCTS);
  renderCart();
  renderWishlistBadge();

  // ensure logo fallback attaches
  (function ensureLogo() {
    const logo = document.getElementById('brandLogo');
    if (!logo) return;
    logo.onerror = () => { logo.src = logoFallback(); };
  })();

  // quick accessibility: focus outlines for keyboard users
  document.body.addEventListener('keyup', (e) => {
    if (e.key === 'Tab') document.documentElement.classList.add('show-focus');
  });
});

/* =========================
   SMALL HELP: HTML escaping
   ========================= */
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, function (m) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
  });
}

/* =========================
   END: EXPORTS (dev helpers)
   ========================= */
window.VibrantFlight = {
  PRODUCTS,
  renderProducts,
  applyFilters,
  addToCart,
  removeFromCart,
  toggleWishlist,
  openAuth,
  closeAuth,
  openTrack,
  closeTrack,
  quickView,
  closeQuick
};
/* ============================================================
   End main.js
   ============================================================ */
/* ============================================================
   ESC + BACKDROP CLOSE FIX
   ============================================================ */

// Close modals or sidebars when pressing ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    // Close Auth Modal
    const authModal = document.getElementById("authModal");
    if (authModal && !authModal.classList.contains("hidden")) {
      authModal.classList.add("hidden");
      document.body.style.overflow = "auto";
    }

    // Close Quick View Modal
    const quickModal = document.getElementById("quickModal");
    if (quickModal && !quickModal.classList.contains("hidden")) {
      quickModal.classList.add("hidden");
      document.body.style.overflow = "auto";
    }

    // Close Cart Sidebar
    const cartSidebar = document.getElementById("cartSidebar");
    if (cartSidebar && cartSidebar.classList.contains("translate-x-0")) {
      cartSidebar.classList.remove("translate-x-0");
      cartSidebar.classList.add("translate-x-full");
      document.body.style.overflow = "auto";
    }
  }
});

// Close when clicking outside modals
window.addEventListener("click", (e) => {
  const authModal = document.getElementById("authModal");
  const quickModal = document.getElementById("quickModal");
  const cartSidebar = document.getElementById("cartSidebar");

  // If clicking backdrop (outside inner content)
  if (authModal && e.target === authModal) {
    authModal.classList.add("hidden");
    document.body.style.overflow = "auto";
  }
  if (quickModal && e.target === quickModal) {
    quickModal.classList.add("hidden");
    document.body.style.overflow = "auto";
  }
  if (cartSidebar && e.target === cartSidebar) {
    cartSidebar.classList.remove("translate-x-0");
    cartSidebar.classList.add("translate-x-full");
    document.body.style.overflow = "auto";
  }
});
