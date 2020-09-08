var express = require('express');
var router = express.Router();
var mysqlc = require('../dal/mysqlc')
/* GET users listing. */

var mysqlpro = function(sql){
  return new Promise(function (resolve,reject){
    mysqlc.query(sql, function (err,result) {
      if(err){
          console.log('[SELECT ERROR]:',err.message);
      }
      // console.log(result);  //数据库查询结果返回到result中
      return resolve(result)
    });
  })
}
router.post('/', function(req, res, next) {
  async function main(){
    try {
      let sql = " select * from links limit 100;";
      let links = await mysqlpro(sql);
      // console.log(links);
      res.send({success:true,data:links});

    } catch (error) {
      console.log(error)
    }
  }
  main();
});

module.exports = router;
