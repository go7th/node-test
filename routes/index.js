const express = require('express');
const router = express.Router();
const _ = require('lodash');
const querystring = require('querystring');
const md5 = require('md5-node');
const request = require('request');

function v_sign(qs, body, sign) {
  delete qs.sign;
  const init_sign = md5(querystring.stringify(qs)+JSON.stringify(body));
  return init_sign === sign;
}

function wget(){
  request('https://www.baidu.com', function (error, response, body) {
    console.log(body)//打印百度首页html内容
  })
};


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '链接列表' });
});
router.post('/menu/detail', function(req, res, next) {
  const verify_res = v_sign(req.query,req.body, _.get(req,'query.sign'));
  if (!verify_res) {
    return res.send({
      "code": 401,
      "data": null,
      "message": "Unauthorizaiton"
    });
  }
  wget()
  const data  = {
    "category": {
        "name": "Danielle_McLaughlin",
        "products": [
            {
                "id": "2",
                "name": "Camilla62",
                "code": "33ab4367-20d2-4997-a5e3-3a5a6ca2e98a",
                "qty": 91891,
                "image": "http://billie.name"
            }
        ]
    }
}
  res.send({
    code: 100,
    data,
    message: "success"
});

});

module.exports = router;
