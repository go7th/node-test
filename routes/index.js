const express = require('express');
const router = express.Router();
const _ = require('lodash');
const querystring = require('querystring');
const md5 = require('md5-node');
const request = require('requestretry');
const bunyan = require('bunyan');
const path = require('path');
const redisc = require('../dal/redisc')


const logger = bunyan.createLogger({
  name: 'node-test',
  streams: [
    {
      level: 'debug',
      path: path.resolve(__dirname, '../access.log')  // log ERROR and above to a file
    }
  ]
});


function v_sign(qs, body, sign) {
  if (sign === 'skip' ) {
    return true;
  }
  delete qs.sign;
  const init_sign = md5(querystring.stringify(qs)+body);
  return init_sign === sign;
}

async function wget(url, id){
  logger.info({url: url+id},`[GET] --> ${url+id}`)
  const response = await request({
    url: url + id,
    json: true,
    maxAttempts: 5,   // (default) try 5 times
    retryDelay: 5000,  // (default) wait for 5s before trying again
    time: true,
  })

  const response_body = response.body;
  if (response_body && response_body.code === 100) {
      logger.info({
        response: response_body,
        timing: {
            elapsedTime: response.elapsedTime,
            responseStartTime: response.responseStartTime,
            timingStart: response.timingStart,
            timings: response.timings,
            timingPhases: response.timingPhases,
        },
        remoteAddress: response.connection ? response.connection.remoteAddress : '',
      },
      `[GET] <-- ${url+id}`);
  } else {
      logger.error({
        error_code: response_body ? response_body.code : 'unknown',
        response: response_body,
        timing: {
            elapsedTime: response.elapsedTime,
            responseStartTime: response.responseStartTime,
            timingStart: response.timingStart,
            timings: response.timings,
            timingPhases: response.timingPhases,
        },
        remoteAddress: response.connection ? response.connection.remoteAddress : '',
      }, `[GET] <-- ${url+id}`);
  }
  return response_body;
};

async function wget_redis(url, id){
  const cache_data = await redisc.get('product_'+id);
  if (cache_data) {
    return JSON.parse(cache_data);
  } else {
    const response = await wget(url, id);
    await redisc.setex('product_'+id, 60, JSON.stringify(response));
    return response;
  }
}

function data_merge(menu_data, product_data){
  const products = [];
  _.each(_.get(menu_data, 'data.products'), (product)=>{
    const meau_p_id = String(_.get(product, 'id'));
    let new_product = {
      id: meau_p_id,
      name: _.get(product, 'name'),
      code: _.get(product, 'code'),
      qty: _.get(product, 'qty'),
      image: "http://default_image"
    };
    _.each(product_data, (p_data)=>{
      const p_data_id = String(_.get(p_data, 'data.id'));
      const p_data_image_url = _.get(p_data, 'data.image');
      if (meau_p_id === p_data_id) {
        new_product = {
          id: p_data_id,
          name: _.get(product, 'name'),
          code: _.get(product, 'code'),
          qty: _.get(product, 'qty'),
          image: p_data_image_url
        };
      }
    })
    products.push(new_product);
  })
  return products;
}

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.render('index', { title: '链接列表' });
});

router.post('/menu/detail', async function(req, res, next) {
  const verify_res = v_sign(req.query, await req.rawBody, _.get(req,'query.sign'));
  if (!verify_res) {
    return res.send({
      code: 401,
      data: null,
      message: "Unauthorizaiton"
    });
  }
  if (
    Number(_.get(req, 'body.store_id')) < 1 || 
    Number(_.get(req, 'body.store_id')) > 40
    ) {
      return res.send({
        code: 404,
        data: null,
        message: "not find"
      });
  }
  const store_id = _.get(req, 'body.store_id');
  // const menu_url = 'https://5f560fae32f56200168bcde2.mockapi.io/api/v1/hello/menu/';
  const menu_url = 'http://192.168.210.46:3000/api/v1/hello/menu/';
  const menu_data = await wget(menu_url, String(store_id));

  const product_urls = [];
  _.each(_.get(menu_data, 'data.products'), (product)=>{
    if (_.get(product, 'id')) {
      // const url = 'https://5f560fae32f56200168bcde2.mockapi.io/api/v1/hello/product_image/';
      const url = 'http://192.168.210.46:3000/api/v1/hello/product_image/';
      product_urls.push(wget_redis(url, String(_.get(product, 'id')))); 
    }
  })
  const product_data = await Promise.all(product_urls);

  const products = data_merge(menu_data, product_data);
  const data  = {
    category: {
      store_id: String(store_id),
      name: _.get(menu_data, 'data.name'),
      products: products
    }
}
  res.send({
    code: 100,
    data,
    message: "success"
  });
});

module.exports = router;
