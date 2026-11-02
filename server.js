const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully to KADEE.LK Ultimate Marketplace!'))
    .catch((err) => console.error('MongoDB Connection Error:', err));
}

// 1. User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' }
});
const User = mongoose.model('User', userSchema);

// 2. Product Schema with Reviews
const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  category: String,
  image: String,
  sellerEmail: String,
  rating: { type: Number, default: 4.5 },
  reviews: [{ user: String, comment: String, rating: Number }]
});
const Product = mongoose.model('Product', productSchema);

// 3. Order Schema for Checkout & PayHere
const orderSchema = new mongoose.Schema({
  buyerEmail: String,
  items: Array,
  totalAmount: Number,
  paymentMethod: String,
  status: { type: String, default: 'Pending' },
  date: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// --- API ROUTES ---

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered!' });
    const newUser = new User({ name, email, password, role });
    await newUser.save();
    res.json({ success: true, message: 'Registration successful!' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(400).json({ error: 'Invalid email or password!' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { title, price, category, image, sellerEmail } = req.body;
    const newProduct = new Product({ title, price, category, image, sellerEmail });
    await newProduct.save();
    res.json({ success: true, message: 'Product added successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Add Review to Product
app.post('/api/products/:id/review', async (req, res) => {
  try {
    const { user, comment, rating } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    product.reviews.push({ user, comment, rating });
    await product.save();
    res.json({ success: true, message: 'Review added successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// Checkout Route (PayHere / COD)
app.post('/api/checkout', async (req, res) => {
  try {
    const { buyerEmail, items, totalAmount, paymentMethod } = req.body;
    const newOrder = new Order({ buyerEmail, items, totalAmount, paymentMethod });
    await newOrder.save();
    res.json({ success: true, message: 'Order placed successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// Admin Stats Route
app.get('/api/admin/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const orders = await Order.find({});
    res.json({ userCount, productCount, orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// --- FRONTEND UI (Daraz/Amazon Style Mega Marketplace) ---
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KADEE.LK - Sri Lanka's Mega Marketplace</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body class="bg-gray-100 font-sans">

        <!-- Top Header -->
        <div class="bg-orange-600 text-white text-xs py-1 px-4 flex justify-between items-center">
            <span>🔥 KADEE.LK - Mega Online Shopping Mall, PayHere & Seller Hub</span>
            <div class="flex space-x-4 items-center">
                <span id="userDisplay" class="font-bold text-yellow-200"></span>
                <button id="authBtn" onclick="openAuthModal()" class="bg-yellow-400 text-orange-900 px-2 py-0.5 rounded font-bold hover:bg-yellow-300">Login / Register</button>
                <button id="logoutBtn" onclick="logout()" class="hidden bg-red-500 px-2 py-0.5 rounded font-bold">Logout</button>
            </div>
        </div>

        <!-- Main Navbar -->
        <header class="bg-orange-500 text-white shadow-md sticky top-0 z-50">
            <div class="container mx-auto px-4 py-3 flex items-center justify-between">
                <a href="/" class="text-2xl font-black tracking-wider flex items-center gap-2">
                    <i class="fa-solid fa-store"></i> KADEE<span class="text-yellow-300">.LK</span>
                </a>
               
                <div class="flex-1 mx-8 max-w-2xl relative">
                    <input type="text" id="searchInput" placeholder="Search products, brands and categories..." class="w-full py-2 px-4 rounded-l text-gray-800 focus:outline-none">
                    <button onclick="searchProducts()" class="absolute right-0 top-0 bg-yellow-400 text-orange-900 px-6 py-2 rounded-r font-bold hover:bg-yellow-300">
                        <i class="fa-solid fa-search"></i>
                    </button>
                </div>

                <div class="flex items-center space-x-4">
                    <button id="adminDashboardBtn" onclick="openAdminModal()" class="hidden bg-purple-600 text-white px-3 py-1 rounded font-bold text-sm hover:bg-purple-700">
                        <i class="fa-solid fa-gauge"></i> Admin Panel
                    </button>
                    <button id="sellerDashboardBtn" onclick="openSellerModal()" class="hidden bg-yellow-300 text-orange-900 px-3 py-1 rounded font-bold text-sm hover:bg-yellow-400">
                        <i class="fa-solid fa-box-open"></i> Seller Hub
                    </button>
                    <div class="relative cursor-pointer flex items-center gap-1" onclick="toggleCart()">
                        <i class="fa-solid fa-cart-shopping text-2xl"></i>
                        <span id="cartCount" class="bg-yellow-300 text-orange-900 rounded-full px-2 text-xs font-bold">0</span>
                        <span class="hidden md:inline font-semibold">Cart</span>
                    </div>
                </div>
            </div>
        </header>

        <!-- Category Bar -->
        <div class="bg-white shadow-sm border-b">
            <div class="container mx-auto px-4 py-2 flex space-x-6 overflow-x-auto text-sm font-semibold text-gray-700">
                <button onclick="filterCategory('All')" class="hover:text-orange-600 whitespace-nowrap">🔥 All Categories</button>
                <button onclick="filterCategory('Electronics')" class="hover:text-orange-600 whitespace-nowrap">💻 Electronics</button>
                <button onclick="filterCategory('Fashion')" class="hover:text-orange-600 whitespace-nowrap">👕 Fashion</button>
                <button onclick="filterCategory('Home & Living')" class="hover:text-orange-600 whitespace-nowrap">🏠 Home & Living</button>
            </div>
        </div>

        <!-- Hero Section -->
        <div class="container mx-auto px-4 mt-4">
            <div class="bg-gradient-to-r from-orange-600 to-yellow-500 rounded-lg p-8 text-white shadow-lg flex justify-between items-center">
                <div>
                    <h1 class="text-3xl md:text-5xl font-extrabold mb-2">Mega Marketplace & PayHere Gateway</h1>
                    <p class="text-lg mb-4">Shop securely with PayHere online payments or Cash on Delivery across Sri Lanka!</p>
                </div>
                <div class="text-6xl hidden md:block">🚀</div>
            </div>
        </div>

        <!-- Products Listing -->
        <main class="container mx-auto px-4 my-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Trending Products & Flash Sale</h2>
            <div id="productGrid" class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div class="text-center col-span-full py-12 text-gray-500">Loading marketplace...</div>
            </div>
        </main>

        <!-- Auth Modal -->
        <div id="authModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex justify-center items-center">
            <div class="bg-white p-8 rounded-lg w-96 shadow-2xl relative">
                <button onclick="closeAuthModal()" class="absolute top-3 right-3 text-gray-500 font-bold text-xl">&times;</button>
                <h3 id="authTitle" class="text-2xl font-bold mb-4 text-orange-600">Login to KADEE.LK</h3>
                <div id="registerFields" class="hidden space-y-3 mb-3">
                    <input type="text" id="regName" placeholder="Full Name" class="w-full p-2 border rounded">
                    <select id="regRole" class="w-full p-2 border rounded">
                        <option value="buyer">Buyer (Customer)</option>
                        <option value="seller">Seller (Vendor)</option>
                        <option value="admin">Admin (Manager)</option>
                    </select>
                </div>
                <input type="email" id="authEmail" placeholder="Email Address" class="w-full p-2 border rounded mb-3">
                <input type="password" id="authPassword" placeholder="Password" class="w-full p-2 border rounded mb-4">
                <button onclick="handleAuthSubmit()" id="authSubmitBtn" class="w-full bg-orange-500 text-white py-2 rounded font-bold hover:bg-orange-600">Login</button>
                <p class="text-sm text-center mt-4">
                    <span id="authToggleText">Don't have an account?</span>
                    <button onclick="toggleAuthMode()" class="text-orange-600 font-bold underline">Register here</button>
                </p>
            </div>
        </div>

        <!-- Seller Hub Modal -->
        <div id="sellerModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex justify-center items-center">
            <div class="bg-white p-8 rounded-lg w-96 shadow-2xl relative">
                <button onclick="openSellerModal()" class="absolute top-3 right-3 text-gray-500 font-bold text-xl">&times;</button>
                <h3 class="text-2xl font-bold mb-4 text-orange-600">Seller Hub - Add Product</h3>
                <input type="text" id="prodTitle" placeholder="Product Title" class="w-full p-2 border rounded mb-3">
                <input type="number" id="prodPrice" placeholder="Price (LKR)" class="w-full p-2 border rounded mb-3">
                <input type="text" id="prodCategory" placeholder="Category (Electronics/Fashion/Home)" class="w-full p-2 border rounded mb-3">
                <input type="text" id="prodImage" placeholder="Image URL (Unsplash link)" class="w-full p-2 border rounded mb-4">
                <button onclick="addNewProduct()" class="w-full bg-orange-500 text-white py-2 rounded font-bold hover:bg-orange-600">Publish Product</button>
            </div>
        </div>

        <!-- Admin Dashboard Modal -->
        <div id="adminModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex justify-center items-center">
            <div class="bg-white p-8 rounded-lg w-11/12 md:w-2/3 max-h-[80vh] overflow-y-auto shadow-2xl relative">
                <button onclick="openAdminModal()" class="absolute top-3 right-3 text-gray-500 font-bold text-xl">&times;</button>
                <h3 class="text-2xl font-bold mb-4 text-purple-600"><i class="fa-solid fa-gauge"></i> Admin Dashboard</h3>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="bg-purple-100 p-4 rounded-lg text-center">
                        <h4 class="text-gray-600 font-semibold">Total Users</h4>
                        <p id="adminUserCount" class="text-2xl font-bold text-purple-700">0</p>
                    </div>
                    <div class="bg-orange-100 p-4 rounded-lg text-center">
                        <h4 class="text-gray-600 font-semibold">Total Products</h4>
                        <p id="adminProdCount" class="text-2xl font-bold text-orange-700">0</p>
                    </div>
                </div>
                <h4 class="font-bold text-lg mb-2">Recent Customer Orders</h4>
                <div id="adminOrdersList" class="space-y-2 text-sm">
                    <p class="text-gray-500">Loading orders...</p>
                </div>
            </div>
        </div>

        <!-- Cart & Checkout Sidebar -->
        <div id="cartModal" class="fixed right-0 top-0 w-96 h-full bg-white shadow-2xl z-50 transform translate-x-full transition-transform duration-300 p-6 flex flex-col">
            <div class="flex justify-between items-center border-b pb-4">
                <h3 class="text-xl font-bold text-gray-800">Your Shopping Cart</h3>
                <button onclick="toggleCart()" class="text-gray-500 hover:text-black font-bold text-xl">&times;</button>
            </div>
            <div id="cartItems" class="flex-1 overflow-y-auto py-4 space-y-4">
                <p class="text-gray-500 text-center">Your cart is empty.</p>
            </div>
            <div class="border-t pt-4 space-y-3">
                <div class="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span id="cartTotal">LKR 0</span>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1">Select Payment Method:</label>
                    <select id="paymentMethod" class="w-full p-2 border rounded text-sm">
                        <option value="PayHere">PayHere Online Payment Gateway</option>
                        <option value="COD">Cash on Delivery (COD)</option>
                    </select>
                </div>
                <button onclick="checkout()" class="w-full bg-orange-500 text-white py-3 rounded font-bold hover:bg-orange-600">Proceed to Checkout</button>
            </div>
        </div>

        <!-- Frontend Script -->
        <script>
            let products = [];
            let cart = [];
            let currentUser = JSON.parse(localStorage.getItem('kadee_user')) || null;
            let isRegisterMode = false;

            function updateUIState() {
                if (currentUser) {
                    document.getElementById('userDisplay').innerText = \`Hello, \${currentUser.name} (\${currentUser.role})\`;
                    document.getElementById('authBtn').classList.add('hidden');
                    document.getElementById('logoutBtn').classList.remove('hidden');
                    if (currentUser.role === 'seller' || currentUser.role === 'admin') {
                        document.getElementById('sellerDashboardBtn').classList.remove('hidden');
                    }
                    if (currentUser.role === 'admin') {
                        document.getElementById('adminDashboardBtn').classList.remove('hidden');
                    }
                } else {
                    document.getElementById('userDisplay').innerText = '';
                    document.getElementById('authBtn').classList.remove('hidden');
                    document.getElementById('logoutBtn').classList.add('hidden');
                    document.getElementById('sellerDashboardBtn').classList.add('hidden');
                    document.getElementById('adminDashboardBtn').classList.add('hidden');
                }
            }

            async function fetchProducts() {
                const res = await fetch('/api/products');
                products = await res.json();
                displayProducts(products);
            }

            function displayProducts(items) {
                const grid = document.getElementById('productGrid');
                if (items.length === 0) {
                    grid.innerHTML = '<p class="col-span-full text-center text-gray-500">No products available.</p>';
                    return;
                }
                grid.innerHTML = items.map(p => \`
                    <div class="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col justify-between">
                        <div>
                            <img src="\${p.image}" alt="\${p.title}" class="w-full h-48 object-cover rounded mb-3">
                            <span class="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded font-semibold">\${p.category}</span>
                            <h3 class="font-bold text-gray-800 mt-2 text-sm md:text-base">\${p.title}</h3>
                            <div class="text-yellow-500 text-xs mt-1">⭐ \${p.rating} / 5 (\${p.reviews ? p.reviews.length : 0} reviews)</div>
                        </div>
                        <div class="mt-4">
                            <div class="text-orange-600 font-extrabold text-lg">LKR \${p.price.toLocaleString()}</div>
                            <button onclick="addToCart('\${p._id}')" class="mt-2 w-full bg-orange-500 text-white py-2 rounded text-sm font-bold hover:bg-orange-600">
                                <i class="fa-solid fa-cart-plus"></i> Add to Cart
                            </button>
                        </div>
                    </div>
                \`).join('');
            }

            function filterCategory(cat) {
                if (cat === 'All') {
                    displayProducts(products);
                } else {
                    const filtered = products.filter(p => p.category === cat);
                    displayProducts(filtered);
                }
            }

            function openAuthModal() { document.getElementById('authModal').classList.remove('hidden'); }
            function closeAuthModal() { document.getElementById('authModal').classList.add('hidden'); }
            function toggleAuthMode() {
                isRegisterMode = !isRegisterMode;
                document.getElementById('authTitle').innerText = isRegisterMode ? 'Register on KADEE.LK' : 'Login to KADEE.LK';
                document.getElementById('registerFields').classList.toggle('hidden');
                document.getElementById('authSubmitBtn').innerText = isRegisterMode ? 'Register' : 'Login';
                document.getElementById('authToggleText').innerText = isRegisterMode ? 'Already have an account?' : "Don't have an account?";
            }

            async function handleAuthSubmit() {
                const email = document.getElementById('authEmail').value;
                const password = document.getElementById('authPassword').value;
                if (isRegisterMode) {
                    const name = document.getElementById('regName').value;
                    const role = document.getElementById('regRole').value;
                    const res = await fetch('/api/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, password, role })
                    });
                    const data = await res.json();
                    if (data.success) { alert('Registered successfully! Please login.'); toggleAuthMode(); }
                    else { alert(data.error); }
                } else {
                    const res = await fetch('/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    const data = await res.json();
                    if (data.success) {
                        currentUser = data.user;
                        localStorage.setItem('kadee_user', JSON.stringify(currentUser));
                        closeAuthModal();
                        updateUIState();
                        alert('Login successful!');
                    } else { alert(data.error); }
                }
            }

            function logout() {
                currentUser = null;
                localStorage.removeItem('kadee_user');
                updateUIState();
                alert('Logged out successfully.');
            }

            function openSellerModal() { document.getElementById('sellerModal').classList.toggle('hidden'); }

            async function addNewProduct() {
                const title = document.getElementById('prodTitle').value;
                const price = Number(document.getElementById('prodPrice').value);
                const category = document.getElementById('prodCategory').value;
                const image = document.getElementById('prodImage').value;
                const res = await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, price, category, image, sellerEmail: currentUser.email })
                });
                const data = await res.json();
                if (data.success) {
                    alert('Product published successfully!');
                    openSellerModal();
                    fetchProducts();
                }
            }

            async function openAdminModal() {
                const modal = document.getElementById('adminModal');
                modal.classList.toggle('hidden');
                if (!modal.classList.contains('hidden')) {
                    const res = await fetch('/api/admin/stats');
                    const stats = await res.json();
                    document.getElementById('adminUserCount').innerText = stats.userCount;
                    document.getElementById('adminProdCount').innerText = stats.productCount;
                    const ordersList = document.getElementById('adminOrdersList');
                    if (stats.orders.length === 0) {
                        ordersList.innerHTML = '<p class="text-gray-500">No orders yet.</p>';
                    } else {
                        ordersList.innerHTML = stats.orders.map(o => \`
                            <div class="bg-gray-50 p-3 rounded border flex justify-between items-center">
                                <div>
                                    <span class="font-bold text-xs text-purple-600">\${o.buyerEmail}</span>
                                    <p class="text-xs text-gray-600">Total: LKR \${o.totalAmount.toLocaleString()} (\${o.paymentMethod})</p>
                                </div>
                                <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">\${o.status}</span>
                            </div>
                        \`).join('');
                    }
                }
            }

            function searchProducts() {
                const query = document.getElementById('searchInput').value.toLowerCase();
                const filtered = products.filter(p => p.title.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
                displayProducts(filtered);
            }

            function addToCart(id) {
                const item = products.find(p => p._id === id);
                if (item) { cart.push(item); updateCartUI(); alert(item.title + ' added to cart!'); }
            }

            function updateCartUI() {
                document.getElementById('cartCount').innerText = cart.length;
                const container = document.getElementById('cartItems');
                if (cart.length === 0) {
                    container.innerHTML = '<p class="text-gray-500 text-center">Your cart is empty.</p>';
                    document.getElementById('cartTotal').innerText = 'LKR 0';
                    return;
                }
                let total = 0;
                container.innerHTML = cart.map((item, index) => {
                    total += item.price;
                    return \`
                        <div class="flex justify-between items-center border-b pb-2">
                            <div>
                                <h4 class="font-semibold text-sm">\${item.title}</h4>
                                <span class="text-orange-600 font-bold text-sm">LKR \${item.price.toLocaleString()}</span>
                            </div>
                            <button onclick="removeFromCart(\${index})" class="text-red-500"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    \`;
                }).join('');
                document.getElementById('cartTotal').innerText = 'LKR ' + total.toLocaleString();
            }

            function removeFromCart(index) { cart.splice(index, 1); updateCartUI(); }
            function toggleCart() { document.getElementById('cartModal').classList.toggle('translate-x-full'); }

            async function checkout() {
                if (!currentUser) { alert('Please login to proceed with checkout!'); openAuthModal(); return; }
                if (cart.length === 0) { alert('Cart is empty'); return; }
                const paymentMethod = document.getElementById('paymentMethod').value;
                const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

                const res = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ buyerEmail: currentUser.email, items: cart, totalAmount, paymentMethod })
                });
                const data = await res.json();
                if (data.success) {
                    if (paymentMethod === 'PayHere') {
                        alert('Redirecting to PayHere secure payment gateway simulation...');
                    } else {
                        alert('Order placed successfully via Cash on Delivery (COD)!');
                    }
                    cart = [];
                    updateCartUI();
                    toggleCart();
                } else {
                    alert('Checkout failed.');
                }
            }

            fetchProducts();
            updateUIState();
        </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
