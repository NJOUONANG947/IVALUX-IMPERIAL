/**
 * IVALUX IMPERIAL - REST API Server
 * Node.js + Express + Supabase
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const employeeRoutes = require('./routes/employee');
const adminRoutes = require('./routes/admin');
const trackRoutes = require('./routes/track');
const ordersRoutes = require('./routes/orders');
const invoicesRoutes = require('./routes/invoices');
const appointmentsRoutes = require('./routes/appointments');
const messagesRoutes = require('./routes/messages');
const financialRoutes = require('./routes/financial');
const loyaltyRoutes = require('./routes/loyalty');
const subscriptionsRoutes = require('./routes/subscriptions');
const notificationsRoutes = require('./routes/notifications');
const reviewsRoutes = require('./routes/reviews');
const analyticsRoutes = require('./routes/analytics');
const sentimentRoutes = require('./routes/sentiment');
const metaverseRoutes = require('./routes/metaverse');
const marketplaceRoutes = require('./routes/marketplace');
const iotRoutes = require('./routes/iot');
const formulationsRoutes = require('./routes/formulations');
const gamificationRoutes = require('./routes/gamification');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 10000; // Aligné sur le port par défaut de Render

// CONFIGURATION CORS CORRIGÉE
app.use(cors({ 
  origin: [
    'https://ivalux.onrender.com', 
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/products', productsRoutes);
app.use('/employee', employeeRoutes);
app.use('/admin', adminRoutes);
app.use('/track', trackRoutes);
app.use('/orders', ordersRoutes);
app.use('/invoices', invoicesRoutes);
app.use('/appointments', appointmentsRoutes);
app.use('/messages', messagesRoutes);
app.use('/financial', financialRoutes);
app.use('/loyalty', loyaltyRoutes);
app.use('/subscriptions', subscriptionsRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/reviews', reviewsRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/sentiment', sentimentRoutes);
app.use('/metaverse', metaverseRoutes);
app.use('/marketplace', marketplaceRoutes);
app.use('/iot', iotRoutes);
app.use('/formulations', formulationsRoutes);
app.use('/gamification', gamificationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ivalux-imperial-api' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`IVALUX IMPERIAL API running on port ${PORT}`);
});
