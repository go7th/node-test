var config = require('../config/config')
var redis = require('pool-redis');
var pool = redis(config.redis);
var db = {};
db.get = function (){
    pool.getClient(function(client, done) {
        client.get('key', function(err, value) {
            console.log('value from redis is:', value);
            done();
        });
    });
}
//exports
module.exports = db