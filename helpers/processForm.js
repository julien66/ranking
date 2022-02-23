const colors = require('colors');
const errors = require('./../helpers/errors');
const {getName} = require('country-list');
const {Athlete, Elo, Event, Result} = require('./../sequelize');

class ProcessForm {

    constructor(body, eventId) {
        var athletes = {};
        this.listLength = body.lastName.length;

        Result.destroy({where : {eventId : eventId}});
        for (var i = 0; i < this.listLength; i++) {
            let concat = body.codeId[i].toLowerCase().replace(/\s/g, '').replace(/[^a-zA-Z ]/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let athleteModel = {
                lastName: body.lastName[i],
                firstName: body.firstName[i],
                gender: body.gender[i],
                flag: body.country[i],
                country: getName(body.country[i]),
                concat: concat,
                rank : i + 1,
            };
            athletes[concat] = athleteModel;

            Athlete.findOrCreate( {raw : true, where: {concat : concat}, defaults : athleteModel})
                .then(data => {
                    return data[0];
                }).then(function(athlete) {
                    return Result.create(
                        {
                            rank : athletes[athlete.concat].rank,
                            eventId : eventId,
                            athleteId : athlete.id
                        });
                })
                .catch(function(err) {
                    console.log(err);
                });
        }
    }
}

module.exports = {
    ProcessForm : ProcessForm,
}