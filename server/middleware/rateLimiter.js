const rateLimit = require('express-rate-limit');

// general api rate limiter , applied to all /api/* routes
//limit = 100 requests per 15 minutes per IP

const apiLimiter = rateLimit({
    windowMs : 15 * 60 * 1000, // 15 mins in ms
    max : 100, // max 100 reqs per windowMs per IP
    
    // custom error msg when limit reached
    message: {
        error : "Too many requests for this IP . Please try again in 15 minutes",
        retryAfter : '15 minutes',
    },

    //standardHeaders: true  adds RateLimit-* headers to responses
    //so the client knows how many reqs they have left
    standardHeaders:true,

    //legacyHeaders:false disables the old x-RateLimit-*headers
    legacyHeaders:false
});

// strict limiter for shorten endpoint
//this endpoint is expensive(DB write) - be more strict
// Limit : 10 requests per minute per IP.

const shortenLimiter = rateLimit({
    windowMs: 60 * 1000, //1min
    max:10, //max 10 shortening reqs per mins

    message: {
        error:'You are creating URLs too fast. Max 10 requests per minute.', 
        tip:'Slow down! This limit exists to prevent spam',
    },
    standardHeaders: true, 
    legacyHeaders:false,
});

module.exports = {apiLimiter, shortenLimiter};