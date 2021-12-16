var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Hike and Fly Ranking', page: "home" });
});

router.get('/about', function(req, res, next) {
  res.render('about', { title: 'About', page: "about" });
});

router.get('/results_upload', function(req, res){
  res.render('results_upload', {title: 'Results upload', page: "result upload"});
})

module.exports = router;
