var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '链接列表' });
});
router.post('/menu/detail', function(req, res, next) {
  console.log(req.body);
  console.log(req.query);
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
