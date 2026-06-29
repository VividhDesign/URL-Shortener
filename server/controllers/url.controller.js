const Url = require('../models/Url');
const { isValidUrl } = require('../validators/url.validator');
const { shortenUrlService, getUrlFromCacheOrDB} = require('../services/url.service');
const { recordAnalytics } = require('../services/analytics.service');

// POST /api/shorten
// Body: { longUrl, expiresInDays (optional) }

const shortenUrl = async (req, res) => {
    const { longUrl, expiresInDays } = req.body;

    // Step 1: Validate input (validator handles this)
    if (!longUrl) {
        return res.status(400).json({ error: 'longUrl is required' });
    }
    if (!isValidUrl(longUrl)) {
        return res.status(400).json({ error: 'Invalid URL format. Include http:// or https://' });
    }

    try {
        // Step 2-6: All DB logic delegated to service
        const result = await shortenUrlService(longUrl, expiresInDays);

        if (result.alreadyExists) {
            return res.status(200).json({
                message: 'URL already shortened',
                shortUrl: result.shortUrl,
                shortCode: result.shortCode,
                clicks: result.clicks,
            });
        }

        // Step 7: Return result
        return res.status(201).json({
            message: 'URL shortened successfully!',
            shortUrl: result.shortUrl,
            shortCode: result.shortCode,
            longUrl: result.longUrl,
            expiresAt: result.expiresAt,
        });

    } catch (error) {
        console.error('Error in shortenUrl:', error);
        return res.status(500).json({ error: 'Server Error. Please try again' });
    }
};

// GET /:code — redirects user to original long URL

const redirectUrl = async (req, res) => {
    const { code } = req.params;

    try {
        // Step 1: Find the URL in database
        const urlDoc = await getUrlFromCacheOrDB(code);

        // Step 2: Handle not found
        if (!urlDoc) {
            return res.status(404).json({ error: 'Short URL not found or has been disabled' });
        }

        // Step 3: Check if link is expired
        if (urlDoc.expiresAt && new Date() > urlDoc.expiresAt) {
            return res.status(410).json({ error: 'This link has expired' });
        }

        // Step 4: Increment click counter (atomic MongoDB operation)
        await Url.findByIdAndUpdate(urlDoc._id, { $inc: { clicks: 1 } });

        // Step 5: Record analytics (fire and forget — don't slow down redirect)
        recordAnalytics(code, req).catch(err =>
            console.error('Analytics recording failed:', err)
        );

        // Step 6: Redirect (302 = temporary, analytics-friendly)
        return res.redirect(302, urlDoc.longUrl);

    } catch (error) {
        console.error('Error in redirect:', error);
        return res.status(500).json({ error: 'Server Error' });
    }
};

// GET /api/info/:code — get info about short URL without redirecting

const getUrlInfo = async (req, res) => {
    const { code } = req.params;

    try {
        const urlDoc = await Url.findOne({ shortCode: code });

        if (!urlDoc) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        return res.status(200).json({
            shortCode: urlDoc.shortCode,
            shortUrl: urlDoc.shortUrl,
            longUrl: urlDoc.longUrl,
            clicks: urlDoc.clicks,
            createdAt: urlDoc.createdAt,
            expiresAt: urlDoc.expiresAt,
            isActive: urlDoc.isActive,
        });

    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { shortenUrl, redirectUrl, getUrlInfo };