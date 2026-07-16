/**
 * Shared Type Definitions for Pink Luxury Charm & Jewelry
 */

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  type: 'base' | 'charm';
  category: 'gelang' | 'kalung' | 'cincin' | 'anting';
  stock: number;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  total_price: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped';
  created_at: string;
  items?: OrderItemWithProduct[];
  shipping_address?: string;
  shipping_lat?: number;
  shipping_lng?: number;
  payment_method?: string;
  qris_reference?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
}

export interface OrderItemWithProduct extends OrderItem {
  product_name?: string;
  product_type?: string;
  product_category?: string;
  product_image?: string;
}

export interface CartItem {
  id: string; // unique ID for item in cart (can be unique set composite or simple)
  baseProduct: Product;
  selectedCharms: Product[];
  quantity: number;
  totalPrice: number;
  engravingText?: string;
  giftBoxSelected?: boolean;
  greetingCardText?: string;
  certificateSelected?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

