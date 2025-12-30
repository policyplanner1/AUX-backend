const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env
dotenv.config();

const app = express();

/* -------------------- CORS CONFIG -------------------- */
// Allow Angular dev and any additional origins via .env
// Example .env: ALLOWED_ORIGINS=http://localhost:4200,https://your-prod-domain.com
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:4200')
  .split(',')
  .map(s => s.trim());

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser or same-origin requests (no Origin header)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,           // if you use cookies/auth headers from Angular
  optionsSuccessStatus: 204,   // for legacy browsers
};

app.use(cors(corsOptions));
// Handle preflight for all routes
app.options('*', cors(corsOptions));
/* ----------------------------------------------------- */

// Middleware to parse JSON requests
app.use(express.json());

// Import routes
const companyRoutes = require('./routes/companyRoutes');
const hdfcRoutes = require('./routes/hdfcRoutes');
const nicRoutes = require('./routes/nicRoutes');
const sbiRoutes = require('./routes/sbiRoutes');
const tataRoutes = require('./routes/tataRoutes');
const bajajRoutes = require('./routes/bajajRoutes');
const careRoutes = require('./routes/careRoutes');
const unisompoRoutes = require('./routes/unisompoRoutes');
const iciciRoutes = require('./routes/iciciRoutes');
const nivaRoutes = require('./routes/nivaRoutes');
const relianceRoutes = require('./routes/relianceRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const otpRoutes = require("./routes/otpRoutes");
const iffcoRoutes = require('./routes/iffcoRoutes');
const unitedRoutes = require('./routes/unitedRoutes');
const digitRoutes = require('./routes/digitRoutes');
const niaRoutes = require('./routes/niaRoutes');
const starRoutes = require('./routes/starRoutes');

// Mount routes.  Each company has its own route namespace.
app.use('/companies', companyRoutes);
app.use('/hdfc', hdfcRoutes);
app.use('/nic', nicRoutes);
app.use('/sbi', sbiRoutes);
app.use('/tata', tataRoutes);
app.use('/bajaj', bajajRoutes);
app.use('/care', careRoutes);
app.use('/unisompo', unisompoRoutes);
app.use('/icici', iciciRoutes);
app.use('/niva', nivaRoutes);
app.use('/reliance', relianceRoutes);
app.use('/iffco', iffcoRoutes);
app.use('/united', unitedRoutes);
app.use('/digit', digitRoutes);
app.use('/nia', niaRoutes);
app.use('/star', starRoutes);


app.use('/proposals', proposalRoutes);
app.use("/otp", otpRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send({ message: 'Health insurance API is running' });
});

// Error handling middleware for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
const port = process.env.PORT || 1202;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
