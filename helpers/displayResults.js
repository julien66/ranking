class DisplayResults {

    constructor (elos, rankLength) {
        this.elos = elos;
        this.rankLength = rankLength;
        return this.format(this.arrangeRow(elos));
    };

    arrangeRow(elos) {
        for (var i = 0; i < elos.length; i++) {
            // For every main result. get elos and append other lines.
            if (i % this.rankLength === 0) {
                elos[i].rankElos = this.getAllSubElo(elos.slice(i, i + this.rankLength));
            }else {
                delete elos[i];
            }
        }
        return elos;
    }

    // For every rank, get all subset of elos.
    getAllSubElo(elos) {
        let rankElos = [];
        for (const elo of elos) {
            rankElos.push([elo.rankId, elo.eloStart, elo.eloEnd]);
        }
        return rankElos;
    }

    format(results) {
        let formated = [];
        for (const result of results) {
            if (result) {
                formated.push({
                    rank : result['athlete.results.rank'],
                    country : result['athlete.country'],
                    flag : result['athlete.flag'],
                    firstName : result['athlete.firstName'],
                    lastName : result['athlete.lastName'],
                    gender : result['athlete.gender'],
                    rankElos : result.rankElos
                });
            }
        }
        return formated;
    }
}



module.exports = {
    DisplayResults : DisplayResults,
};
