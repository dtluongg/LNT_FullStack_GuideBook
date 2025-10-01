const express = require('express');
const cors = require('cors');
const path = require('path');

const moduleRoutes = require('./routes/modules');
const categoryRoutes = require('./routes/categories');
const contentRoutes = require('./routes/contents');
const contentImageRoutes = require('./routes/contentImages')

const app = express();

app.use(cors());
app.use(express.json());
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

module.exports = app;