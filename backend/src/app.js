// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const modulesRoute = require('./routes/modules');
const categoriesRoute = require('./routes/categories');
const contentsRoute = require('./routes/contents');
const mediaRoute = require('./routes/media');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({limit: '6mb'}));
app.use(express.urlencoded({ extended: true }));

// routes 
app.use('/api/modules', modulesRoute);
app.use('/api/categories', categoriesRoute);
app.use('/api/contents', contentsRoute);
app.use('/api/media', mediaRoute);

// serve uploads as static
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
app.use(`/${UPLOAD_DIR}`, express.static(path.join(process.cwd(), UPLOAD_DIR)));

// error handling middleware
app.use(errorHandler);

module.exports = app;