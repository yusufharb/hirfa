/**
 * HIRFA Live Visual Showcase & Interactive Studio Server
 * 
 * Provides an interactive 3-in-1 visual portal:
 * 1. 📱 Customer App Simulator (Arabic RTL, 10 categories, booking flow, live tracking)
 * 2. 🔧 Craftsman App Simulator (availability toggle, incoming job dispatch, accept/complete flow)
 * 3. 💻 Admin Dashboard (KPIs, live bookings table, craftsman verification, revenue)
 * 4. ⚡ Live REST API endpoints matching the backend architecture
 * 
 * Runs on native Node.js (v20+) with zero external dependencies.
 */

const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;

// ── In-Memory State & Seed Data ─────────────────────────────
const state = {
  services: [
    { id: 'srv-1', emoji: '🔧', nameAr: 'سباكة', nameEn: 'Plumbing', minPrice: 200, maxPrice: 800, count: '48 حرفي متاح', desc: 'إصلاح تسريبات، تركيب خلاطات، وصيانة شبكات المياه' },
    { id: 'srv-2', emoji: '⚡', nameAr: 'كهرباء', nameEn: 'Electrical', minPrice: 150, maxPrice: 600, count: '62 حرفي متاح', desc: 'تأسيس وصيانة كهرباء، تركيب نجف، وإصلاح لوحات التوزيع' },
    { id: 'srv-3', emoji: '🎨', nameAr: 'دهانات', nameEn: 'Painting', minPrice: 300, maxPrice: 2000, count: '35 حرفي متاح', desc: 'دهان شقق، معالجة رطوبة، وديكورات جوتن وسكيب' },
    { id: 'srv-4', emoji: '❄️', nameAr: 'تكييف', nameEn: 'AC Service', minPrice: 250, maxPrice: 1000, count: '54 حرفي متاح', desc: 'شحن فريون، غسيل وصيانة تكييفات، وفك وتركيب' },
    { id: 'srv-5', emoji: '🪟', nameAr: 'نجارة', nameEn: 'Carpentry', minPrice: 200, maxPrice: 1500, count: '41 حرفي متاح', desc: 'تصليح أبواب وشبابيك، تجميع غرف نوم، وتفصيل مطابخ' },
    { id: 'srv-6', emoji: '🧹', nameAr: 'تنظيف', nameEn: 'Cleaning', minPrice: 300, maxPrice: 800, count: '70 عاملة متاحة', desc: 'تنظيف عميق للمنازل، تنظيف سجاد ومفروشات بالبخار' },
    { id: 'srv-7', emoji: '🏠', nameAr: 'صيانة عامة', nameEn: 'Maintenance', minPrice: 150, maxPrice: 500, count: '29 حرفي متاح', desc: 'تصليحات سريعة للمنزل وتركيب الستائر والرفوف' },
    { id: 'srv-8', emoji: '🚿', nameAr: 'تجديد حمامات', nameEn: 'Renovation', minPrice: 1000, maxPrice: 8000, count: '18 مقاول متاح', desc: 'عزل حمامات، تركيب سيراميك، وتغيير السباكة بالكامل' },
    { id: 'srv-9', emoji: '🔌', nameAr: 'أجهزة منزلية', nameEn: 'Appliances', minPrice: 150, maxPrice: 600, count: '38 فني متاح', desc: 'صيانة غسالات، ثلاجات، بوتجازات، وسخانات غاز وكهرباء' },
    { id: 'srv-10', emoji: '🚛', nameAr: 'نقل عفش', nameEn: 'Moving', minPrice: 500, maxPrice: 3000, count: '22 سيارة متاحة', desc: 'ونش رفع أثاث، تغليف آمن، وسيارات نقل مجهزة' },
  ],
  craftsmen: [
    { id: 'crf-1', name: 'الأسطى محمد إبراهيم', phone: '01012345678', skill: 'سباكة', rating: 4.9, reviews: 142, jobs: 184, area: 'المعادي ودار السلام', verified: true, wallet: 3450, available: true, nationalId: '28910240103456' },
    { id: 'crf-2', name: 'المهندس أحمد حسني', phone: '01123456789', skill: 'كهرباء', rating: 4.85, reviews: 98, jobs: 120, area: 'مصر الجديدة ومدينة نصر', verified: true, wallet: 2180, available: true, nationalId: '29205150104567' },
    { id: 'crf-3', name: 'عماد النجار (أبو كريم)', phone: '01234567890', skill: 'نجارة', rating: 4.78, reviews: 76, jobs: 89, area: 'التجمع الأول والخامس', verified: true, wallet: 1850, available: false, nationalId: '28509120106789' },
    { id: 'crf-4', name: 'طارق عبد العزيز', phone: '01512345678', skill: 'تكييف', rating: 4.92, reviews: 210, jobs: 260, area: 'الشيخ زايد و 6 أكتوبر', verified: true, wallet: 4920, available: true, nationalId: '29011030107890' },
    { id: 'crf-5', name: 'خالد صابر', phone: '01098765432', skill: 'دهانات', rating: 4.65, reviews: 43, jobs: 51, area: 'الدقي والمهندسين', verified: false, wallet: 850, available: true, nationalId: '29503140101234' },
  ],
  bookings: [
    { id: 'HRF-8401', customerName: 'سارة محمود', customerPhone: '01024567891', service: 'سباكة', address: 'المعادي، شارع 9، القاهرة', problem: 'تسريب مياه أسفل حوض المطبخ', craftsmanId: 'crf-1', craftsmanName: 'الأسطى محمد إبراهيم', status: 'completed', price: 450, fee: 81, method: 'فودافون كاش', date: 'اليوم، 04:30 م', rating: 5 },
    { id: 'HRF-8402', customerName: 'كريم الدسوقي', customerPhone: '01198765432', service: 'تكييف', address: 'التجمع الخامس، حي البنفسج', problem: 'التكييف لا يبرد ويصدر صوت', craftsmanId: 'crf-4', craftsmanName: 'طارق عبد العزيز', status: 'in_progress', price: 600, fee: 108, method: 'كاش عند الاستلام', date: 'اليوم، 06:15 م', rating: null },
    { id: 'HRF-8403', customerName: 'منى عبد الرازق', customerPhone: '01211223344', service: 'كهرباء', address: 'مصر الجديدة، ميدان الكوربة', problem: 'قاطع الدائرة يفصل باستمرار', craftsmanId: 'crf-2', craftsmanName: 'المهندس أحمد حسني', status: 'confirmed', price: 300, fee: 54, method: 'فوري', date: 'اليوم، 07:00 م', rating: null },
  ],
  stats: {
    totalBookingsToday: 158,
    revenueToday: 14250,
    activeCraftsmen: 432,
    newCustomersThisWeek: 89,
    commissionRate: 0.18,
  }
};

// ── Request Router ──────────────────────────────────────────
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── REST API ROUTES ───────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // GET /api/services
    if (pathname === '/api/services' && method === 'GET') {
      res.writeHead(200);
      return res.end(JSON.stringify({ success: true, data: state.services }));
    }

    // GET /api/craftsmen
    if (pathname === '/api/craftsmen' && method === 'GET') {
      res.writeHead(200);
      return res.end(JSON.stringify({ success: true, data: state.craftsmen }));
    }

    // GET /api/bookings
    if (pathname === '/api/bookings' && method === 'GET') {
      res.writeHead(200);
      return res.end(JSON.stringify({ success: true, data: state.bookings }));
    }

    // GET /api/admin/dashboard
    if (pathname === '/api/admin/dashboard' && method === 'GET') {
      const gmv = state.bookings.reduce((sum, b) => sum + (b.price || 0), 0);
      const totalFees = Math.round(gmv * 0.18);
      res.writeHead(200);
      return res.end(JSON.stringify({
        success: true,
        data: {
          totalBookings: state.bookings.length + 155,
          totalGmvEgp: gmv + 58400,
          platformNetProfitEgp: totalFees + 10512,
          activeCraftsmenCount: state.craftsmen.filter(c => c.available).length + 310,
          pendingVerifications: state.craftsmen.filter(c => !c.verified).length,
          stats: state.stats
        }
      }));
    }

    // POST /api/bookings (Create new booking)
    if (pathname === '/api/bookings' && method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const data = JSON.parse(body || '{}');
          const newId = `HRF-${Math.floor(1000 + Math.random() * 9000)}`;
          const price = data.price || 400;
          const fee = Math.round(price * 0.18);

          const newBooking = {
            id: newId,
            customerName: data.customerName || 'عميل تجريبي',
            customerPhone: data.customerPhone || '01000000000',
            service: data.service || 'سباكة',
            address: data.address || 'المعادي، القاهرة',
            problem: data.problem || 'طلب خدمة صيانة عاجلة',
            craftsmanId: 'crf-1',
            craftsmanName: 'الأسطى محمد إبراهيم',
            status: 'searching',
            price: price,
            fee: fee,
            method: data.method || 'كاش عند الاستلام',
            date: 'الآن',
            rating: null
          };

          state.bookings.unshift(newBooking);
          state.stats.totalBookingsToday += 1;
          state.stats.revenueToday += fee;

          res.writeHead(201);
          return res.end(JSON.stringify({ success: true, message: 'Booking created successfully', data: newBooking }));
        } catch (e) {
          res.writeHead(400);
          return res.end(JSON.stringify({ success: false, error: 'Invalid JSON body' }));
        }
      });
      return;
    }

    // PUT /api/bookings/:id/status (Update status: confirmed, in_progress, completed, cancelled)
    if (pathname.startsWith('/api/bookings/') && method === 'PUT') {
      const parts = pathname.split('/');
      const bookingId = parts[3];
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const data = JSON.parse(body || '{}');
          const b = state.bookings.find(item => item.id === bookingId);
          if (b) {
            b.status = data.status || b.status;
            if (data.rating) b.rating = data.rating;
            res.writeHead(200);
            return res.end(JSON.stringify({ success: true, data: b }));
          }
          res.writeHead(404);
          return res.end(JSON.stringify({ success: false, error: 'Booking not found' }));
        } catch (e) {
          res.writeHead(400);
          return res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
        }
      });
      return;
    }

    // POST /api/auth/send-otp
    if (pathname === '/api/auth/send-otp' && method === 'POST') {
      res.writeHead(200);
      return res.end(JSON.stringify({ success: true, message: 'OTP sent: 123456 (Mock mode)' }));
    }

    // Default 404 for API
    res.writeHead(404);
    return res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }));
  }

  // ── SERVE LIVE VISUAL PORTAL (HTML/CSS/JS) ─────────────────
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(getInteractivePortalHTML());
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 HIRFA LIVE SYSTEM IS RUNNING ON: http://localhost:${PORT}`);
  console.log(`📱 Customer App | 🔧 Craftsman App | 💻 Admin Dashboard`);
  console.log(`======================================================\n`);
});

// ─────────────────────────────────────────────────────────────
// The High-Fidelity Interactive Visual Portal HTML
// ─────────────────────────────────────────────────────────────
function getInteractivePortalHTML() {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HIRFA | منصة حِرفة التفاعلية — Live Prototype & Demo</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Cairo Font -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brandBlue: '#1E3A5F',
            brandOrange: '#FF6B35',
            brandLight: '#F8F9FA',
            brandSuccess: '#28A745',
          },
          fontFamily: {
            cairo: ['Cairo', 'sans-serif'],
            inter: ['Inter', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Cairo', sans-serif; background-color: #0f172a; color: #f8fafc; }
    .phone-notch {
      width: 140px; height: 24px; background: #000; border-radius: 0 0 16px 16px; margin: 0 auto;
    }
    .custom-scroll::-webkit-scrollbar { width: 5px; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
    @keyframes pulse-subtle {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
    .pulse-alert { animation: pulse-subtle 1.5s infinite; }
  </style>
</head>
<body class="bg-slate-950 min-h-screen custom-scroll">

  <!-- TOP BRAND HEADER -->
  <header class="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md px-6 py-4">
    <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-brandBlue to-brandOrange flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-orange-500/20">
          ح
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-black tracking-tight text-white font-cairo">HIRFA | حِرفة</h1>
            <span class="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-semibold animate-pulse">● متصل مباشرة بالخادم</span>
          </div>
          <p class="text-xs text-slate-400">المنصة الشاملة لطلب الحرفيين والمهن الحرة بمصر والشرق الأوسط (MVP Live Studio)</p>
        </div>
      </div>

      <!-- VIEW SELECTOR TABS -->
      <div class="flex items-center bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 text-sm">
        <button onclick="switchView('split')" id="btn-split" class="px-4 py-2 rounded-lg font-bold transition-all bg-brandOrange text-white shadow">
          📱 العرض المزدوج (عميل + حرفي)
        </button>
        <button onclick="switchView('admin')" id="btn-admin" class="px-4 py-2 rounded-lg font-bold text-slate-300 hover:text-white transition-all">
          💻 لوحة تحكم الإدارة (Admin)
        </button>
        <button onclick="switchView('api')" id="btn-api" class="px-4 py-2 rounded-lg font-bold text-slate-300 hover:text-white transition-all font-inter">
          ⚡ Live API Explorer
        </button>
      </div>

      <!-- LIVE METRICS PILL -->
      <div class="hidden lg:flex items-center gap-4 text-xs bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
        <div>
          <span class="text-slate-400 block">إجمالي الطلبات اليوم:</span>
          <span class="font-bold text-emerald-400 text-base font-inter" id="header-orders">158 طلب</span>
        </div>
        <div class="w-px h-8 bg-slate-800"></div>
        <div>
          <span class="text-slate-400 block">أرباح المنصة (18%):</span>
          <span class="font-bold text-amber-400 text-base font-inter" id="header-rev">14,250 ج.م</span>
        </div>
      </div>
    </div>
  </header>

  <!-- MAIN CONTAINER -->
  <main class="max-w-7xl mx-auto px-4 py-8">

    <!-- =================================================== -->
    <!-- VIEW 1: SPLIT SCREEN (CUSTOMER APP + CRAFTSMAN APP) -->
    <!-- =================================================== -->
    <div id="view-split" class="space-y-6">
      
      <!-- INSTRUCTION BANNER -->
      <div class="bg-gradient-to-r from-blue-950/60 via-slate-900 to-orange-950/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-3">
          <span class="text-3xl">✨</span>
          <div>
            <h3 class="font-bold text-white text-base">جرّب النظام بشكل حي ومتزامن الآن!</h3>
            <p class="text-sm text-slate-300">
              اطلب سباك أو كهربائي من <strong class="text-orange-400">تطبيق العميل</strong> (يمين) ➔ ستشاهد فوراً إشعار الطلب يرن في <strong class="text-blue-400">تطبيق الحرفي</strong> (يسار) ويتم تسجيله في لوحة الإدارة!
            </p>
          </div>
        </div>
        <button onclick="triggerQuickDemo()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition shadow-lg shadow-emerald-600/30 flex items-center gap-2">
          <span>⚡ محاكاة طلب فوري بضغطة زر</span>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start justify-center">

        <!-- ── PHONE 1: CUSTOMER APP (تطبيق العميل) ────────────── -->
        <div class="flex flex-col items-center">
          <div class="mb-3 flex items-center justify-between w-full max-w-[390px] px-2">
            <span class="text-sm font-bold text-orange-400 flex items-center gap-1.5">
              <span>📱</span> تطبيق العميل (Customer App)
            </span>
            <span class="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">iOS / React Native</span>
          </div>

          <!-- Phone Device Frame -->
          <div class="w-full max-w-[390px] h-[780px] bg-slate-900 rounded-[48px] border-[10px] border-slate-800 shadow-2xl shadow-orange-500/10 flex flex-col overflow-hidden relative">
            <div class="phone-notch"></div>

            <!-- Customer App Inside Screens -->
            <div class="flex-1 bg-slate-50 text-slate-900 overflow-y-auto custom-scroll flex flex-col font-cairo">
              
              <!-- Customer App Header -->
              <div class="bg-brandBlue text-white p-5 rounded-b-3xl shadow-md">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <span class="text-2xl">📍</span>
                    <div>
                      <div class="text-[11px] text-blue-200">موقع الخدمة الحالي</div>
                      <div class="font-bold text-sm flex items-center gap-1">المعادي، القاهرة ▾</div>
                    </div>
                  </div>
                  <div class="w-9 h-9 rounded-full bg-brandOrange flex items-center justify-center font-bold text-sm shadow">
                    س
                  </div>
                </div>

                <div class="bg-white/10 backdrop-blur rounded-xl p-2.5 flex items-center gap-2 border border-white/10 text-xs">
                  <span>🔍</span>
                  <input type="text" placeholder="ابحث عن سباك، كهربائي، نجار..." class="bg-transparent text-white placeholder-blue-200/70 outline-none w-full text-xs">
                </div>
              </div>

              <!-- Promo Banner -->
              <div class="p-4 pb-2">
                <div class="bg-gradient-to-l from-orange-500 to-amber-500 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <span class="bg-white/20 text-xs px-2 py-0.5 rounded font-bold">عرض الانطلاق 🚀</span>
                    <h4 class="font-extrabold text-base mt-1">خصم 20% على أول صيانة</h4>
                    <p class="text-xs text-orange-100">كود الخصم: HIRFA2026</p>
                  </div>
                  <span class="text-4xl">🛠️</span>
                </div>
              </div>

              <!-- 10 Categories Grid -->
              <div class="p-4">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-bold text-slate-800 text-base">خدماتنا المعتمدة (10 مهن)</h3>
                  <span class="text-xs text-orange-600 font-semibold">ضمان حرفة الذهبي ✨</span>
                </div>

                <div class="grid grid-cols-2 gap-3" id="customer-services-grid">
                  <!-- Populated by JS -->
                </div>
              </div>

              <!-- Active Booking Status Tracker Card (Dynamic) -->
              <div id="customer-active-order" class="p-4 pt-0 hidden">
                <div class="bg-white border-2 border-orange-400 rounded-2xl p-4 shadow-lg pulse-alert">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full" id="cust-order-status-badge">
                      جاري البحث عن حرفي...
                    </span>
                    <span class="text-xs text-slate-500 font-inter" id="cust-order-id">#HRF-8404</span>
                  </div>
                  <h4 class="font-bold text-slate-900 text-sm" id="cust-order-title">سباكة — تصليح تسريب</h4>
                  <p class="text-xs text-slate-600 mt-1" id="cust-order-details">الحرفي: الأسطى محمد إبراهيم (⭐ 4.9)</p>
                  
                  <!-- Progress Bar -->
                  <div class="w-full bg-slate-100 h-2 rounded-full my-3 overflow-hidden">
                    <div id="cust-progress-bar" class="bg-brandOrange h-full w-1/4 transition-all duration-500"></div>
                  </div>

                  <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span class="text-slate-600">التكلفة التقديرية: <strong class="text-slate-900" id="cust-order-price">400 ج.م</strong></span>
                    <button onclick="cancelActiveOrder()" class="text-red-500 font-semibold hover:underline">إلغاء الطلب</button>
                  </div>
                </div>
              </div>

            </div>

            <!-- Customer App Bottom Nav -->
            <div class="bg-white border-t border-slate-200 px-6 py-2 flex items-center justify-between text-[11px] text-slate-500">
              <button class="flex flex-col items-center text-brandOrange font-bold">
                <span>🏠</span> الرئيسية
              </button>
              <button class="flex flex-col items-center">
                <span>📋</span> طلباتي
              </button>
              <button class="flex flex-col items-center">
                <span>🔔</span> الإشعارات
              </button>
              <button class="flex flex-col items-center">
                <span>👤</span> حسابي
              </button>
            </div>
          </div>
        </div>


        <!-- ── PHONE 2: CRAFTSMAN APP (تطبيق الحرفي) ───────────── -->
        <div class="flex flex-col items-center">
          <div class="mb-3 flex items-center justify-between w-full max-w-[390px] px-2">
            <span class="text-sm font-bold text-blue-400 flex items-center gap-1.5">
              <span>🔧</span> تطبيق الحرفي (Craftsman Partner App)
            </span>
            <span class="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">Android / React Native</span>
          </div>

          <!-- Craftsman Device Frame -->
          <div class="w-full max-w-[390px] h-[780px] bg-slate-900 rounded-[48px] border-[10px] border-slate-800 shadow-2xl shadow-blue-500/10 flex flex-col overflow-hidden relative">
            <div class="phone-notch"></div>

            <div class="flex-1 bg-slate-900 text-white overflow-y-auto custom-scroll flex flex-col font-cairo">
              
              <!-- Craftsman Header & Toggle -->
              <div class="bg-slate-800/90 p-5 border-b border-slate-700/60">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                      👷
                    </div>
                    <div>
                      <h3 class="font-bold text-base text-white">الأسطى محمد إبراهيم</h3>
                      <div class="flex items-center gap-1 text-xs text-amber-400">
                        <span>⭐ 4.9</span>
                        <span class="text-slate-400">(142 تقييم) • سباك معتمد</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Online Status Switch -->
                <div class="bg-slate-950 p-3 rounded-2xl border border-slate-700/80 flex items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <span id="craftsman-dot" class="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span id="craftsman-status-text" class="text-sm font-bold text-emerald-400">أنت متاح للعمل الآن 🟢</span>
                  </div>
                  <button onclick="toggleCraftsmanAvailability()" id="toggle-avail-btn" class="bg-emerald-600 hover:bg-emerald-500 text-xs px-3 py-1.5 rounded-xl font-bold transition">
                    إيقاف مؤقت
                  </button>
                </div>
              </div>

              <!-- Craftsman Wallet & Earnings Cards -->
              <div class="p-4 grid grid-cols-3 gap-2">
                <div class="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
                  <div class="text-[11px] text-slate-400">أرباح اليوم</div>
                  <div class="text-base font-extrabold text-emerald-400 font-inter mt-1" id="crf-today-earn">450 ج.م</div>
                </div>
                <div class="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
                  <div class="text-[11px] text-slate-400">أرباح الشهر</div>
                  <div class="text-base font-extrabold text-blue-400 font-inter mt-1">8,450 ج.م</div>
                </div>
                <div class="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
                  <div class="text-[11px] text-slate-400">المحفظة</div>
                  <div class="text-base font-extrabold text-amber-400 font-inter mt-1">3,450 ج.م</div>
                </div>
              </div>

              <!-- INCOMING JOB DISPATCH ALERT (Dynamic) -->
              <div class="px-4 flex-1 flex flex-col justify-start">
                
                <div id="craftsman-alert-box" class="bg-gradient-to-b from-orange-950 to-slate-900 border-2 border-orange-500 rounded-3xl p-5 shadow-2xl mb-4 hidden">
                  <div class="flex items-center justify-between mb-3">
                    <span class="bg-orange-600 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                      🔔 طلب عمل جديد في منطقتك!
                    </span>
                    <span class="text-xs text-amber-300 font-bold font-inter" id="crf-timer">⏳ 01:58</span>
                  </div>

                  <div class="space-y-2 mb-4 text-xs">
                    <div class="flex items-center justify-between">
                      <span class="text-slate-400">نوع الخدمة:</span>
                      <strong class="text-white text-sm" id="crf-job-service">سباكة (صيانة عاجلة)</strong>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-400">العنوان:</span>
                      <span class="text-slate-200" id="crf-job-address">المعادي، شارع 9 (2.1 كم عنك)</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-400">المشكلة:</span>
                      <span class="text-slate-300 italic" id="crf-job-problem">"تسريب مياه أسفل الحوض"</span>
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span class="text-slate-400">المبلغ الإجمالي:</span>
                      <span class="text-emerald-400 font-bold text-base font-inter" id="crf-job-price">400 ج.م</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-400">أرباحك الصافية (82%):</span>
                      <span class="text-white font-bold text-sm font-inter" id="crf-job-net">328 ج.م</span>
                    </div>
                  </div>

                  <!-- Craftsman Accept / Decline Buttons -->
                  <div class="flex gap-2">
                    <button onclick="craftsmanAcceptJob()" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-2xl text-sm transition shadow-lg shadow-emerald-600/40">
                      ✅ قبول الطلب فوراً
                    </button>
                    <button onclick="craftsmanDeclineJob()" class="bg-slate-800 hover:bg-slate-700 text-slate-400 px-4 py-3 rounded-2xl text-xs transition">
                      تخطي
                    </button>
                  </div>
                </div>

                <!-- Active Job Management Box -->
                <div id="craftsman-active-job-box" class="bg-slate-800 border border-slate-700 rounded-3xl p-5 shadow-lg hidden">
                  <div class="flex items-center justify-between mb-3">
                    <span class="bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                      🛠️ جاري تنفيذ المهمة
                    </span>
                    <span class="text-xs text-slate-400 font-inter">#HRF-ACTIVE</span>
                  </div>
                  <h4 class="font-bold text-base text-white mb-1" id="crf-active-client-name">العميل: سارة محمود</h4>
                  <p class="text-xs text-slate-300 mb-4">📍 المعادي، شارع 9، القاهرة</p>

                  <div class="grid grid-cols-2 gap-2 mb-4">
                    <a href="tel:0100000000" class="bg-slate-700 text-white text-xs py-2 rounded-xl text-center font-bold block">
                      📞 اتصال بالعميل
                    </a>
                    <a href="https://maps.google.com" target="_blank" class="bg-slate-700 text-white text-xs py-2 rounded-xl text-center font-bold block">
                      🗺️ الملاحة والـ GPS
                    </a>
                  </div>

                  <button onclick="craftsmanCompleteJob()" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-2xl text-sm transition shadow-lg">
                    🏁 تم إتمام الشغل واستلام الحساب
                  </button>
                </div>

                <!-- Idle Placeholder -->
                <div id="craftsman-idle-box" class="text-center py-16 text-slate-500">
                  <div class="text-5xl mb-3">📡</div>
                  <h4 class="font-bold text-slate-300 text-sm">في انتظار وصول طلب جديد...</h4>
                  <p class="text-xs mt-1 text-slate-500">نظام الـ GPS يبحث عن عملاء بالقرب من المعادي</p>
                </div>

              </div>

              <!-- Craftsman Footer -->
              <div class="bg-slate-950 border-t border-slate-800 px-6 py-2 flex items-center justify-between text-[11px] text-slate-500">
                <button class="flex flex-col items-center text-blue-400 font-bold">
                  <span>🏠</span> الرئيسية
                </button>
                <button class="flex flex-col items-center">
                  <span>💼</span> سجل أشغالي
                </button>
                <button class="flex flex-col items-center">
                  <span>💰</span> المحفظة
                </button>
                <button class="flex flex-col items-center">
                  <span>⚙️</span> إعداداتي
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- =================================================== -->
    <!-- VIEW 2: ADMIN DASHBOARD (لوحة الإدارة الكاملة)      -->
    <!-- =================================================== -->
    <div id="view-admin" class="hidden space-y-6">
      
      <!-- Admin Top Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
          <div class="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>إجمالي طلبات اليوم</span>
            <span class="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold">+18% عن أمس</span>
          </div>
          <div class="text-3xl font-black text-white font-inter" id="admin-kpi-orders">158</div>
          <div class="text-xs text-slate-500 mt-2">منها 14 طلب قيد التنفيذ الآن</div>
        </div>

        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
          <div class="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>حجم التداول اليوم (GMV)</span>
            <span class="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold font-inter">+24%</span>
          </div>
          <div class="text-3xl font-black text-amber-400 font-inter" id="admin-kpi-gmv">79,000 ج.م</div>
          <div class="text-xs text-slate-500 mt-2">متوسط قيمة الطلب: 500 ج.م</div>
        </div>

        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
          <div class="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>صافي عمولة حرفة (18%)</span>
            <span class="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold">ربح مباشر</span>
          </div>
          <div class="text-3xl font-black text-emerald-400 font-inter" id="admin-kpi-revenue">14,220 ج.م</div>
          <div class="text-xs text-slate-500 mt-2">عائد صافي بعد رسوم الدفع الإلكتروني</div>
        </div>

        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
          <div class="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>الحرفيين النشطين</span>
            <span class="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-[10px] font-bold font-inter">432 حرفي</span>
          </div>
          <div class="text-3xl font-black text-white font-inter" id="admin-kpi-craftsmen">432</div>
          <div class="text-xs text-amber-400 mt-2">⚠️ 3 طلبات انضمام بانتظار فحص البطاقة</div>
        </div>

      </div>

      <!-- Live Orders Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow">
        <div class="p-5 border-b border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 class="font-bold text-white text-lg">جدول العمليات الحية (Live Bookings Dispatch)</h3>
            <p class="text-xs text-slate-400">تحديث فوري لكل عملية تتم بين العملاء والحرفيين</p>
          </div>
          <button onclick="refreshData()" class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-xl border border-slate-700 transition">
            🔄 تحديث البيانات
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs">
            <thead class="bg-slate-800/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th class="p-3.5">رقم الطلب</th>
                <th class="p-3.5">العميل</th>
                <th class="p-3.5">الخدمة</th>
                <th class="p-3.5">الحرفي المنفذ</th>
                <th class="p-3.5">الموقع</th>
                <th class="p-3.5">الحالة</th>
                <th class="p-3.5">المبلغ</th>
                <th class="p-3.5">عمولة حرفة (18%)</th>
                <th class="p-3.5">طريقة الدفع</th>
              </tr>
            </thead>
            <tbody id="admin-bookings-table-body" class="divide-y divide-slate-800/60 font-cairo">
              <!-- Populated by JS -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Craftsmen Verification Queue -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow">
        <h3 class="font-bold text-white text-base mb-1">طابور توثيق الحرفيين (National ID & Vetting Queue)</h3>
        <p class="text-xs text-slate-400 mb-4">فحص صحيفة الحالة الجنائية وبطاقة الرقم القومي قبل إتاحة الحرفي للجمهور</p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="admin-craftsmen-cards">
          <!-- Populated by JS -->
        </div>
      </div>

    </div>

    <!-- =================================================== -->
    <!-- VIEW 3: LIVE API EXPLORER                          -->
    <!-- =================================================== -->
    <div id="view-api" class="hidden space-y-6 font-inter">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 class="text-lg font-bold text-white font-cairo mb-1">⚡ خادم الـ API الحقيقي (REST Endpoints)</h3>
        <p class="text-xs text-slate-400 font-cairo mb-6">
          يمكنك اختبار جميع الـ Endpoints المكتوبة في الـ Backend مباشرة واستلام رد JSON حي.
        </p>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="space-y-2">
            <label class="text-xs text-slate-400 font-semibold uppercase tracking-wider">اختر Endpoint للتجربة:</label>
            <button onclick="testApi('/api/services', 'GET')" class="w-full text-left bg-slate-800 hover:bg-slate-700 text-xs p-3 rounded-xl border border-slate-700 transition flex items-center justify-between">
              <span><span class="text-emerald-400 font-bold">GET</span> /api/services</span>
              <span class="text-[10px] text-slate-400">قائمة الـ 10 خدمات</span>
            </button>
            <button onclick="testApi('/api/craftsmen', 'GET')" class="w-full text-left bg-slate-800 hover:bg-slate-700 text-xs p-3 rounded-xl border border-slate-700 transition flex items-center justify-between">
              <span><span class="text-emerald-400 font-bold">GET</span> /api/craftsmen</span>
              <span class="text-[10px] text-slate-400">الحرفيين والتقييمات</span>
            </button>
            <button onclick="testApi('/api/bookings', 'GET')" class="w-full text-left bg-slate-800 hover:bg-slate-700 text-xs p-3 rounded-xl border border-slate-700 transition flex items-center justify-between">
              <span><span class="text-emerald-400 font-bold">GET</span> /api/bookings</span>
              <span class="text-[10px] text-slate-400">سجل كل الطلبات</span>
            </button>
            <button onclick="testApi('/api/admin/dashboard', 'GET')" class="w-full text-left bg-slate-800 hover:bg-slate-700 text-xs p-3 rounded-xl border border-slate-700 transition flex items-center justify-between">
              <span><span class="text-emerald-400 font-bold">GET</span> /api/admin/dashboard</span>
              <span class="text-[10px] text-slate-400">مؤشرات الأداء والأرباح</span>
            </button>
            <button onclick="testApi('/api/auth/send-otp', 'POST', { phone: '01012345678' })" class="w-full text-left bg-slate-800 hover:bg-slate-700 text-xs p-3 rounded-xl border border-slate-700 transition flex items-center justify-between">
              <span><span class="text-blue-400 font-bold">POST</span> /api/auth/send-otp</span>
              <span class="text-[10px] text-slate-400">إرسال كود OTP</span>
            </button>
          </div>

          <div class="lg:col-span-2">
            <div class="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span id="api-status-label" class="font-mono text-emerald-400">Response: 200 OK</span>
              <span class="text-slate-500 font-mono">Content-Type: application/json</span>
            </div>
            <pre id="api-output" class="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-emerald-400 font-mono overflow-x-auto h-[400px] custom-scroll">
// اضغط على أي Endpoint على اليمين لتشغيل الطلب واستلام رد JSON المباشر...
            </pre>
          </div>
        </div>
      </div>
    </div>

  </main>

  <!-- JAVASCRIPT STATE ENGINE & INTERACTIVE LOGIC -->
  <script>
    // Global state in sync with server
    let services = [];
    let bookings = [];
    let craftsmen = [];
    let activeCustomerBooking = null;
    let isCraftsmanAvailable = true;

    // View Switching
    function switchView(viewName) {
      document.getElementById('view-split').classList.add('hidden');
      document.getElementById('view-admin').classList.add('hidden');
      document.getElementById('view-api').classList.add('hidden');

      document.getElementById('btn-split').className = 'px-4 py-2 rounded-lg font-bold text-slate-300 hover:text-white transition-all';
      document.getElementById('btn-admin').className = 'px-4 py-2 rounded-lg font-bold text-slate-300 hover:text-white transition-all';
      document.getElementById('btn-api').className = 'px-4 py-2 rounded-lg font-bold text-slate-300 hover:text-white transition-all font-inter';

      if (viewName === 'split') {
        document.getElementById('view-split').classList.remove('hidden');
        document.getElementById('btn-split').className = 'px-4 py-2 rounded-lg font-bold transition-all bg-brandOrange text-white shadow';
      } else if (viewName === 'admin') {
        document.getElementById('view-admin').classList.remove('hidden');
        document.getElementById('btn-admin').className = 'px-4 py-2 rounded-lg font-bold transition-all bg-brandBlue text-white shadow border border-blue-400/30';
      } else if (viewName === 'api') {
        document.getElementById('view-api').classList.remove('hidden');
        document.getElementById('btn-api').className = 'px-4 py-2 rounded-lg font-bold transition-all bg-emerald-600 text-white shadow';
        testApi('/api/services', 'GET');
      }
    }

    // Load initial data from server
    async function loadData() {
      try {
        const [resSrv, resCrf, resBkg] = await Promise.all([
          fetch('/api/services').then(r => r.json()),
          fetch('/api/craftsmen').then(r => r.json()),
          fetch('/api/bookings').then(r => r.json()),
        ]);

        services = resSrv.data || [];
        craftsmen = resCrf.data || [];
        bookings = resBkg.data || [];

        renderCustomerServices();
        renderAdminTable();
        renderCraftsmenCards();
      } catch (e) {
        console.error('Failed to load data:', e);
      }
    }

    // Render customer categories grid
    function renderCustomerServices() {
      const grid = document.getElementById('customer-services-grid');
      grid.innerHTML = services.map(srv => \`
        <div onclick="requestService('\${srv.nameAr}', \${srv.minPrice})" class="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-400 cursor-pointer transition flex flex-col justify-between h-[115px] group">
          <div class="flex items-center justify-between">
            <span class="text-2xl group-hover:scale-110 transition-transform">\${srv.emoji}</span>
            <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">\${srv.minPrice}+ ج.م</span>
          </div>
          <div>
            <h4 class="font-bold text-sm text-slate-900 group-hover:text-orange-600 transition-colors">\${srv.nameAr}</h4>
            <div class="text-[10px] text-slate-400">\${srv.count}</div>
          </div>
        </div>
      \`).join('');
    }

    // Render Admin Table
    function renderAdminTable() {
      const tbody = document.getElementById('admin-bookings-table-body');
      tbody.innerHTML = bookings.map(b => {
        let badgeColor = 'bg-slate-800 text-slate-400';
        let statusAr = b.status;
        if (b.status === 'completed') { badgeColor = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'; statusAr = 'مكتمل ✅'; }
        if (b.status === 'in_progress') { badgeColor = 'bg-blue-500/20 text-blue-400 border border-blue-500/30'; statusAr = 'جاري التنفيذ 🛠️'; }
        if (b.status === 'confirmed') { badgeColor = 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'; statusAr = 'تم التأكيد ⚡'; }
        if (b.status === 'searching') { badgeColor = 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'; statusAr = 'جاري البحث ⏳'; }

        return \`
          <tr class="hover:bg-slate-800/40 transition">
            <td class="p-3.5 font-bold font-inter text-white">\${b.id}</td>
            <td class="p-3.5 font-bold text-slate-200">\${b.customerName}</td>
            <td class="p-3.5"><span class="bg-slate-800 text-orange-400 px-2 py-0.5 rounded font-bold">\${b.service}</span></td>
            <td class="p-3.5 text-slate-300">\${b.craftsmanName || '—'}</td>
            <td class="p-3.5 text-slate-400">\${b.address}</td>
            <td class="p-3.5"><span class="px-2.5 py-1 rounded-full text-[10px] font-bold \${badgeColor}">\${statusAr}</span></td>
            <td class="p-3.5 font-bold text-white font-inter">\${b.price} ج.م</td>
            <td class="p-3.5 font-bold text-emerald-400 font-inter">\${b.fee} ج.م</td>
            <td class="p-3.5 text-slate-400">\${b.method}</td>
          </tr>
        \`;
      }).join('');
    }

    // Render Craftsmen Verification Cards
    function renderCraftsmenCards() {
      const container = document.getElementById('admin-craftsmen-cards');
      container.innerHTML = craftsmen.map(c => \`
        <div class="bg-slate-800/80 p-4 rounded-xl border \${c.verified ? 'border-slate-700' : 'border-amber-500/50 bg-amber-950/20'}">
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-bold text-white text-sm">\${c.name}</h4>
            <span class="text-[10px] px-2 py-0.5 rounded font-bold \${c.verified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300 animate-pulse'}">
              \${c.verified ? 'موثق رسمياً ✅' : 'بانتظار الفحص ⏳'}
            </span>
          </div>
          <p class="text-xs text-slate-400 mb-2">\${c.skill} • \${c.area}</p>
          <div class="text-[11px] text-slate-300 font-inter mb-3">رقم قومي: \${c.nationalId}</div>
          \${!c.verified ? \`
            <button onclick="verifyCraftsman('\${c.id}')" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 rounded-lg text-xs transition">
              قبول وتوثيق الحساب
            </button>
          \` : \`
            <div class="text-[11px] text-emerald-400 font-semibold">✓ تم فحص الفيش الجنائي وصورة البطاقة</div>
          \`}
        </div>
      \`).join('');
    }

    // Customer requests a service
    async function requestService(serviceName, basePrice) {
      const price = basePrice + 100;
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: 'سارة محمود',
          service: serviceName,
          address: 'المعادي، شارع 9، القاهرة',
          price: price,
          problem: 'طلب صيانة عاجلة من تطبيق العميل'
        })
      });
      const data = await res.json();
      activeCustomerBooking = data.data;

      // Show in Customer App
      document.getElementById('customer-active-order').classList.remove('hidden');
      document.getElementById('cust-order-id').innerText = '#' + activeCustomerBooking.id;
      document.getElementById('cust-order-title').innerText = serviceName + ' — طلب جديد';
      document.getElementById('cust-order-price').innerText = price + ' ج.م';
      document.getElementById('cust-order-status-badge').innerText = 'جاري البحث عن أقرب حرفي...';
      document.getElementById('cust-progress-bar').style.width = '25%';

      // Show Alert in Craftsman App!
      if (isCraftsmanAvailable) {
        document.getElementById('craftsman-idle-box').classList.add('hidden');
        document.getElementById('craftsman-active-job-box').classList.add('hidden');
        document.getElementById('craftsman-alert-box').classList.remove('hidden');
        
        document.getElementById('crf-job-service').innerText = serviceName;
        document.getElementById('crf-job-price').innerText = price + ' ج.م';
        document.getElementById('crf-job-net').innerText = Math.round(price * 0.82) + ' ج.م';
      }

      await loadData();
    }

    // Craftsman accepts job
    async function craftsmanAcceptJob() {
      if (!activeCustomerBooking) return;

      await fetch('/api/bookings/' + activeCustomerBooking.id + '/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' })
      });

      // Update Craftsman View
      document.getElementById('craftsman-alert-box').classList.add('hidden');
      document.getElementById('craftsman-active-job-box').classList.remove('hidden');
      document.getElementById('crf-active-client-name').innerText = 'العميل: ' + activeCustomerBooking.customerName;

      // Update Customer View
      document.getElementById('cust-order-status-badge').innerText = 'الحرفي وافق وجاري التنفيذ 🛠️';
      document.getElementById('cust-progress-bar').style.width = '75%';

      await loadData();
    }

    // Craftsman declines job
    function craftsmanDeclineJob() {
      document.getElementById('craftsman-alert-box').classList.add('hidden');
      document.getElementById('craftsman-idle-box').classList.remove('hidden');
    }

    // Craftsman completes job
    async function craftsmanCompleteJob() {
      if (!activeCustomerBooking) return;

      await fetch('/api/bookings/' + activeCustomerBooking.id + '/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', rating: 5 })
      });

      // Update Craftsman View
      document.getElementById('craftsman-active-job-box').classList.add('hidden');
      document.getElementById('craftsman-idle-box').classList.remove('hidden');
      document.getElementById('crf-today-earn').innerText = '850 ج.م';

      // Update Customer View
      document.getElementById('cust-order-status-badge').innerText = 'تم الانتهاء بنجاح! ⭐⭐⭐⭐⭐';
      document.getElementById('cust-progress-bar').style.width = '100%';
      document.getElementById('cust-progress-bar').className = 'bg-emerald-500 h-full w-full';

      await loadData();
      alert('🎉 مبروك! تم إتمام العملية بنجاح وتسجيل العمولة في حساب المنصة.');
    }

    // Cancel active order
    function cancelActiveOrder() {
      document.getElementById('customer-active-order').classList.add('hidden');
      craftsmanDeclineJob();
    }

    // Toggle Craftsman Availability
    function toggleCraftsmanAvailability() {
      isCraftsmanAvailable = !isCraftsmanAvailable;
      const dot = document.getElementById('craftsman-dot');
      const text = document.getElementById('craftsman-status-text');
      const btn = document.getElementById('toggle-avail-btn');

      if (isCraftsmanAvailable) {
        dot.className = 'w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping';
        text.innerText = 'أنت متاح للعمل الآن 🟢';
        text.className = 'text-sm font-bold text-emerald-400';
        btn.innerText = 'إيقاف مؤقت';
        btn.className = 'bg-emerald-600 hover:bg-emerald-500 text-xs px-3 py-1.5 rounded-xl font-bold transition';
      } else {
        dot.className = 'w-3.5 h-3.5 rounded-full bg-red-500';
        text.innerText = 'أنت غير متاح حالياً 🔴';
        text.className = 'text-sm font-bold text-red-400';
        btn.innerText = 'تفعيل التوفر';
        btn.className = 'bg-blue-600 hover:bg-blue-500 text-xs px-3 py-1.5 rounded-xl font-bold transition';
        craftsmanDeclineJob();
      }
    }

    // Quick demo simulation
    function triggerQuickDemo() {
      requestService('سباكة', 350);
    }

    // Verify craftsman
    function verifyCraftsman(id) {
      const c = craftsmen.find(item => item.id === id);
      if (c) c.verified = true;
      renderCraftsmenCards();
      alert('✅ تم اعتماد الحرفي وتوثيق حسابه بنجاح!');
    }

    // Test API in playground
    async function testApi(endpoint, method, bodyData) {
      document.getElementById('api-status-label').innerText = 'Requesting...';
      const options = { method: method };
      if (bodyData) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(bodyData);
      }
      try {
        const res = await fetch(endpoint, options);
        const data = await res.json();
        document.getElementById('api-status-label').innerText = \`Status: \${res.status} \${res.statusText}\`;
        document.getElementById('api-output').innerText = JSON.stringify(data, null, 2);
      } catch (e) {
        document.getElementById('api-output').innerText = '// Error: ' + e.message;
      }
    }

    // Initial load
    loadData();
  </script>

</body>
</html>`;
}
