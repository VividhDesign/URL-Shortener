require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const urlRoutes = require('./routes/url.routes');
const { redirectUrl } = require('./controllers/url.controller');
const analyticsRoutes = require('./routes/analytics.routes');
const app = express();
const {apiLimiter} = require('./middleware/rateLimiter');

// Trust Render/proxy X-Forwarded-For header for correct IP detection
app.set('trust proxy', 1);

//Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://url-shortener-peach-five.vercel.app',
    'https://url-shortener-git-main-vividhdesigns-projects.vercel.app',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express.json());

connectDB();
connectRedis();

app.use('/api', apiLimiter);
app.use('/api', urlRoutes);
app.use('/api/analytics', analyticsRoutes);
app.get('/:code', redirectUrl);

app.get('/', (req, res) => {
    res.json({ message: "URL Shortener API is running" });
});

const PORT = process.env.PORT || 5001;

// Skip listen only in Vercel serverless — Render still needs app.listen
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel Serverless Functions
module.exports = app;