const Redis = require('ioredis');
let client;
const connectRedis = () => {
    client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        //retry strategy : how long to wait between reconnect attempts
        retryStrategy(times) {
            if (times > 10) return null; //stop retrying after 10 attempts;
            return Math.min(times * 200, 2000);//wait 200ms, 400ms,,,,
        },
        lazyConnect : true,
    }
);

client.on('connect', () => {
    console.log('Redis Connected');
});

client.on('error', (err) => {
    //log the error but dont crash the server, app should still work without redis
    console.error('Redis Error : ' , err.message);
});
return client;
};

//Singleton pattern: only one Redis connection across the whole app
const getRedisClient = () => {
    if (!client) {
        connectRedis();
    }
    return client;
};

module.exports = {connectRedis, getRedisClient};