import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ShoppingBag, PlusCircle } from 'lucide-react';
import { Product } from '../types';
import { formatRupiah } from '../utils';

interface ProductCardProps {
  key?: number | string;
  product: Product;
  onSelectBase: (product: Product) => void;
}

export default function ProductCard({ product, onSelectBase }: ProductCardProps) {
  const isBase = product.type === 'base';
  const isOutOfStock = product.stock <= 0;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-rose-dust/15 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
      id={`product-card-${product.id}`}
    >
      <div className="relative aspect-square w-full bg-rose-dust/5 overflow-hidden">
        {/* Floating Tags */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10">
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
            isBase ? 'bg-indigo-600 text-white' : 'bg-rose-gold text-white'
          } shadow-sm`}>
            {product.type === 'base' ? 'Perhiasan Dasar' : 'Aksen Charm'}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#FFFDF9]/90 text-luxury-dark shadow-sm backdrop-blur-sm self-start">
            {product.category === 'gelang' ? 'Gelang' : product.category === 'kalung' ? 'Kalung' : product.category === 'cincin' ? 'Cincin' : 'Anting'}
          </span>
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-[#2F1F21]/60 backdrop-blur-xs z-10 flex items-center justify-center">
            <span className="text-xs font-bold text-[#FFFDF9] tracking-widest uppercase border-2 border-rose-dust/40 px-4 py-1.5 rounded-full bg-rose-gold">
              Habis
            </span>
          </div>
        )}

        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-108"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Details Footer */}
      <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-serif text-sm md:text-base font-bold text-luxury-dark line-clamp-1">
              {product.name}
            </h4>
            <span className="font-serif text-sm md:text-base font-bold text-rose-gold shrink-0">
              {formatRupiah(product.price)}
            </span>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-rose-dust/10 flex items-center justify-between gap-4">
          <span className={`text-[10px] font-semibold ${product.stock <= 5 ? 'text-amber-600' : 'text-green-600'}`}>
            {product.stock <= 0 ? 'Habis' : product.stock <= 5 ? `Sisa ${product.stock}!` : 'Tersedia'}
          </span>

          <button
            onClick={() => onSelectBase(product)}
            disabled={isOutOfStock}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-rose-gold text-white hover:bg-rose-gold/90 shadow-sm hover:shadow active:scale-95'
            }`}
          >
            {isBase ? (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                Kustom & Beli
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5" />
                Tambah Charm
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
