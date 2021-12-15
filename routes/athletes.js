var express = require('express');
var router = express.Router();
const { Athlete } = require('./../sequelize');

router.get('/:code/exist', function(req, res, next) {
    Athlete.findOne({attributes : ['id'], where : {'code' : req.params.code}, raw : true})
        .then(athlete => {
            res.json(athlete);
        })
});

module.exports = router;