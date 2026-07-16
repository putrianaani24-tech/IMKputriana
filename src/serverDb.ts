import fs from 'fs';
import path from 'path';
import { Product, Order, OrderItem, OrderItemWithProduct } from './types';

const DB_FILE = path.resolve(process.cwd(), 'db.json');

interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  orderItems: OrderItem[];
}

const DEFAULT_PRODUCTS: Product[] = [
  // BASE Products - Kalung (Necklaces) - Sorted first as requested ("kalung, gelang, cincin")
  {
    id: 1,
    name: "Kalung Clover Blossom Elegance",
    description: "Kalung emas kuning 18k mewah dengan jajaran kelopak bunga semanggi (clover) bertatahkan kristal putih berkilau. Dasar kalung yang anggun dan berkelas.",
    price: 2850000,
    image_url: "/src/assets/images/regenerated_image_1782825049628.jpg",
    type: "base",
    category: "kalung",
    stock: 20
  },
  {
    id: 2,
    name: "Kalung Kupu-Kupu Marquise Drop",
    description: "Kalung emas bertatahkan kristal kupu-kupu bersayap marquis dengan gantungan tetesan air mata pir (pear drop) yang memancarkan pesona romantis.",
    price: 2450000,
    image_url: "/src/assets/images/regenerated_image_1782825050932.jpg",
    type: "base",
    category: "kalung",
    stock: 18
  },
  {
    id: 3,
    name: "Kalung Rantai Daun Laurel",
    description: "Kalung rantai emas klasik berdesain barisan daun laurel melingkar yang melambangkan kemegahan dan kehormatan abadi.",
    price: 2650000,
    image_url: "/src/assets/images/regenerated_image_1782825052250.jpg",
    type: "base",
    category: "kalung",
    stock: 15
  },
  {
    id: 4,
    name: "Kalung Layered Multi-Charm Golden",
    description: "Rantai bertumpuk tiga lapis (layered chain) berlapis emas kuning 18k dengan charm bawaan matahari, bintang, dan liontin bulan.",
    price: 3200000,
    image_url: "/src/assets/images/regenerated_image_1782825053395.jpg",
    type: "base",
    category: "kalung",
    stock: 12
  },

  // BASE Products - Gelang (Bracelets) - Sorted second
  {
    id: 5,
    name: "Gelang Perak Ranting Daun Laurel",
    description: "Gelang perak murni sterling .925 buatan tangan dengan ukiran daun laurel berjalin indah dan bertahtakan batu zirconia putih bersih.",
    price: 1850000,
    image_url: "/src/assets/images/regenerated_image_1782825054591.jpg",
    type: "base",
    category: "gelang",
    stock: 25
  },
  {
    id: 6,
    name: "Gelang Emas Kelopak Daun & Kristal",
    description: "Gelang rantai emas tipis rose gold dengan aksen kelopak daun melengkung dari permata marquis, dikemas manis dalam kotak perhiasan beludru pink.",
    price: 1950000,
    image_url: "/src/assets/images/regenerated_image_1782825056982.jpg",
    type: "base",
    category: "gelang",
    stock: 22
  },
  {
    id: 7,
    name: "Gelang Rantai Stacked Diamond Wrist",
    description: "Set gelang rantai bertumpuk berlapis emas kuning 18k dengan sentuhan kristal mikro-pave berkilau tinggi yang sangat glamor.",
    price: 2100000,
    image_url: "/src/assets/images/regenerated_image_1782825056166.jpg",
    type: "base",
    category: "gelang",
    stock: 16
  },

  // BASE Products - Cincin (Rings) - Sorted third
  {
    id: 8,
    name: "Cincin Twist Sapphire & Diamond Vine",
    description: "Cincin perak bermodel ranting melilit bertatahkan safir biru safir dan berlian cz putih yang indah layaknya dongeng fantasi.",
    price: 1550000,
    image_url: "/src/assets/images/regenerated_image_1782825059369.jpg",
    type: "base",
    category: "cincin",
    stock: 30
  },
  {
    id: 9,
    name: "Cincin Solitaire Royal Clover Flower",
    description: "Cincin kawin perak berlapis platinum dengan mahkota cincin berbentuk bunga semanggi dari potongan berlian cemerlang.",
    price: 1750000,
    image_url: "/src/assets/images/regenerated_image_1782825060622.jpg",
    type: "base",
    category: "cincin",
    stock: 35
  },
  {
    id: 10,
    name: "Cincin Tiara Marquise Crown",
    description: "Cincin mahkota ratu perak sterling mewah bertahtakan berlian marquise berbentuk tiara agung yang memukau mata.",
    price: 1650000,
    image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80",
    type: "base",
    category: "cincin",
    stock: 28
  },
  {
    id: 11,
    name: "Cincin Stacked Rainbow Gemstones",
    description: "Set tumpuk cincin emas-perak eksklusif dengan paduan kristal warna-warni pelangi yang memancarkan keceriaan cerita indah Anda.",
    price: 2250000,
    image_url: "/src/assets/images/regenerated_image_1782825061458.jpg",
    type: "base",
    category: "cincin",
    stock: 20
  },

  // BASE Products - Anting (Earrings) - Sorted fourth
  {
    id: 12,
    name: "Anting Stacked Piercing Set - Golden Elegance",
    description: "Set anting tindik tinduk emas multi-tumpuk mewah dengan hiasan kupu-kupu kristal, hoop kecil, dan rantai mutiara menggantung.",
    price: 2350000,
    image_url: "/src/assets/images/regenerated_image_1782825062687.jpg",
    type: "base",
    category: "anting",
    stock: 15
  },

  // CHARMS (Can be added to any Base) - Highly Attractive and Beautiful Designs!
  {
    id: 13,
    name: "Charm Kupu-Kupu Marquis Rose Gold",
    description: "Charm kupu-kupu indah bersayap kristal marquise berkilauan, terbuat dari rose gold 18k yang anggun.",
    price: 650000,
    image_url: "/src/assets/images/regenerated_image_1782828549089.jpg",
    type: "charm",
    category: "gelang",
    stock: 100
  },
  {
    id: 14,
    name: "Charm Bintang & Bulan Sabit Celestial",
    description: "Charm kombinasi bintang jatuh dan bulan sabit mungil bertatahkan berlian mikro-pave.",
    price: 550000,
    image_url: "/src/assets/images/regenerated_image_1782828550249.jpg",
    type: "charm",
    category: "kalung",
    stock: 80
  },
  {
    id: 15,
    name: "Charm Klover Emerald Keberuntungan",
    description: "Charm semanggi empat daun pembawa keberuntungan dengan tatahan batu emerald hijau tua dan berlian putih.",
    price: 600000,
    image_url: "/src/assets/images/regenerated_image_1782828550945.jpg",
    type: "charm",
    category: "gelang",
    stock: 90
  },
  {
    id: 16,
    name: "Charm Tetesan Embun Mutiara Air Tawar",
    description: "Mutiara air tawar budidaya asli berbentuk tetesan air yang tergantung lembut pada pengait emas murni.",
    price: 750000,
    image_url: "/src/assets/images/regenerated_image_1782828551705.jpg",
    type: "charm",
    category: "anting",
    stock: 45
  },
  {
    id: 17,
    name: "Charm Mahkota Royal Tiara",
    description: "Charm tiara mini berhiaskan potongan berlian marquise dan cz merah muda yang menakjubkan.",
    price: 500000,
    image_url: "/src/assets/images/regenerated_image_1782828552613.jpg",
    type: "charm",
    category: "gelang",
    stock: 75
  },
  {
    id: 18,
    name: "Charm Ceri Kristal Ruby",
    description: "Charm berbentuk buah ceri kembar dari batu ruby merah delima asli dan gagang emas yang menggemaskan.",
    price: 450000,
    image_url: "/src/assets/images/regenerated_image_1782828553380.jpg",
    type: "charm",
    category: "cincin",
    stock: 60
  },
  {
    id: 19,
    name: "Charm Planet Saturnus Amethyst",
    description: "Charm planet Saturnus dengan cincin bintang emas berputar dan core batu amethyst ungu kristal.",
    price: 450000,
    image_url: "/src/assets/images/regenerated_image_1782828554265.jpg",
    type: "charm",
    category: "kalung",
    stock: 55
  }
];

function readDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData: DatabaseSchema = {
        products: DEFAULT_PRODUCTS,
        orders: [],
        orderItems: []
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data) as DatabaseSchema;
    
    // Auto-migrate if the database exists but still uses the old USD prices (e.g. price of id:1 is 125)
    if (parsed.products && parsed.products.length > 0 && parsed.products.some(p => p.price < 5000)) {
      parsed.products = DEFAULT_PRODUCTS;
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    
    return parsed;
  } catch (err) {
    console.error('Error reading DB file:', err);
    return { products: DEFAULT_PRODUCTS, orders: [], orderItems: [] };
  }
}

function writeDB(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB file:', err);
  }
}

export const db = {
  // PRODUCTS CRUD
  getProducts(): Product[] {
    return readDB().products;
  },

  getProductById(id: number): Product | undefined {
    return readDB().products.find(p => p.id === id);
  },

  createProduct(prod: Omit<Product, 'id'>): Product {
    const data = readDB();
    const newId = data.products.reduce((max, p) => p.id > max ? p.id : max, 0) + 1;
    const newProduct: Product = { id: newId, ...prod };
    data.products.push(newProduct);
    writeDB(data);
    return newProduct;
  },

  updateProduct(id: number, prod: Partial<Omit<Product, 'id'>>): Product | undefined {
    const data = readDB();
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    data.products[index] = { ...data.products[index], ...prod };
    writeDB(data);
    return data.products[index];
  },

  deleteProduct(id: number): boolean {
    const data = readDB();
    const initialLength = data.products.length;
    data.products = data.products.filter(p => p.id !== id);
    writeDB(data);
    return data.products.length < initialLength;
  },

  // ORDERS MANAGEMENT
  getOrders(): Order[] {
    const data = readDB();
    // Hydrate orders with their order items and product info
    return data.orders.map(order => {
      const items = data.orderItems
        .filter(item => item.order_id === order.id)
        .map(item => {
          const product = data.products.find(p => p.id === item.product_id);
          return {
            ...item,
            product_name: product?.name || 'Unknown Item',
            product_type: product?.type,
            product_category: product?.category,
            product_image: product?.image_url
          };
        });
      return { ...order, items };
    });
  },

  createOrder(orderData: {
    customer_name: string;
    customer_email: string;
    items: { product_id: number; quantity: number }[];
    shipping_address?: string;
    shipping_lat?: number;
    shipping_lng?: number;
    payment_method?: string;
    qris_reference?: string;
  }): { order: Order; items: OrderItem[] } {
    const data = readDB();
    
    // Calculate live total price on the backend to prevent tampering
    let calculatedTotal = 0;
    const itemsToCreate: Omit<OrderItem, 'id'>[] = [];

    for (const item of orderData.items) {
      const product = data.products.find(p => p.id === item.product_id);
      if (!product) {
        throw new Error(`Product with ID ${item.product_id} not found.`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`);
      }
      
      const itemPrice = product.price;
      calculatedTotal += itemPrice * item.quantity;
      itemsToCreate.push({
        order_id: 0, // Fill after order creation
        product_id: item.product_id,
        quantity: item.quantity,
        price: itemPrice
      });

      // Deduct stock
      product.stock -= item.quantity;
    }

    // Save order
    const nextOrderId = data.orders.reduce((max, o) => o.id > max ? o.id : max, 0) + 1;
    const newOrder: Order = {
      id: nextOrderId,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      total_price: calculatedTotal,
      status: 'pending',
      created_at: new Date().toISOString(),
      shipping_address: orderData.shipping_address,
      shipping_lat: orderData.shipping_lat,
      shipping_lng: orderData.shipping_lng,
      payment_method: orderData.payment_method || 'QRIS',
      qris_reference: orderData.qris_reference
    };
    data.orders.push(newOrder);

    // Save order items
    let nextItemId = data.orderItems.reduce((max, i) => i.id > max ? i.id : max, 0) + 1;
    const finalItems: OrderItem[] = itemsToCreate.map(item => {
      const orderItem: OrderItem = {
        id: nextItemId++,
        order_id: nextOrderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      };
      data.orderItems.push(orderItem);
      return orderItem;
    });

    writeDB(data);

    return {
      order: newOrder,
      items: finalItems
    };
  },

  updateOrderStatus(orderId: number, status: 'pending' | 'paid' | 'processing' | 'shipped'): Order | undefined {
    const data = readDB();
    const orderIndex = data.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return undefined;

    data.orders[orderIndex].status = status;
    writeDB(data);
    return data.orders[orderIndex];
  }
};
