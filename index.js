require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const { swaggerUi, specs } = require('./config/swagger');
const pool = require('./config/db');

// Test DB connection on startup
pool
  .getConnection()
  .then((conn) => {
    console.log('MySQL database connection successful!');
    conn.release();
  })
  .catch((err) => {
    console.error('MySQL database connection failed:', err.message);
  });

app.use(cors(['*'])); // Allow all origins for CORS
app.use(express.json({ limit: '50mb' })); // Increase payload size limit
app.use('/api', routes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
