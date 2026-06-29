const Analytics = require('../models/Analytics');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');
const Url = require('../models/Url');

const recordAnalytics = async (shortCode, req) => {
    // get ip address
    // in production, 'x-forwarded for ' header has real IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket.remoteAddress || 'unknown';

    // look up geo location for IP

    const geo = geoip.lookup(ip);
    const country = geo ? geo.country : 'Unknown';
    const city = geo ? geo.city : 'Unknown';

    //Parse User-Agent to get device info 
    const ua = req.headers['user-agent'] || '';
    const parser = new UAParser(ua);
    const result = parser.getResult();

    let device = 'desktop';
    if (result.device.type === 'mobile') device = 'mobile';
    else if (result.device.type === 'tablet') device = 'tablet';
    // desktop browsers don't set device.type — default 'desktop' is already correct

    const browser = result.browser.name || 'unknown';
    const os = result.os.name || 'unknown';
    const referrer = req.headers.referer || req.headers.referrer || 'direct';

    // save analytics record
    const analyticsDoc = new Analytics({
        shortCode, 
        ipAddress: ip,
        country, 
        city,
        device, 
        browser,
        os, referrer,
    });
    await analyticsDoc.save();
};

const getAnalyticsSummaryService = async (code) => {
    const urlDoc = await Url.findOne({
        shortCode : code
    });
    if (!urlDoc) return null;

    const totalClicks = await Analytics.countDocuments({
        shortCode : code
    });

    const firstClick = await Analytics.findOne({shortCode : code}).sort({createdAt: 1});
    
    const lastClick = await Analytics.findOne({shortCode : code}).sort({createdAt: -1});

    return {
        shortCode: code,
        shortUrl: urlDoc.shortUrl,
        longUrl: urlDoc.longUrl,
        totalClicks, 
        createdAt: urlDoc.createdAt,
        expiresAt: urlDoc.expiresAt,
        firstClickAt: firstClick?.createdAt || null,
        lastClickAt: lastClick?.createdAt || null,
    };
};

const getDailyAnalyticsService = async (code) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await Analytics.aggregate([
        { $match: {
            shortCode: code, 
            createdAt:{
                $gte : thirtyDaysAgo
                   }
                }
            },
            {
                $group :
                 {_id: {$dateToString: {
                    format : '%Y-%m-%d',
                    date : '$createdAt'
                   }},
                   count : {$sum : 1}
                }
            },
            {
                $sort : {_id : 1}
            }, 
            {
                $project : 
                { _id : 0, date : '$_id', count : 1}
          }
    ]);
};

const getCountryAnalyticsService = async (code) => {
    return await Analytics.aggregate([
        { $match: { shortCode : code }},
        { $group : { _id: '$country', count: { $sum : 1}}},
        { $sort : {count: -1}},
        { $limit : 10}, 
        { $project : { _id : 0, country: '$_id', count: 1 }}
    ]);
};

const getDeviceAnalyticsService = async (code) => {
    return await Analytics.aggregate([
        { $match : {shortCode : code}},
        { $group : {_id : '$device', count: {$sum: 1}}},
        { $sort : {count : -1}}, 
        { $project : { _id: 0, device: '$_id', count: 1}}
    ]);
};

const getReferrerAnalyticsService = async (code) => {
    return await Analytics.aggregate([
        { $match : { shortCode : code}}, 
        { $group: {_id : '$referrer', count : { $sum: 1}}},
        { $sort: {count : -1}}, 
        { $limit : 10}, 
        { $project : {_id : 0, referrer: '$_id', count: 1}}
    ]
    );
};

module.exports = { 
    recordAnalytics,
    getAnalyticsSummaryService, 
    getDailyAnalyticsService, 
    getCountryAnalyticsService, 
    getDeviceAnalyticsService, 
    getReferrerAnalyticsService,
 };
