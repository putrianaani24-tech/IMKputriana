import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Hammer, Crown, Heart, Gift, Compass, 
  ArrowDownCircle, BadgeCheck, CheckCircle, Search, ArrowUpDown,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Product, Order, CartItem, User as UserType } from './types';
import { Header, Footer } from './components/HeaderFooter';
import ProductCard from './components/ProductCard';
import CharmBuilder from './components/CharmBuilder';
import CartCheckout from './components/CartCheckout';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import CustomerOrders from './components/CustomerOrders';

export default function App() {
  // Core states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentView, setCurrentView] = useState<'catalog' | 'admin'>('catalog');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User Authentication States
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    const saved = localStorage.getItem('pink_luxury_logged_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'customer_login' | 'customer_register' | 'admin'>('customer_login');

  // Filter states
  const [activeCategory, setActiveCategory] = useState<'all' | 'gelang' | 'kalung' | 'cincin' | 'anting'>('all');
  const [activeType, setActiveType] = useState<'all' | 'base' | 'charm'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'default' | 'priceAsc' | 'priceDesc' | 'newest'>('default');

  // Selected base product preloaded into the workshop
  const [selectedBaseForBuilder, setSelectedBaseForBuilder] = useState<Product | undefined>(undefined);

  // Ref to scroll to the customizer workshop smoothly
  const builderSectionRef = useRef<HTMLDivElement>(null);

  // Hero Interactive Showcase States
  const [heroSelectedCharms, setHeroSelectedCharms] = useState<string[]>(['heart', 'sparkles']);
  const [heroActiveTheme, setHeroActiveTheme] = useState<'bracelet' | 'necklace'>('bracelet');
  const [heroMousePos, setHeroMousePos] = useState({ x: 0, y: 0 });
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [popParticles, setPopParticles] = useState<{ id: number; x: number; y: number; char: string; color: string }[]>([]);

  // Login handler
  const handleLoginSuccess = (user: UserType) => {
    setCurrentUser(user);
    localStorage.setItem('pink_luxury_logged_user', JSON.stringify(user));
    
    // If they logged in as Admin, redirect them to the Admin view!
    if (user.role === 'admin') {
      setCurrentView('admin');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pink_luxury_logged_user');
    // If they were on admin view, kick them back to catalog
    if (currentView === 'admin') {
      setCurrentView('catalog');
    }
  };

  const handleViewChange = (view: 'catalog' | 'admin') => {
    if (view === 'admin') {
      if (currentUser) {
        if (currentUser.role !== 'admin') {
          alert("Akses ditolak. Anda saat ini masuk sebagai Pelanggan. Silakan keluar dari akun Anda terlebih dahulu untuk mengakses menu Admin.");
          return;
        }
      } else {
        handleOpenAuthModal('admin');
        return;
      }
    }
    setCurrentView(view);
  };

  const handleOpenAuthModal = (tab: 'customer_login' | 'customer_register' | 'admin' = 'customer_login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };


  // Fetch initial products and orders on mount
  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error("Gagal mengambil data katalog produk.");
      const data = await res.json();
      setProducts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error("Gagal mengambil data pesanan admin.");
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      console.error("Orders fetching failed", err);
    }
  };

  // Administrative handlers
  const handleCreateProduct = async (newProduct: Omit<Product, 'id'>) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Gagal membuat produk.");
    }
    await fetchProducts(); // Reload catalog
  };

  const handleUpdateProduct = async (id: number, partialProduct: Partial<Product>) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partialProduct)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Gagal memperbarui produk.");
    }
    await fetchProducts(); // Reload catalog
  };

  const handleDeleteProduct = async (id: number) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Gagal menghapus produk.");
    }
    await fetchProducts(); // Reload catalog
  };

  const handleUpdateOrderStatus = async (orderId: number, status: Order['status']) => {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Gagal memperbarui status order.");
    }
    await fetchOrders(); // Reload orders
  };

  // Cart operations
  const handleAddBespokeToCart = (bespokeItem: Omit<CartItem, 'id'>) => {
    const uniqueId = `bespoke-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newCartItem: CartItem = {
      id: uniqueId,
      ...bespokeItem
    };
    setCart(prev => [...prev, newCartItem]);
    setIsCartOpen(true); // Auto-open cart to showcase luxury progress
  };

  const handleUpdateCartQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return;
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const handleRemoveCartItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // When checkout successfully completes, update local data
  const handleCheckoutSuccess = (order: any) => {
    fetchProducts(); // Reload products to get latest stock levels
    fetchOrders(); // Reload orders to populate admin panel
  };

  // Triggers when user clicks "Customize Base" on product card
  const handleSelectBaseForWorkshop = (base: Product) => {
    setSelectedBaseForBuilder(base);
    // Smooth scroll down to builder section
    builderSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Filter and sort local product lists based on user intent (kalung, gelang, cincin, anting)
  const filteredProducts = products
    .filter(product => {
      const categoryMatch = activeCategory === 'all' || product.category === activeCategory;
      const typeMatch = activeType === 'all' || product.type === activeType;
      const searchMatch = searchQuery.trim() === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && typeMatch && searchMatch;
    })
    .sort((a, b) => {
      if (sortOption === 'priceAsc') {
        return a.price - b.price;
      }
      if (sortOption === 'priceDesc') {
        return b.price - a.price;
      }
      if (sortOption === 'newest') {
        return b.id - a.id;
      }

      const order: Record<string, number> = {
        'kalung': 1,
        'gelang': 2,
        'cincin': 3,
        'anting': 4
      };
      const orderA = order[a.category] || 5;
      const orderB = order[b.category] || 5;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // Within the same category, place base items before charms
      if (a.type !== b.type) {
        return a.type === 'base' ? -1 : 1;
      }
      
      return a.id - b.id;
    });

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-between" id="pink-luxury-root">
      
      {/* HEADER NAVIGATION */}
      <Header 
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        currentView={currentView}
        onChangeView={handleViewChange}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
      />

      {/* CART CHECKOUT FLOATING PANEL */}
      <CartCheckout
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onCheckoutSuccess={handleCheckoutSuccess}
        currentUser={currentUser}
      />

      {/* CUSTOMER ORDER TRACKING PANEL */}
      <CustomerOrders
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        onRefreshOrders={fetchOrders}
        currentUser={currentUser}
        onOpenAuthModal={() => handleOpenAuthModal('customer_login')}
      />


      {/* MAIN BODY FRAME */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {currentView === 'catalog' ? (
          /* ==========================================
             CONSUMER VIEW: LANDING & CATALOG WORKSHOP
             ========================================== */
          <div className="space-y-12">
            
            {/* ELEGANT LUXURY HERO BANNER WITH INTERACTIVE ATELIER SHOWCASE */}
            <section 
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                setHeroMousePos({ x, y });
              }}
              className="relative rounded-3xl overflow-hidden bg-[#241517] text-[#FFFDF9] py-12 lg:py-16 px-6 sm:px-10 md:px-16 shadow-2xl border border-rose-gold/15 transition-all min-h-[500px]"
              id="luxury-interactive-hero"
            >
              {/* Glowing Ambient Highlights - Guided gently by the cursor positions */}
              <motion.div 
                className="absolute pointer-events-none rounded-full bg-rose-gold/10 blur-3xl w-[400px] h-[400px] -z-1"
                animate={{
                  x: heroMousePos.x * 60,
                  y: heroMousePos.y * 60,
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 60 }}
                style={{ top: '10%', left: '5%' }}
              />
              <motion.div 
                className="absolute pointer-events-none rounded-full bg-rose-dust/10 blur-3xl w-[450px] h-[450px] -z-1"
                animate={{
                  x: -heroMousePos.x * 80,
                  y: -heroMousePos.y * 80,
                }}
                transition={{ type: 'spring', damping: 35, stiffness: 50 }}
                style={{ bottom: '-10%', right: '-5%' }}
              />

              {/* Magical Drifting Star Particles (Gold Dust) */}
              {[
                { id: 1, top: '8%', left: '12%', size: 3, delay: 0, duration: 8 },
                { id: 2, top: '22%', left: '88%', size: 5, delay: 1, duration: 11 },
                { id: 3, top: '78%', left: '15%', size: 4, delay: 2, duration: 13 },
                { id: 4, top: '82%', left: '78%', size: 5, delay: 0.5, duration: 9 },
                { id: 5, top: '42%', left: '62%', size: 3, delay: 1.5, duration: 10 },
                { id: 6, top: '18%', left: '48%', size: 4, delay: 2.5, duration: 7 },
                { id: 7, top: '65%', left: '92%', size: 4, delay: 3, duration: 12 },
                { id: 8, top: '55%', left: '5%', size: 5, delay: 0.8, duration: 9 },
              ].map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute bg-rose-gold rounded-full opacity-45 pointer-events-none z-0"
                  style={{
                    top: p.top,
                    left: p.left,
                    width: p.size,
                    height: p.size,
                    boxShadow: '0 0 8px #C8A27C'
                  }}
                  animate={{
                    y: [0, -35, 0],
                    x: [0, 18, 0],
                    opacity: [0.2, 0.8, 0.2],
                    scale: [1, 1.3, 1]
                  }}
                  transition={{
                    duration: p.duration,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: 'easeInOut'
                  }}
                />
              ))}

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                
                {/* LEFT COLUMN: THE ATELIER LORE & NAVIGATION */}
                <div className="lg:col-span-7 space-y-6 text-left">
                  <div className="inline-flex items-center gap-2 bg-[#FFFDF9]/15 px-3.5 py-1.5 rounded-full border border-rose-dust/20 shadow-sm backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-[#E1B3B5] animate-pulse" />
                    <span className="text-[9px] font-bold tracking-widest uppercase text-rose-dust">Atelier Haute Kriya</span>
                  </div>

                  <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight text-white leading-[1.35] select-none">
                    {/* Beautiful, elegant luxury title layout */}
                    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
                      <motion.span
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="font-serif text-white tracking-tight"
                      >
                        Sampaikan
                      </motion.span>

                      <motion.span
                        initial={{ opacity: 0, scale: 0.96, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="font-serif italic text-rose-dust relative inline-block pb-1.5"
                      >
                        <span className="relative z-10 bg-gradient-to-r from-rose-dust via-[#FAF6F0] to-rose-gold bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(225,179,181,0.2)] animate-luxury-flow">
                          Cerita Indahmu
                        </span>
                        {/* Elegant modern hand-drawn signature luxury underline line */}
                        <motion.span
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 1.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute left-0 bottom-1 w-full h-[3px] bg-gradient-to-r from-rose-gold/60 via-rose-dust to-[#C8A27C]/60 rounded-full origin-left"
                        />
                      </motion.span>
                    </div>

                    {/* 'Melalui Kriya Seni Logam Mulia' subtitle animated smoothly as a sleek golden gradient text block */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-3 text-xl sm:text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FFFDF9]/90 to-rose-dust font-light tracking-wide flex items-center gap-2 animate-luxury-flow"
                    >
                      <span>Melalui Kriya Seni Logam Mulia</span>
                      <motion.span 
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-block text-[#C8A27C] text-lg sm:text-xl md:text-2xl"
                      >
                        ✦
                      </motion.span>
                    </motion.div>
                  </h2>

                  <p className="text-xs md:text-sm text-[#E1B3B5]/85 leading-relaxed font-light max-w-xl" style={{ fontFamily: "'Playfair Display', serif", textAlign: 'justify' }}>
                    Di L'Atelier d'Ana, jadilah kurator bagi keanggunan Anda sendiri. Pilih untaian rose gold murni terbaik, padukan dengan kilau permata & kristal pilihan, lalu ciptakan sebuah mahakarya abadi yang memancarkan pesona jati diri Anda yang tiada duanya. ✦
                  </p>

                  <div className="flex flex-wrap gap-3 pt-3">
                    <button
                      onClick={() => {
                        builderSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="bg-rose-gold text-white px-6 py-3 rounded-xl font-bold text-xs tracking-wider uppercase shadow-lg hover:bg-rose-gold/90 hover:shadow-xl hover:scale-102 transition-all flex items-center gap-2 active:scale-98"
                    >
                      <Hammer className="w-4 h-4" />
                      Mulai Desain Kustom Anda
                    </button>
                    <a
                      href="#master-catalog"
                      className="bg-[#FFFDF9]/5 text-white border border-rose-dust/30 px-5 py-3 rounded-xl font-bold text-xs tracking-wider uppercase hover:bg-white/10 hover:border-white/50 transition-all flex items-center gap-2"
                    >
                      <Compass className="w-4 h-4" />
                      Katalog Elemen Dasar
                    </a>
                  </div>

                  {/* Micro reassurance lines */}
                  <div className="flex gap-4 text-[9px] text-[#A47F81] font-mono pt-2">
                    <span>✦ Garansi Keaslian Logam 18K</span>
                    <span>✦ Maestro Perakitan Manual</span>
                    <span>✦ Sertifikat Lab</span>
                  </div>
                </div>

                {/* RIGHT COLUMN: SPOTLIGHT MASTERPIECE CAROUSEL */}
                <div className="lg:col-span-5 flex flex-col items-center" style={{ perspective: 1200 }}>
                  <motion.div 
                    animate={{
                      rotateY: heroMousePos.x * 12,
                      rotateX: -heroMousePos.y * 12,
                      z: 15
                    }}
                    transition={{ type: 'spring', damping: 25, stiffness: 80 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className="w-full max-w-[340px] bg-[#1E1113] border border-rose-gold/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col items-center justify-between text-center min-h-[410px]" 
                    id="interactive-hero-tray"
                  >
                    {/* Inner velvet stitch border */}
                    <div className="absolute inset-2 border border-dashed border-rose-gold/15 rounded-2xl pointer-events-none" />
                    
                    {/* Tray Status Label */}
                    <div className="w-full flex justify-between items-center text-[8px] font-mono tracking-wider text-rose-gold/60 uppercase relative z-10 pb-2 border-b border-rose-gold/10">
                      <span>Atelier Spotlight</span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Crown className="w-2.5 h-2.5" />
                        Koleksi Mahakarya
                      </span>
                    </div>

                    {/* Masterpiece Showcase Slide */}
                    {(() => {
                      const featuredMasterpieces = [
                        {
                          name: "Kalung Clover Blossom Elegance",
                          category: "kalung",
                          price: 2850000,
                          image_url: "/src/assets/images/regenerated_image_1782825049628.jpg",
                          description: "Desain berkelas bertakhta kelopak semanggi kristal berkilau."
                        },
                        {
                          name: "Gelang Perak Ranting Daun Laurel",
                          category: "gelang",
                          price: 1850000,
                          image_url: "/src/assets/images/regenerated_image_1782825054591.jpg",
                          description: "Ukiran daun laurel perak murni sterling .925 buatan tangan."
                        },
                        {
                          name: "Cincin Twist Sapphire & Diamond Vine",
                          category: "cincin",
                          price: 1550000,
                          image_url: "/src/assets/images/regenerated_image_1782825059369.jpg",
                          description: "Balutan ranting safir biru safir dan berlian cz yang menawan."
                        },
                        {
                          name: "Anting Stacked Piercing Set - Golden Elegance",
                          category: "anting",
                          price: 2350000,
                          image_url: "/src/assets/images/regenerated_image_1782825062687.jpg",
                          description: "Set anting emas dengan rantai mutiara menggantung nan indah."
                        }
                      ];

                      const currentSlide = featuredMasterpieces[activeHeroSlide];

                      return (
                        <div className="w-full py-3 flex-1 flex flex-col justify-between relative z-10">
                          {/* Image frame */}
                          <div className="relative w-full h-40 flex items-center justify-center my-1 select-none">
                            {/* Glowing ambient background */}
                            <div className="absolute w-28 h-28 rounded-full bg-rose-dust/20 blur-2xl pointer-events-none" />
                            
                            {/* Carousel Left/Right Buttons */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveHeroSlide(prev => (prev - 1 + featuredMasterpieces.length) % featuredMasterpieces.length);
                              }}
                              className="absolute left-0 z-20 p-1.5 rounded-full bg-black/40 border border-white/10 hover:bg-rose-gold/30 hover:border-rose-gold text-white transition-all cursor-pointer"
                              title="Sebelumnya"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveHeroSlide(prev => (prev + 1) % featuredMasterpieces.length);
                              }}
                              className="absolute right-0 z-20 p-1.5 rounded-full bg-black/40 border border-white/10 hover:bg-rose-gold/30 hover:border-rose-gold text-white transition-all cursor-pointer"
                              title="Berikutnya"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>

                            {/* Main Slide Image */}
                            <motion.div
                              key={activeHeroSlide}
                              initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                              exit={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                              transition={{ duration: 0.4 }}
                              className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-rose-gold/40 shadow-xl bg-black/20"
                            >
                              <img 
                                src={currentSlide.image_url} 
                                alt={currentSlide.name} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </motion.div>
                          </div>

                          {/* Slide Info Block */}
                          <div className="space-y-1 my-2">
                            <span className="text-[7.5px] uppercase font-bold text-rose-gold/80 tracking-widest block">
                              {currentSlide.category} kriya
                            </span>
                            <h4 className="text-xs font-serif text-white font-bold tracking-wide truncate max-w-[280px] mx-auto">
                              {currentSlide.name}
                            </h4>
                            <p className="text-[9.5px] text-rose-dust/70 leading-relaxed max-w-[240px] mx-auto min-h-[28px] line-clamp-2">
                              {currentSlide.description}
                            </p>
                          </div>

                          {/* Price Tag & Workshop trigger */}
                          <div className="w-full space-y-2 mt-1">
                            <div className="bg-[#170B0D] border border-rose-gold/10 rounded-xl py-1.5 px-3 flex justify-between items-center">
                              <span className="text-[7.5px] uppercase font-bold text-gray-400 tracking-wider">Harga Koleksi</span>
                              <span className="text-xs font-serif text-rose-gold font-bold">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(currentSlide.price)}
                              </span>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.03, boxShadow: "0 10px 20px -10px rgba(200, 162, 124, 0.4)" }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                // Find matching product in local state
                                const matched = products.find(p => p.name.toLowerCase().includes(currentSlide.name.toLowerCase().substring(0, 15)));
                                if (matched) {
                                  handleSelectBaseForWorkshop(matched);
                                } else {
                                  // Fallback to base category selection
                                  const fallback = products.find(p => p.category === currentSlide.category && p.type === 'base');
                                  if (fallback) {
                                    handleSelectBaseForWorkshop(fallback);
                                  } else {
                                    builderSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }
                                }
                              }}
                              className="w-full bg-gradient-to-r from-rose-gold/30 to-[#C8A27C]/60 border border-rose-gold/40 hover:from-rose-gold/50 hover:to-[#C8A27C]/80 text-white py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all"
                            >
                              Sesuaikan di Workshop ✦
                            </motion.button>
                          </div>

                          {/* Carousel Dots */}
                          <div className="flex justify-center gap-1.5 mt-3">
                            {featuredMasterpieces.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setActiveHeroSlide(index)}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  index === activeHeroSlide ? 'bg-rose-gold w-3' : 'bg-rose-gold/20'
                                }`}
                                title={`Slide ${index + 1}`}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                </div>
              </div>
            </section>

            {/* ATELIER ASSURANCES STRIP */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Crown, title: "Lapisan Emas 18K", desc: "Daya tahan tanpa kompromi" },
                { icon: Hammer, title: "Dirakit Manual", desc: "Sambungan rantai presisi" },
                { icon: Gift, title: "Kemasan Eksklusif", desc: "Kotak beludru & sertifikat" },
                { icon: BadgeCheck, title: "Batu Permata Asli", desc: "Pink quartz bersertifikat" }
              ].map((item, idx) => (
                <div key={idx} className="bg-[#FFFDF9] border border-rose-dust/15 rounded-2xl p-4 flex items-start gap-3 shadow-sm hover:border-rose-gold/20 transition-all">
                  <div className="p-2 bg-rose-dust/10 rounded-xl text-rose-gold shrink-0">
                    <item.icon className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-luxury-dark">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </section>

            {/* CATALOG SECTION (GRID LIST) */}
            <section id="master-catalog" className="scroll-mt-24 space-y-6">
              <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-rose-dust/20 pb-4">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-rose-gold uppercase block">The Jewelry Boutique</span>
                  <h3 className="font-serif-luxury text-2xl md:text-3xl text-[#764d50] font-semibold mt-1">
                    Jelajahi Elemen Perhiasan
                  </h3>
                </div>

                {/* FILTERS TOOLBAR */}
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                  
                  {/* Search bar */}
                  <div className="relative w-full sm:w-64 md:w-72 lg:w-80">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-rose-gold/50">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Cari perhiasan kriya atau kategori..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-rose-dust/30 bg-[#FFFDF9] focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold/20 text-luxury-dark placeholder-rose-gold/40 transition-all shadow-xs"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-rose-gold/40 hover:text-rose-gold transition-all"
                        title="Hapus pencarian"
                      >
                        <span className="text-xs">✕</span>
                      </button>
                    )}
                  </div>

                  {/* Category filter */}
                  <div className="flex items-center bg-rose-dust/10 p-1 rounded-xl flex-wrap">
                    {[
                      { key: 'all', label: 'Semua' },
                      { key: 'gelang', label: 'Gelang' },
                      { key: 'kalung', label: 'Kalung' },
                      { key: 'cincin', label: 'Cincin' },
                      { key: 'anting', label: 'Anting' }
                    ].map((btn) => (
                      <button
                        key={btn.key}
                        onClick={() => setActiveCategory(btn.key as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                          activeCategory === btn.key
                            ? 'bg-rose-gold text-white shadow-xs'
                            : 'text-luxury-dark hover:bg-rose-dust/10'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Type filter */}
                  <div className="flex items-center bg-rose-dust/10 p-1 rounded-xl">
                    {[
                      { key: 'all', label: 'Semua Tipe' },
                      { key: 'base', label: 'Perhiasan Dasar' },
                      { key: 'charm', label: 'Charm Saja' }
                    ].map((btn) => (
                      <button
                        key={btn.key}
                        onClick={() => setActiveType(btn.key as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                          activeType === btn.key
                            ? 'bg-rose-gold text-white shadow-xs'
                            : 'text-luxury-dark hover:bg-rose-dust/10'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Sort options dropdown */}
                  <div className="relative w-full sm:w-auto">
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as any)}
                      className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2 text-xs rounded-xl border border-rose-dust/30 bg-[#FFFDF9] focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold/20 text-luxury-dark transition-all shadow-xs font-medium cursor-pointer"
                    >
                      <option value="default">Urutan Standar</option>
                      <option value="priceAsc">Harga: Terendah ke Tertinggi</option>
                      <option value="priceDesc">Harga: Tertinggi ke Terendah</option>
                      <option value="newest">Pendatang Baru (Terbaru)</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-rose-gold/60">
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </span>
                  </div>

                </div>
              </div>

              {/* PRODUCTS LIST GRID */}
              {loading ? (
                <div className="text-center py-20">
                  <div className="relative w-12 h-12 mx-auto mb-4">
                    <div className="absolute inset-0 border-4 border-rose-dust/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-rose-gold border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-sm text-rose-dust font-serif italic">Memuat katalog indah kami...</p>
                </div>
              ) : error ? (
                <div className="text-center py-16 bg-red-50 rounded-3xl border border-red-100 p-6">
                  <p className="text-sm text-red-800">{error}</p>
                  <button 
                    onClick={fetchProducts} 
                    className="mt-4 px-5 py-2.5 bg-rose-gold text-white rounded-xl text-xs font-semibold shadow hover:bg-rose-gold/90 transition-all"
                  >
                    Coba Hubungkan Kembali
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-rose-dust/30 rounded-3xl bg-white text-rose-dust flex flex-col items-center justify-center gap-4">
                  <p className="text-sm font-serif italic text-rose-gold/75">
                    Tidak ada perhiasan yang sesuai dengan pencarian atau filter kriya Anda.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                      setActiveType('all');
                      setSortOption('default');
                    }}
                    className="px-5 py-2 bg-rose-dust/20 hover:bg-rose-dust/30 text-luxury-dark rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer"
                  >
                    Atur Ulang Pencarian & Filter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelectBase={handleSelectBaseForWorkshop}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* CORE INTERACTIVE CHARM BUILDER WORKSHOP */}
            <section ref={builderSectionRef} className="scroll-mt-24 space-y-4">
              <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
                <span className="text-[10px] font-bold tracking-widest text-rose-gold uppercase block">Bespoke Workshop Atelier</span>
                <h3 className="font-serif-luxury text-3xl text-luxury-dark font-bold">
                  Buka Kreativitas Anda
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Pilih rantai dasar emas atau perak di bawah ini, lalu rancang kombinasi pesona Anda sendiri di kanvas visual. Lihat kilauan, evaluasi harga langsung, dan masukkan karya agung Anda ke dalam keranjang.
                </p>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-sm text-rose-dust">Menyiapkan workspace...</p>
                </div>
              ) : (
                <CharmBuilder
                  products={products}
                  selectedBaseProduct={selectedBaseForBuilder}
                  onAddBespokeToCart={handleAddBespokeToCart}
                />
              )}
            </section>

          </div>
        ) : (
          /* ==========================================
             ADMIN DASHBOARD CORE FULFILLMENT VIEWS
             ========================================== */
          <AdminDashboard
            products={products}
            onRefreshProducts={fetchProducts}
            orders={orders}
            onRefreshOrders={fetchOrders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onCreateProduct={handleCreateProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            currentUser={currentUser}
            onOpenAuthModal={handleOpenAuthModal}
          />
        )}

      </main>

      {/* AUTHENTICATION MODAL OVERLAY */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialTab={authModalTab}
      />

      {/* FOOTER */}
      <Footer />

    </div>
  );
}
