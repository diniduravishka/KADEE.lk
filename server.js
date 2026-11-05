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
    .then(() => {
      console.log('MongoDB Connected Successfully to KADEE.LK Mega Marketplace!');
      seedDatabase();
    })
    .catch((err) => console.error('MongoDB Connection Error:', err));
} else {
  console.error('MONGO_URI is missing in environment variables!');
}

// 1. User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  date: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// 2. Product Schema
const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  category: String,
  image: String,
  sellerEmail: String,
  rating: { type: Number, default: 4.8 },
  reviews: [{ user: String, comment: String, rating: Number }]
});
const Product = mongoose.model('Product', productSchema);

// 3. Order Schema
const orderSchema = new mongoose.Schema({
  buyerEmail: String,
  items: Array,
  totalAmount: Number,
  paymentMethod: String,
  status: { type: String, default: 'Processing' },
  date: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// Auto-seed initial products and default Admin accounts securely
async function seedDatabase() {
  try {
    await User.findOneAndUpdate(
      { email: 'diniduravishka649@gmail.com' },
      {
        name: 'Dinidu ravishka',
        email: 'diniduravishka649@gmail.com',
        password: 'ACD172aus@kc',
        role: 'admin'
      },
      { upsert: true, new: true }
    );

    await User.findOneAndUpdate(
      { email: 'Maheshi@example.com' },
      {
        name: 'Maheshi herath',
        email: 'Maheshi@example.com',
        password: 'PMD1512hmp#@qc',
        role: 'admin'
      },
      { upsert: true, new: true }
    );

    console.log('Default Admin Accounts verified & updated successfully!');

    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany([
        { title: 'Wireless Bluetooth Gaming Headphones', price: 8500, category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', sellerEmail: 'diniduravishka649@gmail.com', rating: 4.8 },
        { title: 'Smart Watch Series 8 Ultra', price: 15400, category: 'Electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', sellerEmail: 'diniduravishka649@gmail.com', rating: 4.9 },
        { title: 'Classic Casual Sports Sneakers', price: 5900, category: 'Fashion', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', sellerEmail: 'Maheshi@example.com', rating: 4.6 },
        { title: 'Professional DSLR Camera 4K', price: 125000, category: 'Electronics', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500', sellerEmail: 'diniduravishka649@gmail.com', rating: 5.0 },
        { title: 'Minimalist Genuine Leather Wallet', price: 2500, category: 'Fashion', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500', sellerEmail: 'Maheshi@example.com', rating: 4.5 },
        { title: 'Stainless Steel Insulated Water Bottle', price: 3200, category: 'Home & Living', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', sellerEmail: 'diniduravishka649@gmail.com', rating: 4.7 }
      ]);
      console.log('Initial mega products seeded successfully!');
    }
  } catch (err) {
    console.error('Error in database seeding:', err);
  }
}

// --- API ROUTES ---

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) return res.status(400).json({ error: 'Email already registered!' });
   
    const assignedRole = (role === 'seller') ? 'seller' : 'buyer';
    const newUser = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      role: assignedRole
    });
    await newUser.save();
    res.json({ success: true, message: 'Registration successful!' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const loginInput = req.body.email ? req.body.email.trim() : '';
    const passwordInput = req.body.password ? req.body.password.trim() : '';
   
    const user = await User.findOne({
      $or: [
        { email: loginInput.toLowerCase() },
        { name: loginInput }
      ],
      password: passwordInput
    });
   
    if (!user) return res.status(400).json({ error: 'Invalid username/email or password!' });
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

app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const buyerCount = await User.countDocuments({ role: 'buyer' });
    const sellerCount = await User.countDocuments({ role: 'seller' });
    const adminCount = await User.countDocuments({ role: 'admin' });
   
    const products = await Product.find({});
    const orders = await Order.find({});

    res.json({
      totalUsers,
      buyerCount,
      sellerCount,
      adminCount,
      productCount: products.length,
      products,
      orders
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// --- FRONTEND UI ---
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
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
            body { font-family: 'Poppins', sans-serif; }
        </style>
    </head>
    <body class="bg-gray-100 text-gray-800">

        <!-- Top Announcement Bar -->
        <div class="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white text-xs py-2 px-6 flex justify-between items-center shadow-inner">
            <div class="flex items-center gap-2">
                <span class="bg-yellow-400 text-orange-950 px-2 py-0.5 rounded font-extrabold animate-pulse">MEGA SALE</span>
                <span>🔥 දිවයින පුරා බෙදාහැරීම සහ PayHere / COD පහසුකම් සමඟ!</span>
            </div>
            <div class="flex space-x-6 items-center font-medium">
                <span id="userDisplay" class="text-yellow-200"></span>
                <button id="authBtn" onclick="openAuthModal()" class="bg-white text-orange-600 px-3 py-1 rounded-full font-bold hover:bg-yellow-300 hover:text-orange-900 transition shadow">Login / Register</button>
                <button id="logoutBtn" onclick="logout()" class="hidden bg-red-600 text-white px-3 py-1 rounded-full font-bold hover:bg-red-700 transition">Logout</button>
            </div>
        </div>

        <!-- Sticky Mega Header -->
        <header id="mainHeader" class="bg-orange-500 text-white shadow-lg sticky top-0 z-50">
            <div class="container mx-auto px-6 py-3 flex items-center justify-between gap-4">
                <a href="/" class="text-3xl font-black tracking-wider flex items-center gap-2 drop-shadow">
                    <div class="bg-white text-orange-600 p-2 rounded-xl shadow"><i class="fa-solid fa-store"></i></div>
                    KADEE<span class="text-yellow-300">.LK</span>
                </a>
               
                <div class="flex-1 max-w-3xl relative hidden md:block" id="searchBarContainer">
                    <input type="search" id="searchInput" autocomplete="off" placeholder="Search for products, brands and categories in KADEE.LK..." class="w-full py-3 px-5 rounded-l-xl text-gray-800 focus:outline-none shadow-inner font-medium">
                    <button onclick="searchProducts()" class="absolute right-0 top-0 bg-yellow-400 text-orange-950 px-8 py-3 rounded-r-xl font-extrabold hover:bg-yellow-300 transition shadow">
                        <i class="fa-solid fa-search"></i>
                    </button>
                </div>

                <div class="flex items-center space-x-4">
                    <button id="adminDashboardBtn" onclick="openAdminModal()" class="hidden bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-xl font-bold text-sm shadow transition flex items-center gap-2">
                        <i class="fa-solid fa-gauge-high"></i> Admin Panel
                    </button>
                    <button id="sellerDashboardBtn" onclick="openSellerModal()" class="hidden bg-yellow-300 hover:bg-yellow-400 text-orange-950 px-4 py-2 rounded-xl font-bold text-sm shadow transition flex items-center gap-2">
                        <i class="fa-solid fa-box-archive"></i> Seller Hub
                    </button>
                    <div id="cartIconWrapper" class="relative cursor-pointer flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-xl transition shadow" onclick="toggleCart()">
                        <i class="fa-solid fa-cart-shopping text-xl"></i>
                        <span id="cartCount" class="bg-yellow-300 text-orange-950 rounded-full px-2 py-0.5 text-xs font-black">0</span>
                        <span class="hidden lg:inline font-bold">Cart</span>
                    </div>
                </div>
            </div>
        </header>

        <!-- Categories Bar -->
        <nav id="categoriesNav" class="bg-white shadow-sm border-b sticky top-[68px] z-40">
            <div class="container mx-auto px-6 py-2.5 flex space-x-8 overflow-x-auto text-sm font-bold text-gray-700">
                <button onclick="filterCategory('All')" class="hover:text-orange-600 whitespace-nowrap flex items-center gap-1.5"><i class="fa-solid fa-fire text-orange-500"></i> All Categories</button>
                <button onclick="filterCategory('Electronics')" class="hover:text-orange-600 whitespace-nowrap flex items-center gap-1.5"><i class="fa-solid fa-laptop"></i> Electronics</button>
                <button onclick="filterCategory('Fashion')" class="hover:text-orange-600 whitespace-nowrap flex items-center gap-1.5"><i class="fa-solid fa-shirt"></i> Fashion & Clothing</button>
                <button onclick="filterCategory('Home & Living')" class="hover:text-orange-600 whitespace-nowrap flex items-center gap-1.5"><i class="fa-solid fa-house-chimney"></i> Home & Living</button>
                <button onclick="filterCategory('Beauty')" class="hover:text-orange-600 whitespace-nowrap flex items-center gap-1.5"><i class="fa-solid fa-spa"></i> Beauty & Health</button>
            </div>
        </nav>

        <!-- Admin Direct Full-Screen Dashboard (Shown immediately when Admin logs in) -->
        <div id="adminDirectDashboard" class="hidden container mx-auto px-6 my-8">
            <div class="bg-white p-8 rounded-3xl shadow-2xl border border-purple-100">
                <div class="flex justify-between items-center mb-6 pb-4 border-b">
                    <h3 class="text-3xl font-black text-purple-700 flex items-center gap-3"><i class="fa-solid fa-shield-halved"></i> KADEE.LK Master Admin Control Center</h3>
                    <div class="flex items-center gap-3">
                        <span class="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full font-bold text-xs">🔒 Biometric & Face ID Secured</span>
                        <button onclick="logout()" class="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-700 transition">Logout Admin</button>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
                    <div class="bg-purple-50 p-6 rounded-2xl border border-purple-100 text-center shadow-sm">
                        <h4 class="text-gray-600 font-semibold text-xs uppercase">Total Users</h4>
                        <p id="directAdminTotalUsers" class="text-4xl font-black text-purple-700 mt-2">0</p>
                    </div>
                    <div class="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center shadow-sm">
                        <h4 class="text-gray-600 font-semibold text-xs uppercase">Total Buyers</h4>
                        <p id="directAdminBuyerCount" class="text-4xl font-black text-blue-700 mt-2">0</p>
                    </div>
                    <div class="bg-amber-50 p-6 rounded-2xl border border-amber-100 text-center shadow-sm">
                        <h4 class="text-gray-600 font-semibold text-xs uppercase">Total Sellers</h4>
                        <p id="directAdminSellerCount" class="text-4xl font-black text-amber-600 mt-2">0</p>
                    </div>
                    <div class="bg-orange-50 p-6 rounded-2xl border border-orange-100 text-center shadow-sm">
                        <h4 class="text-gray-600 font-semibold text-xs uppercase">Total Products</h4>
                        <p id="directAdminProdCount" class="text-4xl font-black text-orange-600 mt-2">0</p>
                    </div>
                </div>

                <!-- Growth Analytics Bar Charts -->
                <div class="bg-gray-50 p-8 rounded-2xl border border-gray-200 mb-8 shadow-inner">
                    <h4 class="font-black text-lg mb-6 text-gray-900 flex items-center gap-2"><i class="fa-solid fa-chart-bar text-purple-600"></i> Marketplace Registration Growth Bar Charts</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="bg-white p-6 rounded-xl border shadow-sm">
                            <div class="flex justify-between font-bold text-sm text-gray-700 mb-2">
                                <span>Buyer Registration Bar</span>
                                <span id="directBuyerRatioText" class="text-blue-600 font-black">0%</span>
                            </div>
                            <div class="w-full bg-gray-100 rounded-full h-6 overflow-hidden flex">
                                <div id="directBuyerBar" class="bg-blue-600 h-6 rounded-full transition-all duration-700 flex items-center justify-end pr-3 text-white text-xs font-bold" style="width: 0%"></div>
                            </div>
                        </div>
                        <div class="bg-white p-6 rounded-xl border shadow-sm">
                            <div class="flex justify-between font-bold text-sm text-gray-700 mb-2">
                                <span>Seller Registration Bar</span>
                                <span id="directSellerRatioText" class="text-amber-600 font-black">0%</span>
                            </div>
                            <div class="w-full bg-gray-100 rounded-full h-6 overflow-hidden flex">
                                <div id="directSellerBar" class="bg-amber-500 h-6 rounded-full transition-all duration-700 flex items-center justify-end pr-3 text-white text-xs font-bold" style="width: 0%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Customer Orders -->
                <h4 class="font-black text-xl mb-4 text-gray-900 flex items-center gap-2"><i class="fa-solid fa-receipt text-green-600"></i> Recent Customer Orders (PayHere & COD)</h4>
                <div id="directAdminOrdersList" class="space-y-3 text-sm">
                    <p class="text-gray-400">Loading orders...</p>
                </div>
            </div>
        </div>

        <!-- Hero Banner -->
        <div id="heroBanner" class="container mx-auto px-6 mt-6">
            <div class="bg-gradient-to-r from-gray-900 via-orange-900 to-orange-600 rounded-2xl p-8 md:p-12 text-white shadow-2xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
                <div class="absolute -right-10 -bottom-10 opacity-10 text-9xl">🛍️</div>
                <div class="z-10 max-w-xl">
                    <span class="bg-yellow-400 text-orange-950 text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider">Sri Lanka's #1 Marketplace</span>
                    <h1 class="text-3xl md:text-5xl font-black mt-3 mb-4 leading-tight">Shop Smart, Live Better with KADEE.LK</h1>
                    <p class="text-gray-200 mb-6 font-light">Experience lightning-fast delivery, secured PayHere online checkout, and trusted local vendors all in one mega platform.</p>
                    <div class="flex gap-4">
                        <button onclick="window.scrollTo({top: 600, behavior: 'smooth'})" class="bg-yellow-400 text-orange-950 font-extrabold px-8 py-3 rounded-xl shadow-lg hover:bg-yellow-300 transition">Start Shopping</button>
                        <button onclick="openAuthModal()" class="border-2 border-white text-white font-bold px-6 py-3 rounded-xl hover:bg-white hover:text-gray-900 transition">Join as Seller</button>
                    </div>
                </div>
                <div class="mt-8 md:mt-0 z-10 text-center bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl">
                    <div class="text-yellow-300 font-black text-2xl">🔥 FLASH SALE</div>
                    <p class="text-sm text-gray-200 mt-1">Up to 60% OFF on Top Electronics</p>
                    <div class="mt-4 flex gap-2 justify-center font-mono text-lg font-bold">
                        <span class="bg-black/50 px-3 py-1 rounded">08</span>:
                        <span class="bg-black/50 px-3 py-1 rounded">45</span>:
                        <span class="bg-black/50 px-3 py-1 rounded">22</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dynamic Marketplace Info Banner for Logged Users -->
        <div id="roleInfoBanner" class="container mx-auto px-6 mt-6 hidden">
            <div id="buyerBanner" class="hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
                <div>
                    <h3 class="text-xl font-black flex items-center gap-2"><i class="fa-solid fa-bag-shopping"></i> Welcome to Your Buyer Hub!</h3>
                    <p class="text-sm text-blue-100 mt-1">Enjoy lightning-fast islandwide delivery, verified local sellers, secure PayHere payments, and 24/7 buyer protection on KADEE.LK.</p>
                </div>
                <span class="bg-yellow-400 text-blue-950 px-4 py-2 rounded-xl font-extrabold text-sm shadow">VIP Buyer</span>
            </div>
            <div id="sellerBanner" class="hidden bg-gradient-to-r from-amber-600 to-orange-700 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
                <div>
                    <h3 class="text-xl font-black flex items-center gap-2"><i class="fa-solid fa-store"></i> Welcome to Seller Hub & Vendor Dashboard!</h3>
                    <p class="text-sm text-amber-100 mt-1">Manage your inventory, publish trending products instantly to thousands of Sri Lankan buyers, and track your sales performance in real-time.</p>
                </div>
                <button onclick="openSellerModal()" class="bg-white text-orange-950 px-4 py-2 rounded-xl font-extrabold text-sm shadow hover:bg-yellow-300 transition">Publish Product</button>
            </div>
        </div>

        <!-- Main Product Grid -->
        <main id="mainProductSection" class="container mx-auto px-6 my-10">
            <div class="flex justify-between items-center mb-6 border-b pb-3">
                <h2 class="text-2xl font-black text-gray-900 flex items-center gap-2"><i class="fa-solid fa-bolt text-orange-500"></i> Flash Sale & Trending Items</h2>
                <span class="text-sm font-semibold text-gray-500">Showing curated mega collection</span>
            </div>
           
            <div id="productGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div class="text-center col-span-full py-16 text-gray-400 font-medium">Loading mega marketplace...</div>
            </div>
        </main>

        <!-- Auth Modal -->
        <div id="authModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden z-50 flex justify-center items-center p-4">
            <div class="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl relative transform transition-all">
                <button onclick="closeAuthModal()" class="absolute top-4 right-4 text-gray-400 hover:text-black font-bold text-2xl">&times;</button>
                <h3 id="authTitle" class="text-2xl font-black mb-6 text-gray-900">Login to KADEE.LK</h3>
               
                <div id="registerFields" class="hidden space-y-4 mb-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-1">Full Name</label>
                        <input type="text" id="regName" placeholder="Dinidu ravishka" class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-1">Account Role</label>
                        <select id="regRole" class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium">
                            <option value="buyer">Buyer (Customer)</option>
                            <option value="seller">Seller (Vendor Hub)</option>
                        </select>
                    </div>
                </div>

                <div class="space-y-4 mb-6">
                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-1" id="authLabelEmail">Username / Email Address</label>
                        <input type="text" id="authEmail" autocomplete="username" placeholder="Dinidu ravishka" class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-1">Password</label>
                        <input type="password" id="authPassword" autocomplete="current-password" placeholder="••••••••" class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                    </div>
                </div>
                <button onclick="handleAuthSubmit()" id="authSubmitBtn" class="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg">Login</button>
                <p class="text-sm text-center mt-6 text-gray-600">
                    <span id="authToggleText">Don't have an account?</span>
                    <button onclick="toggleAuthMode()" class="text-orange-600 font-extrabold underline ml-1">Register here</button>
                </p>
            </div>
        </div>

        <!-- Seller Hub Modal -->
        <div id="sellerModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden z-50 flex justify-center items-center p-4">
            <div class="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
                <button onclick="openSellerModal()" class="absolute top-4 right-4 text-gray-400 hover:text-black font-bold text-2xl">&times;</button>
                <h3 class="text-2xl font-black mb-6 text-orange-600 flex items-center gap-2"><i class="fa-solid fa-box-open"></i> Seller Hub</h3>
                <div class="space-y-4 mb-6">
                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-1">Product Title</label>
                        <input type="text" id="prodTitle" placeholder="e.g. Wireless Gaming Headset" class="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-1">Price (LKR)</label>
                        <input type="number" id="prodPrice" placeholder="4500" class="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-1">Category</label>
                        <input type="text" id="prodCategory" placeholder="Electronics / Fashion / Home" class="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-1">Image URL</label>
                        <input type="text" id="prodImage" placeholder="https://images.unsplash.com/..." class="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500">
                    </div>
                </div>
                <button onclick="addNewProduct()" class="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg">Publish Product</button>
            </div>
        </div>

        <!-- Admin Dashboard Modal (Fallback/Manual trigger if needed) -->
        <div id="adminModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden z-50 flex justify-center items-center p-4">
            <div class="bg-white p-8 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                <button onclick="openAdminModal()" class="absolute top-4 right-4 text-gray-400 hover:text-black font-bold text-2xl">&times;</button>
                <h3 class="text-2xl font-black mb-6 text-purple-700 flex items-center gap-2"><i class="fa-solid fa-gauge-high"></i> Admin Dashboard & Analytics</h3>
               
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                    <div class="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-center">
                        <h4 class="text-gray-600 font-semibold text-xs uppercase">Total Users</h4>
                        <p id="adminTotalUsers" class="text-3xl font-black text-purple-700 mt-1">0</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                        <h4 class="text-gray-600 font-semibold text-xs uppercase">Total Buyers</h4>
                        <p id="adminBuyerCount" class="text-3xl font-black text-blue-700 mt-1">0</p>
                    </div>
                    <div class="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
                        <h4 class="text-gray-600 font-semibold text-xs uppercase">Total Sellers</h4>
                        <p id="adminSellerCount" class="text-3xl font-black text-amber-600 mt-1">0</p>
                    </div>
                    <div class="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center">
                        <h4 class="text-gray-600 font-semibold text-xs uppercase">Total Products</h4>
                        <p id="adminProdCount" class="text-3xl font-black text-orange-600 mt-1">0</p>
                    </div>
                </div>

                <h4 class="font-bold text-lg mb-4 text-gray-900">Recent Customer Orders (PayHere & COD)</h4>
                <div id="adminOrdersList" class="space-y-3 text-sm">
                    <p class="text-gray-400">Loading orders...</p>
                </div>
            </div>
        </div>

        <!-- Cart Sidebar -->
        <div id="cartModal" class="fixed right-0 top-0 w-full max-w-md h-full bg-white shadow-2xl z-50 transform translate-x-full transition-transform duration-300 p-6 flex flex-col">
            <div class="flex justify-between items-center border-b pb-4">
                <h3 class="text-xl font-black text-gray-900 flex items-center gap-2"><i class="fa-solid fa-cart-shopping text-orange-600"></i> Shopping Cart</h3>
                <button onclick="toggleCart()" class="text-gray-400 hover:text-black font-bold text-2xl">&times;</button>
            </div>
            <div id="cartItems" class="flex-1 overflow-y-auto py-4 space-y-4">
                <p class="text-gray-400 text-center py-8">Your cart is currently empty.</p>
            </div>
            <div class="border-t pt-4 space-y-4">
                <div class="flex justify-between font-black text-xl">
                    <span>Subtotal:</span>
                    <span id="cartTotal" class="text-orange-600">LKR 0</span>
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-600 mb-1">Select Checkout Payment Method:</label>
                    <select id="paymentMethod" class="w-full p-3 border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500 outline-none">
                        <option value="PayHere">PayHere Secured Online Gateway</option>
                        <option value="COD">Cash on Delivery (COD)</option>
                    </select>
                </div>
                <button onclick="checkout()" class="w-full bg-orange-600 text-white py-3.5 rounded-xl font-black hover:bg-orange-700 transition shadow-lg">Proceed to Checkout</button>
            </div>
        </div>

        <!-- Frontend JavaScript -->
        <script>
            let products = [];
            let cart = [];
            let currentUser = JSON.parse(localStorage.getItem('kadee_user')) || null;
            let isRegisterMode = false;

            async function updateUIState() {
                const adminBtn = document.getElementById('adminDashboardBtn');
                const sellerBtn = document.getElementById('sellerDashboardBtn');
                const roleBanner = document.getElementById('roleInfoBanner');
                const buyerBanner = document.getElementById('buyerBanner');
                const sellerBanner = document.getElementById('sellerBanner');
                const directAdminDashboard = document.getElementById('adminDirectDashboard');
                const heroBanner = document.getElementById('heroBanner');
                const mainProductSection = document.getElementById('mainProductSection');
                const categoriesNav = document.getElementById('categoriesNav');
                const searchBarContainer = document.getElementById('searchBarContainer');
                const cartIconWrapper = document.getElementById('cartIconWrapper');
               
                adminBtn.classList.add('hidden');
                sellerBtn.classList.add('hidden');
                roleBanner.classList.add('hidden');
                buyerBanner.classList.add('hidden');
                sellerBanner.classList.add('hidden');
                directAdminDashboard.classList.add('hidden');

                if (currentUser) {
                    document.getElementById('userDisplay').innerText = \`👤 \${currentUser.name} (\${currentUser.role})\`;
                    document.getElementById('authBtn').classList.add('hidden');
                    document.getElementById('logoutBtn').classList.remove('hidden');

                    if (currentUser.role === 'admin') {
                        // Hide regular marketplace sections and display full Admin Direct Dashboard
                        heroBanner.classList.add('hidden');
                        mainProductSection.classList.add('hidden');
                        categoriesNav.classList.add('hidden');
                        searchBarContainer.classList.add('hidden');
                        cartIconWrapper.classList.add('hidden');
                        directAdminDashboard.classList.remove('hidden');
                        loadAdminDirectStats();
                    } else {
                        roleBanner.classList.remove('hidden');
                        if (currentUser.role === 'buyer') {
                            buyerBanner.classList.remove('hidden');
                        } else if (currentUser.role === 'seller') {
                            sellerBtn.classList.remove('hidden');
                            sellerBanner.classList.remove('hidden');
                        }
                    }
                } else {
                    document.getElementById('userDisplay').innerText = '';
                    document.getElementById('authBtn').classList.remove('hidden');
                    document.getElementById('logoutBtn').classList.add('hidden');
                }
            }

            async function loadAdminDirectStats() {
                try {
                    const res = await fetch('/api/admin/stats');
                    const stats = await res.json();
                   
                    document.getElementById('directAdminTotalUsers').innerText = stats.totalUsers;
                    document.getElementById('directAdminBuyerCount').innerText = stats.buyerCount;
                    document.getElementById('directAdminSellerCount').innerText = stats.sellerCount;
                    document.getElementById('directAdminProdCount').innerText = stats.productCount;

                    const totalRegs = stats.buyerCount + stats.sellerCount;
                    const buyerPct = totalRegs > 0 ? Math.round((stats.buyerCount / totalRegs) * 100) : 0;
                    const sellerPct = totalRegs > 0 ? Math.round((stats.sellerCount / totalRegs) * 100) : 0;

                    document.getElementById('directBuyerRatioText').innerText = buyerPct + '% (' + stats.buyerCount + ' Buyers)';
                    document.getElementById('directBuyerBar').style.width = buyerPct + '%';
                    document.getElementById('directBuyerBar').innerText = buyerPct + '%';

                    document.getElementById('directSellerRatioText').innerText = sellerPct + '% (' + stats.sellerCount + ' Sellers)';
                    document.getElementById('directSellerBar').style.width = sellerPct + '%';
                    document.getElementById('directSellerBar').innerText = sellerPct + '%';

                    const ordersList = document.getElementById('directAdminOrdersList');
                    if (stats.orders.length === 0) {
                        ordersList.innerHTML = '<p class="text-gray-400">No orders received yet.</p>';
                    } else {
                        ordersList.innerHTML = stats.orders.map(o => \`
                            <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                                <div>
                                    <span class="font-black text-xs text-purple-700">Buyer: \${o.buyerEmail}</span>
                                    <p class="text-xs text-gray-600 mt-0.5">Total: <b>LKR \${o.totalAmount.toLocaleString()}</b> via \${o.paymentMethod}</p>
                                </div>
                                <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-extrabold">\${o.status}</span>
                            </div>
                        \`).join('');
                    }
                } catch(err) {
                    console.error('Failed to load admin stats', err);
                }
            }

            async function fetchProducts() {
                try {
                    const res = await fetch('/api/products');
                    products = await res.json();
                    if (!currentUser || currentUser.role !== 'admin') {
                        displayProducts(products);
                    }
                } catch (err) {
                    console.error('Error fetching products', err);
                }
            }

            function displayProducts(items) {
                const grid = document.getElementById('productGrid');
                if (!items || items.length === 0) {
                    grid.innerHTML = '<p class="col-span-full text-center text-gray-400 py-12">No products available in this category.</p>';
                    return;
                }
                grid.innerHTML = items.map(p => \`
                    <div class="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-4 flex flex-col justify-between border border-gray-100 group">
                        <div>
                            <div class="relative overflow-hidden rounded-xl mb-3 bg-gray-100">
                                <img src="\${p.image}" alt="\${p.title}" class="w-full h-52 object-cover group-hover:scale-105 transition duration-300">
                                <span class="absolute top-2 left-2 bg-orange-600 text-white text-[10px] uppercase font-black px-2.5 py-1 rounded-full shadow">\${p.category}</span>
                            </div>
                            <h3 class="font-bold text-gray-900 mt-2 text-sm md:text-base line-clamp-2">\${p.title}</h3>
                            <div class="flex items-center gap-1 text-yellow-500 text-xs mt-1.5 font-semibold">
                                <span>⭐ \${p.rating}</span>
                                <span class="text-gray-400">(\${p.reviews ? p.reviews.length : 0} reviews)</span>
                            </div>
                        </div>
                        <div class="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                            <div>
                                <span class="text-[10px] text-gray-400 block font-medium">Price</span>
                                <div class="text-orange-600 font-black text-lg">LKR \${p.price.toLocaleString()}</div>
                            </div>
                            <button onclick="addToCart('\${p._id}')" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow transition flex items-center gap-1.5">
                                <i class="fa-solid fa-cart-plus"></i> Add
                            </button>
                        </div>
                    </div>
                \`).join('');
            }

            function filterCategory(cat) {
                if (cat === 'All') {
                    displayProducts(products);
                } else {
                    const filtered = products.filter(p => p.category.toLowerCase().includes(cat.toLowerCase()));
                    displayProducts(filtered);
                }
            }

            function openAuthModal() {
                document.getElementById('authEmail').value = '';
                document.getElementById('authPassword').value = '';
                document.getElementById('authModal').classList.remove('hidden');
            }
           
            function closeAuthModal() { document.getElementById('authModal').classList.add('hidden'); }
           
            function toggleAuthMode() {
                isRegisterMode = !isRegisterMode;
                document.getElementById('authTitle').innerText = isRegisterMode ? 'Create KADEE.LK Account' : 'Login to KADEE.LK';
                document.getElementById('registerFields').classList.toggle('hidden');
                document.getElementById('authSubmitBtn').innerText = isRegisterMode ? 'Register Now' : 'Login';
                document.getElementById('authToggleText').innerText = isRegisterMode ? 'Already have an account?' : "Don't have an account?";
               
                if (isRegisterMode) {
                    document.getElementById('authLabelEmail').innerText = 'Email Address';
                    document.getElementById('authEmail').placeholder = 'Maheshi@example.com';
                } else {
                    document.getElementById('authLabelEmail').innerText = 'Username / Email Address';
                    document.getElementById('authEmail').placeholder = 'Dinidu ravishka';
                }

                document.getElementById('authEmail').value = '';
                document.getElementById('authPassword').value = '';
            }

            async function handleAuthSubmit() {
                const email = document.getElementById('authEmail').value.trim();
                const password = document.getElementById('authPassword').value.trim();
                if (!email || !password) { alert('Please enter username/email and password!'); return; }

                if (isRegisterMode) {
                    const name = document.getElementById('regName').value.trim();
                    const role = document.getElementById('regRole').value;
                    const res = await fetch('/api/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, password, role })
                    });
                    const data = await res.json();
                    if (data.success) { alert('Registration successful! Please login.'); toggleAuthMode(); }
                    else { alert(data.error || 'Registration failed'); }
                } else {
                    const res = await fetch('/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    const data = await res.json();
                    if (data.success) {
                        const userObj = data.user;
                       
                        // If Admin, simulate Biometric / Face ID / Fingerprint verification for high security
                        if (userObj.role === 'admin') {
                            if (window.PublicKeyCredential) {
                                try {
                                    alert('🔐 KADEE.LK Security: Please verify your Fingerprint or Face ID for Admin Access.');
                                    // Simulated WebAuthn prompt or native confirmation
                                } catch(e) {}
                            }
                            const bioConfirm = confirm('🔒 Biometric Verification: Confirm Admin Face ID / Fingerprint Scan for ' + userObj.name + '?');
                            if (!bioConfirm) {
                                alert('Biometric verification cancelled. Login aborted.');
                                return;
                            }
                        }

                        currentUser = userObj;
                        localStorage.setItem('kadee_user', JSON.stringify(currentUser));
                        closeAuthModal();
                        updateUIState();
                        alert('Welcome back, ' + currentUser.name + '!');
                        window.location.reload();
                    } else { alert(data.error || 'Invalid username/email or password!'); }
                }
            }

            function logout() {
                currentUser = null;
                localStorage.removeItem('kadee_user');
                updateUIState();
                alert('Logged out successfully.');
                window.location.reload();
            }

            function openSellerModal() {
                if (!currentUser || (currentUser.role !== 'seller' && currentUser.role !== 'admin')) {
                    alert('Access Denied! Sellers only.');
                    return;
                }
                document.getElementById('sellerModal').classList.toggle('hidden');
            }

            async function addNewProduct() {
                const title = document.getElementById('prodTitle').value;
                const price = Number(document.getElementById('prodPrice').value);
                const category = document.getElementById('prodCategory').value;
                const image = document.getElementById('prodImage').value;
                if (!title || !price || !category || !image) { alert('Please fill in all product details!'); return; }
               
                const res = await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, price, category, image, sellerEmail: currentUser.email })
                });
                const data = await res.json();
                if (data.success) {
                    alert('Product published successfully on KADEE.LK!');
                    openSellerModal();
                    fetchProducts();
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
                    container.innerHTML = '<p class="text-gray-400 text-center py-8">Your cart is currently empty.</p>';
                    document.getElementById('cartTotal').innerText = 'LKR 0';
                    return;
                }
                let total = 0;
                container.innerHTML = cart.map((item, index) => {
                    total += item.price;
                    return \`
                        <div class="flex justify-between items-center bg-gray-50 p-3 rounded-xl border">
                            <div class="flex items-center gap-3">
                                <img src="\${item.image}" class="w-12 h-12 object-cover rounded-lg">
                                <div>
                                    <h4 class="font-bold text-sm line-clamp-1">\${item.title}</h4>
                                    <span class="text-orange-600 font-extrabold text-xs">LKR \${item.price.toLocaleString()}</span>
                                </div>
                            </div>
                            <button onclick="removeFromCart(\--index)" class="text-red-500 hover:text-red-700 p-2"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    \`;
                }).join('');
                document.getElementById('cartTotal').innerText = 'LKR ' + total.toLocaleString();
            }

            function removeFromCart(index) { cart.splice(index, 1); updateCartUI(); }
            function toggleCart() { document.getElementById('cartModal').classList.toggle('translate-x-full'); }

            async function checkout() {
                if (!currentUser) { alert('Please login or register to complete your checkout!'); openAuthModal(); return; }
                if (cart.length === 0) { alert('Your cart is empty!'); return; }
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
                        alert('Redirecting to PayHere secure payment gateway simulation... Order Successful!');
                    } else {
                        alert('Order placed successfully via Cash on Delivery (COD)!');
                    }
                    cart = [];
                    updateCartUI();
                    toggleCart();
                } else {
                    alert('Checkout failed. Please try again.');
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
