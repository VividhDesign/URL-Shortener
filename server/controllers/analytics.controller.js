const {
    getAnalyticsSummaryService,
    getDailyAnalyticsService, 
    getCountryAnalyticsService, 
    getDeviceAnalyticsService,
    getReferrerAnalyticsService,
} = require('../services/analytics.service');

const getAnalyticsSummary = async (req, res) => {
    try {
        const data = await getAnalyticsSummaryService(req.params.code);
        if (!data) return res.status(404).json({error: 'Short URL not found'});
        return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ error: 'Server error'});
        }
};

const getDailyAnalytics = async (req, res) => {
    try {
        const data = await getDailyAnalyticsService(req.params.code);
        return res.status(200).json({ shortCode: req.params.code, data});
    } catch (error) {
        return res.status(500).json({error: 'Server error'});
    }
};

const getCountryAnalytics = async (req, res) => {
    try {
        const data = await getCountryAnalyticsService(req.params.code);
        return res.status(200).json({ shortCode: req.params.code, data});
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
};

const getDeviceAnalytics = async (req, res) => {
    try {
        const data = await getDeviceAnalyticsService(req.params.code);
        return res.status(200).json({ shortCode: req.params.code, data});
    } catch (error) {
        return res.status(500).json({ error: 'Server error'});
    }
};

const getReferrerAnalytics = async (req, res) => {
    try {
        const data = await getReferrerAnalyticsService(req.params.code);
        return res.status(200).json({ shortCode: req.params.code, data});
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getAnalyticsSummary,
    getDailyAnalytics,
    getCountryAnalytics,
    getDeviceAnalytics,
    getReferrerAnalytics,
};

