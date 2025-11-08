// models.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ===== USER MODEL =====
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

// ===== CUSTOMER MODEL (WITH USER REFERENCE) =====
const measurementSchema = new mongoose.Schema({
  bust: Number,
  waist: Number,
  hip: Number,
  shoulder: Number,
  sleeve: Number,
  inseam: Number,
  neck: Number,
  notes: String
}, { _id: false });

const customerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ADDED USER REFERENCE
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  address: String,
  notes: String,
  measurements: measurementSchema
}, { timestamps: true });

// Index for faster queries
customerSchema.index({ user: 1, name: 1 });

const Customer = mongoose.model('Customer', customerSchema);

// ===== ORDER MODEL (WITH USER REFERENCE) =====
const orderItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  fabric: String,
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ADDED USER REFERENCE
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['received', 'in-progress', 'ready', 'delivered'], default: 'received' },
  paymentStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
  dueDate: { type: Date, required: true },
  fittingDate: Date,
  notes: String
}, { timestamps: true });

// Index for faster queries
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ user: 1, customer: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = { User, Customer, Order };