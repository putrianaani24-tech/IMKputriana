import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/serverDb';
import { Product } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON request parser
  app.use(express.json());

  // Log incoming requests for better observability
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // REST API Endpoints

  // GET /api/products (with category and type filters)
  app.get('/api/products', (req, res) => {
    try {
      let products = db.getProducts();
      
      const { category, type } = req.query;

      if (category) {
        products = products.filter(
          p => p.category.toLowerCase() === String(category).toLowerCase()
        );
      }

      if (type) {
        products = products.filter(
          p => p.type.toLowerCase() === String(type).toLowerCase()
        );
      }

      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch products' });
    }
  });

  // POST /api/products (Admin - create product)
  app.post('/api/products', (req, res) => {
    try {
      const { name, description, price, image_url, type, category, stock } = req.body;

      if (!name || !price || !type || !category || stock === undefined) {
        return res.status(400).json({ error: 'Missing required fields for product creation.' });
      }

      const newProd = db.createProduct({
        name,
        description: description || '',
        price: parseFloat(price),
        image_url: image_url || 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=500',
        type: type as 'base' | 'charm',
        category: category as 'gelang' | 'kalung' | 'cincin' | 'anting',
        stock: parseInt(stock, 10)
      });

      res.status(201).json(newProd);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create product' });
    }
  });

  // PUT /api/products/{id} (Admin - update product/stock)
  app.put('/api/products/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      const updated = db.updateProduct(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update product' });
    }
  });

  // DELETE /api/products/{id} (Admin - delete product)
  app.delete('/api/products/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      const deleted = db.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Product not found or already deleted' });
      }

      res.json({ message: 'Product deleted successfully', id });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete product' });
    }
  });

  // POST /api/orders (Submit checkout and handle stock reduction)
  app.post('/api/orders', (req, res) => {
    try {
      const { 
        customer_name, 
        customer_email, 
        items,
        shipping_address,
        shipping_lat,
        shipping_lng,
        payment_method,
        qris_reference
      } = req.body;

      if (!customer_name || !customer_email || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Missing required order fields or items.' });
      }

      const result = db.createOrder({
        customer_name,
        customer_email,
        items: items.map((it: any) => ({
          product_id: parseInt(it.product_id, 10),
          quantity: parseInt(it.quantity, 10)
        })),
        shipping_address,
        shipping_lat: shipping_lat ? parseFloat(shipping_lat) : undefined,
        shipping_lng: shipping_lng ? parseFloat(shipping_lng) : undefined,
        payment_method: payment_method || 'QRIS',
        qris_reference
      });

      res.status(201).json({
        message: 'Order created successfully via simulated premium gateway',
        order: result.order,
        items: result.items
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to process order. Please verify stock.' });
    }
  });

  // GET /api/orders (Admin view to list all orders)
  app.get('/api/orders', (req, res) => {
    try {
      const orders = db.getOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch orders' });
    }
  });

  // PUT /api/orders/{id}/status (Admin view to update order status)
  app.put('/api/orders/:id/status', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid order ID' });
      }

      if (!status || !['pending', 'paid', 'processing', 'shipped'].includes(status)) {
        return res.status(400).json({ error: 'Invalid order status. Must be pending, paid, processing, or shipped.' });
      }

      const updated = db.updateOrderStatus(id, status as any);
      if (!updated) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update order status' });
    }
  });

  // Integrate Vite Dev Server Middleware / Static Serve
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA Fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start Express on 0.0.0.0:3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`L'Atelier d'Ana Charm & Jewelry server active at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
});
