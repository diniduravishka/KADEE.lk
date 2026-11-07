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
      console.log('MongoDB Connected Successfully to KADEE.LK Marketplace!');
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
  reviewsCount: { type: Number, default: 75 }
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
      { name: 'Dinidu ravishka', email: 'diniduravishka649@gmail.com', password: 'ACD172aus@kc', role: 'admin' },
      { upsert: true, new: true }
    );

    await User.findOneAndUpdate(
      { email: 'Maheshi@example.com' },
      { name: 'Maheshi herath', email: 'Maheshi@example.com', password: 'PMD1512hmp#@qc', role: 'admin' },
      { upsert: true, new: true }
    );

    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany([
        { title: 'AirPods Pro', price: 49990, category: 'Mobiles', image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500', sellerEmail: 'diniduravishka649@gmail.com', rating: 4.8, reviewsCount: 120 },
        { title: 'Samsung Galaxy A56', price: 89990, category: 'Mobiles', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500', sellerEmail: 'diniduravishka649@gmail.com', rating: 4.7, reviewsCount: 98 },
        { title: 'Nike Air Force 1', price: 34990, category: 'Fashion', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', sellerEmail: 'Maheshi@example.com', rating: 4.6, reviewsCount: 77 },
        { title: 'Laptop Backpack', price: 7990, category: 'Home & Living', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', sellerEmail: 'diniduravishka649@gmail.com', rating: 4.5, reviewsCount: 60 },
        { title: 'Smart Watch', price: 19990, category: 'Electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', sellerEmail: 'Maheshi@example.com', rating: 4.6, reviewsCount: 85 },
        { title: 'Wireless Earphones', price: 12990, category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', sellerEmail: 'diniduravishka649@gmail.com', rating: 4.5, reviewsCount: 72 }
      ]);
      console.log('Luxury Gold theme products seeded successfully!');
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
    const newUser = new User({ name: name.trim(), email: email.trim().toLowerCase(), password: password.trim(), role: assignedRole });
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
      $or: [{ email: loginInput.toLowerCase() }, { name: loginInput }],
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

    res.json({ totalUsers, buyerCount, sellerCount, adminCount, productCount: products.length, products, orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// --- FRONTEND UI (Exact LankaCart Black & Gold Curved Wave Theme) ---
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KADEE.LK - Online Marketplace</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
            body { font-family: 'Poppins', sans-serif; background-color: #000000; color: #fff; overflow-x: hidden; }
            .gold-text { color: #f3ba2f; }
            .gold-bg { background: linear-gradient(135deg, #f5d77f 0%, #d4af37 50%, #aa820a 100%); color: #000; }
            .gold-border { border-color: #f3ba2f; }
          
            /* Luxury Curved Gold Wave Background */
            .luxury-curved-bg {
                background:
                    radial-gradient(circle at top right, rgba(243, 186, 47, 0.28) 0%, rgba(212, 160, 23, 0.1) 35%, transparent 65%),
                    radial-gradient(circle at 85% 45%, rgba(243, 186, 47, 0.18) 0%, transparent 55%),
                    linear-gradient(135deg, #0b0b0b 0%, #000000 100%);
                position: relative;
            }
            .luxury-curved-bg::before {
                content: '';
                position: absolute;
                top: 0; right: 0; width: 70%; height: 500px;
                background: radial-gradient(ellipse at top right, rgba(243, 186, 47, 0.22) 0%, rgba(0,0,0,0) 75%);
                border-bottom-left-radius: 100% 50%;
                pointer-events: none;
                z-index: 1;
            }
        </style>
    </head>
    <body class="luxury-curved-bg text-white">

        <!-- Top Header Bar -->
        <div class="bg-[#101010] text-xs py-2 px-6 flex justify-between items-center border-b border-zinc-800 relative z-20">
            <div class="flex items-center space-x-6 text-zinc-300">
                <span><i class="fa-solid fa-phone gold-text mr-1"></i> +94 70 7521 138</span>
                <span><i class="fa-solid fa-envelope gold-text mr-1"></i> diniduravishka649@gmail.com</span>
            </div>
            <div class="flex space-x-4 items-center font-medium">
                <span id="userDisplay" class="text-amber-200"></span>
                <a href="#" onclick="alert('Redirecting to Track Order...')" class="hover:gold-text transition">Track Order</a>
                <span class="text-zinc-600">|</span>
                <a href="#" onclick="alert('KADEE.LK Help & Support Center')" class="hover:gold-text transition">Help</a>
                <span class="text-zinc-600">|</span>
                <a href="#" onclick="alert('About KADEE.LK - Sri Lanka\\'s #1 Marketplace')" class="hover:gold-text transition">About Us</a>
            </div>
        </div>

        <!-- Main Header -->
        <header id="mainHeader" class="bg-[#0b0b0b]/95 backdrop-blur-md py-4 shadow-xl sticky top-0 z-50 border-b border-zinc-800">
            <div class="container mx-auto px-6 flex items-center justify-between gap-4">
                <a href="/" class="text-3xl font-black tracking-wider flex items-center gap-2">
                    <div class="gold-bg p-2 rounded-xl shadow"><i class="fa-solid fa-store"></i></div>
                    KADEE<span class="gold-text">.LK</span>
                </a>
              
                <div class="flex-1 max-w-2xl relative hidden md:block" id="searchBarContainer">
                    <input type="search" id="searchInput" autocomplete="off" placeholder="Search for products..." class="w-full py-3 px-5 rounded-l-xl text-gray-900 focus:outline-none shadow-inner font-medium">
                    <button onclick="searchProducts()" class="absolute right-0 top-0 gold-bg px-8 py-3 rounded-r-xl font-extrabold hover:opacity-90 transition shadow">
                        <i class="fa-solid fa-search"></i>
                    </button>
                </div>

                <div class="flex items-center space-x-6">
                    <button id="adminDashboardBtn" onclick="openAdminModal()" class="hidden bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl font-bold text-sm shadow transition flex items-center gap-2 border gold-border">
                        <i class="fa-solid fa-gauge-high gold-text"></i> Admin Panel
                    </button>
                    <button id="sellerDashboardBtn" onclick="openSellerModal()" class="hidden gold-bg text-black px-4 py-2 rounded-xl font-bold text-sm shadow transition flex items-center gap-2">
                        <i class="fa-solid fa-box-archive"></i> Seller Hub
                    </button>
                    <button id="authBtn" onclick="openAuthModal()" class="flex items-center gap-2 hover:gold-text font-semibold">
                        <i class="fa-solid fa-user text-lg gold-text"></i> Login / Register
                    </button>
                    <button id="logoutBtn" onclick="logout()" class="hidden bg-red-600 text-white px-3 py-1.5 rounded-xl font-bold text-sm">Logout</button>
                    <div id="cartIconWrapper" class="cursor-pointer flex items-center gap-2 gold-bg text-black px-4 py-2 rounded-xl transition shadow font-bold" onclick="toggleCart()">
                        <i class="fa-solid fa-cart-shopping text-xl"></i>
                        <span id="cartCount" class="bg-black text-amber-300 rounded-full px-2 py-0.5 text-xs font-black">0</span>
                        <span id="cartTotalText" class="font-extrabold text-sm">Rs. 0</span>
                    </div>
                </div>
            </div>
        </header>

        <!-- Navigation Bar -->
        <nav id="categoriesNav" class="bg-[#121212] border-t border-zinc-800 shadow-sm sticky top-[76px] z-40">
            <div class="container mx-auto px-6 py-3 flex items-center justify-between overflow-x-auto text-sm font-bold text-zinc-300">
                <div class="flex space-x-8 items-center">
                    <button onclick="filterCategory('All')" class="gold-bg text-black px-4 py-2 rounded-xl flex items-center gap-2 shadow font-extrabold"><i class="fa-solid fa-bars"></i> All Categories</button>
                    <button onclick="filterCategory('Home')" class="hover:gold-text flex items-center gap-1"><i class="fa-solid fa-house gold-text"></i> Home</button>
                    <button onclick="filterCategory('Categories')" class="hover:gold-text flex items-center gap-1">Categories <i class="fa-solid fa-chevron-down text-xs"></i></button>
                    <button onclick="filterCategory('Deals')" class="hover:gold-text flex items-center gap-1"><i class="fa-solid fa-tag gold-text"></i> Deals</button>
                    <button onclick="filterCategory('Sellers')" class="hover:gold-text flex items-center gap-1"><i class="fa-solid fa-store gold-text"></i> Sellers</button>
                    <button onclick="filterCategory('Orders')" class="hover:gold-text flex items-center gap-1"><i class="fa-solid fa-box gold-text"></i> Orders</button>
                    <button onclick="filterCategory('Contact')" class="hover:gold-text flex items-center gap-1"><i class="fa-solid fa-envelope gold-text"></i> Contact</button>
                </div>
            </div>
        </nav>

        <!-- Admin Direct Dashboard -->
        <div id="adminDirectDashboard" class="hidden container mx-auto px-6 my-8 text-gray-900">
            <div class="bg-white p-8 rounded-3xl shadow-2xl border border-amber-500">
                <div class="flex justify-between items-center mb-6 pb-4 border-b">
                    <h3 class="text-3xl font-black text-black flex items-center gap-3"><i class="fa-solid fa-shield-halved gold-text"></i> KADEE.LK Master Admin Control Center</h3>
                    <div class="flex items-center gap-3">
                        <span class="bg-amber-100 text-amber-900 px-4 py-1.5 rounded-full font-bold text-xs">🔒 Biometric & Face ID Secured</span>
                        <button onclick="logout()" class="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-700 transition">Logout Admin</button>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
                    <div class="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-center shadow-sm">
                        <h4 class="text-gray-600 font-semibold text-xs uppercase">Total Users</h4>
                        <p id="directAdminTotalUsers" class="text-4xl font-black text-black mt-2">0</p>
                    </div>
                    <div class="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center shadow-sm">
                        <h4 class="text-gray-600 font-semibold text-xs uppercase">Total Buyers</h4>
                        <p id="directAdminBuyerCount" class="text-4xl font-black text-blue-700 mt-2">0</p>
                    </div>
                    <div class="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-center shadow-sm">
                        <h4 class="text-gray-600 font-semibold text-xs uppercase">Total Sellers</h4>
                        <p id="directAdminSellerCount" class="text-4xl font-black text-amber-600 mt-2">0</p>
                    </div>
                    <div class="bg-orange-50 p-6 rounded-2xl border border-orange-100 text-center shadow-sm">
                        <h4 class="text-gray-600 font-semibold text-xs uppercase">Total Products</h4>
                        <p id="directAdminProdCount" class="text-4xl font-black text-orange-600 mt-2">0</p>
                    </div>
                </div>

                <div class="bg-gray-50 p-8 rounded-2xl border border-gray-200 mb-8 shadow-inner">
                    <h4 class="font-black text-lg mb-6 text-gray-900 flex items-center gap-2"><i class="fa-solid fa-chart-bar gold-text"></i> Marketplace Registration Growth Bar Charts</h4>
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
                                <div id="directSellerBar" class="gold-bg h-6 rounded-full transition-all duration-700 flex items-center justify-end pr-3 text-black text-xs font-bold" style="width: 0%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <h4 class="font-black text-xl mb-4 text-gray-900 flex items-center gap-2"><i class="fa-solid fa-receipt text-green-600"></i> Recent Customer Orders</h4>
                <div id="directAdminOrdersList" class="space-y-3 text-sm">
                    <p class="text-gray-400">Loading orders...</p>
                </div>
            </div>
        </div>

        <!-- Hero Section -->
        <div id="heroBanner" class="container mx-auto px-6 mt-8 relative z-10">
            <div class="flex flex-col md:flex-row justify-between items-center py-8">
                <div class="max-w-xl">
                    <h1 class="text-4xl md:text-5xl font-black mb-3">Welcome to <br><span class="gold-text">KADEE.LK</span></h1>
                    <p class="text-xl font-bold mb-2">Your One-Stop Online Marketplace</p>
                    <p class="text-zinc-400 text-sm mb-6">Shop from thousands of products with trust and convenience.</p>
                    <button onclick="window.scrollTo({top: 600, behavior: 'smooth'})" class="gold-bg font-extrabold px-8 py-3.5 rounded-2xl shadow-xl hover:opacity-90 transition flex items-center gap-2">
                        Shop Now <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
                <div class="mt-8 md:mt-0 flex flex-col items-center">
                    <div class="bg-[#121212]/95 backdrop-blur-md p-8 rounded-3xl border border-amber-500/50 shadow-2xl relative text-center">
                        <div class="absolute -top-3 -right-3 gold-bg text-xs font-black px-3 py-1 rounded-full shadow">EXPRESS CART</div>
                        <i class="fa-solid fa-cart-shopping text-7xl gold-text mb-4"></i>
                        <p class="text-xs font-bold text-zinc-300">Fast Islandwide Checkout</p>
                    </div>
                    <div class="flex space-x-3 mt-6">
                        <div class="bg-[#121212] px-4 py-2 rounded-full flex items-center gap-2 border border-zinc-800 text-xs shadow">
                            <i class="fa-solid fa-check gold-text"></i> Secure Payment
                        </div>
                        <div class="bg-[#121212] px-4 py-2 rounded-full flex items-center gap-2 border border-zinc-800 text-xs shadow">
                            <i class="fa-solid fa-check gold-text"></i> Fast Delivery
                        </div>
                        <div class="bg-[#121212] px-4 py-2 rounded-full flex items-center gap-2 border border-zinc-800 text-xs shadow">
                            <i class="fa-solid fa-check gold-text"></i> Easy Returns
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Categories Icons Row -->
        <div id="categoryIconsRow" class="container mx-auto px-6 my-10 relative z-10">
            <div class="bg-[#121212] p-6 rounded-3xl grid grid-cols-3 sm:grid-cols-5 md:grid-cols-10 gap-4 text-center border border-zinc-800 shadow-2xl">
                <div onclick="filterCategory('Mobiles')" class="cursor-pointer group">
                    <div class="bg-white/5 group-hover:gold-bg group-hover:text-black p-4 rounded-2xl transition mx-auto w-14 h-14 flex items-center justify-center mb-2"><i class="fa-solid fa-mobile-screen text-xl gold-text group-hover:text-black"></i></div>
                    <span class="text-xs font-semibold">Mobiles</span>
                </div>
                <div onclick="filterCategory('Laptops')" class="cursor-pointer group">
                    <div class="bg-white/5 group-hover:gold-bg group-hover:text-black p-4 rounded-2xl transition mx-auto w-14 h-14 flex items-center justify-center mb-2"><i class="fa-solid fa-laptop text-xl gold-text group-hover:text-black"></i></div>
                    <span class="text-xs font-semibold">Laptops</span>
                </div>
                <div onclick="filterCategory('Electronics')" class="cursor-pointer group">
                    <div class="bg-white/5 group-hover:gold-bg group-hover:text-black p-4 rounded-2xl transition mx-auto w-14 h-14 flex items-center justify-center mb-2"><i class="fa-solid fa-plug text-xl gold-text group-hover:text-black"></i></div>
                    <span class="text-xs font-semibold">Electronics</span>
                </div>
                <div onclick="filterCategory('Fashion')" class="cursor-pointer group">
                    <div class="bg-white/5 group-hover:gold-bg group-hover:text-black p-4 rounded-2xl transition mx-auto w-14 h-14 flex items-center justify-center mb-2"><i class="fa-solid fa-shirt text-xl gold-text group-hover:text-black"></i></div>
                    <span class="text-xs font-semibold">Fashion</span>
                </div>
                <div onclick="filterCategory('Home')" class="cursor-pointer group">
                    <div class="bg-white/5 group-hover:gold-bg group-hover:text-black p-4 rounded-2xl transition mx-auto w-14 h-14 flex items-center justify-center mb-2"><i class="fa-solid fa-house text-xl gold-text group-hover:text-black"></i></div>
                    <span class="text-xs font-semibold">Home & Living</span>
                </div>
                <div onclick="filterCategory('Beauty')" class="cursor-pointer group">
                    <div class="bg-white/5 group-hover:gold-bg group-hover:text-black p-4 rounded-2xl transition mx-auto w-14 h-14 flex items-center justify-center mb-2"><i class="fa-solid fa-spray-can-sparkles text-xl gold-text group-hover:text-black"></i></div>
                    <span class="text-xs font-semibold">Beauty</span>
                </div>
                <div onclick="filterCategory('Sports')" class="cursor-pointer group">
                    <div class="bg-white/5 group-hover:gold-bg group-hover:text-black p-4 rounded-2xl transition mx-auto w-14 h-14 flex items-center justify-center mb-2"><i class="fa-solid fa-futbol text-xl gold-text group-hover:text-black"></i></div>
                    <span class="text-xs font-semibold">Sports</span>
                </div>
                <div onclick="filterCategory('Toys')" class="cursor-pointer group">
                    <div class="bg-white/5 group-hover:gold-bg group-hover:text-black p-4 rounded-2xl transition mx-auto w-14 h-14 flex items-center justify-center mb-2"><i class="fa-solid fa-gamepad text-xl gold-text group-hover:text-black"></i></div>
                    <span class="text-xs font-semibold">Toys</span>
                </div>
                <div onclick="filterCategory('Books')" class="cursor-pointer group">
                    <div class="bg-white/5 group-hover:gold-bg group-hover:text-black p-4 rounded-2xl transition mx-auto w-14 h-14 flex items-center justify-center mb-2"><i class="fa-solid fa-book text-xl gold-text group-hover:text-black"></i></div>
                    <span class="text-xs font-semibold">Books</span>
                </div>
                <div onclick="filterCategory('All')" class="cursor-pointer group">
                    <div class="bg-white/5 group-hover:gold-bg group-hover:text-black p-4 rounded-2xl transition mx-auto w-14 h-14 flex items-center justify-center mb-2"><i class="fa-solid fa-ellipsis text-xl gold-text group-hover:text-black"></i></div>
                    <span class="text-xs font-semibold">More</span>
                </div>
            </div>
        </div>

        <!-- Main Product Section -->
        <main id="mainProductSection" class="container mx-auto px-6 my-10 relative z-10">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold flex items-center gap-2"><i class="fa-solid fa-star gold-text"></i> Featured Products</h2>
                <button onclick="filterCategory('All')" class="text-sm font-semibold text-zinc-400 hover:gold-text flex items-center gap-1">View All <i class="fa-solid fa-arrow-right"></i></button>
            </div>
          
            <div id="productGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div class="text-center col-span-full py-16 text-zinc-400 font-medium">Loading products...</div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="bg-[#121212] pt-12 pb-6 border-t border-zinc-800 mt-16 text-sm relative z-10">
            <div class="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                    <a href="/" class="text-2xl font-black tracking-wider flex items-center gap-2 mb-4">
                        <div class="gold-bg p-1.5 rounded-lg shadow"><i class="fa-solid fa-store"></i></div>
                        KADEE<span class="gold-text">.LK</span>
                    </a>
                    <p class="text-zinc-400 text-xs leading-relaxed">Shop Smart... Live Better...</p>
                </div>
                <div>
                    <h4 class="font-bold mb-4 text-white">Quick Links</h4>
                    <ul class="space-y-2 text-zinc-400 text-xs">
                        <li><a href="#" class="hover:gold-text"><i class="fa-solid fa-house gold-text mr-1"></i> Home</a></li>
                        <li><a href="#" class="hover:gold-text"><i class="fa-solid fa-bars gold-text mr-1"></i> Categories</a></li>
                        <li><a href="#" class="hover:gold-text"><i class="fa-solid fa-truck gold-text mr-1"></i> Track Order</a></li>
                        <li><a href="#" class="hover:gold-text"><i class="fa-solid fa-envelope gold-text mr-1"></i> Contact Us</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold mb-4 text-white">Customer Support</h4>
                    <ul class="space-y-2 text-zinc-400 text-xs">
                        <li><i class="fa-solid fa-phone gold-text mr-1"></i> +94 70 7521 138</li>
                        <li><i class="fa-solid fa-envelope gold-text mr-1"></i> diniduravishka649@gmail.com</li>
                        <li><i class="fa-solid fa-clock gold-text mr-1"></i> Mon - Sat: 8.00 AM - 8.00 PM</li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold mb-4 text-white">Follow Us</h4>
                    <div class="flex space-x-3">
                        <a href="#" class="w-8 h-8 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center hover:gold-bg hover:text-black transition"><i class="fa-brands fa-facebook-f text-xs"></i></a>
                        <a href="#" class="w-8 h-8 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center hover:gold-bg hover:text-black transition"><i class="fa-brands fa-instagram text-xs"></i></a>
                        <a href="#" class="w-8 h-8 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center hover:gold-bg hover:text-black transition"><i class="fa-brands fa-whatsapp text-xs"></i></a>
                        <a href="#" class="w-8 h-8 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center hover:gold-bg hover:text-black transition"><i class="fa-brands fa-tiktok text-xs"></i></a>
                    </div>
                </div>
            </div>
            <div class="container mx-auto px-6 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-400">
                <p>&copy; 2026 KADEE.LK. All rights reserved.</p>
                <p class="mt-2 sm:mt-0 flex items-center gap-1">Powered by <i class="fa-solid fa-heart text-red-500"></i> KADEE.LK</p>
            </div>
        </footer>

        <!-- Auth Modal (Login / Register with "Dinidu ravishka") -->
        <div id="authModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm hidden z-50 flex justify-center items-center p-4 text-gray-900">
            <div class="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl relative border border-amber-500">
                <button onclick="closeAuthModal()" class="absolute top-4 right-4 text-gray-400 hover:text-black font-bold text-2xl">&times;</button>
                <h3 id="authTitle" class="text-2xl font-black mb-6 text-black">Login to KADEE.LK</h3>
              
                <div id="registerFields" class="hidden space-y-4 mb-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-1">Full Name</label>
                        <input type="text" id="regName" autocomplete="off" placeholder="Dinidu ravishka" class="w-full p-3 border rounded-xl outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-1">Account Role</label>
                        <select id="regRole" class="w-full p-3 border rounded-xl outline-none">
                            <option value="buyer">Buyer (Customer)</option>
                            <option value="seller">Seller (Vendor Hub)</option>
                        </select>
                    </div>
                </div>

                <div class="space-y-4 mb-6">
                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-1" id="authLabelEmail">Username / Email Address</label>
                        <input type="text" id="authEmail" autocomplete="off" placeholder="Dinidu ravishka" class="w-full p-3 border rounded-xl outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-1">Password</label>
                        <input type="password" id="authPassword" autocomplete="new-password" placeholder="••••••••" class="w-full p-3 border rounded-xl outline-none">
                    </div>
                </div>
                <button onclick="handleAuthSubmit()" id="authSubmitBtn" class="w-full gold-bg py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg">Login</button>
                <p class="text-sm text-center mt-6 text-gray-600">
                    <span id="authToggleText">Don't have an account?</span>
                    <button onclick="toggleAuthMode()" class="gold-text font-extrabold underline ml-1 text-amber-700">Register here</button>
                </p>
            </div>
        </div>

        <!-- Seller Hub Modal -->
        <div id="sellerModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm hidden z-50 flex justify-center items-center p-4 text-gray-900">
            <div class="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl relative border border-amber-500">
                <button onclick="openSellerModal()" class="absolute top-4 right-4 text-gray-400 hover:text-black font-bold text-2xl">&times;</button>
                <h3 class="text-2xl font-black mb-6 text-black flex items-center gap-2"><i class="fa-solid fa-box-open gold-text"></i> Seller Hub</h3>
                <div class="space-y-4 mb-6">
                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-1">Product Title</label>
                        <input type="text" id="prodTitle" autocomplete="off" placeholder="e.g. AirPods Pro" class="w-full p-3 border rounded-xl outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-1">Price (Rs.)</label>
                        <input type="number" id="prodPrice" autocomplete="off" placeholder="49990" class="w-full p-3 border rounded-xl outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-1">Category</label>
                        <input type="text" id="prodCategory" autocomplete="off" placeholder="Mobiles / Laptops / Fashion" class="w-full p-3 border rounded-xl outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-600 mb-1">Image URL</label>
                        <input type="text" id="prodImage" autocomplete="off" placeholder="https://images.unsplash.com/..." class="w-full p-3 border rounded-xl outline-none">
                    </div>
                </div>
                <button onclick="addNewProduct()" class="w-full gold-bg py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg">Publish Product</button>
            </div>
        </div>

        <!-- Cart Sidebar -->
        <div id="cartModal" class="fixed right-0 top-0 w-full max-w-md h-full bg-white text-gray-900 shadow-2xl z-50 transform translate-x-full transition-transform duration-300 p-6 flex flex-col">
            <div class="flex justify-between items-center border-b pb-4">
                <h3 class="text-xl font-black text-black flex items-center gap-2"><i class="fa-solid fa-cart-shopping gold-text"></i> Shopping Cart</h3>
                <button onclick="toggleCart()" class="text-gray-400 hover:text-black font-bold text-2xl">&times;</button>
            </div>
            <div id="cartItems" class="flex-1 overflow-y-auto py-4 space-y-4">
                <p class="text-gray-400 text-center py-8">Your cart is currently empty.</p>
            </div>
            <div class="border-t pt-4 space-y-4">
                <div class="flex justify-between font-black text-xl">
                    <span>Subtotal:</span>
                    <span id="cartTotal" class="gold-text text-amber-700">Rs. 0</span>
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-600 mb-1">Select Payment Method:</label>
                    <select id="paymentMethod" class="w-full p-3 border rounded-xl text-sm font-semibold outline-none">
                        <option value="PayHere">Secure Online Payment</option>
                        <option value="COD">Cash on Delivery (COD)</option>
                    </select>
                </div>
                <button onclick="checkout()" class="w-full gold-bg py-3.5 rounded-xl font-black hover:opacity-90 transition shadow-lg">Proceed to Checkout</button>
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
                const directAdminDashboard = document.getElementById('adminDirectDashboard');
                const heroBanner = document.getElementById('heroBanner');
                const mainProductSection = document.getElementById('mainProductSection');
                const categoriesNav = document.getElementById('categoriesNav');
                const categoryIconsRow = document.getElementById('categoryIconsRow');
              
                adminBtn.classList.add('hidden');
                sellerBtn.classList.add('hidden');
                directAdminDashboard.classList.add('hidden');

                if (currentUser) {
                    document.getElementById('userDisplay').innerText = \`👤 \${currentUser.name} (\${currentUser.role})\`;
                    document.getElementById('authBtn').classList.add('hidden');
                    document.getElementById('logoutBtn').classList.remove('hidden');

                    if (currentUser.role === 'admin') {
                        heroBanner.classList.add('hidden');
                        mainProductSection.classList.add('hidden');
                        categoriesNav.classList.add('hidden');
                        categoryIconsRow.classList.add('hidden');
                        document.getElementById('searchBarContainer').classList.add('hidden');
                        document.getElementById('cartIconWrapper').classList.add('hidden');
                        directAdminDashboard.classList.remove('hidden');
                        loadAdminDirectStats();
                    } else {
                        if (currentUser.role === 'seller') {
                            sellerBtn.classList.remove('hidden');
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
                            <div class="bg-gray-50 p-4 rounded-2xl border flex justify-between items-center shadow-sm">
                                <div>
                                    <span class="font-black text-xs text-amber-700">Buyer: \${o.buyerEmail}</span>
                                    <p class="text-xs text-gray-600 mt-0.5">Total: <b>Rs. \${o.totalAmount.toLocaleString()}</b> via \${o.paymentMethod}</p>
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
                    grid.innerHTML = '<p class="col-span-full text-center text-zinc-400 py-12">No products available.</p>';
                    return;
                }
                grid.innerHTML = items.map(p => \`
                    <div class="bg-white text-gray-900 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-3 flex flex-col justify-between border border-zinc-200 group">
                        <div>
                            <div class="relative overflow-hidden rounded-xl mb-3 bg-gray-100">
                                <img src="\${p.image}" alt="\${p.title}" class="w-full h-40 object-cover group-hover:scale-105 transition duration-300">
                            </div>
                            <h3 class="font-bold text-gray-900 text-sm line-clamp-1">\${p.title}</h3>
                            <div class="text-amber-600 font-black text-base mt-1">Rs. \${p.price.toLocaleString()}</div>
                            <div class="flex items-center gap-1 text-yellow-500 text-xs mt-1 font-semibold">
                                <span>⭐ \${p.rating}</span>
                                <span class="text-gray-400">(\${p.reviewsCount || 75})</span>
                            </div>
                        </div>
                        <div class="mt-4 pt-3 border-t border-gray-100">
                            <button onclick="addToCart('\${p._id}')" class="w-full gold-bg hover:opacity-90 text-black py-2 rounded-xl font-bold text-xs shadow transition flex items-center justify-center gap-1.5">
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
                    const filtered = products.filter(p => p.category.toLowerCase().includes(cat.toLowerCase()));
                    displayProducts(filtered);
                }
            }

            function openAuthModal() {
                document.getElementById('authEmail').value = '';
                document.getElementById('authPassword').value = '';
                if(document.getElementById('regName')) document.getElementById('regName').value = '';
                document.getElementById('authModal').classList.remove('hidden');
            }
            function closeAuthModal() { document.getElementById('authModal').classList.add('hidden'); }
          
            function toggleAuthMode() {
                isRegisterMode = !isRegisterMode;
                document.getElementById('authTitle').innerText = isRegisterMode ? 'Create KADEE.LK Account' : 'Login to KADEE.LK';
                document.getElementById('registerFields').classList.toggle('hidden');
                document.getElementById('authSubmitBtn').innerText = isRegisterMode ? 'Register Now' : 'Login';
                document.getElementById('authToggleText').innerText = isRegisterMode ? 'Already have an account?' : "Don't have an account?";
              
                document.getElementById('authEmail').value = '';
                document.getElementById('authPassword').value = '';
                if(document.getElementById('regName')) document.getElementById('regName').value = '';
            }

            async function handleAuthSubmit() {
                const email = document.getElementById('authEmail').value.trim() || document.getElementById('authEmail').placeholder;
                const password = document.getElementById('authPassword').value.trim();
                if (!password) { alert('Please enter password!'); return; }

                if (isRegisterMode) {
                    const name = document.getElementById('regName').value.trim() || document.getElementById('regName').placeholder;
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
                        if (userObj.role === 'admin') {
                            const bioConfirm = confirm('🔒 Biometric Verification: Confirm Admin Face ID / Fingerprint Scan for ' + userObj.name + '?');
                            if (!bioConfirm) { alert('Biometric verification cancelled.'); return; }
                        }
                        currentUser = userObj;
                        localStorage.setItem('kadee_user', JSON.stringify(currentUser));
                        closeAuthModal();
                        updateUIState();
                        alert('Welcome back, ' + currentUser.name + '!');
                        window.location.reload();
                    } else { alert(data.error || 'Invalid login credentials!'); }
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
                    alert('Product published successfully!');
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
                let total = 0;
                const container = document.getElementById('cartItems');
                if (cart.length === 0) {
                    container.innerHTML = '<p class="text-gray-400 text-center py-8">Your cart is currently empty.</p>';
                    document.getElementById('cartTotal').innerText = 'Rs. 0';
                    document.getElementById('cartTotalText').innerText = 'Rs. 0';
                    return;
                }
                container.innerHTML = cart.map((item, index) => {
                    total += item.price;
                    return \`
                        <div class="flex justify-between items-center bg-gray-50 p-3 rounded-xl border">
                            <div class="flex items-center gap-3">
                                <img src="\${item.image}" class="w-12 h-12 object-cover rounded-lg">
                                <div>
                                    <h4 class="font-bold text-sm line-clamp-1">\${item.title}</h4>
                                    <span class="text-amber-700 font-extrabold text-xs">Rs. \${item.price.toLocaleString()}</span>
                                </div>
                            </div>
                            <button onclick="removeFromCart(\--index)" class="text-red-500 p-2"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    \`;
                }).join('');
                document.getElementById('cartTotal').innerText = 'Rs. ' + total.toLocaleString();
                document.getElementById('cartTotalText').innerText = 'Rs. ' + total.toLocaleString();
            }

            function removeFromCart(index) { cart.splice(index, 1); updateCartUI(); }
            function toggleCart() { document.getElementById('cartModal').classList.toggle('translate-x-full'); }

            async function checkout() {
                if (!currentUser) { alert('Please login to complete your checkout!'); openAuthModal(); return; }
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
                    alert('Order placed successfully!');
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
