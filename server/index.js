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
        // allow requests with no origin (Postman, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express.json()); // parse JSON bodies

connectDB();
connectRedis();

//applly general rateLimiter to all /api routes
app.use('/api', apiLimiter);

app.use('/api', urlRoutes);

app.use('/api/analytics', analyticsRoutes);
// /:code catches any short code 
app.get('/:code', redirectUrl);

app.get('/', (req, res) => {
    res.json({ message: "URL Shortener API is running" });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});