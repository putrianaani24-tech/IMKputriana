import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Compass, Navigation, ShieldCheck, Check, Globe } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ShippingMapProps {
  onLocationSelect: (address: string, lat: number, lng: number) => void;
  initialAddress?: string;
}

interface PresetLocation {
  name: string;
  address: string;
  lat: number;
  lng: number;
  area: string;
}

const NATIONWIDE_PRESETS: PresetLocation[] = [
  {
    name: "Atelier Utama (Jakarta Center)",
    address: "Grand Indonesia, Lantai 1, Rose Gold Room, Menteng, Jakarta Pusat, DKI Jakarta",
    lat: -6.1953,
    lng: 106.8208,
    area: "DKI Jakarta"
  },
  {
    name: "Dago Mansion (Bandung)",
    address: "Jl. Ir. H. Juanda No. 128, Dago, Coblong, Kota Bandung, Jawa Barat, 40135",
    lat: -6.8863,
    lng: 107.6153,
    area: "Jawa Barat"
  },
  {
    name: "Ubud Sanctuary (Bali)",
    address: "Jl. Raya Sanggingan No. 88, Ubud, Gianyar, Bali, 80571",
    lat: -8.4984,
    lng: 115.2534,
    area: "Bali"
  },
  {
    name: "Surabaya Suites (Kertajaya)",
    address: "Jl. Kertajaya Indah Timur No. 42, Mulyorejo, Kota Surabaya, Jawa Timur, 60116",
    lat: -7.2754,
    lng: 112.7844,
    area: "Jawa Timur"
  },
  {
    name: "Medan Mansion (Selayang)",
    address: "Jl. Setia Budi No. 12A, Selayang, Kota Medan, Sumatera Utara, 20132",
    lat: 3.5582,
    lng: 98.6324,
    area: "Sumatera Utara"
  },
  {
    name: "Makassar Waterfront",
    address: "Jl. Metro Tanjung Bunga No. 88, Makassar, Sulawesi Selatan, 90224",
    lat: -5.1524,
    lng: 119.4124,
    area: "Sulawesi Selatan"
  },
  {
    name: "Yogyakarta Heritage Villa",
    address: "Jl. Malioboro No. 24, Sosromenduran, Kota Yogyakarta, DIY, 55271",
    lat: -7.7924,
    lng: 110.3658,
    area: "DI Yogyakarta"
  },
  {
    name: "Singapore Penthouse",
    address: "Orchard Road Marina Towers, No. 10 Marina Boulevard, Singapore 018981",
    lat: 1.3521,
    lng: 103.8198,
    area: "Singapore"
  },
  {
    name: "Tokyo Ginza Residence",
    address: "Chome-5-1 Ginza, Chuo City, Tokyo 104-0061, Japan",
    lat: 35.6716,
    lng: 139.7645,
    area: "Japan"
  }
];

export default function ShippingMap({ onLocationSelect, initialAddress = '' }: ShippingMapProps) {
  const [lat, setLat] = useState(NATIONWIDE_PRESETS[1].lat);
  const [lng, setLng] = useState(NATIONWIDE_PRESETS[1].lng);
  const [searchQuery, setSearchQuery] = useState('');
  const [customAddress, setCustomAddress] = useState(initialAddress || NATIONWIDE_PRESETS[1].address);
  const [isSearching, setIsSearching] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);

  const ATELIER_COORDS = NATIONWIDE_PRESETS[0]; // Grand Indonesia

  // Calculate Haversine distance from Atelier
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return parseFloat(d.toFixed(1));
  };

  const distance = calculateDistance(ATELIER_COORDS.lat, ATELIER_COORDS.lng, lat, lng);

  const getDeliveryEstimation = (dist: number) => {
    if (dist <= 15) {
      return "Same-Day Delivery (Kurir Atelier)";
    } else if (dist <= 100) {
      return "1 - 2 Hari Kerja (Express Luxury)";
    } else if (dist <= 1000) {
      return "2 - 4 Hari Kerja (Reguler Terproteksi)";
    } else if (dist <= 3000) {
      return "3 - 5 Hari Kerja (Kargo Aman Bersertifikat)";
    } else {
      return "5 - 7 Hari Kerja (Global Luxury Express)";
    }
  };

  const getEstimatedDeliveryDateRange = (dist: number) => {
    const today = new Date();
    const startDays = 2 + (dist <= 15 ? 0 : dist <= 100 ? 1 : dist <= 1000 ? 2 : dist <= 3000 ? 3 : 5);
    const endDays = startDays + (dist <= 15 ? 1 : dist <= 100 ? 1 : dist <= 1000 ? 2 : dist <= 3000 ? 2 : 3);
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + startDays);
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + endDays);
    
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const startStr = startDate.toLocaleDateString('id-ID', options);
    const endStr = endDate.toLocaleDateString('id-ID', options);
    
    return `${startStr} - ${endStr} 2026`;
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Leaflet instance
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([lat, lng], 10);

    // Warm aesthetic tile styles using OpenStreetMap Carto
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Create high-end pink-gold custom SVG marker icon
    const customIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-pink-500/30 rounded-full animate-ping"></div>
          <div class="w-5 h-5 bg-pink-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // Add marker
    const marker = L.marker([lat, lng], { icon: customIcon, draggable: true }).addTo(map);

    mapInstanceRef.current = map;
    markerInstanceRef.current = marker;

    // Click on Map to set location
    map.on('click', (e) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      handleMapInteraction(clickLat, clickLng);
    });

    // Drag marker event
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      handleMapInteraction(position.lat, position.lng);
    });

    // Auto-resize leaflet map helper
    setTimeout(() => {
      map.invalidateSize();
    }, 400);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update parent when address, lat or lng changes
  useEffect(() => {
    onLocationSelect(customAddress, lat, lng);
  }, [customAddress, lat, lng]);

  const handleMapInteraction = async (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);

    if (markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng([newLat, newLng]);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([newLat, newLng]);
    }

    setCustomAddress(`Mencari alamat detail (${newLat.toFixed(4)}, ${newLng.toFixed(4)})...`);

    try {
      // Free Nominatim reverse geocoder
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&zoom=18&addressdetails=1`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          setCustomAddress(data.display_name);
          return;
        }
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }

    setCustomAddress(`Kargo Kustom: Area Koordinat (${newLat.toFixed(4)}, ${newLng.toFixed(4)})`);
  };

  const handleSelectPreset = (preset: PresetLocation) => {
    setLat(preset.lat);
    setLng(preset.lng);
    setCustomAddress(preset.address);

    if (mapInstanceRef.current && markerInstanceRef.current) {
      mapInstanceRef.current.setView([preset.lat, preset.lng], 13);
      markerInstanceRef.current.setLatLng([preset.lat, preset.lng]);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setCustomAddress("Mencari lokasi di peta...");

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const result = data[0];
          const newLat = parseFloat(result.lat);
          const newLng = parseFloat(result.lon);
          const displayName = result.display_name;

          setLat(newLat);
          setLng(newLng);
          setCustomAddress(displayName);

          if (mapInstanceRef.current && markerInstanceRef.current) {
            mapInstanceRef.current.setView([newLat, newLng], 12);
            markerInstanceRef.current.setLatLng([newLat, newLng]);
            
            // Invalidate size once more just in case
            mapInstanceRef.current.invalidateSize();
          }
        } else {
          setCustomAddress(`Kargo Kustom: Jl. ${searchQuery}`);
        }
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      setCustomAddress(`Kargo Kustom: Jl. ${searchQuery}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-3 bg-white border border-rose-dust/15 rounded-2xl p-4 shadow-xs" id="shipping-maps-container">
      
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-dust/5 pb-2.5">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-rose-gold" />
          <h4 className="text-xs font-bold text-luxury-dark uppercase tracking-wider">Kargo Pengantaran Internasional (Real Map)</h4>
        </div>
        <span className="text-[10px] text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
          <Compass className="w-3 h-3 text-green-500 animate-spin" />
          Mendukung Seluruh Indonesia & Dunia
        </span>
      </div>

      {/* Address Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-1.5" id="maps-search-form">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-rose-gold/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari wilayah/kota mana saja di seluruh dunia..."
            className="w-full pl-9 pr-3 py-2 border border-rose-dust/15 rounded-xl bg-rose-dust/5 focus:bg-white text-xs text-luxury-dark focus:outline-none focus:border-rose-gold"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-3.5 bg-[#2F1F21] hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1"
        >
          {isSearching ? 'Mencari...' : 'Cari Map'}
        </button>
      </form>

      {/* Preset Luxury Address Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none" id="preset-maps-chips">
        {NATIONWIDE_PRESETS.slice(1).map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className={`px-2.5 py-1 text-[9px] font-bold rounded-full border transition-all shrink-0 flex items-center gap-1 ${
              Math.abs(lat - preset.lat) < 0.001 && Math.abs(lng - preset.lng) < 0.001
                ? 'bg-rose-gold border-rose-gold text-white'
                : 'bg-[#FFFDF9] border-rose-dust/20 text-[#A47F81] hover:border-rose-gold/40'
            }`}
          >
            {Math.abs(lat - preset.lat) < 0.001 && Math.abs(lng - preset.lng) < 0.001 && <Check className="w-2.5 h-2.5" />}
            {preset.name.split(" (")[0]}
          </button>
        ))}
      </div>

      {/* Real Interactive Leaflet Map Container */}
      <div 
        className="h-48 w-full rounded-xl border border-rose-dust/15 overflow-hidden relative shadow-inner z-10"
        id="luxury-interactive-map-frame"
      >
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Instruct Overlay */}
        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs px-2 py-1 rounded-md text-[8px] text-[#A47F81] font-medium flex items-center gap-1 border border-rose-dust/10 shadow-xs z-50 pointer-events-none">
          <Navigation className="w-2.5 h-2.5 text-rose-gold" />
          <span>Klik/geser peniti pink di peta untuk menentukan koordinat kargo Anda</span>
        </div>
      </div>

      {/* Coordinate & Distance Indicators */}
      <div className="grid grid-cols-2 gap-2 text-[10px]" id="maps-distance-grid">
        <div className="bg-[#FFFDF9] border border-rose-dust/10 rounded-xl p-2.5 space-y-0.5">
          <p className="text-gray-400 font-semibold uppercase tracking-wider text-[8px]">Koordinat Pengantaran</p>
          <p className="font-mono text-luxury-dark font-extrabold truncate">
            {lat.toFixed(4)}° {lat >= 0 ? 'N' : 'S'}, {lng.toFixed(4)}° {lng >= 0 ? 'E' : 'W'}
          </p>
        </div>
        <div className="bg-[#FFFDF9] border border-rose-dust/10 rounded-xl p-2.5 space-y-0.5">
          <p className="text-gray-400 font-semibold uppercase tracking-wider text-[8px]">Kargo & Jarak dari Atelier Utama</p>
          <p className="text-luxury-dark font-bold flex items-center gap-1 font-serif">
            <span className="text-rose-gold text-xs font-serif">{distance >= 5000 ? '>5.000' : distance} km</span>
            <span className="text-[8px] text-green-600 font-semibold font-sans bg-green-50 px-1.5 py-0.2 rounded">Bebas Ongkir</span>
          </p>
        </div>
      </div>

      {/* Dynamic Delivery Estimation Box */}
      <div className="bg-rose-dust/5 border border-rose-gold/20 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs" id="maps-delivery-estimation-box">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-rose-gold animate-spin shrink-0" style={{ animationDuration: '6s' }} />
          <div>
            <p className="text-[8px] text-[#A47F81] font-extrabold uppercase tracking-wider">Estimasi Pengiriman Kargo</p>
            <p className="font-semibold text-luxury-dark">{getDeliveryEstimation(distance)}</p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[8px] text-gray-400 uppercase tracking-wider font-semibold">Estimasi Tiba di Alamat</p>
          <p className="text-rose-gold font-bold font-serif">{getEstimatedDeliveryDateRange(distance)}</p>
        </div>
      </div>

      {/* Full Address Text Area */}
      <div>
        <label className="block text-[9px] font-bold text-luxury-dark uppercase tracking-wider mb-1">
          Alamat Pengiriman Kargo Lengkap (Tersinkronisasi)
        </label>
        <textarea
          required
          rows={2}
          value={customAddress}
          onChange={(e) => setCustomAddress(e.target.value)}
          placeholder="Masukkan detail tambahan alamat (Provinsi, Kota, Kecamatan, Kode Pos, Jalan, No. Rumah)..."
          className="w-full px-3 py-2 border border-rose-dust/15 rounded-xl bg-rose-dust/5 focus:bg-white text-xs text-luxury-dark focus:outline-none focus:border-rose-gold resize-none font-medium leading-relaxed"
          id="shipping-address-textarea"
        />
      </div>

      {/* Premium Shipping Guarantee Badge */}
      <div className="bg-emerald-50/50 border border-emerald-200/40 rounded-xl p-2.5 text-[10px] text-emerald-800 leading-normal flex items-start gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <div>
          <strong>Layanan Kargo Eksklusif Seluruh Dunia:</strong> Kami mengirim perhiasan kustom Anda ke mana pun di seluruh Indonesia maupun luar negeri secara gratis, dilengkapi kotak pengaman kayu jati bersertifikasi, terlindungi asuransi premium 100%.
        </div>
      </div>
    </div>
  );
}
