const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Products දත්ත (වැඩිපුර එකතු කරන ලද නිෂ්පාදන)
const products = [
    { id: 1, name: 'Wireless Bluetooth Earbuds', price: 'Rs. 3,500', category: 'Electronics' },
    { id: 2, name: 'Smart Fitness Watch', price: 'Rs. 5,800', category: 'Wearables' },
    { id: 3, name: 'Fast Charging Power Bank', price: 'Rs. 4,200', category: 'Accessories' },
    { id: 4, name: 'LED Desk Lamp with USB', price: 'Rs. 2,900', category: 'Home' },
    { id: 5, name: 'Gaming Mechanical Keyboard', price: 'Rs. 8,500', category: 'Electronics' },
    { id: 6, name: 'HD Security Camera', price: 'Rs. 6,500', category: 'Smart Home' },
    { id: 7, name: 'Portable Bluetooth Speaker', price: 'Rs. 4,900', category: 'Audio' },
    { id: 8, name: 'Ergonomic Mousepad', price: 'Rs. 1,200', category: 'Accessories' }
];

// ==========================================
// API ROUTES
// ==========================================

// 1. Login API Route
app.post('/api/login', (req, res) => {
    const { identifier, password, role } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({
            success: false,
            message: 'කරුණාකර දත්ත සියල්ල ඇතුළත් කරන්න!'
        });
    }

    res.status(200).json({
        success: true,
        message: 'සාර්ථකව පිවිසෙන ලදී!',
        user: { identifier, role: role || 'buyer' }
    });
});

// 2. Products API Route
app.get('/api/products', (req, res) => {
    res.status(200).json({ success: true, products });
});

// ==========================================
// FRONTEND (HTML / CSS / JS එකම තැනක)
// ==========================================
app.get('*', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="si">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KADEE.LK - Dinidu Ravishka</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 font-sans">

    <!-- LOGIN SECTION -->
    <div id="login-section" class="min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
           
            <!-- වම් පැත්ත: ඩරාස් එකේ වගේ විශේෂතා / බැනර් කොටස -->
            <div class="bg-gradient-to-br from-orange-500 to-amber-600 text-white p-8 flex flex-col justify-between">
                <div>
                    <h1 class="text-3xl font-extrabold mb-2">KADEE.LK</h1>
                    <p class="text-orange-100 text-sm">ප්‍රධාන නිර්මාතෘ: Dinidu Ravishka</p>
                </div>
                <div class="space-y-6 my-8">
                    <div class="flex items-start space-x-3">
                        <span class="text-2xl">🚀</span>
                        <div>
                            <h3 class="font-bold">වේගවත් ඩිලිවරි සේවාව</h3>
                            <p class="text-xs text-orange-100">දිවයින පුරා ඉක්මනින් නිවසටම ගෙන්වා ගන්න.</p>
                        </div>
                    </div>
                    <div class="flex items-start space-x-3">
                        <span class="text-2xl">🛡️</span>
                        <div>
                            <h3 class="font-bold">100% ආරක්ෂිත ගෙවීම්</h3>
                            <p class="text-xs text-orange-100">ආරක්ෂිත සහ පහසු ක්‍රමවේද හරහා ගෙවීම් කරන්න.</p>
                        </div>
                    </div>
                    <div class="flex items-start space-x-3">
                        <span class="text-2xl">💎</span>
                        <div>
                            <h3 class="font-bold">විශේෂ දීමනා සහ වට්ටම්</h3>
                            <p class="text-xs text-orange-100">දිනපතා අලුත් වන සුපිරි වට්ටම් ලබා ගන්න.</p>
                        </div>
                    </div>
                </div>
                <div class="text-xs text-orange-200">
                    © 2026 KADEE.LK - Dinidu Ravishka. All rights reserved.
                </div>
            </div>

            <!-- දකුණු පැත්ත: Login Form එක (Dinidu ravishka පමණක් ඇති placeholder එක සමඟ) -->
            <div class="p-8 flex flex-col justify-center">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Login to KADEE.LK</h2>
               
                <form id="loginForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">ගිණුම් වර්ගය (Account Type)</label>
                        <select id="role" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none">
                            <option value="buyer">ගණුදෙනුකරු (Buyer)</option>
                            <option value="seller">විකුණුම්කරු (Seller)</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Username / Email Address</label>
                        <input type="text" id="identifier" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none" placeholder="Dinidu ravishka">
                    </div>
                   
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input type="password" id="password" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none" placeholder="••••••••">
                    </div>

                    <button type="submit" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg transition duration-200">
                        Login
                    </button>
                </form>
               
                <div id="error-msg" class="mt-4 text-red-500 text-sm text-center hidden"></div>
            </div>
        </div>
    </div>

    <!-- BUYER DASHBOARD SECTION (Buyer ලොග් වෙද්දී පේන විශේෂ පෝස්ට්/වාසි) -->
    <div id="buyer-dashboard" class="hidden min-h-screen bg-gray-50 p-6">
        <header class="flex justify-between items-center bg-white p-4 rounded-xl shadow-md mb-8">
            <h1 class="text-2xl font-bold text-orange-600">KADEE.LK - Buyer Portal</h1>
            <button onclick="logout()" class="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">Logout</button>
        </header>

        <main class="max-w-6xl mx-auto">
            <div class="bg-orange-100 border-l-4 border-orange-500 p-4 mb-6 rounded-r-xl shadow-sm">
                <h3 class="font-bold text-orange-800 text-lg">🛒 ගැනුම්කරුවන් සඳහා විශේෂ දීමනා සහ වාසි</h3>
                <p class="text-sm text-orange-700 mt-1">අපගේ වෙබ් අඩවිය හරහා ඔබට වඩාත්ම විශ්වාසනීය භාණ්ඩ පහසු මිලට, වගකීමක් සහිතව නිවසටම ගෙන්වා ගත හැක. දිනපතා අලුත් වන වට්ටම් බලාගන්න!</p>
            </div>

            <h2 class="text-xl font-bold text-gray-800 mb-4">අපගේ නිෂ්පාදන (Featured Products)</h2>
            <div id="buyer-product-list" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"></div>
        </main>
    </div>

    <!-- SELLER DASHBOARD SECTION (Seller ලොග් වෙද්දී පේන ක්‍රියාකාරිත්ව විස්තර සහ පෝස්ට්) -->
    <div id="seller-dashboard" class="hidden min-h-screen bg-gray-50 p-6">
        <header class="flex justify-between items-center bg-white p-4 rounded-xl shadow-md mb-8">
            <h1 class="text-2xl font-bold text-blue-600">KADEE.LK - Seller Dashboard</h1>
            <button onclick="logout()" class="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">Logout</button>
        </header>

        <main class="max-w-6xl mx-auto">
            <div class="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6 rounded-r-xl shadow-sm">
                <h3 class="font-bold text-blue-800 text-lg">📈 විකුණුම්කරුවන්ගේ ක්‍රියාකාරිත්වය සහ මගපෙන්වීම</h3>
                <p class="text-sm text-blue-700 mt-1">මෙම පැනලය හරහා ඔබට ඔබේ භාණ්ඩ ලැයිස්තුගත කිරීමට, ඇණවුම් කළමනාකරණය කිරීමට සහ දිනපතා ලැබෙන ආදායම පහසුවෙන් නිරීක්ෂණය කරමින් ඔබේ ව්‍යාපාරය පුළුල් කරගත හැක.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white p-6 rounded-xl shadow">
                    <h4 class="text-gray-500 text-sm">මුළු ඇණවුම් (Total Orders)</h4>
                    <p class="text-2xl font-bold text-gray-800 mt-2">24</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow">
                    <h4 class="text-gray-500 text-sm">මුළු ආදායම (Total Revenue)</h4>
                    <p class="text-2xl font-bold text-green-600 mt-2">Rs. 84,500</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow">
                    <h4 class="text-gray-500 text-sm">සක්‍රීය භාණ්ඩ (Active Products)</h4>
                    <p class="text-2xl font-bold text-blue-600 mt-2">8</p>
                </div>
            </div>

            <h2 class="text-xl font-bold text-gray-800 mb-4">ඔබේ වෙළඳසැල් නිෂ්පාදන (Your Store Items)</h2>
            <div id="seller-product-list" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"></div>
        </main>
    </div>

    <!-- Frontend JavaScript -->
    <script>
        const loginForm = document.getElementById('loginForm');
        const loginSection = document.getElementById('login-section');
        const buyerDashboard = document.getElementById('buyer-dashboard');
        const sellerDashboard = document.getElementById('seller-dashboard');
        const errorMsg = document.getElementById('error-msg');
        const buyerProductList = document.getElementById('buyer-product-list');
        const sellerProductList = document.getElementById('seller-product-list');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const identifier = document.getElementById('identifier').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier, password, role })
                });

                const data = await response.json();

                if (data.success) {
                    loginSection.classList.add('hidden');
                    if (role === 'buyer') {
                        buyerDashboard.classList.remove('hidden');
                        fetchProducts('buyer');
                    } else {
                        sellerDashboard.classList.remove('hidden');
                        fetchProducts('seller');
                    }
                } else {
                    errorMsg.textContent = data.message;
                    errorMsg.classList.remove('hidden');
                }
            } catch (err) {
                console.error(err);
                errorMsg.textContent = 'සර්වර් දෝෂයක් සිදු විය!';
                errorMsg.classList.remove('hidden');
            }
        });

        async function fetchProducts(target) {
            try {
                const response = await fetch('/api/products');
                const data = await response.json();
               
                if (data.success) {
                    const container = target === 'buyer' ? buyerProductList : sellerProductList;
                    container.innerHTML = '';
                    data.products.forEach(product => {
                        container.innerHTML += \`
                            <div class="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
                                <span class="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded font-semibold">\${product.category}</span>
                                <h3 class="font-bold text-lg mt-2 text-gray-800">\${product.name}</h3>
                                <p class="text-orange-600 font-bold mt-2">\${product.price}</p>
                                <button class="mt-4 w-full bg-gray-900 text-white py-1.5 rounded-lg text-sm hover:bg-orange-500 transition">\${target === 'buyer' ? 'මිදී ගන්න' : 'ניהול (Manage)'}</button>
                            </div>
                        \`;
                    });
                }
            } catch (err) {
                console.error('Error fetching products:', err);
            }
        }

        function logout() {
            buyerDashboard.classList.add('hidden');
            sellerDashboard.classList.add('hidden');
            loginSection.classList.remove('hidden');
            loginForm.reset();
        }
    </script>
</body>
</html>
    `);
});

// Server එක Start කිරීම
app.listen(PORT, () => {
    console.log(\`Server is running smoothly on http://localhost:\${PORT}\`);
}); 
