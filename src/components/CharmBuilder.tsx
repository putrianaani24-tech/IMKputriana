import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trash2, Plus, Info, HelpCircle } from 'lucide-react';
import { Product, CartItem } from '../types';
import { formatRupiah } from '../utils';

interface CharmBuilderProps {
  products: Product[];
  onAddBespokeToCart: (cartItem: Omit<CartItem, 'id'>) => void;
  selectedBaseProduct?: Product;
}

export default function CharmBuilder({ products, onAddBespokeToCart, selectedBaseProduct }: CharmBuilderProps) {
  // Filter base products and charms
  const baseProducts = products.filter(p => p.type === 'base');
  const charms = products.filter(p => p.type === 'charm');

  // State
  const [selectedBase, setSelectedBase] = useState<Product | null>(selectedBaseProduct || null);
  const [attachedCharms, setAttachedCharms] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<'gelang' | 'kalung' | 'cincin' | 'anting'>('gelang');
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'warning' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'warning' = 'success') => {
    setNotification({ text, type });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Premium custom add-ons states
  const [engravingText, setEngravingText] = useState('');
  const [giftBoxSelected, setGiftBoxSelected] = useState(false);
  const [greetingCardText, setGreetingCardText] = useState('');
  const [certificateSelected, setCertificateSelected] = useState(false);

  // Sync if selectedBaseProduct prop changes
  useEffect(() => {
    if (selectedBaseProduct) {
      setSelectedBase(selectedBaseProduct);
      setAttachedCharms([]); // Reset charms when starting a new base
    }
  }, [selectedBaseProduct]);

  // Set initial base if none is selected
  useEffect(() => {
    if (!selectedBase && baseProducts.length > 0) {
      // Find base in activeCategory
      const matchingBase = baseProducts.find(b => b.category === activeCategory);
      if (matchingBase) {
        setSelectedBase(matchingBase);
      } else {
        const firstBase = baseProducts[0];
        setSelectedBase(firstBase);
        setActiveCategory(firstBase.category);
      }
    }
  }, [activeCategory, baseProducts, selectedBase]);

  const handleBaseChange = (base: Product) => {
    setSelectedBase(base);
    setActiveCategory(base.category);
    setAttachedCharms([]); // Reset attached charms on base change
  };

  const handleAddCharm = (charm: Product) => {
    if (attachedCharms.length >= 6) {
      showNotification("Untuk estetika terbaik, maksimal 6 charm dapat digantungkan sekaligus.", "warning");
      return;
    }
    if (charm.stock <= 0) {
      showNotification(`Mohon maaf, stok charm "${charm.name}" sedang kosong.`, "warning");
      return;
    }
    setAttachedCharms([...attachedCharms, charm]);
  };

  const handleRemoveCharm = (indexToRemove: number) => {
    setAttachedCharms(attachedCharms.filter((_, idx) => idx !== indexToRemove));
  };

  // Calculate prices
  const basePrice = selectedBase ? selectedBase.price : 0;
  const charmsPrice = attachedCharms.reduce((sum, c) => sum + c.price, 0);
  
  // Custom options prices
  const giftBoxPrice = giftBoxSelected ? 50000 : 0;
  const certificatePrice = certificateSelected ? 25000 : 0;
  const engravingPrice = engravingText.trim() ? 30000 : 0;
  const greetingCardPrice = greetingCardText.trim() ? 15000 : 0;

  const totalPrice = basePrice + charmsPrice + giftBoxPrice + certificatePrice + engravingPrice + greetingCardPrice;

  const getProductionEstimation = () => {
    let days = 1; // base assembly & casting
    if (attachedCharms.length > 0) {
      days += 1; // layout & handcraft loop-soldering
    }
    if (engravingText.trim()) {
      days += 1; // customized deep laser engraving
    }
    if (certificateSelected) {
      days += 0.5; // official laboratory certification & serial labeling
    }
    return Math.ceil(days);
  };

  const handleAddToCart = () => {
    if (!selectedBase) {
      showNotification("Silakan pilih perhiasan dasar terlebih dahulu.", "warning");
      return;
    }

    onAddBespokeToCart({
      baseProduct: selectedBase,
      selectedCharms: attachedCharms,
      quantity: 1,
      totalPrice: totalPrice,
      engravingText: engravingText.trim() || undefined,
      giftBoxSelected: giftBoxSelected || undefined,
      greetingCardText: greetingCardText.trim() || undefined,
      certificateSelected: certificateSelected || undefined
    });

    showNotification("Bespoke custom set telah berhasil ditambahkan ke keranjang!", "success");
    
    // Reset selections for next beautiful design
    setAttachedCharms([]);
    setEngravingText('');
    setGiftBoxSelected(false);
    setGreetingCardText('');
    setCertificateSelected(false);
  };

  // Get SVG visual render representing the base shape
  const renderBaseVisual = () => {
    if (!selectedBase) return null;

    switch (selectedBase.category) {
      case 'gelang': {
        const isSilver = selectedBase.name.toLowerCase().includes('silver') || selectedBase.name.toLowerCase().includes('perak');
        const metalGradientId = isSilver ? 'silver-grad' : 'rosegold-grad';
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full max-h-[320px]" id="visual-bracelet">
            <defs>
              <linearGradient id="rosegold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F9E2DF" />
                <stop offset="40%" stopColor="#E6C1B9" />
                <stop offset="70%" stopColor="#B76E79" />
                <stop offset="100%" stopColor="#8C4D58" />
              </linearGradient>
              <linearGradient id="silver-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#CBD5E1" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <filter id="luxury-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#2F1F21" floodOpacity="0.12" />
              </filter>
            </defs>
            {/* Bracelet circle */}
            <circle cx="200" cy="200" r="110" fill="none" stroke={`url(#${metalGradientId})`} strokeWidth="12" strokeLinecap="round" filter="url(#luxury-shadow)" />
            {/* Inner glow ring */}
            <circle cx="200" cy="200" r="110" fill="none" stroke="#FFF" strokeWidth="2.5" strokeOpacity="0.5" />
            <circle cx="200" cy="200" r="104" fill="none" stroke={`url(#${metalGradientId})`} strokeWidth="1.5" strokeOpacity="0.4" />
            
            {/* 3D Golden/Silver beads distributed along bracelet */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const bx = 200 + 110 * Math.sin(rad);
              const by = 200 + 110 * Math.cos(rad);
              return (
                <g key={i}>
                  <circle cx={bx} cy={by} r="8" fill={`url(#${metalGradientId})`} stroke="#FFF" strokeWidth="1.2" filter="url(#luxury-shadow)" />
                  <circle cx={bx - 2.5} cy={by - 2.5} r="2.5" fill="#FFF" fillOpacity="0.85" />
                </g>
              );
            })}

            {/* Lock Heart Clasp */}
            <g transform="translate(200, 90)">
              <path d="M0,8 C-10,-5 -22,2 -12,14 L0,24 L12,14 C22,2 -10,-5 0,8 Z" fill="#B76E79" stroke="#FFF" strokeWidth="1.5" filter="url(#luxury-shadow)" />
              <circle cx="0" cy="11" r="3" fill="#FFF" className="animate-pulse" />
            </g>
          </svg>
        );
      }
      case 'kalung': {
        const isSilver = selectedBase.name.toLowerCase().includes('silver') || selectedBase.name.toLowerCase().includes('perak');
        const metalGradientId = isSilver ? 'silver-grad' : 'rosegold-grad';
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full max-h-[320px]" id="visual-necklace">
            <defs>
              <linearGradient id="rosegold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F9E2DF" />
                <stop offset="40%" stopColor="#E6C1B9" />
                <stop offset="70%" stopColor="#B76E79" />
                <stop offset="100%" stopColor="#8C4D58" />
              </linearGradient>
              <linearGradient id="silver-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#CBD5E1" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <filter id="luxury-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#2F1F21" floodOpacity="0.12" />
              </filter>
            </defs>
            {/* Elegant neck arc chain */}
            <path d="M 80,60 Q 200,370 320,60" fill="none" stroke={`url(#${metalGradientId})`} strokeWidth="6" strokeLinecap="round" filter="url(#luxury-shadow)" />
            {/* Highlight line */}
            <path d="M 82,60 Q 200,367 318,60" fill="none" stroke="#FFF" strokeWidth="2" strokeOpacity="0.45" />

            {/* Small gleaming links along necklace chain */}
            {[0.15, 0.25, 0.35, 0.45, 0.5, 0.55, 0.65, 0.75, 0.85].map((t, idx) => {
              const x = (1-t)*(1-t)*80 + 2*(1-t)*t*200 + t*t*320;
              const y = (1-t)*(1-t)*60 + 2*(1-t)*t*370 + t*t*60;
              return (
                <g key={idx}>
                  <circle cx={x} cy={y} r="6" fill={`url(#${metalGradientId})`} stroke="#FFF" strokeWidth="1" filter="url(#luxury-shadow)" />
                  <circle cx={x - 1.5} cy={y - 1.5} r="2" fill="#FFF" fillOpacity="0.8" />
                </g>
              );
            })}

            {/* Center bail charm mount */}
            <g transform="translate(200, 215)">
              <circle cx="0" cy="0" r="10" fill="#B76E79" stroke="#FFF" strokeWidth="1.5" filter="url(#luxury-shadow)" />
              <circle cx="0" cy="0" r="4" fill="#FFF" />
              <path d="M 0,10 L 0,22" stroke={`url(#${metalGradientId})`} strokeWidth="5.5" />
            </g>
          </svg>
        );
      }
      case 'cincin': {
        const isSilver = selectedBase.name.toLowerCase().includes('silver') || selectedBase.name.toLowerCase().includes('perak');
        const metalGradientId = isSilver ? 'silver-grad' : 'rosegold-grad';
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full max-h-[320px]" id="visual-ring">
            <defs>
              <linearGradient id="rosegold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F9E2DF" />
                <stop offset="40%" stopColor="#E6C1B9" />
                <stop offset="70%" stopColor="#B76E79" />
                <stop offset="100%" stopColor="#8C4D58" />
              </linearGradient>
              <linearGradient id="silver-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#CBD5E1" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <filter id="luxury-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#2F1F21" floodOpacity="0.12" />
              </filter>
              <radialGradient id="gem-shine" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#F9E2DF" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#E6C1B9" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Outer band */}
            <circle cx="200" cy="210" r="90" fill="none" stroke={`url(#${metalGradientId})`} strokeWidth="15" filter="url(#luxury-shadow)" />
            {/* Highlight overlays */}
            <circle cx="200" cy="210" r="94.5" fill="none" stroke="#FFF" strokeWidth="2" strokeOpacity="0.5" />
            <circle cx="200" cy="210" r="85" fill="none" stroke="#2F1F21" strokeWidth="1.5" strokeOpacity="0.15" />
            
            {/* Diamond Crown Top mount */}
            <path d="M 175,110 L 190,128 L 210,128 L 225,110 Z" fill="#B76E79" stroke="#FFF" strokeWidth="1" filter="url(#luxury-shadow)" />
            
            {/* Glowing Giant Diamond Facets */}
            <g transform="translate(200, 105)">
              <circle cx="0" cy="0" r="24" fill="url(#gem-shine)" className="animate-pulse" />
              {/* Diamond Body */}
              <path d="M -16,0 L -10,-14 L 10,-14 L 16,0 L 0,16 Z" fill="#F0FDFA" stroke="#2DD4BF" strokeWidth="1.5" />
              {/* Facet Lines */}
              <path d="M -10,-14 L 0,16 L 10,-14 M -16,0 L 16,0 M -10,-14 L -6,0 L 0,16 L 6,0 L 10,-14" stroke="#FFF" strokeWidth="1.2" strokeOpacity="0.8" />
              {/* Sparkle Star */}
              <path d="M -22,-10 Q -15,-10 -15,-17 Q -15,-10 -8,-10 Q -15,-10 -15,-3 Q -15,-10 -22,-10 Z" fill="#FFF" className="animate-pulse" />
            </g>
          </svg>
        );
      }
      case 'anting': {
        const isSilver = selectedBase.name.toLowerCase().includes('silver') || selectedBase.name.toLowerCase().includes('perak');
        const metalGradientId = isSilver ? 'silver-grad' : 'rosegold-grad';
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full max-h-[320px]" id="visual-earrings">
            <defs>
              <linearGradient id="rosegold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F9E2DF" />
                <stop offset="40%" stopColor="#E6C1B9" />
                <stop offset="70%" stopColor="#B76E79" />
                <stop offset="100%" stopColor="#8C4D58" />
              </linearGradient>
              <linearGradient id="silver-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#CBD5E1" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <filter id="luxury-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#2F1F21" floodOpacity="0.12" />
              </filter>
            </defs>
            {/* Hoop 1 */}
            <g transform="translate(140, 180)">
              <circle cx="0" cy="0" r="55" fill="none" stroke={`url(#${metalGradientId})`} strokeWidth="11" filter="url(#luxury-shadow)" />
              <circle cx="0" cy="0" r="58.5" fill="none" stroke="#FFF" strokeWidth="2" strokeOpacity="0.5" />
              <circle cx="0" cy="0" r="50" fill="none" stroke="#2F1F21" strokeWidth="1" strokeOpacity="0.15" />
              {/* Ear Hanger wire */}
              <path d="M 0,-55 A 15,15 0 0,0 -15,-80" fill="none" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
              {/* Mount point ball */}
              <circle cx="0" cy="55" r="7" fill="#B76E79" stroke="#FFF" strokeWidth="1" />
            </g>
            
            {/* Hoop 2 */}
            <g transform="translate(260, 180)">
              <circle cx="0" cy="0" r="55" fill="none" stroke={`url(#${metalGradientId})`} strokeWidth="11" filter="url(#luxury-shadow)" />
              <circle cx="0" cy="0" r="58.5" fill="none" stroke="#FFF" strokeWidth="2" strokeOpacity="0.5" />
              <circle cx="0" cy="0" r="50" fill="none" stroke="#2F1F21" strokeWidth="1" strokeOpacity="0.15" />
              {/* Ear Hanger wire */}
              <path d="M 0,-55 A 15,15 0 0,0 -15,-80" fill="none" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
              {/* Mount point ball */}
              <circle cx="0" cy="55" r="7" fill="#B76E79" stroke="#FFF" strokeWidth="1" />
            </g>
          </svg>
        );
      }
      default:
        return null;
    }
  };

  // Get visual position coordinates for charms hanging on base
  const getCharmCoordinates = (index: number, total: number) => {
    if (!selectedBase) return { x: 200, y: 200 };

    switch (selectedBase.category) {
      case 'gelang': {
        // Distribute along the lower arc of the bracelet (from 110 to 250 degrees)
        const startAngle = 120; // in degrees
        const endAngle = 240;
        const angleRange = endAngle - startAngle;
        const angle = total <= 1 
          ? 180 
          : startAngle + (index / (total - 1)) * angleRange;
        const angleRad = (angle * Math.PI) / 180;
        
        // r = 110, cx = 200, cy = 200
        const r = 110;
        return {
          x: 200 + r * Math.sin(angleRad),
          y: 200 + r * Math.cos(angleRad) + 15 // hang slightly lower
        };
      }
      case 'kalung': {
        // Hanging from the center pendant point (cluster or spread)
        const centerOffset = (index - (total - 1) / 2) * 26;
        return {
          x: 200 + centerOffset,
          y: 232 + (Math.abs(index - (total - 1) / 2) * 4) // curved hang
        };
      }
      case 'cincin': {
        // Clusters near the crown loop at the top
        const angleOffset = (index - (total - 1) / 2) * 22; // spread angle
        const angleRad = (angleOffset * Math.PI) / 180;
        const r = 105;
        return {
          x: 200 + r * Math.sin(angleRad),
          y: 105 - r * Math.cos(angleRad) + 110 // positioned beautifully over crown
        };
      }
      case 'anting': {
        // Split charms evenly between hoop 1 and hoop 2
        const isLeftHoop = index % 2 === 0;
        const hoopIndex = Math.floor(index / 2);
        const totalPerHoop = Math.ceil(total / 2);
        const spreadOffset = (hoopIndex - (totalPerHoop - 1) / 2) * 16;
        
        return {
          x: isLeftHoop ? 140 + spreadOffset : 260 + spreadOffset,
          y: 242 + Math.abs(spreadOffset) * 0.2
        };
      }
      default:
        return { x: 200, y: 200 };
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-4" id="bespoke-charm-builder">
      
      {/* LEFT: INTERACTIVE SIMULATION STAGE (7 Columns) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-[#FFFDF9] border border-rose-dust/30 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between min-h-[500px] relative overflow-hidden">
          
          {/* Soft background decor */}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-rose-dust/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-rose-gold/5 rounded-full blur-3xl pointer-events-none" />

          {/* Info panel */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-rose-dust/20 pb-4">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-rose-gold uppercase block">Atelier Desain Mandiri</span>
              <h3 className="font-serif-luxury text-2xl text-luxury-dark mt-1 font-semibold">Simulasi Perhiasan Kustom</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md leading-relaxed">
                Di sini Anda dapat merancang perhiasan kustom Anda sendiri secara real-time. Pilih jenis perhiasan dasar di <strong>Langkah 1</strong> (Gelang, Kalung, Cincin, atau Anting), lalu tambahkan pesona <strong>(Charm)</strong> batu permata berkilau pilihan Anda di <strong>Langkah 2</strong>.
              </p>
            </div>
            <div className="flex gap-2 self-center md:self-start">
              {['gelang', 'kalung', 'cincin', 'anting'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    const matchingBase = baseProducts.find(b => b.category === cat);
                    if (matchingBase) handleBaseChange(matchingBase);
                    else setActiveCategory(cat as any);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                    activeCategory === cat
                      ? 'bg-rose-gold text-white shadow-sm'
                      : 'bg-rose-dust/10 text-luxury-dark hover:bg-rose-dust/20'
                  }`}
                >
                  {cat === 'gelang' ? 'Gelang' : cat === 'kalung' ? 'Kalung' : cat === 'cincin' ? 'Cincin' : 'Anting'}
                </button>
              ))}
            </div>
          </div>

          {/* MAIN VISUALIZATION FRAME */}
          <div className="relative flex-1 flex items-center justify-center min-h-[350px] my-4 select-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedBase?.id || 'empty'}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="relative w-full max-w-[340px] aspect-square flex items-center justify-center"
              >
                {/* Base SVG */}
                {selectedBase ? (
                  <>
                    {renderBaseVisual()}

                    {/* Absolute Charms Dangling Over Base */}
                    {attachedCharms.map((charm, idx) => {
                      const coords = getCharmCoordinates(idx, attachedCharms.length);
                      return (
                        <motion.div
                          key={`${charm.id}-${idx}`}
                          initial={{ opacity: 0, y: coords.y - 48, scale: 0.5 }}
                          animate={{ opacity: 1, x: coords.x - 28, y: coords.y - 28, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          whileHover={{ scale: 1.25, zIndex: 50 }}
                          className="absolute w-14 h-14 rounded-full border-2 border-rose-gold/45 shadow-lg bg-gradient-to-b from-white to-[#FAF5F3] p-1 cursor-pointer group ring-4 ring-rose-dust/5 hover:ring-rose-gold/30 hover:shadow-rose-gold/15 transition-all duration-300"
                          title={`${charm.name} (Klik untuk lepas)`}
                          onClick={() => handleRemoveCharm(idx)}
                        >
                          {/* Hanging metallic bail (pengait) */}
                          <div className="absolute -top-4.5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                            {/* Inner bail ring */}
                            <div className="w-3.5 h-4.5 border-2 border-rose-gold rounded-full bg-transparent flex items-center justify-center shadow-sm">
                              {/* Small metal loop connector */}
                              <div className="w-1.5 h-1.5 bg-rose-gold rounded-full" />
                            </div>
                            {/* Connector tiny cap */}
                            <div className="w-2.5 h-1.5 bg-[#B76E79] rounded-b-sm border-t border-white/20" />
                          </div>
                          
                          {/* Charm image */}
                          <img
                            src={charm.image_url}
                            alt={charm.name}
                            className="w-full h-full object-cover rounded-full pointer-events-none"
                            referrerPolicy="no-referrer"
                          />

                          {/* Hover Overlay Delete Trigger */}
                          <div className="absolute inset-0 bg-[#2F1F21]/75 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Trash2 className="w-4 h-4 text-white" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </>
                ) : (
                  <div className="text-center text-rose-dust/80">
                    <HelpCircle className="w-12 h-12 mx-auto stroke-[1.5] mb-2 animate-bounce" />
                    <p className="font-serif text-lg">Loading visual model...</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* BOTTOM METRICS */}
          <div className="relative z-10 border-t border-rose-dust/20 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-rose-dust font-medium">Detail Komposisi Perhiasan</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-serif-luxury text-lg text-luxury-dark font-semibold">
                  {selectedBase?.name || "Belum Dipilih"}
                </span>
                <span className="text-sm text-rose-gold">({formatRupiah(basePrice)})</span>
                {attachedCharms.length > 0 && (
                  <>
                    <span className="text-xs text-rose-dust">+</span>
                    <span className="text-xs bg-rose-dust/10 text-rose-gold px-2.5 py-0.5 rounded-full font-medium">
                      {attachedCharms.length} Charm ({formatRupiah(charmsPrice)})
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-rose-dust uppercase font-semibold">Total Harga</p>
                <h4 className="text-2xl font-serif-luxury font-bold text-rose-gold">{formatRupiah(totalPrice)}</h4>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!selectedBase}
                className={`px-6 py-3 rounded-xl font-medium tracking-wide flex items-center gap-2.5 shadow-md transition-all ${
                  selectedBase 
                    ? 'bg-rose-gold text-white hover:bg-rose-gold/90 hover:shadow-lg active:scale-98' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Masukkan Keranjang
              </button>
            </div>
          </div>

          {/* Toast success banner */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={`absolute bottom-6 left-6 right-6 ${notification.type === 'warning' ? 'bg-amber-900/95' : 'bg-[#2F1F21]/95'} text-white py-3.5 px-5 rounded-xl shadow-xl flex items-center justify-between z-50 text-sm border border-rose-dust/20 backdrop-blur-md`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#E1B3B5]" />
                  <span>{notification.text}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* REKOMENDASI SET SERASI */}
        <div className="bg-[#FFFDF9] border border-rose-dust/30 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="p-2.5 bg-rose-dust/15 rounded-xl text-rose-gold shrink-0">
              <Sparkles className="w-5 h-5 stroke-[1.5]" style={{ backgroundColor: '#f0ebeb' }} />
            </span>
            <div>
              <h5 className="text-xs font-bold text-luxury-dark">✨ Rekomendasi Set Perhiasan Serasi</h5>
              <p className="text-[10px] text-gray-500 leading-relaxed mt-1">
                Lengkapi koleksi mahakarya Anda! Setelah menambahkan {selectedBase?.category === 'gelang' ? 'Gelang' : selectedBase?.category === 'kalung' ? 'Kalung' : selectedBase?.category === 'cincin' ? 'Cincin' : 'Anting'} ini ke keranjang, rancang cincin, kalung, atau anting dengan charm senada agar menjadi set perhiasan yang serasi.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0 justify-end w-full md:w-auto">
            {['gelang', 'kalung', 'cincin', 'anting'].filter(cat => cat !== selectedBase?.category).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  const matchingBase = baseProducts.find(b => b.category === cat);
                  if (matchingBase) {
                    handleBaseChange(matchingBase);
                  } else {
                    setActiveCategory(cat as any);
                  }
                }}
                className="px-3 py-1.5 bg-rose-dust/10 text-rose-gold border border-rose-dust/20 hover:border-rose-gold/40 text-[10px] font-bold rounded-lg transition-all"
              >
                + Desain {cat === 'gelang' ? 'Gelang' : cat === 'kalung' ? 'Kalung' : cat === 'cincin' ? 'Cincin' : 'Anting'}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT: COMPONENT SELECTION DRAWER (5 Columns) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* BASE JEWELRY SELECTOR CARD */}
        <div className="bg-[#FFFDF9] border border-rose-dust/30 rounded-3xl p-5 shadow-sm">
          <h4 className="font-serif-luxury text-lg text-luxury-dark mb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-rose-gold rounded-full" />
            Langkah 1: Pilih Perhiasan Dasar
          </h4>
          <p className="text-xs text-rose-dust/80 mb-4">
            Pilih perhiasan dasar emas Rose Gold 18k atau Perak Sterling .925 elegan untuk menggantungkan charm Anda.
          </p>
 
          <div className="flex flex-col gap-2.5 max-h-[170px] overflow-y-auto pr-1">
            {baseProducts.map((base) => {
              const isSelected = selectedBase?.id === base.id;
              return (
                <div
                  key={base.id}
                  onClick={() => handleBaseChange(base)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-rose-gold bg-rose-dust/10 shadow-sm'
                      : 'border-rose-dust/10 bg-white hover:bg-rose-dust/5'
                  }`}
                >
                  <img
                    src={base.image_url}
                    alt={base.name}
                    className="w-12 h-12 rounded-lg object-cover border border-rose-dust/10"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="text-xs font-semibold text-luxury-dark truncate">{base.name}</h5>
                      <span className="text-xs font-serif font-semibold text-rose-gold">{formatRupiah(base.price)}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{base.description}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-dust/10 text-rose-gold font-medium">
                        {base.category === 'gelang' ? 'Gelang' : base.category === 'kalung' ? 'Kalung' : base.category === 'cincin' ? 'Cincin' : 'Anting'}
                      </span>
                      <span className={`text-[9px] font-medium ${base.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {base.stock > 0 ? `Stok: ${base.stock}` : 'Habis'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHARM SELECTION GRID */}
        <div className="bg-[#FFFDF9] border border-rose-dust/30 rounded-3xl p-5 shadow-sm flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-serif-luxury text-lg text-luxury-dark flex items-center gap-2">
              <span className="w-1.5 h-4 bg-rose-gold rounded-full" />
              Langkah 2: Pilih Gantungan (Charm) Anda
            </h4>
            <span className="text-[10px] font-medium bg-rose-gold/10 text-rose-gold px-2 py-0.5 rounded-full">
              {attachedCharms.length}/6 Terpilih
            </span>
          </div>
          <p className="text-xs text-rose-dust/80 mb-4">
            Pilih batu permata berkualitas tinggi, inisial nama, atau charm mewah sebagai pelengkap perhiasan Anda.
          </p>
 
          <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[310px] pr-1 flex-1">
            {charms.map((charm) => {
              const countInBespoke = attachedCharms.filter(c => c.id === charm.id).length;
              const isOutOfStock = charm.stock <= countInBespoke;
              return (
                <div
                  key={charm.id}
                  onClick={() => !isOutOfStock && handleAddCharm(charm)}
                  className={`group relative flex flex-col p-2.5 rounded-xl border transition-all ${
                    isOutOfStock 
                      ? 'border-gray-200 bg-gray-50/50 opacity-60 cursor-not-allowed'
                      : 'border-rose-dust/15 bg-white hover:border-rose-gold hover:shadow-md cursor-pointer'
                  }`}
                >
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-rose-dust/5 border border-rose-dust/5">
                    <img
                      src={charm.image_url}
                      alt={charm.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    {countInBespoke > 0 && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-gold text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                        +{countInBespoke}
                      </div>
                    )}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-rose-gold tracking-wide uppercase px-2 py-1 bg-white border border-rose-dust/30 rounded-full shadow-sm">
                          Habis
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h5 className="text-[11px] font-semibold text-luxury-dark truncate group-hover:text-rose-gold transition-colors">
                        {charm.name}
                      </h5>
                      <p className="text-[9px] text-gray-500 line-clamp-1 mt-0.5">{charm.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-rose-dust/10">
                      <span className="text-[11px] font-serif font-bold text-rose-gold">{formatRupiah(charm.price)}</span>
                      {!isOutOfStock && (
                        <div className="w-5 h-5 rounded-full bg-rose-dust/15 text-rose-gold flex items-center justify-center group-hover:bg-rose-gold group-hover:text-white transition-all">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-3 border-t border-rose-dust/20 flex items-start gap-2.5 bg-rose-dust/5 p-3 rounded-xl">
            <Info className="w-4 h-4 text-rose-gold shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed text-gray-600">
              Setiap custom set dirangkai secara manual oleh ahli pengrajin kami di L'Atelier d'Ana. Anda dapat menata ulang atau melepas charm dengan mengeklik gambar charm di area simulasi sebelah kiri.
            </p>
          </div>

        </div>

        {/* LANGKAH 3: PILIHAN TAMBAHAN PREMIUM */}
        <div className="bg-[#FFFDF9] border border-rose-dust/30 rounded-3xl p-5 shadow-sm">
          <h4 className="font-serif-luxury text-base text-luxury-dark mb-2.5 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-rose-gold rounded-full" />
            Langkah 3: Pilihan Tambahan Premium
          </h4>
          <p className="text-[11px] text-rose-dust/80 mb-3.5">
            Tambahkan sentuhan kemewahan ekstra untuk pesanan Anda dengan opsi kemasan eksklusif dan grafir kustom.
          </p>

          <div className="space-y-3 font-sans">
            {/* 1. Velvet Gift Box */}
            <label className="flex items-start gap-3 p-2.5 rounded-xl border border-rose-dust/15 bg-white hover:bg-rose-dust/5 transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={giftBoxSelected}
                onChange={(e) => setGiftBoxSelected(e.target.checked)}
                className="mt-1 accent-rose-gold shrink-0"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between font-semibold text-luxury-dark">
                  <span>Kotak Kado Beludru Diraja (Royal Velvet Gift Box)</span>
                  <span className="text-rose-gold font-serif">+Rp 50.000</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Kotak beludru warna pink rose mewah, dilapisi pita satin emas & bantal penopang perhiasan.</p>
              </div>
            </label>

            {/* 2. Certificate of Authenticity */}
            <label className="flex items-start gap-3 p-2.5 rounded-xl border border-rose-dust/15 bg-white hover:bg-rose-dust/5 transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={certificateSelected}
                onChange={(e) => setCertificateSelected(e.target.checked)}
                className="mt-1 accent-rose-gold shrink-0"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between font-semibold text-luxury-dark">
                  <span>Sertifikat Kemurnian Atelier (Atelier Certificate)</span>
                  <span className="text-rose-gold font-serif">+Rp 25.000</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Sertifikat fisik dengan nomor seri resmi yang menjamin keaslian lapisan emas 18k & batu kristal.</p>
              </div>
            </label>

            {/* 3. Custom Laser Engraving */}
            <div className="p-2.5 rounded-xl border border-rose-dust/15 bg-white space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-luxury-dark">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-gold" />
                  Grafir Nama / Inisial Kustom
                </span>
                <span className="text-rose-gold font-serif">+Rp 30.000</span>
              </div>
              <p className="text-[10px] text-gray-400">Ukir inisial, nama, atau tanggal spesial pada plat kecil/kancing pengait perhiasan.</p>
              <input
                type="text"
                value={engravingText}
                onChange={(e) => setEngravingText(e.target.value)}
                placeholder="Contoh: A & B, 17.08.23 (Maks 15 karakter)"
                maxLength={15}
                className="w-full px-3 py-1.5 border border-rose-dust/20 rounded-lg text-xs text-luxury-dark focus:outline-none focus:border-rose-gold bg-amber-50/10"
              />
            </div>

            {/* 4. Greeting Card */}
            <div className="p-2.5 rounded-xl border border-rose-dust/15 bg-white space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-luxury-dark">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-gold" />
                  Kartu Ucapan Tulis Tangan
                </span>
                <span className="text-rose-gold font-serif">+Rp 15.000</span>
              </div>
              <p className="text-[10px] text-gray-400">Pesan personal Anda akan ditulis tangan secara estetis di atas kertas linen mewah.</p>
              <textarea
                rows={2}
                value={greetingCardText}
                onChange={(e) => setGreetingCardText(e.target.value)}
                placeholder="Tulis pesan ucapan Anda di sini..."
                className="w-full px-3 py-1.5 border border-rose-dust/20 rounded-lg text-xs text-luxury-dark focus:outline-none focus:border-rose-gold resize-none bg-amber-50/10"
              />
            </div>
          </div>
        </div>

        {/* LANGKAH 4: ESTIMASI PEMBUATAN MAHA KARYA */}
        <div className="bg-[#FFFDF9] border border-rose-dust/30 rounded-3xl p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="font-serif-luxury text-base text-luxury-dark flex items-center gap-2">
              <span className="w-1.5 h-4 bg-rose-gold rounded-full" />
              Langkah 4: Jadwal Perakitan & QA
            </h4>
            <span className="text-[10px] bg-rose-gold/10 text-rose-gold font-bold px-2.5 py-1 rounded-full border border-rose-gold/20">
              {getProductionEstimation()} Hari Pengerjaan
            </span>
          </div>

          <p className="text-[11px] text-rose-dust/80 leading-normal">
            Guna memastikan kualitas standar tinggi atelier, perhiasan kustom Anda akan dirakit sesuai tahapan laboratorium berikut:
          </p>

          <div className="relative pl-5 border-l border-rose-dust/30 space-y-4 text-xs font-sans">
            {/* Timeline Item 1 */}
            <div className="relative">
              <div className="absolute -left-6.5 top-0.5 w-3 h-3 rounded-full bg-rose-gold border-2 border-white shadow-sm" />
              <div className="flex items-start justify-between">
                <strong className="text-luxury-dark">Hari 1: Persiapan & Pengecoran Logam</strong>
                <span className="text-[9px] text-rose-gold font-bold uppercase tracking-wider">Selesai</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">Penempaan emas 18k murni untuk perhiasan dasar ({selectedBase?.name || 'Gelang'}).</p>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative">
              <div className={`absolute -left-6.5 top-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm transition-colors ${
                attachedCharms.length > 0 ? 'bg-rose-gold' : 'bg-gray-300'
              }`} />
              <div className="flex items-start justify-between">
                <strong className={attachedCharms.length > 0 ? 'text-luxury-dark' : 'text-gray-400'}>
                  Hari 2: Pemasangan {attachedCharms.length} Charm Manual
                </strong>
                <span className="text-[9px] text-[#A47F81] font-semibold">
                  {attachedCharms.length > 0 ? 'Aktif' : 'Antrean'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">Penyolderan mikro & penataan loop kristal zircon secara estetis oleh maestro kriya kami.</p>
            </div>

            {/* Timeline Item 3 (Custom Engraving) */}
            <div className="relative">
              <div className={`absolute -left-6.5 top-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm transition-colors ${
                engravingText.trim() ? 'bg-rose-gold' : 'bg-gray-300'
              }`} />
              <div className="flex items-start justify-between">
                <strong className={engravingText.trim() ? 'text-luxury-dark' : 'text-gray-400'}>
                  Hari 3: Grafir Presisi Laser Serat Optik
                </strong>
                <span className="text-[9px] text-[#A47F81] font-semibold">
                  {engravingText.trim() ? 'Ditambahkan' : 'Opsional'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">Grafir nama kustom "{engravingText || 'Belum diisi'}" menggunakan laser serat berkekuatan tinggi.</p>
            </div>

            {/* Timeline Item 4 */}
            <div className="relative">
              <div className="absolute -left-6.5 top-0.5 w-3 h-3 rounded-full bg-rose-gold/40 border-2 border-white shadow-sm" />
              <div className="flex items-start justify-between">
                <strong className="text-luxury-dark">Hari Terakhir: Quality Control & Sertifikasi</strong>
                <span className="text-[9px] text-green-600 font-bold uppercase">Final</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">Uji ketahanan gesek, pembersihan ultrasonik, penyegelan pita satin, dan penerbitan sertifikat.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
