import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Lock, ShieldCheck, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
  initialTab?: 'customer_login' | 'customer_register' | 'admin';
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess, initialTab = 'customer_login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'customer_login' | 'customer_register' | 'admin'>(initialTab);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Clear fields on tab change
  const handleTabChange = (tab: 'customer_login' | 'customer_register' | 'admin') => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
    setPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const lowerEmail = email.trim().toLowerCase();

    if (activeTab === 'customer_login') {
      if (!email || !password) {
        setError('Harap isi semua kolom email dan kata sandi.');
        return;
      }

      // Seamless Admin Login (directly from regular form for security)
      if ((lowerEmail === 'admin@latelierana.com' || lowerEmail === 'admin@pinkluxury.com') && password === 'admin123') {
        const adminUser: UserType = {
          id: 'admin-1',
          name: 'Atelier Master',
          email: lowerEmail,
          role: 'admin'
        };
        onLoginSuccess(adminUser);
        onClose();
        return;
      }
      
      // Handle simple credentials verification or allow registering anything
      const savedUsersJson = localStorage.getItem('pink_luxury_users') || '[]';
      const savedUsers: UserType[] = JSON.parse(savedUsersJson);
      
      // Default fallback account
      if (lowerEmail === 'customer@luxury.com' && password === 'customer123') {
        const defaultUser: UserType = {
          id: 'cust-default',
          name: 'Siti Rahma',
          email: 'customer@luxury.com',
          role: 'customer'
        };
        onLoginSuccess(defaultUser);
        onClose();
        return;
      }

      const found = savedUsers.find(u => u.email.toLowerCase() === lowerEmail);
      if (found) {
        onLoginSuccess(found);
        onClose();
      } else {
        setError('Email atau kata sandi tidak cocok. Harap periksa kembali kredensial Anda atau buat akun baru.');
      }

    } else if (activeTab === 'customer_register') {
      if (!name || !email || !password) {
        setError('Semua kolom pendaftaran wajib diisi.');
        return;
      }
      if (password.length < 5) {
        setError('Kata sandi minimal harus terdiri dari 5 karakter.');
        return;
      }

      const savedUsersJson = localStorage.getItem('pink_luxury_users') || '[]';
      const savedUsers: UserType[] = JSON.parse(savedUsersJson);
      
      if (savedUsers.some(u => u.email.toLowerCase() === lowerEmail) || lowerEmail === 'customer@luxury.com' || lowerEmail === 'admin@latelierana.com' || lowerEmail === 'admin@pinkluxury.com') {
        setError('Alamat email ini sudah terdaftar.');
        return;
      }

      const newUser: UserType = {
        id: `cust-${Date.now()}`,
        name,
        email: lowerEmail,
        role: 'customer'
      };

      savedUsers.push(newUser);
      localStorage.setItem('pink_luxury_users', JSON.stringify(savedUsers));
      
      setSuccess('Pendaftaran berhasil! Silakan masuk ke akun baru Anda.');
      setTimeout(() => {
        setActiveTab('customer_login');
        setPassword('');
        setError(null);
        setSuccess(null);
      }, 1500);

    } else if (activeTab === 'admin') {
      if (!email || !password) {
        setError('Harap masukkan email dan kata sandi admin.');
        return;
      }

      // Admin verification
      if ((lowerEmail === 'admin@latelierana.com' || lowerEmail === 'admin@pinkluxury.com') && password === 'admin123') {
        const adminUser: UserType = {
          id: 'admin-1',
          name: 'Atelier Master',
          email: lowerEmail,
          role: 'admin'
        };
        onLoginSuccess(adminUser);
        onClose();
      } else {
        setError('Kredensial Admin tidak cocok.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="auth-modal-overlay">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Panel */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-md bg-[#FFFDF9] rounded-3xl border border-rose-dust/20 shadow-2xl overflow-hidden z-10 p-6 md:p-8"
          id="auth-modal-panel"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-rose-dust/10 text-rose-gold transition-colors"
            id="auth-modal-close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-rose-gold/10 rounded-full text-rose-gold mb-3 animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-2xl font-bold text-luxury-dark">
              Atelier Member Portal
            </h3>
            <p className="text-[10px] text-rose-gold uppercase tracking-wider font-semibold mt-1">
              Gerbang Kemewahan & Desain Kustom
            </p>
          </div>

          {/* Tab Selection */}
          <div className="bg-rose-dust/10 p-1 rounded-xl flex gap-1 mb-6 text-xs font-bold" id="auth-tabs">
            <button
              onClick={() => handleTabChange('customer_login')}
              className={`flex-1 py-2 rounded-lg text-center transition-all ${
                activeTab === 'customer_login'
                  ? 'bg-rose-gold text-white shadow-xs'
                  : 'text-luxury-dark hover:bg-rose-dust/5'
              }`}
              id="tab-customer-login"
            >
              Masuk
            </button>
            <button
              onClick={() => handleTabChange('customer_register')}
              className={`flex-1 py-2 rounded-lg text-center transition-all ${
                activeTab === 'customer_register'
                  ? 'bg-rose-gold text-white shadow-xs'
                  : 'text-luxury-dark hover:bg-rose-dust/5'
              }`}
              id="tab-customer-register"
            >
              Daftar
            </button>
            <button
              onClick={() => handleTabChange('admin')}
              className={`flex-1 py-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
                activeTab === 'admin'
                  ? 'bg-[#2F1F21] text-[#FFFDF9] shadow-xs'
                  : 'text-luxury-dark hover:bg-rose-dust/5'
              }`}
              id="tab-admin"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>

          {/* Instruction helper - high-end & professional without leaking passwords */}
          <div className="bg-rose-dust/5 border border-rose-dust/15 rounded-xl p-3 mb-4 text-[11px] text-[#A47F81] leading-relaxed flex items-start gap-2">
            <User className="w-4 h-4 text-rose-gold shrink-0 mt-0.5" />
            <div>
              {activeTab === 'admin' ? (
                <span>
                  Gunakan kredensial administrator resmi L'Atelier d'Ana untuk mengakses Dashboard manajemen pesanan dan kontrol inventaris.
                </span>
              ) : activeTab === 'customer_login' ? (
                <span>
                  Silakan masuk menggunakan akun terdaftar Anda untuk melihat pesanan kustom, melacak pengiriman, dan mengakses layanan prioritas.
                </span>
              ) : (
                <span>
                  Daftarkan alamat email Anda untuk menyimpan riwayat pesanan kustom yang telah Anda rancang di Atelier kami.
                </span>
              )}
            </div>
          </div>

          {/* Error and Success feedback messages */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 mb-4 text-xs text-rose-800 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 mb-4 text-xs text-emerald-800 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p>{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="auth-modal-form">
            {activeTab === 'customer_register' && (
              <div>
                <label className="block text-[10px] font-bold text-luxury-dark uppercase tracking-wider mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-rose-gold/50" />
                  <input
                    type="text"
                    required
                    id="auth-input-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Siti Rahma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-rose-dust/20 bg-white focus:outline-none focus:border-rose-gold text-xs font-medium text-luxury-dark"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-luxury-dark uppercase tracking-wider mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-rose-gold/50" />
                <input
                  type="email"
                  required
                  id="auth-input-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab === 'admin' ? 'admin@latelierana.com' : 'nama@domain.com'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-rose-dust/20 bg-white focus:outline-none focus:border-rose-gold text-xs font-medium text-luxury-dark"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-luxury-dark uppercase tracking-wider mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-rose-gold/50" />
                <input
                  type="password"
                  required
                  id="auth-input-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-rose-dust/20 bg-white focus:outline-none focus:border-rose-gold text-xs font-medium text-luxury-dark"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="auth-submit-btn"
              className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 mt-2 shadow-md hover:shadow-lg ${
                activeTab === 'admin' 
                  ? 'bg-[#2F1F21] text-[#FFFDF9] hover:bg-black' 
                  : 'bg-rose-gold text-white hover:bg-rose-gold/90'
              }`}
            >
              {activeTab === 'customer_login' && 'Masuk Sebagai Pelanggan'}
              {activeTab === 'customer_register' && 'Daftar Akun'}
              {activeTab === 'admin' && 'Masuk Sebagai Admin'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Switching Prompt */}
          <div className="mt-5 pt-4 border-t border-rose-dust/10 text-center">
            {activeTab === 'customer_login' ? (
              <p className="text-[11px] text-gray-500">
                Belum memiliki akun perhiasan?{' '}
                <button 
                  onClick={() => handleTabChange('customer_register')}
                  className="text-rose-gold font-bold hover:underline"
                  type="button"
                >
                  Daftar Sekarang
                </button>
              </p>
            ) : activeTab === 'customer_register' ? (
              <p className="text-[11px] text-gray-500">
                Sudah memiliki akun?{' '}
                <button 
                  onClick={() => handleTabChange('customer_login')}
                  className="text-rose-gold font-bold hover:underline"
                  type="button"
                >
                  Masuk di sini
                </button>
              </p>
            ) : (
              <p className="text-[11px] text-gray-500">
                Bukan tim administrator?{' '}
                <button 
                  onClick={() => handleTabChange('customer_login')}
                  className="text-rose-gold font-bold hover:underline"
                  type="button"
                >
                  Masuk sebagai Pelanggan
                </button>
              </p>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
