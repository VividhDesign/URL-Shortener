const express = require('express');
const router = express.Router();
const {shortenUrl, getUrlInfo } = require('../controllers/url.controller');
const {shortenLimiter} = require('../middleware/rateLimiter');

// POST /api/shorten -> creates short url
// shortenLimiter applies a STRICT limit (10 req/min) on top of the global apiLimiter
router.post('/shorten', shortenLimiter, shortenUrl);

// GET /api/Info/:code -> Get URL info (no redirect)

router.get('/info/:code', getUrlInfo);

module.exports = router;

