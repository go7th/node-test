var config = require('../config/config')
var mysql = require('mysql');
var pool = mysql.createPool(config.mysql);
var db    = {};
/**
 * 对query执行的结果自定义返回JSON结果
 */
db.responseDoReturn = function (res, result, resultJSON) {
    if (typeof result === 'undefined') {
        res.json({
            code: '201',
            msg: 'failed to do'
        });
    } else {
        res.json(result);
    }
};

/**
 * 封装query之sql带不占位符func
 */
db.query = function (sql, callback) {
    pool.getConnection(function(err, connection) {
        connection.query(sql, function(err, rows) {
            callback(err, rows);
            //释放链接
            connection.release();
        });
    });
}

/**
 * 封装query之sql带占位符func
 */
db.queryArgs = function (sql, args, callback) {
    pool.getConnection(function(err, connection) {
        connection.query(sql, args, function(err, rows) {
            callback(err, rows);
            //释放链接
            connection.release();
        });
    });
}

//exports
module.exports = db