var express = require('express');
var multer = require('multer');
var router = express.Router();
const {DisplayResults} = require('./../helpers/displayResults');
const {ProcessResults} = require('./../helpers/processResults');
const {ProcessForm} = require('./../helpers/processForm');
const {ProcessElo} = require('./../helpers/processElo');
const {getNameList, getCode, getName, getCodeList} = require('country-list');

const {Athlete, Elo, Event, EventType, FileResult, formError, Op, Rank, Result} = require('./../sequelize');

/* GET POST add type event */
router.get('/type', function (req, res, next) {
    EventType.findAll({raw: true, attributes: ['id', 'name', 'description', 'color']})
        .then(eventTypes => {
            res.render('event_type', {
                title: 'Add a type of event', eventTypes: eventTypes, page: 'eventTypes'
            })
        });
});

/* Destroy event type from get route */
router.get('/delete_type/:eventTypeId', function (req, res) {
    if (req.params.eventTypeId) {
        Rank.destroy({where : {eventTypeId : req.params.eventTypeId}})
            .then(eventType => {
                return EventType.destroy({where: {id: req.params.eventTypeId}})
            })
            .then(eventType => res.redirect('/events/type'));
    } else {
        res.redirect('/events/type');
    }
});

router.post('/type', function (req, res, next) {
    EventType.create(req.body)
        .then(eventType => {
            return Rank.create({eventTypeId : eventType.id, season : 0, country : 0});
        })
        .then(rank => res.redirect('/events/type'));
});

/* GET event page. Add and Edit */
router.get(['/', '/edit/:id'], function (req, res, next) {
    let countries = getNameList();
    let errors = false;
    let previousForm = false;
    if (req.session.errors) {
        errors = req.session.errors;
        delete req.session.errors;
    }

    if (req.session.form) {
        previousForm = req.session.form;
        delete req.session.form;
    }
    let promises = [
        EventType.findAll({raw: true, attributes: ['id', 'name']}),
        Event.findAll({
            raw: true,
            attributes: ['id', 'country', 'flag', 'name', 'start', 'end', 'website', 'rankStatus'],
            include: [{model: EventType, attributes: ['name']}]
        }),
    ];
    if (parseInt(req.params.id)) {
        promises.push(Event.findOne({
            'where': {id: parseInt(req.params.id)},
            include: {model: FileResult, attributes: {exclude: ['buffer']}},
            'raw': true
        }));
    }
    Promise.all(promises).then(results => {
        let edit = (results.length > 2) ? results[2] : null;
        if (previousForm) {
            edit = previousForm;
        }
        res.render('event', {
            countries: countries,
            edit: edit,
            errors: errors,
            eventTypes: results[0],
            events: results[1],
            page: 'events',
            previousForm: previousForm,
            thisYear: new Date().getFullYear(),
            title: 'Add an event',
        });
    });
});

// Helper function to format geoJson from latlon string. '{lat} , {lon}';
var formatGeo = function (latlon) {
    return {
        'type': 'Point',
        'coordinates': [latlon.split(',')[1], latlon.split(',')[0]],
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
router.post(['/', '/:id'], multer().any(), function (req, res, next) {
    if (req.body.latlon) {
        req.body.latlon = formatGeo(req.body.latlon);
    }
    // Add flag. Get code from Name
    req.body.flag = getCode(req.body.country);
    var result = new ProcessResults(req);

    if (parseInt(req.params.id)) {
        Event.update(req.body, {where: {id: parseInt(req.params.id)}})
            .then(event => {
                if (!result.empty && result.errors.length == 0) {
                    return FileResult.destroy({where: {eventId: req.params.id}});
                } else if (result.errors.length > 0) {
                    next(result.notifyError());
                } else {
                    res.redirect('/events');
                }
            })
            .then(del => {
                return FileResult.create(result.toDb(), {include: Event})
            }).then(file => {
                if (file) {
                    res.redirect('/events/page/' + req.params.id + '/check');
                }
            })
            .catch(function (err) {
            });
    } else {
        // Create the comp first. We'll deal with results later.
        Event.create(req.body, {include: EventType})
            .then(event => {
                result.setEventid(event.id);
                if (!result.empty && result.errors.length == 0) {
                    return FileResult.create(result.toDb(), {include: Event})
                } else if (result.errors.length > 0) {
                    next(result.notifyError());
                } else {
                    res.redirect('/events');
                }
                return false;
            }).then(file => {
                if (file) {
                    res.redirect('/events/page/' + file.dataValues.eventId + '/check');
                }
            })
            .catch(function (err) {
                console.log(err);
                if (err.errors) {
                    next(formError('Event', err.errors, '/events'));
                }
                console.log("Event creation failed".red);
            });
    }
});

router.get(['/page/:id'], function(req,res) {
    async function start() {
        let process = new ProcessElo(req.params.id);
        await process.init();
        let elos = await process.getElos();
        let displayElos = new DisplayResults(elos, process.ranks.length);
        res.render('eventPage', {elos : displayElos});
    }

    start();
});


router.get(['/page/:id/check'], function (req, res) {
    let countries = getCodeList();
    Event.findOne({raw: true, 'where': {id: req.params.id}, include: {model: FileResult}})
        .then(event => {
            let uploadResults = false;
            uploadResults = new ProcessResults(req, {
                originalname: event['fileResult.originalname'],
                mimetype: event['fileResult.mimetype'],
                size: event['fileResult.size'],
                buffer: event['fileResult.buffer'],
                eventId: event['fileResult.eventId']
            });
            res.render('eventPageCheck', {
                codeList : countries,
                title: 'Event Page',
                page: 'event',
                event: event,
                uploadResults: uploadResults.results,
                headerResults: uploadResults.nameOrder
            });
        })
        .catch(function (err) {
            console.log("failed fetch results.");
        });
});

router.post(['/page/:id/check'], function (req, res) {
    var check = parseInt(req.body.check);
    if (check) {
        let form = new ProcessForm(req.body, req.params.id);
        res.redirect('/events/page/' + req.params.id + '/check');
    } else {
        FileResult.destroy({where: {eventId: req.params.id}})
            .then(del => {
                res.redirect('/events/edit/' + req.params.id);
            })
            .catch(function (err) {
                console.log(err)
                console.log('FileResult Deletion failed'.red);
            })
    }
});


router.get('/map', function (req, res) {
    res.render('events_map', {title: 'Events Map', page: 'map'});
});

router.get('/calendar', function (req, res) {
    Event.findAll({
        raw: true,
        attributes: ['country', 'flag', 'name', 'start', 'end'],
        include: [{model: EventType, attributes: ['color']}]
    })
        .then(events => {
            res.render('events_calendar', {title: 'Events Calendar', page: 'calendar', events: events})
        });
});

router.get('/json', function (req, res) {
    Event.findAll({
        raw: true,
        attributes: ['id', 'country', 'flag', 'name', 'start', 'end', 'website', 'latlon'],
        include: [{model: EventType, attributes: ['name', 'color']}]
    })
        .then(events => res.json(events));
});

/* Destroy event from get route */
router.get('/delete/:eventId', function (req, res) {
    if (req.params.eventId) {
        Event.destroy({
            where: {id: req.params.eventId}
        }).then(whatever => {
            res.redirect('/events')
        });
    } else {
        res.redirect('/events');
    }
});

router.get('/page/:eventId/elo', function (req, res) {
    async function start() {
        let process = new ProcessElo(req.params.eventId);
        await process.init();
        for (const rank of process.ranks) {
            await process.processEventElo(rank);
        }

        let events = await process.getNextEvents();
        for (event of events) {
            let process = new ProcessElo(event.id);
            await process.init();
            for (const rank of process.ranks) {
                await process.processEventElo(rank);
            }
        }
        res.redirect('/events');
    }

    start();
});

module.exports = router;