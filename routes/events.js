var express = require('express');
var multer = require('multer');
var router = express.Router();
const {ProcessResults} = require('./../results/processResults');
const { getNameList, getCode } = require('country-list');

const { Event, EventType, FileResult } = require('./../sequelize');

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
    let errors = false;
    if (req.session.errors) {
        errors = req.session.errors;
        delete req.session.errors;
    }
    let promises = [
        EventType.findAll({raw : true, attributes: ['id', 'name']}),
        Event.findAll({raw : true, attributes: ['id', 'country', 'flag', 'name', 'start', 'end', 'website'], include: [{model : EventType, attributes: ['name']}]}),
    ];
    if (parseInt(req.params.id)) {
        promises.push(Event.findOne({'where' : {id : parseInt(req.params.id)}, include : {model : FileResult}, 'raw' : true}));
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
    return {
        'type' : 'Point',
        'coordinates' : [latlon.split(',')[1], latlon.split(',')[0]],
        'crs': {
            'type': "name",
            'properties': {
                'name': "urn:ogc:def:crs:EPSG::4326"
            }
        }
    };
};

// Post event page. Both create and edit event.
// We always want to priorize event form OVER handling results file.
// Other form field from event must not fail because file format or other is not good.
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
                    FileResult.destroy({where : {eventId : req.params.id}})
                        .then(del => {
                            FileResult.create(result.toDb(), {include : Event})
                                .then(file => {
                                    res.redirect('/events/page/' + req.params.id + '/check');
                                })
                                .catch(function(err){
                                    console.log(err);
                                    console.log("Creating new file result failed" .red);
                                })
                        })
                        .catch(function(err) {
                            console.log("Deleting file result failed" . red);
                            res.redirect('/events/edit/' + req.params.id);
                        });
                    //req.session.results = result.getResults();
                } else {
                    next(result.notifyError());
                }
            })
            .catch(function(err) {
        });
    }  else {
        // Create the comp first. We'll deal with results later.
        Event.create(req.body, {include: EventType})
            .then(event => {
                result.setEventid(event.id);
                if (!result.empty && result.errors.length == 0) {
                    FileResult.create(result.toDb(), {include : Event})
                        .then(file => {
                            res.redirect('/events/page/' + req.params.id + '/check');
                        })
                        .catch(function(err){
                            console.log("Creating new file result failed");
                        });
                } else {
                    next(result.notifyError());
                }
            })
            .catch(function (err) {
                console.log("Event creation failed");
            });
    }
});

router.get(['/page/:id', '/page/:id/check'], function(req, res) {
    Event.findOne({raw: true, 'where' : {id : req.params.id}, include : {model : FileResult}})
       .then(event => {
           let uploadResults = false;
           uploadResults = new ProcessResults(req, {
               originalname : event['fileResult.originalname'],
               mimetype : event['fileResult.mimetype'],
               size : event['fileResult.size'],
               buffer : event['fileResult.buffer'],
               eventId : event['fileResult.eventId']
           });
           res.render('eventPage', {title : 'Event Page', page : 'event', event : event, uploadResults : uploadResults.results})
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