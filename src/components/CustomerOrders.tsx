import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Search, Sparkles, ShoppingBag, MapPin, QrCode, 
  Printer, ShieldCheck, Clock, Hammer, Truck, BadgeCheck, 
  HelpCircle, ChevronDown, ChevronUp, Calendar, Compass, Star 
} from 'lucide-react';
import { Order, User } from '../types';

interface CustomerOrdersProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onRefreshOrders: () => Promise<void>;
  currentUser: User | null;
  onOpenAuthModal: () => void;
}

export default function CustomerOrders({
  isOpen,
  onClose,
  orders,
  onRefreshOrders,
  currentUser,
  onOpenAuthModal
}: CustomerOrdersProps) {
  const [searchEmail, setSearchEmail] = useState(currentUser?.email || '');
  const [hasSearched, setHasSearched] = useState(!!currentUser?.email);
  const [expandedOrders, setExpandedOrders] = useState<{ [id: number]: boolean }>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;
    setHasSearched(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshOrders();
    setIsRefreshing(false);
  };

  // Filter orders by email
  const customerOrders = orders.filter(
    order => order.customer_email.toLowerCase().trim() === searchEmail.toLowerCase().trim()
  ).sort((a, b) => b.id - a.id); // newest first

  const toggleOrderExpand = (id: number) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Generate estimation details dynamically for an order based on items and date
  const getOrderEstimationDetails = (order: Order) => {
    const today = new Date(order.created_at);
    
    // Calculate production days based on what typical products would need (matching CartCheckout rules)
    let productionDays = 1;
    // Default fallback calculation
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        let itemDays = 1;
        if (item.product_type === 'charm') itemDays += 1;
        if (itemDays > productionDays) productionDays = itemDays;
      });
    }

    // Estimate shipping days based on address keywords
    let shippingDays = 2; // default
    const addr = (order.shipping_address || '').toLowerCase();
    if (addr.includes('jakarta') || addr.includes('tangerang') || addr.includes('bekasi') || addr.includes('depok') || addr.includes('grand indonesia')) {
      shippingDays = 1;
    } else if (addr.includes('bandung') || addr.includes('banten') || addr.includes('jawa barat')) {
      shippingDays = 2;
    } else if (addr.includes('singapore') || addr.includes('japan') || addr.includes('tokyo') || addr.includes('luar negeri')) {
      shippingDays = 5;
    } else if (addr.includes('bali') || addr.includes('surabaya') || addr.includes('yogyakarta')) {
      shippingDays = 3;
    } else {
      shippingDays = 4;
    }

    const totalStart = productionDays + shippingDays;
    const totalEnd = totalStart + 2;
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + totalStart);
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + totalEnd);
    
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const startStr = startDate.toLocaleDateString('id-ID', options);
    const endStr = endDate.toLocaleDateString('id-ID', options);

    return {
      productionDays,
      shippingDays,
      totalStart,
      totalEnd,
      dateRange: `${startStr} - ${endStr} 2026`
    };
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-full uppercase tracking-wider">
            Menunggu Pembayaran
          </span>
        );
      case 'paid':
        return (
          <span className="px-2.5 py-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full uppercase tracking-wider">
            Lunas & Antrean Desain
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-1 text-[9px] font-bold text-rose-gold bg-rose-gold/10 border border-rose-gold/20 rounded-full uppercase tracking-wider animate-pulse">
            Perakitan Manual Maestro
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2.5 py-1 text-[9px] font-bold text-blue-800 bg-blue-50 border border-blue-200 rounded-full uppercase tracking-wider">
            Dikirim Kargo Premium
          </span>
        );
      default:
        return null;
    }
  };

  // Helper to determine active step in the workshop timeline (0 to 5)
  const getActiveTimelineStep = (status: Order['status']): number => {
    if (status === 'pending') return 0;
    if (status === 'paid') return 1; // casting
    if (status === 'processing') return 3; // customizer active
    if (status === 'shipped') return 5; // cargo transit
    return 2;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex" id="customer-orders-drawer">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2F1F21]/45 backdrop-blur-sm"
          />

          {/* Right Sided Drawer Panel */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="relative ml-auto w-full max-w-lg bg-[#FFFDF9] border-l border-rose-dust/30 shadow-2xl flex flex-col overflow-hidden h-full z-10"
            id="customer-orders-panel"
          >
            
            {/* Header section */}
            <div className="px-6 py-5 border-b border-rose-dust/15 flex items-center justify-between bg-[#FFFDF9] shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl bg-rose-dust/10 text-rose-gold flex items-center justify-center">
                  <Compass className="w-5 h-5 animate-[spin_8s_linear_infinite]" />
                </span>
                <div>
                  <h3 className="font-serif-luxury text-xl font-bold text-luxury-dark">
                    Lacak Mahakarya Anda
                  </h3>
                  <p className="text-[10px] text-rose-gold uppercase tracking-wider font-semibold">
                    Riwayat Pesanan & Real-Time Workshop Tracking
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-rose-dust/10 text-gray-400 hover:text-luxury-dark transition-colors"
                id="close-customer-orders"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Frame */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              
              {/* Profile Link or Search Bar */}
              <div className="bg-white border border-rose-dust/15 rounded-2xl p-4 shadow-sm space-y-3">
                <h4 className="text-[10px] font-bold text-[#A47F81] uppercase tracking-widest">
                  Masukkan Email Pembelian Anda
                </h4>
                
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-rose-gold">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="Contoh: sitirahma@example.com"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-rose-dust/25 bg-white focus:outline-none focus:border-rose-gold text-xs font-medium text-luxury-dark placeholder-rose-dust/40"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 bg-rose-gold text-white text-xs font-bold rounded-xl hover:bg-rose-gold/90 transition-all uppercase tracking-wide shrink-0"
                    id="btn-search-orders"
                  >
                    Cari
                  </button>
                </form>

                {/* If user is authenticated, sync automatically */}
                {currentUser ? (
                  <div className="text-[10px] text-gray-400 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                    <span>Sinkron dengan profil aktif: <strong>{currentUser.name}</strong> ({currentUser.email})</span>
                  </div>
                ) : (
                  <p className="text-[10px] text-rose-dust font-medium leading-normal">
                    💡 Hubungkan akun Anda untuk kemudahan pelacakan otomatis tanpa memasukkan email berulang kali.{' '}
                    <button 
                      onClick={() => {
                        onClose();
                        onOpenAuthModal();
                      }}
                      className="text-rose-gold underline font-bold"
                    >
                      Masuk Sekarang
                    </button>
                  </p>
                )}
              </div>

              {/* Order Results Section */}
              {hasSearched && (
                <div className="space-y-4">
                  
                  {/* Results Heading & Refresh button */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif-luxury text-sm text-luxury-dark font-extrabold flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-rose-gold" />
                      Daftar Pesanan ({customerOrders.length})
                    </h3>
                    
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="text-[10px] text-rose-gold hover:underline font-bold flex items-center gap-1 disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Perbarui Data
                    </button>
                  </div>

                  {customerOrders.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-rose-dust/20 rounded-2xl bg-white p-6">
                      <HelpCircle className="w-10 h-10 text-rose-dust/40 mx-auto mb-2" />
                      <h4 className="text-xs font-bold text-luxury-dark">Pesanan Tidak Ditemukan</h4>
                      <p className="text-[10px] text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                        Kami tidak menemukan pesanan yang terkait dengan email <strong>{searchEmail}</strong>. Silakan periksa kembali ejaan email atau periksa tanda bukti pembayaran Anda.
                      </p>
                    </div>
                  ) : (
                    customerOrders.map((order) => {
                      const isExpanded = !!expandedOrders[order.id];
                      const est = getOrderEstimationDetails(order);
                      const timelineStep = getActiveTimelineStep(order.status);
                      
                      return (
                        <div 
                          key={order.id} 
                          className="bg-white border border-rose-dust/15 rounded-2xl overflow-hidden shadow-xs transition-all hover:border-rose-gold/25"
                        >
                          {/* Order Header Summary */}
                          <div 
                            onClick={() => toggleOrderExpand(order.id)}
                            className="p-4 bg-[#FFFDF9]/60 hover:bg-[#FFFDF9] flex items-center justify-between gap-3 cursor-pointer select-none border-b border-rose-dust/5"
                          >
                            <div className="space-y-1">
                              <p className="text-[9px] text-gray-400 font-semibold font-mono leading-none">
                                INV-PL-{order.id}-{new Date(order.created_at).getFullYear()}
                              </p>
                              <p className="text-xs font-bold text-luxury-dark font-serif">
                                {formatRupiah(order.total_price)}
                              </p>
                              <p className="text-[9px] text-[#A47F81] font-semibold flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3 text-rose-gold" />
                                {new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {getStatusBadge(order.status)}
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-rose-gold shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-rose-gold shrink-0" />
                              )}
                            </div>
                          </div>

                          {/* Expansion Timeline & Details */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-rose-dust/10 bg-white"
                              >
                                <div className="p-4 space-y-5">
                                  
                                  {/* THE REAL-TIME WORKSHOP TIMELINE */}
                                  <div className="bg-[#FFFDF9] border border-rose-gold/15 rounded-xl p-3.5 space-y-3.5">
                                    <div className="flex items-center justify-between">
                                      <p className="text-[9px] text-rose-gold font-extrabold uppercase tracking-wider flex items-center gap-1">
                                        <Hammer className="w-3.5 h-3.5 text-rose-gold animate-bounce" />
                                        Progress Perakitan Atelier
                                      </p>
                                      <span className="text-[8px] bg-rose-gold/15 text-rose-gold font-bold px-2 py-0.5 rounded-full">
                                        Fase {timelineStep} dari 5
                                      </span>
                                    </div>

                                    {/* Timeline graphic bar */}
                                    <div className="relative pl-4 border-l-2 border-rose-dust/30 space-y-4 text-[10px]">
                                      
                                      {/* Phase 1 */}
                                      <div className="relative">
                                        <div className={`absolute -left-5.5 top-0.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs ${
                                          timelineStep >= 0 ? 'bg-green-600' : 'bg-gray-200'
                                        }`} />
                                        <div className="flex justify-between items-center">
                                          <strong className={timelineStep >= 0 ? 'text-luxury-dark' : 'text-gray-400'}>
                                            Fase 1: Transaksi Masuk & Antrean Antam
                                          </strong>
                                          <span className="text-[8px] text-green-600 font-bold uppercase">Selesai</span>
                                        </div>
                                        <p className="text-[9px] text-gray-400">Verifikasi QRIS berhasil, logistik menyiapkan bahan dasar logam mulia.</p>
                                      </div>

                                      {/* Phase 2 */}
                                      <div className="relative">
                                        <div className={`absolute -left-5.5 top-0.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs ${
                                          timelineStep >= 1 ? 'bg-green-600' : 'bg-gray-200'
                                        }`} />
                                        <div className="flex justify-between items-center">
                                          <strong className={timelineStep >= 1 ? 'text-luxury-dark' : 'text-gray-400'}>
                                            Fase 2: Pengecoran Logam Mulia 18K
                                          </strong>
                                          <span className="text-[8px] text-green-600 font-bold uppercase">
                                            {timelineStep > 1 ? 'Selesai' : timelineStep === 1 ? 'Diproses' : 'Antrean'}
                                          </span>
                                        </div>
                                        <p className="text-[9px] text-gray-400">Peleburan kawat rose gold murni dibentuk sesuai standar lingkar perhiasan.</p>
                                      </div>

                                      {/* Phase 3 */}
                                      <div className="relative">
                                        <div className={`absolute -left-5.5 top-0.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs ${
                                          timelineStep >= 3 ? 'bg-green-600' : timelineStep === 2 ? 'bg-rose-gold animate-ping' : 'bg-gray-200'
                                        }`} />
                                        <div className="flex justify-between items-center">
                                          <strong className={timelineStep >= 2 ? 'text-luxury-dark' : 'text-gray-400'}>
                                            Fase 3: Penyolderan & Penataan Charm Manual
                                          </strong>
                                          <span className="text-[8px] text-rose-gold font-bold uppercase">
                                            {timelineStep > 3 ? 'Selesai' : timelineStep === 3 ? 'Sedang Dirakit' : 'Antrean'}
                                          </span>
                                        </div>
                                        <p className="text-[9px] text-gray-400">Maestro perhiasan menyolder loop kancing pengait pesona zircon satu per satu secara manual.</p>
                                      </div>

                                      {/* Phase 4 */}
                                      <div className="relative">
                                        <div className={`absolute -left-5.5 top-0.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs ${
                                          timelineStep >= 4 ? 'bg-green-600' : 'bg-gray-200'
                                        }`} />
                                        <div className="flex justify-between items-center">
                                          <strong className={timelineStep >= 4 ? 'text-luxury-dark' : 'text-gray-400'}>
                                            Fase 4: Quality Control & Sertifikasi Laboratorium
                                          </strong>
                                          <span className="text-[8px] text-rose-gold font-bold uppercase">
                                            {timelineStep > 4 ? 'Selesai' : timelineStep === 4 ? 'Uji Lab' : 'Antrean'}
                                          </span>
                                        </div>
                                        <p className="text-[9px] text-gray-400">Pembersihan ultrasonik, uji ketahanan gesek kancing, dan pencetakan kartu seri sertifikat.</p>
                                      </div>

                                      {/* Phase 5 */}
                                      <div className="relative">
                                        <div className={`absolute -left-5.5 top-0.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs ${
                                          timelineStep >= 5 ? 'bg-rose-gold' : 'bg-gray-200'
                                        }`} />
                                        <div className="flex justify-between items-center">
                                          <strong className={timelineStep >= 5 ? 'text-luxury-dark' : 'text-gray-400'}>
                                            Fase 5: Serah Terima Kurir & Pengiriman Kargo
                                          </strong>
                                          <span className="text-[8px] text-[#A47F81] font-bold uppercase">
                                            {order.status === 'shipped' ? 'Dikirim' : 'Menunggu Selesai'}
                                          </span>
                                        </div>
                                        <p className="text-[9px] text-gray-400">Perhiasan disegel pita beludru kado, diserahterimakan ke pengiriman logistik premium.</p>
                                      </div>

                                    </div>
                                  </div>

                                  {/* ESTIMASI KEDATANGAN BOX */}
                                  <div className="bg-[#FAF6F0] rounded-xl p-3 text-[10px] grid grid-cols-2 gap-3 border border-rose-dust/10">
                                    <div>
                                      <p className="text-gray-400 text-[8px] uppercase tracking-wider">Durasi Produksi Atelier</p>
                                      <p className="font-extrabold text-luxury-dark mt-0.5">{est.productionDays} Hari Kerja</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-400 text-[8px] uppercase tracking-wider">Estimasi Tiba di Rumah</p>
                                      <p className="font-extrabold text-rose-gold mt-0.5 font-serif">{est.dateRange}</p>
                                    </div>
                                  </div>

                                  {/* PURCHASED ITEMS */}
                                  <div className="space-y-2">
                                    <p className="text-[8px] text-[#A47F81] font-bold uppercase tracking-wider">Detail Komponen Pesanan</p>
                                    <div className="space-y-1.5">
                                      {order.items && order.items.map((item) => (
                                        <div key={item.id} className="flex gap-2.5 items-center p-2 rounded-xl bg-gray-50 border border-gray-100">
                                          {item.product_image && (
                                            <img 
                                              src={item.product_image} 
                                              alt={item.product_name} 
                                              referrerPolicy="no-referrer"
                                              className="w-10 h-10 object-cover rounded-lg shrink-0 border border-rose-dust/10"
                                            />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold text-luxury-dark truncate">{item.product_name}</p>
                                            <p className="text-[8px] text-rose-gold uppercase font-bold tracking-wider mt-0.5">
                                              Tipe: {item.product_type} • {item.product_category}
                                            </p>
                                          </div>
                                          <div className="text-right shrink-0">
                                            <p className="text-[10px] font-mono font-bold text-luxury-dark">{item.quantity}x</p>
                                            <p className="text-[9px] text-rose-gold font-bold font-serif">{formatRupiah(item.price * item.quantity)}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* SHIPPING DETAILS */}
                                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1.5 text-[10px]">
                                    <p className="text-[8px] text-[#A47F81] font-bold uppercase tracking-wider flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5 text-rose-gold" />
                                      Tujuan Pengiriman Kargo:
                                    </p>
                                    <p className="text-gray-600 font-medium leading-relaxed">
                                      {order.shipping_address || 'Pengambilan langsung di Atelier Menteng'}
                                    </p>
                                    {order.qris_reference && (
                                      <p className="text-[8px] text-gray-400 font-mono pt-1 border-t border-dashed mt-1.5">
                                        Nomer Referensi Bank: <span className="text-luxury-dark font-semibold">{order.qris_reference}</span>
                                      </p>
                                    )}
                                  </div>

                                  {/* Premium certificate information banner */}
                                  <div className="pt-2 border-t border-rose-dust/10 mt-1 flex items-center justify-center gap-2 text-center bg-rose-dust/5 p-2 rounded-lg">
                                    <Star className="w-3.5 h-3.5 text-rose-gold fill-rose-gold/30 shrink-0 animate-pulse" />
                                    <p className="text-[9px] text-luxury-dark/90 font-medium">
                                      Sertifikat fisik resmi yang dicetak timbul dengan tinta emas disertakan di dalam kotak beludru merah muda paket Anda.
                                    </p>
                                  </div>

                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  )}

                </div>
              )}

              {/* Default Welcome content before searching */}
              {!hasSearched && (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 bg-rose-gold/10 text-rose-gold rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Truck className="w-8 h-8 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-serif-luxury text-sm font-bold text-luxury-dark">Pantau Setiap Proses Kriya Mahakarya Anda</h4>
                    <p className="text-[10.5px] text-rose-dust/80 leading-relaxed max-w-sm mx-auto mt-1">
                      Perhiasan kustom Anda diproses secara khusus. Masukkan email di atas untuk melihat status perakitan kustom Anda oleh Maestro perhiasan kami hingga pengiriman kargo bergaransi ke rumah Anda.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Brand signature */}
            <div className="p-4 border-t border-rose-dust/10 bg-[#FFFDF9] text-center text-[9px] text-gray-400 font-mono shrink-0">
              <p>© 2026 L'Atelier d'Ana Haute Joaillerie. Dilindungi Oleh Jaminan Keaslian Emas 18K.</p>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
