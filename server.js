require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const { User, Customer, Order } = require('./models');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'tailor_secret_key';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tailor-notebook';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // This contains { id, email }
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Auth Routes
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const user = new User({ name, email, password });
    await user.save();
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customer Routes - FILTERED BY USER
app.get('/api/customers', authMiddleware, async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = {
      user: req.user.id, // FILTER BY LOGGED-IN USER
      name: { $regex: search, $options: 'i' }
    };
    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      user: req.user.id // ENSURE USER OWNS THIS CUSTOMER
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', authMiddleware, async (req, res) => {
  try {
    const customerData = {
      ...req.body,
      user: req.user.id // ASSOCIATE WITH LOGGED-IN USER
    };
    const customer = new Customer(customerData);
    await customer.save();
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/customers/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Customer.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, // ENSURE USER OWNS THIS CUSTOMER
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Customer not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customers/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Customer.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id // ENSURE USER OWNS THIS CUSTOMER
    });
    if (!deleted) return res.status(404).json({ error: 'Customer not found' });
    
    // Also delete all orders for this customer
    await Order.deleteMany({ customer: req.params.id, user: req.user.id });
    
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Order Routes - FILTERED BY USER
app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const filter = { user: req.user.id }; // FILTER BY LOGGED-IN USER
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const orders = await Order.find(filter)
      .populate('customer')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id // ENSURE USER OWNS THIS ORDER
    }).populate('customer');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    // Verify the customer belongs to this user
    const customer = await Customer.findOne({
      _id: req.body.customer,
      user: req.user.id
    });
    if (!customer) {
      return res.status(400).json({ error: 'Invalid customer' });
    }
    
    const orderData = {
      ...req.body,
      user: req.user.id // ASSOCIATE WITH LOGGED-IN USER
    };
    const order = new Order(orderData);
    await order.save();
    
    // Populate customer before sending response
    await order.populate('customer');
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Order.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, // ENSURE USER OWNS THIS ORDER
      req.body,
      { new: true }
    ).populate('customer');
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/orders/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Order.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id // ENSURE USER OWNS THIS ORDER
    });
    if (!deleted) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard stats endpoint
app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const totalCustomers = await Customer.countDocuments({ user: userId });
    const totalOrders = await Order.countDocuments({ user: userId });
    const pendingOrders = await Order.countDocuments({ user: userId, status: { $in: ['received', 'in-progress'] } });
    const totalRevenue = await Order.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId), paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    res.json({
      totalCustomers,
      totalOrders,
      pendingOrders,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));