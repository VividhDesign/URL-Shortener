const mongoose = require('mongoose');

//schema defines the shape of your document in MONGO DB
const urlSchema  = new mongoose.Schema(
    {
        //original long url the user submits
        longUrl: {
            type : String, 
            required : [true, 'Long URL is required'], 
            trim : true // remove leading/ trailing spaces
        },
        shortCode: {
            type : String,
            required : true,
            unique: true,
            index: true
    },
    shortUrl: {
        type : String, 
        required: true,
    },
    clicks :{
        type : Number, 
        default : 0,
    },
    expiresAt : {
        type : Date,
        default : null,
    },
    createdBy: {
        type: String, 
        default : 'anonymous',
    },
    // is this link still active or has the user disabled it
    isActive: {
        type: Boolean, 
        default : true,
    },
},
{
    timestamps: true, //this automatically adds createdAt and updatedAt fields
}
);

// MongoDB will automatically delete documents where expires at is in the past.we dont need a
//cron job for this, expireAfterSeconds:0 means "delete exactly at expiresAt time"

urlSchema.index({expiresAt: 1}, {
    expireAfterSeconds: 0
});

const Url = mongoose.model('Url', urlSchema);
module.exports = Url;