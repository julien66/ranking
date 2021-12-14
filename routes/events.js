var express = require('express');
var multer = require('multer');
var router = express.Router();
const {ProcessResults} = require('./../results/processResults');
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

/* GET event page. Add and Edit */
router.get(['/', '/edit/:id'], function(req, res, next) {
    let countries = getNameList();
    let errors = (req.session.errors) ? req.session.errors : false;
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
                    errors : errors,
                });
            });
});

// Helper function to format geoJson from latlon string. '{lat} , {lon}';
var formatGeo = function(latlon) {
    return {'type' : 'Point','coordinates' : [latlon.split(',')[1], latlon.split(',')[0]]};
};

// Post event page. Both create and edit event.
router.post(['/', '/:id'], multer().any(), function(req, res, next) {
    if (req.body.latlon) {
        req.body.latlon = formatGeo(req.body.latlon);
    }
    // Add flag. Get code from Name
    req.body.flag = getCode(req.body.country);
    var result = new ProcessResults(req ,res);

    if (parseInt(req.params.id)) {
        Event.update(req.body, {where : {id : parseInt(req.params.id)}})
            .then(event => {
                if (!result.empty && result.errors.length == 0) {
                    res.redirect('/events/' + req.params.id);
                } else {
                    next(result.notifyError());
                }
                res.redirect('/events');
            })
            .catch(function(err) {
        });
    }  else {
        // Create the comp first. We'll deal with results later.
        Event.create(req.body, {include: EventType})
            .then(event => res.redirect('/events'))
            .catch(function (err) {
            });
    }
});

router.get('/:id', function(req, res) {
   Event.findOne({raw: true, 'where' : {id : req.params.id}})
       .then(event => {
           res.render('eventPage', {title : 'Event Page', page : 'event', event : event})
       })
        .catch(function(err) {
    })
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