import React from 'react';
import { ShoppingBag, Sparkles, ShieldCheck, Heart, MapPin, Phone, Mail, User as UserIcon, LogOut, KeyRound, Compass, Gem } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenOrders: () => void;
  currentView: 'catalog' | 'admin';
  onChangeView: (view: 'catalog' | 'admin') => void;
  currentUser: User | null;
  onOpenAuthModal: (tab?: 'customer_login' | 'customer_register' | 'admin') => void;
  onLogout: () => void;
}

export function Header({ 
  cartCount, 
  onOpenCart, 
  onOpenOrders,
  currentView, 
  onChangeView, 
  currentUser, 
  onOpenAuthModal, 
  onLogout 
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/80 backdrop-blur-md border-b border-rose-dust/20" id="luxury-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onChangeView('catalog')}>
            <div className="relative w-11 h-11 rounded-xl flex items-center justify-center shadow-md border border-rose-gold/30 group-hover:border-rose-gold/60 transition-all duration-300" style={{ backgroundColor: '#ebd9d9' }}>
              <div className="absolute inset-1 border border-rose-gold/15 rounded-lg pointer-events-none" />
              <Gem className="w-5 h-5" style={{ color: '#000000' }} />
            </div>
            <div>
              <h1 className="font-serif-luxury text-base md:text-lg font-bold tracking-wider text-luxury-dark group-hover:text-rose-gold transition-colors duration-300 leading-none">
                L'Atelier d'Ana
              </h1>
              <span className="text-[8px] font-bold tracking-widest text-[#A47F81] uppercase block mt-1">
                Haute Joaillerie Atelier
              </span>
            </div>
          </div>

          {/* Action Center (Switch view, open cart, User Login/Status) */}
          <div className="flex items-center gap-3">
            
            {/* View toggle (Catalog vs Admin) - ONLY VISIBLE IF LOGGED IN AS ADMIN */}
            {currentUser?.role === 'admin' && (
              <div className="bg-rose-dust/10 p-1 rounded-xl flex gap-1 animate-fade-in">
                <button
                  onClick={() => onChangeView('catalog')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
                    currentView === 'catalog'
                      ? 'bg-rose-gold text-white shadow-sm'
                      : 'text-luxury-dark hover:bg-rose-dust/10'
                  }`}
                >
                  Belanja Workshop
                </button>
                <button
                  onClick={() => onChangeView('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 ${
                    currentView === 'admin'
                      ? 'bg-[#2F1F21] text-[#FFFDF9] shadow-sm'
                      : 'text-luxury-dark hover:bg-rose-dust/10'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Atelier
                </button>
              </div>
            )}

            {/* Lacak Pesanan Button & Cart Button */}
            {currentView === 'catalog' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenOrders}
                  className="p-2.5 rounded-xl border border-rose-dust/20 text-rose-gold hover:bg-rose-dust/5 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm text-xs font-bold"
                  title="Lacak Status Perakitan & Pengiriman"
                  id="btn-lacak-pesanan"
                >
                  <Compass className="w-4.5 h-4.5 animate-[spin_10s_linear_infinite]" />
                  <span className="hidden md:inline">Lacak Pesanan</span>
                </button>

                <button
                  onClick={onOpenCart}
                  className="relative p-2.5 rounded-xl border border-rose-dust/20 text-rose-gold hover:bg-rose-dust/5 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                >
                  <ShoppingBag className="w-4.5 h-4.5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-gold text-[#FFFDF9] text-[9px] font-bold flex items-center justify-center shadow animate-bounce">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* User Session Info / Login Trigger */}
            <div className="border-l border-rose-dust/15 pl-3 flex items-center gap-2">
              {currentUser ? (
                <div className="flex items-center gap-2 bg-rose-dust/10 hover:bg-rose-dust/15 p-1 pr-2.5 rounded-xl transition-all max-w-[150px] sm:max-w-none">
                  <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center text-white ${
                    currentUser.role === 'admin' ? 'bg-[#2F1F21]' : 'bg-rose-gold'
                  }`}>
                    {currentUser.role === 'admin' ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-[10px] font-extrabold text-luxury-dark leading-none truncate max-w-[80px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[8px] text-rose-gold uppercase font-bold tracking-wider leading-none mt-0.5">
                      {currentUser.role === 'admin' ? 'Atelier Admin' : 'Pelanggan'}
                    </p>
                  </div>
                  <button
                    onClick={onLogout}
                    title="Keluar"
                    className="p-1 hover:text-rose-gold text-gray-400 transition-colors ml-1"
                    id="btn-logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onOpenAuthModal('customer_login')}
                  className="px-3.5 py-2 rounded-xl bg-[#FFFDF9] border border-rose-dust/25 text-rose-gold hover:bg-rose-dust/5 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  id="btn-open-auth"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#2F1F21] text-[#FFFDF9] border-t border-rose-dust/15 mt-16" id="luxury-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-gold/10 flex items-center justify-center border border-rose-gold/25">
                <Gem className="w-4 h-4 text-rose-gold" />
              </div>
              <h2 className="font-serif text-lg font-bold tracking-wider">L'Atelier d'Ana</h2>
            </div>
            <p className="text-xs text-[#E1B3B5]/75 leading-relaxed">
              Setiap mahakarya perhiasan dirakit secara manual oleh tangan terampil di atelier kami menggunakan emas merah muda (rose gold) pilihan dan batu permata murni yang telah disertifikasi.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <span>Dibuat dengan cinta dan</span>
              <Heart className="w-3 h-3 text-rose-gold fill-rose-gold animate-pulse" />
              <span>untuk pecinta charm kustom.</span>
            </div>
          </div>

          {/* Catalog Links Col */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-white tracking-widest uppercase">Kategori Utama</h4>
            <ul className="space-y-2 text-xs text-[#E1B3B5]/70">
              <li className="hover:text-white transition-colors cursor-pointer">Gelang Kustom (Bracelets)</li>
              <li className="hover:text-white transition-colors cursor-pointer">Kalung Cantik (Necklaces)</li>
              <li className="hover:text-white transition-colors cursor-pointer">Cincin Mahkota (Rings)</li>
              <li className="hover:text-white transition-colors cursor-pointer">Anting Gantung (Earrings)</li>
            </ul>
          </div>
 
          {/* Atelier standards Col */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-white tracking-widest uppercase">Jaminan Kami</h4>
            <ul className="space-y-2 text-xs text-[#E1B3B5]/70">
              <li>Lapisan Emas Rose Gold Premium 18K</li>
              <li>Dibuat Manual oleh Pengrajin Ahli</li>
              <li>Pengiriman Kargo Gratis Berasuransi Penuh</li>
              <li>Sertifikat Keaslian Batu Permata</li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-white tracking-widest uppercase">Alamat Atelier</h4>
            <ul className="space-y-2.5 text-xs text-[#E1B3B5]/70">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-gold shrink-0" />
                <span>The Luxury Arcade No. 89, Jakarta Selatan</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-gold shrink-0" />
                <span>+62 (21) 800-CHAMPION</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-rose-gold shrink-0" />
                <span>atelier@pinkluxurycharm.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copy bar */}
        <div className="border-t border-rose-dust/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E1B3B5]/40">
          <p>© 2026 L'Atelier d'Ana Charm & Jewelry Atelier. Hak Cipta Dilindungi.</p>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer">Kebijakan Privasi</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Syarat & Ketentuan Kustom</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
