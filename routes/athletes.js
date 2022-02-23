var express = require('express');
var router = express.Router();
const { Athlete } = require('./../sequelize');

router.get('/exist/:concat', function(req, res, next) {
    Athlete.findOne({attributes : ['id'], where : {'concat' : req.params.concat}, raw : true})
        .then(athlete => {
            res.json(athlete);
        })
        .catch(function(err) {
            console.log(err);
        })
});

module.exports = router;