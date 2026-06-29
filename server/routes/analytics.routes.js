const express = require('express');
const router = express.Router();
const {
    getAnalyticsSummary, 
    getDailyAnalytics, 
    getCountryAnalytics,
    getDeviceAnalytics, 
    getReferrerAnalytics,
} = require('../controllers/analytics.controller');

router.get('/:code', getAnalyticsSummary);
router.get('/:code/daily', getDailyAnalytics);
router.get('/:code/countries', getCountryAnalytics);
router.get('/:code/devices', getDeviceAnalytics);
router.get('/:code/referrers', getReferrerAnalytics);

module.exports = router;