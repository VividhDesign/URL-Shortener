const mongoose = require('mongoose');
const analyticsSchema = new mongoose.Schema(
    {
        shortCode : {
            type : String, 
            required: true,
            index: true, // we ll query by shortCode often needs index
        },
        // ip address of person who clicked , used to determine geographic location
        ipAddress: {
            type : String, 
            default: 'unknown',
        },
        // country derived from IP using geoip-lite
        country: {
            type: String, 
            default: 'Unknown',
        },
        //city if available
        city: {
            type : String, 
            default : 'Unknow',
        },
        device : {
            type: String, 
            enum : ['mobile', 'tablet', 'desktop', 'unknown'],
            default : 'unknown',
        },
        browser : {
            type : String, 
            default : 'unknown',
        }, 
        os : {
            type : String, 
            default : 'unknown',
        },
        referrer : {
            type: String, 
            default : 'direct',
        },
    }, 
    {
        timestamps: true, // auto-add createdat, updatedat
    }
);

const Analytics = mongoose.model('Analytics', analyticsSchema);
module.exports = Analytics;