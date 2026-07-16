import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, Plus, Edit3, Trash2, Check, X, ClipboardList, 
  RefreshCw, TrendingUp, ShoppingBag, ShieldCheck, Mail, User,
  Map, QrCode, MapPin
} from 'lucide-react';
import { Product, Order, User as UserType } from '../types';
import { formatRupiah } from '../utils';

interface AdminDashboardProps {
  products: Product[];
  onRefreshProducts: () => void;
  orders: Order[];
  onRefreshOrders: () => void;
  onUpdateOrderStatus: (orderId: number, status: Order['status']) => Promise<void>;
  onCreateProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  onUpdateProduct: (id: number, product: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
  currentUser: UserType | null;
  onOpenAuthModal: (tab?: 'customer_login' | 'customer_register' | 'admin') => void;
}

export default function AdminDashboard({
  products,
  onRefreshProducts,
  orders,
  onRefreshOrders,
  onUpdateOrderStatus,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  currentUser,
  onOpenAuthModal
}: AdminDashboardProps) {
  
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  
  // Create / Edit Product Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [type, setType] = useState<'base' | 'charm'>('base');
  const [category, setCategory] = useState<'gelang' | 'kalung' | 'cincin' | 'anting'>('gelang');
  const [stock, setStock] = useState('');
  
  // Feedback states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  // Stats calculation
  const totalRevenue = orders
    .filter(o => o.status !== 'pending')
    .reduce((sum, o) => sum + o.total_price, 0);
  const ordersCount = orders.length;
  const lowStockCount = products.filter(p => p.stock <= 5).length;

  useEffect(() => {
    onRefreshProducts();
    onRefreshOrders();
  }, []);

  const openCreateForm = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setImageUrl('');
    setType('base');
    setCategory('gelang');
    setStock('');
    setIsFormOpen(true);
  };

  const openEditForm = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setImageUrl(prod.image_url);
    setType(prod.type);
    setCategory(prod.category);
    setStock(prod.stock.toString());
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock) {
      showMsg("Please fill out all required fields.", true);
      return;
    }

    setLoading(true);
    try {
      const productPayload = {
        name,
        description,
        price: parseFloat(price),
        image_url: imageUrl || 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=500',
        type,
        category,
        stock: parseInt(stock, 10)
      };

      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, productPayload);
        showMsg(`Product "${name}" updated successfully!`, false);
      } else {
        await onCreateProduct(productPayload);
        showMsg(`Product "${name}" created successfully!`, false);
      }
      setIsFormOpen(false);
    } catch (err: any) {
      showMsg(err.message || "Failed to save product.", true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this exquisite product? This action is irreversible.")) return;
    try {
      await onDeleteProduct(id);
      showMsg("Product deleted successfully.", false);
    } catch (err: any) {
      showMsg(err.message || "Failed to delete product.", true);
    }
  };

  const showMsg = (text: string, error: boolean) => {
    setMessage({ text, error });
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="bg-[#FFFDF9] border border-rose-dust/30 rounded-3xl p-6 md:p-8 shadow-sm my-6" id="admin-control-center">
      
      {/* Header and Branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-rose-dust/20 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-rose-gold/10 text-rose-gold">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold tracking-widest text-rose-gold uppercase">Panel Kontrol Atelier</span>
          </div>
          <h2 className="font-serif-luxury text-3xl text-luxury-dark mt-2 font-bold">Admin L'Atelier d'Ana</h2>
        </div>
 
        {/* Tab Buttons & Refresh */}
        <div className="flex items-center gap-3">
          <div className="bg-rose-dust/10 p-1.5 rounded-xl flex gap-1">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                activeTab === 'inventory'
                  ? 'bg-rose-gold text-white shadow-sm'
                  : 'text-luxury-dark hover:bg-rose-dust/15'
              }`}
            >
              <Package className="w-4 h-4" />
              Kelola Inventaris
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-rose-gold text-white shadow-sm'
                  : 'text-luxury-dark hover:bg-rose-dust/15'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Pesanan Pelanggan
            </button>
          </div>

          <button
            onClick={() => {
              onRefreshProducts();
              onRefreshOrders();
              showMsg("Dashboard statistics updated.", false);
            }}
            className="p-2.5 rounded-xl border border-rose-dust/20 text-rose-gold hover:bg-rose-dust/5 active:scale-95 transition-all"
            title="Refresh Server Data"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white border border-rose-dust/15 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Pendapatan</p>
            <h4 className="text-xl font-serif-luxury font-bold text-luxury-dark">{formatRupiah(totalRevenue)}</h4>
          </div>
        </div>

        <div className="bg-white border border-rose-dust/15 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-rose-dust/10 text-rose-gold flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Penjualan</p>
            <h4 className="text-xl font-serif-luxury font-bold text-luxury-dark">{ordersCount} Pesanan</h4>
          </div>
        </div>

        <div className="bg-white border border-rose-dust/15 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Peringatan Stok Tipis</p>
            <h4 className="text-xl font-serif-luxury font-bold text-luxury-dark">{lowStockCount} Produk</h4>
          </div>
        </div>
      </div>

      {/* ALERT FEEDBACK BANNER */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl mb-6 flex items-center gap-3 border text-sm ${
              message.error 
                ? 'bg-red-50 border-red-100 text-red-800' 
                : 'bg-green-50 border-green-100 text-green-800'
            }`}
          >
            {message.error ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW SECTIONS */}
      {activeTab === 'inventory' ? (
        <div>
          {/* Inventory Tools */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="font-serif-luxury text-xl text-luxury-dark">Database Katalog</h3>
              <p className="text-xs text-rose-dust">Akses penuh tambah, baca, ubah, dan hapus data perhiasan.</p>
            </div>
            <button
              onClick={openCreateForm}
              className="bg-rose-gold text-white px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide shadow-md hover:bg-rose-gold/95 hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Produk Baru
            </button>
          </div>
 
          {/* CRITICAL: MASTER CRUD MODAL FORM */}
          {isFormOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#FFFDF9] border border-rose-dust/30 w-full max-w-xl rounded-3xl p-6 shadow-2xl relative"
              >
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="absolute top-5 right-5 p-2 rounded-full hover:bg-rose-dust/10 text-gray-400 hover:text-luxury-dark transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <h3 className="font-serif-luxury text-2xl text-luxury-dark mb-1">
                  {editingProduct ? 'Ubah Produk Atelier' : 'Tambah Produk Baru yang Indah'}
                </h3>
                <p className="text-xs text-rose-dust mb-5">
                  Tentukan detail presisi, gambar cantik, dan stok akurat untuk perhiasan dasar atau charm kustom Anda.
                </p>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-luxury-dark uppercase tracking-wider mb-1">Product Title *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Majestic Rose Gold Crown Band"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rose-dust/20 bg-white focus:outline-none focus:border-rose-gold text-xs"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-luxury-dark uppercase tracking-wider mb-1">Detailed Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the gemstone quality, metals, styling loops..."
                        rows={2}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rose-dust/20 bg-white focus:outline-none focus:border-rose-gold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-luxury-dark uppercase tracking-wider mb-1">Harga (Rupiah) *</label>
                      <input
                        type="number"
                        step="1"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="1850000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rose-dust/20 bg-white focus:outline-none focus:border-rose-gold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-luxury-dark uppercase tracking-wider mb-1">Initial Stock *</label>
                      <input
                        type="number"
                        required
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="25"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rose-dust/20 bg-white focus:outline-none focus:border-rose-gold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-luxury-dark uppercase tracking-wider mb-1">Jenis Produk *</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rose-dust/20 bg-white focus:outline-none focus:border-rose-gold text-xs"
                      >
                        <option value="base">Perhiasan Dasar (Gelang/Kalung...)</option>
                        <option value="charm">Gantungan Charm Pendukung</option>
                      </select>
                    </div>
 
                    <div>
                      <label className="block text-xs font-bold text-luxury-dark uppercase tracking-wider mb-1">Kategori Grup *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rose-dust/20 bg-white focus:outline-none focus:border-rose-gold text-xs"
                      >
                        <option value="gelang">Gelang (Bracelet)</option>
                        <option value="kalung">Kalung (Necklace)</option>
                        <option value="cincin">Cincin (Ring)</option>
                        <option value="anting">Anting (Earring)</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-luxury-dark uppercase tracking-wider mb-1">Image URL</label>
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rose-dust/20 bg-white focus:outline-none focus:border-rose-gold text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-rose-dust/15">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-5 py-2.5 rounded-xl border border-rose-dust/25 text-gray-500 text-xs font-semibold hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl bg-rose-gold text-white text-xs font-semibold hover:bg-rose-gold/90 flex items-center gap-2 shadow"
                    >
                      {loading ? 'Menyimpan...' : editingProduct ? 'Simpan Perubahan' : 'Publikasikan Produk'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* TABLE */}
          <div className="overflow-x-auto rounded-2xl border border-rose-dust/15 bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-rose-dust/10 border-b border-rose-dust/15">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-luxury-dark">Detail</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-luxury-dark">Kategori</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-luxury-dark">Harga</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-luxury-dark">Stok Gudang</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-luxury-dark text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-dust/10">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-rose-dust text-sm">
                      No products found in database. Add new items to populate your catalog.
                    </td>
                  </tr>
                ) : (
                  products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-rose-dust/5 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-12 h-12 rounded-xl object-cover border border-rose-dust/15 shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="font-semibold text-xs text-luxury-dark">{prod.name}</h4>
                          <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{prod.description}</p>
                        </div>
                      </td>
                      <td className="p-4 text-xs">
                        <div className="flex gap-1.5 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            prod.type === 'base' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {prod.type}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-rose-dust/10 text-rose-gold font-medium capitalize">
                            {prod.category}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-serif font-bold text-rose-gold">
                        {formatRupiah(prod.price)}
                      </td>
                      <td className="p-4 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            prod.stock <= 5 ? 'bg-amber-500 animate-pulse' : 'bg-green-500'
                          }`} />
                          <span className="font-semibold text-luxury-dark">{prod.stock} unit</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => openEditForm(prod)}
                            className="p-1.5 rounded-lg border border-rose-dust/20 text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id)}
                            className="p-1.5 rounded-lg border border-rose-dust/20 text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Master"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ORDERS MANAGEMENT */
        <div>
          <div className="mb-5">
            <h3 className="font-serif-luxury text-xl text-luxury-dark">Pesanan Kustom Pelanggan</h3>
            <p className="text-xs text-rose-dust">Simulasikan proses pengiriman: ubah status dari Lunas, Sedang Diproses, atau Dikirim.</p>
          </div>
 
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center p-12 border border-dashed border-rose-dust/30 rounded-2xl bg-white text-rose-dust text-sm">
                Belum ada pesanan kustom yang terdaftar di portal ini.
              </div>
            ) : (
              orders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-white border border-rose-dust/15 rounded-2xl p-5 shadow-sm hover:border-rose-gold/20 transition-all"
                >
                  {/* Order header row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-dust/10 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-rose-gold bg-rose-gold/10 px-2.5 py-0.5 rounded-full">
                          Pesanan #{order.id}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">
                          {new Date(order.created_at).toLocaleString('id-ID', { hour12: false })}
                        </span>
                      </div>
                      
                      {/* Customer metrics */}
                      <div className="flex gap-4 mt-2">
                        <span className="text-xs text-luxury-dark font-medium flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-rose-dust" /> {order.customer_name}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-rose-dust" /> {order.customer_email}
                        </span>
                      </div>
                    </div>
 
                    {/* Total & Status Selector */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[9px] uppercase font-bold text-gray-400">Total Pembayaran</p>
                        <h4 className="text-lg font-serif-luxury font-bold text-rose-gold">
                          {formatRupiah(order.total_price)}
                        </h4>
                      </div>

                      <div>
                        <label className="block text-[8px] font-extrabold uppercase text-gray-400 tracking-wider mb-1">Status Pengiriman</label>
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none ${
                            order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            order.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            order.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                        >
                          <option value="pending">Menunggu</option>
                          <option value="paid">Lunas</option>
                          <option value="processing">Proses</option>
                          <option value="shipped">Dikirim</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Items included detailed view */}
                  <div>
                    <h5 className="text-[10px] font-extrabold text-luxury-dark uppercase tracking-wider mb-2">Elemen Perhiasan Kustom</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 p-2 rounded-xl bg-rose-dust/5 border border-rose-dust/10">
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-10 h-10 rounded-lg object-cover border border-rose-dust/10"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <h6 className="text-[11px] font-bold text-luxury-dark truncate">{item.product_name}</h6>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] text-rose-gold font-serif font-bold">{formatRupiah(item.price)}</span>
                              <span className="text-[9px] text-gray-400">x{item.quantity}</span>
                              <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.2 bg-white rounded border border-rose-dust/10 ${
                                item.product_type === 'base' ? 'text-indigo-600' : 'text-rose-600'
                              }`}>
                                {item.product_type}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address, Map Coordinates & QRIS details */}
                  <div className="mt-4 pt-3.5 border-t border-rose-dust/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5 bg-emerald-50/20 border border-emerald-100/40 p-3.5 rounded-xl">
                      <p className="text-[9px] text-[#A47F81] font-bold uppercase tracking-wider flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5 text-rose-gold" />
                        Detail Pembayaran Keuangan (QRIS)
                      </p>
                      <p className="text-luxury-dark font-semibold">
                        Metode Pembayaran: <span className="text-rose-gold font-extrabold">{order.payment_method || 'QRIS'}</span>
                      </p>
                      {order.qris_reference && (
                        <p className="text-gray-500 font-mono text-[10px]">
                          Ref Code: <span className="text-luxury-dark font-extrabold select-all">{order.qris_reference}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5 bg-rose-dust/5 border border-rose-dust/10 p-3.5 rounded-xl">
                      <p className="text-[9px] text-[#A47F81] font-bold uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-gold" />
                        Tujuan Pengiriman Kargo Map
                      </p>
                      <p className="text-luxury-dark leading-relaxed font-semibold text-[10px]">
                        {order.shipping_address || 'Tidak ada alamat kustom yang dipilih.'}
                      </p>
                      {order.shipping_lat && order.shipping_lng && (
                        <p className="text-gray-400 font-mono text-[9px] flex items-center gap-1.5 mt-1.5">
                          <Map className="w-3 h-3 text-rose-gold" />
                          Koordinat Peta: {order.shipping_lat.toFixed(4)}° S, {order.shipping_lng.toFixed(4)}° E
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
