var express = require('express');
var multer = require('multer');
var xlsx = require('node-xlsx');
var router = express.Router();
const { getNameList, getCode } = require('country-list');

const { Event, EventType } = require('./../sequelize');

/* GET POST add type event */
router.get('/type', function(req, res, next) {
    EventType.findAll({raw: true, attributes: ['id', 'name', 'description', 'color'] })
        .then(eventTypes => {
            res.render('event_type', {
                title: 'Add a type of event', eventTypes: eventTypes, page : 'eventTypes'
            })
        });
});

/* Destroy event type from get route */
router.get('/delete_type/:eventTypeId', function(req, res) {
    if (req.params.eventTypeId) {
        EventType.destroy({
            where : {id : req.params.eventTypeId}
        }).then( whatever => res.redirect('/events/type'));
    } else {
        res.redirect('/events/type');
    }
});

router.post('/type', function(req, res, next) {
    EventType.create(req.body)
        .then(user => res.redirect('/events/type'));
});

/* GET POST add event page. */
router.get(['/', '/edit/:id'], function(req, res, next) {
    let countries = getNameList();
    let promises = [
        EventType.findAll({raw : true, attributes: ['id', 'name']}),
        Event.findAll({raw : true, attributes: ['id', 'country', 'flag', 'name', 'start', 'end', 'website'], include: [{model : EventType, attributes: ['name']}]}),
    ];
    if (parseInt(req.params.id)) {
        promises.push(Event.findOne({'where' : {id : parseInt(req.params.id)}}));
    }
    Promise.all(promises).then(results => {
                let edit = (results.length > 2) ? results[2] : null;
                res.render('event', {
                    page : 'events',
                    title : 'Add an event',
                    eventTypes : results[0],
                    events : results[1],
                    countries : countries,
                    thisYear : new Date().getFullYear(),
                    edit : edit,
                });
            });
});

// Helper function to format geoJson from latlon string. '{lat} , {lon}';
var formatGeo = function(latlon) {
    return {'type' : 'Point','coordinates' : [latlon.split(',')[1], latlon.split(',')[0]]};
};

router.post(['/', '/:id'], multer().any(), function(req, res, next) {
    //console.log(req.files);

    // @todo. Check data and insert event first. You'll get Event ID.
    // You can just treat the comp then.
    if (req.body.latlon) {
        req.body.latlon = formatGeo(req.body.latlon);
    }
    // Add flag. Get code from Name
    req.body.flag = getCode(req.body.country);

    // Update or create
    if (parseInt(req.params.id)) {
        Event.update(req.body, {where : {id : parseInt(req.params.id)}})
            .then(event => res.redirect('/events'))
            .catch(function(err) {
            console.log(err);
        });
    }  else {
        Event.create(req.body, {include: EventType})
            .then(event => res.redirect('/events'))
            .catch(function (err) {
                console.log(err);
            });
    }

    /*if (req.files.length > 0) {
        var doc = xlsx.parse(req.files[0].buffer);
        if (doc.length > 0 && doc[0].data.length > 0) {
            var header = doc[0].data[0];
            console.log(header)
            var data = doc[0].data.slice(1);
            for (var i = 0;  i < data.length; i++) {
                console.log(data[i]);
            }
        }
    }*/
});

router.get('/map', function(req, res) {
    res.render('events_map', {title : 'Events Map', page : 'map'});
});

router.get('/calendar', function(req, res) {
    Event.findAll({raw: true, attributes: ['country', 'flag', 'name', 'start', 'end'], include: [{model : EventType, attributes: ['color']}] })
        .then(events => {
            res.render('events_calendar', {title : 'Events Calendar', page : 'calendar', events : events})
        });
});

router.get('/json', function(req, res) {
    Event.findAll({raw : true, attributes: ['id', 'country', 'flag', 'name', 'start', 'end', 'website', 'latlon'], include: [{model : EventType, attributes: ['name', 'color']}]})
        .then(events => res.json(events));
});

/* Destroy event from get route */
router.get('/delete/:eventId', function(req, res) {
    if (req.params.eventId) {
        Event.destroy({
            where : {id : req.params.eventId}
        }).then( whatever => {res.redirect('/events')});
    } else {
        res.redirect('/events');
    }
});

module.exports = router;