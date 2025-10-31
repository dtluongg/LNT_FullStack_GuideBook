const express = require('express');
const cors = require('cors');
const path = require('path');

const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const moduleRoutes = require('./routes/modules');
const categoryRoutes = require('./routes/categories');
const contentRoutes = require('./routes/contents');
const contentImageRoutes = require('./routes/contentImages')
const convertRoutes = require('./routes/convert');
const authRoutesDemo = require('./routes/authRoutesDemo');
const authUserRoutes = require('./routes/authUser');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
}));

// Giới hạn rate cho các endpoint auth
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });
app.use('/api/auth', authLimiter);

// app.use(cors());
// app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); // phục vụ truy cập file tĩnh từ thư mục uploads

// Debug log khi app khởi động
console.log("🚀 Mounting routes...");

app.use('/api/modules', (req, res, next) => {
  console.log("➡️ Hit /api/modules");
  next();
}, moduleRoutes);

app.use('/api/categories', (req, res, next) => {
  console.log("➡️ Hit /api/categories");
  next();
}, categoryRoutes);

app.use('/api/contents', (req, res, next) => {
  console.log("➡️ Hit /api/contents");
  next();
}, contentRoutes);

app.use('/api/images', (req, res, next) => {
  console.log("➡️ Hit /api/images");
  next();
}, contentImageRoutes);

app.use('/api/convert', (req, res, next) => {
  console.log("➡️ Hit /api/convert");
  next();
}, convertRoutes);

app.use('/api/auth', (req, res, next) => {
  console.log("➡️ Hit /api/auth");
  next();
}, authRoutesDemo);

module.exports = app;