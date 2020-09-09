var config = require('../config/config')
var redis = require('pool-redis');
var pool = redis(config.redis);
var db = {};
db.get = async function (key){
    return new Promise((resolve, reject) => {
        pool.getClient(function(client, done) {
            client.get(key, function(err, value) {
                resolve(value);
                done();
            });
        })

    });
}
db.setex = async function (key, time, value){
    return new Promise((resolve, reject) => {
        pool.getClient(function(client, done) {
            const timeout = time || 60;
            client.setex(key, timeout, value, function(err, value) {
                resolve(value);
                done();
            });
        });
    })

}
//exports
module.exports = db