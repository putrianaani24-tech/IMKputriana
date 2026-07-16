import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Trash2, CreditCard, Sparkles, X, 
  ChevronRight, ArrowRight, CheckCircle2, User, Mail, 
  ShieldAlert, QrCode, Printer, Download, Clock, ShieldCheck, MapPin, Map, Landmark
} from 'lucide-react';
import { CartItem, User as UserType } from '../types';
import { formatRupiah } from '../utils';
import ShippingMap from './ShippingMap';

interface CartCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onCheckoutSuccess: (order: any) => void;
  currentUser: UserType | null;
}

type CheckoutStep = 'cart' | 'shipping_payment' | 'qris_gateway' | 'authorizing' | 'assembling' | 'receipt';

export default function CartCheckout({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutSuccess,
  currentUser
}: CartCheckoutProps) {
  
  // Checkout Form and Navigation State
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Address and Maps States
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingLat, setShippingLat] = useState(-6.1915);
  const [shippingLng, setShippingLng] = useState(106.8285);

  // QRIS Countdown Timer
  const [qrisTimer, setQrisTimer] = useState(900); // 15 minutes in seconds
  const [qrisTxCode, setQrisTxCode] = useState('');

  // Auto-fill checkout details when user is logged in
  useEffect(() => {
    if (currentUser && currentUser.role === 'customer') {
      setCustomerName(currentUser.name);
      setCustomerEmail(currentUser.email);
    } else {
      setCustomerName('');
      setCustomerEmail('');
    }
  }, [currentUser]);

  // Generate a random high-end transaction code when entering QRIS
  useEffect(() => {
    if (currentStep === 'qris_gateway') {
      const randHex = Math.random().toString(16).substr(2, 8).toUpperCase();
      setQrisTxCode(`QRIS-PL-${randHex}`);
      setQrisTimer(900); // reset 15m timer
    }
  }, [currentStep]);

  // Countdown clock effect for QRIS
  useEffect(() => {
    if (currentStep !== 'qris_gateway' || qrisTimer <= 0) return;
    const interval = setInterval(() => {
      setQrisTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentStep, qrisTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Subtotal calculation
  const subtotal = cartItems.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const getOverallEstimationDetails = () => {
    // 1. Calculate production days
    let productionDays = 1;
    cartItems.forEach(item => {
      let itemDays = 1;
      if (item.selectedCharms.length > 0) itemDays += 1;
      if (item.engravingText) itemDays += 1;
      if (item.certificateSelected) itemDays += 1;
      if (itemDays > productionDays) productionDays = itemDays;
    });

    // 2. Estimate shipping days based on address keywords
    let shippingDays = 2; // default
    const addr = (shippingAddress || '').toLowerCase();
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

    const today = new Date();
    
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

  const handleLocationSelect = (address: string, lat: number, lng: number) => {
    setShippingAddress(address);
    setShippingLat(lat);
    setShippingLng(lng);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    if (!customerName || !customerEmail) {
      setErrorMessage("Mohon isi nama lengkap dan alamat email Anda.");
      return;
    }
    if (!shippingAddress || shippingAddress.length < 10) {
      setErrorMessage("Mohon lengkapi alamat pengiriman Anda pada map.");
      return;
    }
    setErrorMessage(null);
    setCurrentStep('qris_gateway');
  };

  const handleSimulatePaymentSuccess = async () => {
    setIsSubmitting(true);
    setCurrentStep('authorizing');
    setErrorMessage(null);

    try {
      // Flatten cart items for backend order submission.
      const flattenedItemsMap: { [productId: number]: number } = {};
      for (const cartItem of cartItems) {
        const qty = cartItem.quantity;
        const baseId = cartItem.baseProduct.id;
        flattenedItemsMap[baseId] = (flattenedItemsMap[baseId] || 0) + qty;
        
        for (const charm of cartItem.selectedCharms) {
          flattenedItemsMap[charm.id] = (flattenedItemsMap[charm.id] || 0) + qty;
        }
      }

      const orderItemsPayload = Object.keys(flattenedItemsMap).map(idStr => ({
        product_id: parseInt(idStr, 10),
        quantity: flattenedItemsMap[parseInt(idStr, 10)]
      }));

      // Simulate network verification delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStep('assembling');
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          items: orderItemsPayload,
          shipping_address: shippingAddress,
          shipping_lat: shippingLat,
          shipping_lng: shippingLng,
          payment_method: 'QRIS',
          qris_reference: qrisTxCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memproses pesanan kustom Anda. Silakan hubungi pengrajin.");
      }

      // Success - Save order payload locally and show final premium receipt
      setPlacedOrder(data.order);
      setCurrentStep('receipt');

    } catch (err: any) {
      console.error("Checkout QRIS Error:", err);
      setErrorMessage(err.message || "Gagal memverifikasi pembayaran. Silakan coba lagi.");
      setCurrentStep('qris_gateway');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleFinishCheckout = () => {
    if (placedOrder) {
      onCheckoutSuccess(placedOrder);
    }
    onClearCart();
    setCustomerName('');
    setCustomerEmail('');
    setShippingAddress('');
    setCurrentStep('cart');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="luxury-checkout-drawer">
      {/* Background backdrop blur */}
      <div 
        className="absolute inset-0 bg-[#2F1F21]/45 backdrop-blur-sm transition-opacity" 
        onClick={() => {
          if (currentStep !== 'authorizing' && currentStep !== 'assembling' && currentStep !== 'receipt') {
            onClose();
          }
        }}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-screen max-w-md bg-[#FFFDF9] border-l border-rose-dust/30 shadow-2xl flex flex-col justify-between overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-rose-dust/15 flex items-center justify-between bg-[#FFFDF9] shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-xl bg-rose-dust/10 text-rose-gold flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-serif-luxury text-xl font-bold text-luxury-dark">
                  {currentStep === 'cart' && 'Keranjang Belanja'}
                  {currentStep === 'shipping_payment' && 'Detail Pengiriman'}
                  {currentStep === 'qris_gateway' && 'Aman via QRIS'}
                  {currentStep === 'receipt' && 'Bukti Pembayaran'}
                  {(currentStep === 'authorizing' || currentStep === 'assembling') && 'Memproses Pesanan'}
                </h3>
                <p className="text-[10px] text-rose-gold uppercase tracking-wider font-semibold">
                  {currentStep === 'cart' && 'Pilihan Perhiasan Kustom Anda'}
                  {currentStep === 'shipping_payment' && 'Alamat & Kargo Premium'}
                  {currentStep === 'qris_gateway' && 'Gerbang Pembayaran Nasional'}
                  {currentStep === 'receipt' && 'Sertifikat Pembelian Resmi'}
                  {(currentStep === 'authorizing' || currentStep === 'assembling') && 'Harap Tunggu...'}
                </p>
              </div>
            </div>
            
            {/* Close button only available when not loading / finishing */}
            {currentStep !== 'authorizing' && currentStep !== 'assembling' && currentStep !== 'receipt' && (
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-rose-dust/10 text-gray-400 hover:text-luxury-dark transition-colors"
                id="close-checkout-btn"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <p>{errorMessage}</p>
            </div>
          )}

          {/* MAIN CONTAINER STEPS CHANGER */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            
            {/* STEP 1: CART LIST */}
            {currentStep === 'cart' && (
              <>
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-rose-dust/80 py-12">
                    <ShoppingBag className="w-16 h-16 stroke-[1.2] mb-3 animate-pulse" />
                    <h4 className="font-serif text-lg text-luxury-dark mb-1">Keranjang Anda Kosong</h4>
                    <p className="text-xs max-w-[240px] leading-relaxed">
                      Mulai desain gelang, cincin, atau kalung kustom di workshop kami untuk memulai perhiasan cantik Anda.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4" id="cart-items-list">
                    {cartItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-white border border-rose-dust/10 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all relative overflow-hidden"
                      >
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                          title="Hapus perhiasan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-3.5">
                          {/* Image */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-rose-dust/10 bg-rose-dust/5 relative shrink-0">
                            <img
                              src={item.baseProduct.image_url}
                              alt={item.baseProduct.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute bottom-1 right-1 text-[8px] bg-rose-gold text-white px-1.5 py-0.2 rounded font-semibold uppercase">
                              Kustom
                            </span>
                          </div>
      
                          {/* Description Details */}
                          <div className="flex-1 min-w-0 pr-6">
                            <h4 className="text-xs font-bold text-luxury-dark truncate">{item.baseProduct.name}</h4>
                            <p className="text-[10px] text-rose-gold font-medium mt-0.5 capitalize">
                              Kategori: {item.baseProduct.category}
                            </p>
                            
                            {/* Attached charms list */}
                            {item.selectedCharms.length > 0 ? (
                              <div className="mt-2 space-y-1 bg-rose-dust/5 p-2 rounded-xl border border-rose-dust/5">
                                <p className="text-[8px] font-extrabold text-rose-gold uppercase tracking-wider">
                                  Charm Terpasang ({item.selectedCharms.length}):
                                </p>
                                <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                                  {item.selectedCharms.map(c => c.name).join(', ')}
                                </p>
                              </div>
                            ) : (
                              <p className="text-[9px] text-gray-400 italic mt-1.5">Belum ada charm terpasang pada perhiasan dasar ini.</p>
                            )}

                            {/* Selected Premium Addons */}
                            {(item.giftBoxSelected || item.certificateSelected || item.engravingText || item.greetingCardText) && (
                              <div className="mt-1.5 space-y-1 bg-[#FAF6F0] p-2 rounded-xl border border-rose-dust/10">
                                <p className="text-[8px] font-extrabold text-[#A47F81] uppercase tracking-wider">
                                  Pilihan Tambahan Premium:
                                </p>
                                <ul className="text-[9px] text-gray-500 space-y-0.5 list-disc list-inside font-medium">
                                  {item.giftBoxSelected && <li>Kotak Kado Beludru (+Rp 50.000)</li>}
                                  {item.certificateSelected && <li>Sertifikat Keaslian (+Rp 25.000)</li>}
                                  {item.engravingText && <li>Grafir Kustom: "{item.engravingText}" (+Rp 30.000)</li>}
                                  {item.greetingCardText && <li>Kartu Ucapan Kustom (+Rp 15.000)</li>}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quantity & Price */}
                        <div className="flex items-center justify-between border-t border-rose-dust/5 mt-4 pt-3">
                          <div className="flex items-center border border-rose-dust/20 rounded-lg overflow-hidden bg-white">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="px-2.5 py-1 text-gray-400 hover:text-luxury-dark hover:bg-gray-50 transition-colors text-sm font-semibold"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="px-3.5 text-xs font-semibold text-luxury-dark">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="px-2.5 py-1 text-gray-400 hover:text-luxury-dark hover:bg-gray-50 transition-colors text-sm font-semibold"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-[9px] text-gray-400">Harga total item</p>
                            <p className="text-sm font-serif font-bold text-rose-gold">
                              {formatRupiah(item.totalPrice * item.quantity)}
                            </p>
                          </div>
                        </div>

                      </div>
                    ))}

                    {/* CROSS-SELLING / MATCHING PRODUCTS BANNER IN CART */}
                    <div className="bg-[#FAF6F0] border border-rose-dust/20 rounded-2xl p-4 space-y-3 mt-4">
                      <div className="flex items-start gap-2.5">
                        <Sparkles className="w-4.5 h-4.5 text-rose-gold shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-luxury-dark">Lengkapi Koleksi Set Perhiasan Anda</h5>
                          <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5">
                            Ingin memesan perhiasan pendamping? Rancang Cincin, Kalung, atau Anting kustom mewah yang serasi untuk menyempurnakan penampilan Anda!
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {['cincin', 'kalung', 'anting'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              onClose();
                              setTimeout(() => {
                                const builderEl = document.getElementById('bespoke-charm-builder');
                                if (builderEl) {
                                  builderEl.scrollIntoView({ behavior: 'smooth' });
                                }
                              }, 300);
                            }}
                            className="bg-white border border-rose-dust/15 hover:border-rose-gold text-[10px] font-bold text-rose-gold py-1.5 px-2 rounded-xl transition-all hover:shadow-xs text-center capitalize"
                          >
                            + Desain {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* STEP 2: SHIPPING DETAILS & MAP PICKER */}
            {currentStep === 'shipping_payment' && (
              <form onSubmit={handleProceedToPayment} className="space-y-4" id="checkout-form-step-2">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-rose-gold uppercase tracking-widest">Informasi Kontak Anda</h4>
                  
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-rose-gold">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nama Lengkap Anda"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-rose-dust/25 bg-white focus:outline-none focus:border-rose-gold text-xs font-medium placeholder-rose-dust/50 text-luxury-dark"
                    />
                  </div>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-rose-gold">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Alamat Email Anda"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-rose-dust/25 bg-white focus:outline-none focus:border-rose-gold text-xs font-medium placeholder-rose-dust/50 text-luxury-dark"
                    />
                  </div>
                </div>

                {/* Shipping interactive map & coordinates */}
                <ShippingMap 
                  onLocationSelect={handleLocationSelect} 
                  initialAddress={shippingAddress}
                />

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-rose-gold text-white font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-md hover:bg-rose-gold/90 transition-all hover:shadow-lg mt-3"
                  id="submit-to-qris-btn"
                >
                  <QrCode className="w-4 h-4" />
                  Lanjutkan ke Pembayaran QRIS
                </button>
              </form>
            )}

            {/* STEP 3: QRIS GATEWAY INTERFACE */}
            {currentStep === 'qris_gateway' && (
              <div className="space-y-5 text-center" id="qris-checkout-panel">
                <div className="bg-[#FAF6F0] border border-rose-dust/15 rounded-2xl p-5 space-y-4 shadow-xs relative">
                  
                  {/* QRIS / GPN Header */}
                  <div className="flex items-center justify-between border-b border-rose-dust/10 pb-3">
                    <div className="flex items-center gap-1 text-[#2F1F21]">
                      <Landmark className="w-4 h-4" />
                      <span className="font-extrabold text-[11px] uppercase tracking-wider">QRIS GPN</span>
                    </div>
                    <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase border border-green-200">
                      Metode Terpilih
                    </span>
                  </div>

                  {/* Pricing Overview */}
                  <div className="text-center py-2">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Total Tagihan Perhiasan</p>
                    <p className="text-2xl font-serif-luxury font-extrabold text-rose-gold mt-1">
                      {formatRupiah(subtotal)}
                    </p>
                    <p className="text-[9px] text-[#A47F81] font-medium mt-1">
                      Penerima: <strong>L'Atelier d'Ana Charm Atelier</strong>
                    </p>
                    <div className="mt-2.5 px-3 py-1.5 bg-rose-gold/5 border border-rose-gold/25 rounded-xl inline-block text-[10px] text-rose-gold font-bold">
                      ✨ Estimasi Tiba: {getOverallEstimationDetails().dateRange} ({getOverallEstimationDetails().totalStart}-{getOverallEstimationDetails().totalEnd} Hari Kerja)
                    </div>
                  </div>

                  {/* Interactive Styled QRIS Code Visual */}
                  <div className="w-48 h-48 bg-white p-3 rounded-2xl border border-rose-dust/20 mx-auto shadow-sm flex flex-col justify-between items-center relative overflow-hidden">
                    
                    {/* QRIS logo overlay text inside GPN format */}
                    <div className="w-full flex justify-between items-center text-[8px] font-extrabold text-gray-400 mb-1 border-b pb-1">
                      <span>QRIS</span>
                      <span className="text-red-600">GPN</span>
                    </div>

                    {/* Styled High-contrast QR Matrix */}
                    <div className="w-36 h-36 bg-white flex flex-wrap items-center justify-center relative">
                      {/* Stylized QR Modules using nested SVG representing real complex QR code */}
                      <svg viewBox="0 0 100 100" className="w-full h-full text-luxury-dark">
                        {/* 3 Main Corner Positioning Blocks */}
                        <rect x="5" y="5" width="22" height="22" fill="currentColor" />
                        <rect x="9" y="9" width="14" height="14" fill="#fff" />
                        <rect x="12" y="12" width="8" height="8" fill="currentColor" />

                        <rect x="73" y="5" width="22" height="22" fill="currentColor" />
                        <rect x="77" y="9" width="14" height="14" fill="#fff" />
                        <rect x="80" y="12" width="8" height="8" fill="currentColor" />

                        <rect x="5" y="73" width="22" height="22" fill="currentColor" />
                        <rect x="9" y="77" width="14" height="14" fill="#fff" />
                        <rect x="12" y="80" width="8" height="8" fill="currentColor" />

                        {/* Random dense mosaic modules */}
                        <rect x="32" y="5" width="8" height="8" fill="currentColor" />
                        <rect x="44" y="12" width="12" height="4" fill="currentColor" />
                        <rect x="60" y="5" width="8" height="16" fill="currentColor" />
                        <rect x="32" y="20" width="16" height="8" fill="currentColor" />
                        <rect x="52" y="24" width="8" height="8" fill="currentColor" />
                        
                        <rect x="5" y="32" width="16" height="8" fill="currentColor" />
                        <rect x="5" y="44" width="8" height="16" fill="currentColor" />
                        <rect x="16" y="52" width="12" height="8" fill="currentColor" />

                        <rect x="32" y="32" width="36" height="36" fill="currentColor" />
                        <rect x="38" y="38" width="24" height="24" fill="#fff" />
                        
                        {/* Center Ring / Jewelry brand icon placeholder inside QR */}
                        <rect x="44" y="44" width="12" height="12" fill="#E1B3B5" rx="3" />
                        <circle cx="50" cy="50" r="3" fill="#FFFDF9" />

                        <rect x="73" y="32" width="12" height="8" fill="currentColor" />
                        <rect x="88" y="44" width="8" height="16" fill="currentColor" />
                        <rect x="73" y="52" width="12" height="8" fill="currentColor" />

                        <rect x="32" y="73" width="8" height="12" fill="currentColor" />
                        <rect x="44" y="85" width="16" height="8" fill="currentColor" />
                        <rect x="64" y="73" width="8" height="22" fill="currentColor" />
                        <rect x="76" y="73" width="20" height="8" fill="currentColor" />
                        <rect x="84" y="85" width="12" height="10" fill="currentColor" />
                      </svg>
                    </div>

                    <p className="text-[7px] text-[#A47F81] tracking-widest uppercase font-extrabold mt-1">
                      NMID: ID10302938475
                    </p>
                  </div>

                  {/* Expiration Timer & TX Reference */}
                  <div className="flex items-center justify-between text-[11px] text-gray-500 bg-white p-2.5 rounded-xl border border-rose-dust/10">
                    <div className="flex items-center gap-1 text-[#A47F81] font-bold">
                      <Clock className="w-3.5 h-3.5 animate-pulse text-rose-gold" />
                      <span>Sisa Waktu Pembayaran:</span>
                    </div>
                    <span className="font-mono font-bold text-rose-gold text-xs">{formatTimer(qrisTimer)}</span>
                  </div>

                  <div className="text-[10px] text-left text-gray-400 font-mono space-y-0.5">
                    <p>Ref ID: <span className="text-luxury-dark font-semibold select-all">{qrisTxCode}</span></p>
                    <p>Tujuan: <span className="text-luxury-dark font-semibold">L'Atelier d'Ana Atelier Group</span></p>
                  </div>
                </div>

                {/* Secure instructions */}
                <div className="bg-white border border-rose-gold/15 rounded-xl p-3.5 text-left space-y-2">
                  <p className="text-[11px] text-luxury-dark font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-gold" />
                    Petunjuk Pembayaran:
                  </p>
                  <ol className="text-[10px] text-[#A47F81] space-y-1 list-decimal list-inside pl-1 leading-relaxed font-medium">
                    <li>Buka aplikasi perbankan (BCA, Mandiri, dll) atau dompet digital (Gopay, OVO, ShopeePay, Dana).</li>
                    <li>Pilih menu <strong>Pindai / Scan QRIS</strong>.</li>
                    <li>Arahkan kamera ke kode QRIS kustom di atas.</li>
                    <li>Masukkan nominal yang tertera atau konfirmasi pembayaran Anda.</li>
                  </ol>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setCurrentStep('shipping_payment')}
                    className="flex-1 py-3 bg-white border border-rose-dust/30 text-rose-gold rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-rose-dust/5 transition-all"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleSimulatePaymentSuccess}
                    className="flex-2 py-3.5 bg-[#2F1F21] text-[#FFFDF9] hover:bg-black rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 shadow transition-all active:scale-98"
                    id="btn-confirm-qris"
                  >
                    <CheckCircle2 className="w-4 h-4 text-rose-gold" />
                    Saya Sudah Membayar
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: PROCESSING OVERLAYS */}
            {currentStep === 'authorizing' && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20" id="authorizing-panel">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-rose-dust/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-rose-gold border-t-transparent rounded-full animate-spin" />
                </div>
                <div>
                  <h4 className="font-serif text-lg text-luxury-dark font-bold">Memverifikasi Pembayaran QRIS</h4>
                  <p className="text-xs text-rose-dust mt-1">Menghubungkan ke node perbankan GPN dan mencatat mutasi...</p>
                </div>
              </div>
            )}

            {currentStep === 'assembling' && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20" id="assembling-panel">
                <div className="relative w-16 h-16 flex items-center justify-center bg-rose-gold/15 rounded-full animate-pulse">
                  <Sparkles className="w-8 h-8 text-rose-gold animate-[spin_10s_linear_infinite]" />
                </div>
                <div>
                  <h4 className="font-serif text-lg text-luxury-dark font-bold">Merakit Perhiasan Anda</h4>
                  <p className="text-xs text-rose-dust mt-1">Memproses detail desain kustom Anda ke pengrajin utama Atelier...</p>
                </div>
              </div>
            )}

            {/* STEP 5: DETAILED printable payment proof certificate (RECEIPT) */}
            {currentStep === 'receipt' && placedOrder && (
              <div className="space-y-4" id="payment-receipt-certificate-panel">
                
                {/* Print/Download header bar (Hidden during browser print via default styles) */}
                <div className="flex gap-2 print:hidden shrink-0">
                  <button
                    onClick={handlePrintReceipt}
                    className="flex-1 py-2.5 bg-white border border-rose-dust/30 text-rose-gold rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 hover:bg-rose-dust/5 transition-all shadow-xs"
                    id="btn-print-receipt"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak Bukti (Print)
                  </button>
                  <button
                    onClick={handleFinishCheckout}
                    className="flex-1 py-2.5 bg-rose-gold text-white rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 hover:bg-rose-gold/90 transition-all shadow-xs"
                    id="btn-done-receipt"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Selesai & Tutup
                  </button>
                </div>

                {/* THE FORMAL LUXURY CERTIFICATE CONTAINER */}
                <div className="bg-white border-2 border-rose-gold/30 rounded-2xl p-6 relative overflow-hidden shadow-md font-sans bg-[radial-gradient(#FFFDF9_60%,#FAF6F0_100%)] select-text print:border-none print:shadow-none print:bg-white" id="printable-invoice-certificate">
                  
                  {/* Fine Gold Corner Accents */}
                  <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-rose-gold/40" />
                  <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-rose-gold/40" />
                  <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-rose-gold/40" />
                  <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-rose-gold/40" />

                  {/* Background Watermark Crest */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-2">
                    <Sparkles className="w-56 h-56 text-rose-gold rotate-12" />
                  </div>

                  {/* Letterhead */}
                  <div className="text-center border-b border-rose-gold/20 pb-4 space-y-1 relative z-10">
                    <div className="inline-flex items-center justify-center gap-1 bg-[#2F1F21] text-[#FFFDF9] px-2.5 py-1 rounded-md text-[8px] font-bold tracking-widest uppercase border border-rose-gold">
                      <Sparkles className="w-3 h-3 text-rose-gold animate-spin" />
                      Atelier Haute Couture
                    </div>
                    <h2 className="font-serif-luxury text-xl font-bold text-luxury-dark mt-1">PINK LUXURY</h2>
                    <p className="text-[8px] font-extrabold text-[#A47F81] uppercase tracking-widest leading-none">
                      Charm & Jewelry Craftsmanship
                    </p>
                    <p className="text-[7px] text-gray-400">
                      Grand Indonesia, Menteng, Jakarta Pusat • Telp: (021) 8293-980
                    </p>
                  </div>

                  {/* BUKTI PEMBAYARAN / CERTIFICATE LABEL */}
                  <div className="text-center my-4 space-y-1 relative z-10">
                    <h3 className="text-xs font-serif font-extrabold uppercase tracking-widest text-[#2F1F21]">
                      SURAT BUKTI TRANSAKSI RESMI
                    </h3>
                    <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-800 border border-green-200 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mx-auto">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-600 fill-green-600/10" />
                      Status: Lunas (Paid)
                    </div>
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-2 gap-y-2 text-[10px] border-b border-rose-dust/10 pb-3 mb-3 font-medium text-[#A47F81]">
                    <div>
                      <p className="text-gray-400 text-[8px] uppercase tracking-wider">No. Invoice Resmi</p>
                      <p className="font-mono text-luxury-dark font-extrabold">INV-PL-{placedOrder.id}-{new Date(placedOrder.created_at).getFullYear()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[8px] uppercase tracking-wider">Metode Pembayaran</p>
                      <p className="text-luxury-dark font-extrabold flex items-center gap-1">
                        <QrCode className="w-3 h-3 text-rose-gold" />
                        QRIS GPN Instan
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[8px] uppercase tracking-wider">Tanggal Transaksi</p>
                      <p className="text-luxury-dark font-extrabold">
                        {new Date(placedOrder.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[8px] uppercase tracking-wider">Kode Referensi Bank</p>
                      <p className="font-mono text-luxury-dark font-extrabold truncate max-w-[130px]" title={placedOrder.qris_reference || qrisTxCode}>
                        {placedOrder.qris_reference || qrisTxCode}
                      </p>
                    </div>
                  </div>

                  {/* Customer Information Section */}
                  <div className="border-b border-rose-dust/10 pb-3 mb-3 text-[10px] font-medium">
                    <h4 className="text-[8px] font-bold text-[#A47F81] uppercase tracking-wider mb-1.5">Identitas Pemilik & Pengiriman</h4>
                    <div className="space-y-1 text-luxury-dark">
                      <p className="flex justify-between">
                        <span className="text-gray-400">Nama Pelanggan:</span>
                        <span className="font-extrabold">{placedOrder.customer_name}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-400">Alamat Email:</span>
                        <span className="font-bold select-all">{placedOrder.customer_email}</span>
                      </p>
                      
                      {placedOrder.shipping_address && (
                        <div className="mt-2 bg-rose-dust/5 p-2 rounded-xl border border-rose-dust/10 space-y-1">
                          <p className="text-[8px] text-rose-gold font-extrabold uppercase tracking-wider flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-gold" />
                            Alamat Pengantaran Kargo Map:
                          </p>
                          <p className="text-[10px] text-gray-600 font-medium leading-relaxed">
                            {placedOrder.shipping_address}
                          </p>
                          {placedOrder.shipping_lat && placedOrder.shipping_lng && (
                            <p className="text-[8px] text-gray-400 font-mono">
                              Geo-Lokasi: {placedOrder.shipping_lat.toFixed(4)}° S, {placedOrder.shipping_lng.toFixed(4)}° E
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Purchased Items List */}
                  <div className="space-y-2 border-b border-rose-dust/10 pb-3 mb-3 text-[10px] font-medium">
                    <h4 className="text-[8px] font-bold text-[#A47F81] uppercase tracking-wider mb-1.5">Spesifikasi Karya Perhiasan</h4>
                    
                    {/* Rendered itemized items from the order or cart fallback */}
                    <div className="space-y-2">
                      {placedOrder.items && placedOrder.items.length > 0 ? (
                        placedOrder.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-start gap-3 bg-[#FFFDF9] border border-rose-dust/10 p-2 rounded-lg">
                            <div className="flex-1">
                              <p className="font-extrabold text-luxury-dark leading-snug">{item.product_name || 'Karya Perhiasan'}</p>
                              <p className="text-[8px] text-rose-gold uppercase font-bold tracking-wider mt-0.5">
                                Tipe: {item.product_type} • {item.product_category}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-mono font-bold text-luxury-dark">{item.quantity} x {formatRupiah(item.price)}</p>
                              <p className="font-serif font-extrabold text-rose-gold text-[10px]">{formatRupiah(item.price * item.quantity)}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        // Fallback list of designer items from active cart to represent accurately if API lags
                        cartItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-start gap-3 bg-[#FFFDF9] border border-rose-dust/10 p-2 rounded-lg">
                            <div className="flex-1">
                              <p className="font-extrabold text-luxury-dark leading-snug">{item.baseProduct.name} Set</p>
                              <p className="text-[8px] text-rose-gold uppercase font-bold tracking-wider mt-0.5">
                                Kustom • {item.selectedCharms.map(c => c.name).join(', ') || 'Tanpa Charm'}
                              </p>
                              {(item.giftBoxSelected || item.certificateSelected || item.engravingText || item.greetingCardText) && (
                                <p className="text-[8px] text-gray-500 font-medium mt-1">
                                  Tambahan: {[
                                    item.giftBoxSelected && "Kotak Kado Beludru",
                                    item.certificateSelected && "Sertifikat Atelier",
                                    item.engravingText && `Grafir "${item.engravingText}"`,
                                    item.greetingCardText && "Kartu Ucapan"
                                  ].filter(Boolean).join(', ')}
                                </p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-mono font-bold text-luxury-dark">{item.quantity} x {formatRupiah(item.totalPrice)}</p>
                              <p className="font-serif font-extrabold text-rose-gold text-[10px]">{formatRupiah(item.totalPrice * item.quantity)}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* ESTIMASI JADWAL SERAH TERIMA MAHA KARYA */}
                  <div className="bg-[#FAF6F0] border border-rose-dust/15 rounded-xl p-3 mb-3 text-[10px] space-y-2">
                    <h4 className="text-[8px] font-bold text-[#A47F81] uppercase tracking-wider flex items-center justify-between">
                      <span>Estimasi Jadwal Serah Terima Mahakarya</span>
                      <span className="text-rose-gold text-[9px] font-extrabold">{getOverallEstimationDetails().dateRange}</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-center text-[9px]">
                      <div className="bg-white p-1.5 rounded-lg border border-rose-dust/5 space-y-0.5">
                        <p className="text-gray-400 font-semibold uppercase text-[7px]">1. Fase Desain & QC</p>
                        <p className="font-extrabold text-luxury-dark">{getOverallEstimationDetails().productionDays} Hari Kerja</p>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-rose-dust/5 space-y-0.5">
                        <p className="text-gray-400 font-semibold uppercase text-[7px]">2. Pengiriman Kargo</p>
                        <p className="font-extrabold text-luxury-dark">{getOverallEstimationDetails().shippingDays} Hari Kerja</p>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-rose-dust/5 space-y-0.5">
                        <p className="text-gray-400 font-semibold uppercase text-[7px]">3. Total Estimasi</p>
                        <p className="font-bold text-rose-gold font-serif">{getOverallEstimationDetails().totalStart} - {getOverallEstimationDetails().totalEnd} Hari</p>
                      </div>
                    </div>
                    <p className="text-[8px] text-gray-400 text-center leading-normal">
                      Peringatan: Setiap tahap dikerjakan secara presisi guna melestarikan ketahanan kemilau emas dan kekuatan solderan kancing perhiasan Anda.
                    </p>
                  </div>

                  {/* Grand total price section */}
                  <div className="space-y-1.5 text-xs font-bold text-right text-luxury-dark relative z-10">
                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                      <span>Biaya Pengiriman Kargo Berasuransi</span>
                      <span className="text-green-600 uppercase font-extrabold">Rp 0 (Gratis)</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-rose-gold/20 pt-2 text-luxury-dark">
                      <span className="font-serif">Total Nilai Pembayaran</span>
                      <span className="font-serif-luxury text-base text-rose-gold font-extrabold">
                        {formatRupiah(placedOrder.total_price || subtotal)}
                      </span>
                    </div>
                  </div>

                  {/* Seal Signature / Stamp */}
                  <div className="mt-6 flex justify-between items-end">
                    <div className="text-[7px] text-gray-400 font-mono leading-normal max-w-[150px]">
                      Sertifikat ini membuktikan keaslian emas rose gold 18k dan kemurnian batu quartz terpilih di atelier kami.
                    </div>
                    
                    {/* Authenticated Stamp design */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full border border-dashed border-rose-gold/50 flex flex-col items-center justify-center text-[7px] text-rose-gold uppercase font-black tracking-widest leading-none rotate-12 shadow-xs bg-rose-gold/5">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse text-rose-gold mb-0.5" />
                        <span>ATELIER</span>
                        <span>PASSED</span>
                      </div>
                      <p className="text-[8px] font-serif font-bold text-luxury-dark mt-1.5">Master Jeweler</p>
                    </div>
                  </div>

                </div>

                <p className="text-[9px] text-gray-400 text-center select-none print:hidden">
                  Terima kasih atas pesanan perhiasan kustom Anda di L'Atelier d'Ana. Pengrajin kami akan segera memproses desain Anda dengan dedikasi penuh.
                </p>
              </div>
            )}

          </div>

          {/* Bottom Fixed Pricing details during normal cart list */}
          {currentStep === 'cart' && cartItems.length > 0 && (
            <div className="border-t border-rose-dust/20 bg-white p-6 space-y-4 shadow-inner shrink-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>Pengiriman Premium Kargo</span>
                  <span className="text-green-600 font-bold uppercase tracking-wide">Gratis</span>
                </div>
                <div className="border-t border-rose-dust/10 pt-2.5 flex items-center justify-between">
                  <span className="text-sm font-bold text-luxury-dark">Total Biaya</span>
                  <span className="text-xl font-serif-luxury font-bold text-rose-gold">{formatRupiah(subtotal)}</span>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep('shipping_payment')}
                className="w-full py-4 rounded-xl bg-rose-gold text-white font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-md hover:bg-rose-gold/90 transition-all hover:shadow-lg active:scale-98"
                id="btn-go-to-shipping"
              >
                <ChevronRight className="w-4 h-4" />
                Lengkapi Alamat Pengiriman
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
