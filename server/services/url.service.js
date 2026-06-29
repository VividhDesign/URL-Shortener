const Url = require('../models/Url');
const { generateShortCode } = require('../utils/shortCode');
const { getRedisClient } = require('../config/redis');
const CACHE_TTL = 60 * 60 * 24; // 24 hrs in seconds

// All DB logic for shortening a URL lives here
// Controller calls this and just sends the response

const shortenUrlService = async (longUrl, expiresInDays) => {

    // Step 2: Check if this long URL was already shortened (no duplicates)
    const existing = await Url.findOne({ longUrl, isActive: true });
    if (existing) {
        return {
            alreadyExists: true,
            shortUrl: `${process.env.BASE_URL}/${existing.shortCode}`,
            shortCode: existing.shortCode,
            clicks: existing.clicks,
        };
    }

    // Step 3: Generate a unique short code (handle collision)
    let shortCode;
    let isUnique = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    while (!isUnique && attempts < MAX_ATTEMPTS) {
        shortCode = generateShortCode();
        const codeExists = await Url.findOne({ shortCode });
        if (!codeExists) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        throw new Error('Could not generate a unique code. Try again.');
    }

    // Step 4: Calculate expiry date if provided
    let expiresAt = null;
    if (expiresInDays && expiresInDays > 0) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));
    }

    // Step 5: Build the full short URL
    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;

    // Step 6: Save to MongoDB
    const urlDoc = new Url({ longUrl, shortCode, shortUrl, expiresAt });
    await urlDoc.save();

    return { alreadyExists: false, shortUrl, shortCode, longUrl, expiresAt };
};

const getUrlFromCacheOrDB = async (shortCode) => {
    const redis = getRedisClient();
    const cacheKey = `url:${shortCode}`;
    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log(`Cache HIT for ${shortCode}`);
            return JSON.parse(cached);
        }
    } catch (redisErr) {
        console.error('Redis get Failed, falling back to DB', redisErr.message);
    }

    console.log(`Cache miss for ${shortCode} - querying MongoDB`);
    const urlDoc = await Url.findOne({shortCode, isActive: true});

    if (urlDoc){
        try {
            await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(urlDoc));
            console.log(`Cached ${shortCode} in Redis`);
        } catch (redisErr) {
            console.error('Redis set failed:', redisErr.message);
        }
    }
    return urlDoc;
};

const invalidateCache = async (shortCode) => {
    try {
        const redis = getRedisClient();
        await redis.del(`url:${shortCode}`);
        console.log(`Cache invalidated for ${shortCode}`);
    } catch (err) {
        console.error("Cache invalidatioin failed:", err.message);
    }
}
module.exports = { shortenUrlService, getUrlFromCacheOrDB, invalidateCache };
