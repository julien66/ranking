const colors = require('colors');
const errors = require('./../helpers/errors');
const {Athlete, Col, Elo, Event, Op, Rank, Result} = require('./../sequelize');
const EloHelper = require('./../helpers/elo');

class ProcessElo {

     constructor(eventId){

        this.eventId = eventId;
        this.eloBase = 1500;
        this.event = false;
        this.results = [];
        this.ranks = [];
        this.elosStart = [];
        this.elosEnd = [];
    }

    async init() {
        await this.getEvent(this.eventId)
            .then(event => {
                this.event = event;
                return this.getResults();
            })
            .then(results => {
                this.results = results;
                return this.setLocalRank();
            })
            .then(rank => {
                return this.getRanks();
            })
            .then(ranks => {
                this.ranks = ranks;
                for (const rank of ranks) {
                    this.elosStart[rank.id] = [];
                    this.elosEnd[rank.id] = [];
                }
            })
            .catch(function(err) {
                console.log(err);
            });
    };

     async processEventElo (rank) {
             let getPromises = [];
             let setPromises = [];
             for (const result of this.results) {
                 getPromises.push(this.getPastElo(rank.id, result.athleteId));
             }

             await Promise.all(getPromises).then(elos => {
                 this.assignEloResult(rank, elos);
                 return Elo.destroy({where : {eventId : this.event.id, rankId : rank.id }});
             }).then(elosDestroy => {
                 setPromises = this.writeElo(rank);
                 return Promise.all(setPromises);
             }).catch(function(err) {
                 console.log(err);
             });
    }


    writeElo(rank) {
        var promises = [];
        for (var i=0; i < this.results.length; i++) {
            promises.push(Elo.create({
                rankId : rank.id,
                eventId : this.event.id,
                athleteId : this.results[i].athleteId,
                eloStart : this.elosStart[rank.id][this.results[i].rank - 1],
                eloEnd : this.elosEnd[rank.id][this.results[i].rank - 1],
            }));
        }
        return promises;
    }

    assignEloResult(rank, elos) {
        for (var i = 0; i < elos.length; i++) {
            let elo;
            if (!elos[i]) {
                elo = this.eloBase;
            }
            else {
                elo = elos[i].eloEnd;
            }
            this.elosStart[rank.id].push(elo);
            this.elosEnd[rank.id].push(elo);
        }

        // Each player against each other as 1 VS 1 Elo match.
        for (var i = 0; i < this.elosStart[rank.id].length; i++) {
            for (var y = (0 + i); y < this.elosEnd[rank.id].length; y++) {
                if (i !== y) {
                    let newElos = EloHelper.getNewEloRatings([this.elosEnd[rank.id][i], this.elosEnd[rank.id][y]]);
                    this.elosEnd[rank.id][i] = newElos[0];
                    this.elosEnd[rank.id][y] = newElos[1];
                }
            }
        }
    }

    getPastElo(rankId, athleteId) {
        return Elo.findOne(
            {
                raw : true,
                where : {
                    rankId : rankId,
                    athleteId : athleteId,
                },
                include : {
                    model : Event,
                    where : {end : {[Op.lte] : this.event.start.toISOString()}},
                    order : [['end', 'DESC']]
                },
            });
    }

    getEvent(eventId) {
        return Event.findOne({raw: true, where : {id : eventId}});
    }

    async getNextEvents() {
        let query = {
            raw :true,
            where : {
                id : {[Op.not] : this.event.id},
                eventTypeId : this.event.eventTypeId,
                start : {[Op.gte] : this.event.start.toISOString()}
            },
            order : [['start' , 'ASC']]
        };

        return await Event.findAll(query);
    }

    getResults() {
        return Result.findAll({raw : true, "where" : {eventId : this.event.id}});
    }

    getRanks() {
        return Rank.findAll({
            raw : true,
            where : {
                'eventTypeId' : this.event.eventTypeId,
                'country' : {[Op.or] : [this.event.country , '0']},
                'season' : {[Op.or] : [this.event.season, 0]},
            }
        });
    }

    async getElos() {
         return await Elo.findAll({
             raw : true,
             where: {
                 eventId: this.eventId,
                 rankId: this.ranks.map(function(rank) { return rank.id}),
             },
             include : [{
                 model : Athlete,
                 include : {
                     model : Result,
                     where : {
                         eventId : this.eventId,
                     },
                 },
             }],
             order : [[Col('athlete.results.rank'), 'Asc'], ['rankId', 'Asc']],
         });
    }

    setLocalRank() {
        return Rank.findOrCreate({
            raw : true,
            'where' : {'country' : this.event.country, 'season' : this.event.season, 'eventTypeId' :  this.event.eventTypeId}})
    }
}

module.exports = {
    ProcessElo : ProcessElo,
}