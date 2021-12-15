const colors = require('colors');
var xlsx = require('node-xlsx');

class ProcessResults {

    // This class can either be instanciated directly from file request req.files
    // or by passing an event model object including fileResults.
    constructor(req, file) {
        this.expectedColumns = ['rank', 'lastname', 'firstname', 'gender', 'pilotcode', 'country', 'licencen'];
        this.errors = [];
        this.warnings = [];
        this.header = [];
        this.results = [];
        this.landPageError = (req.params.id) ? '/events/edit/' + req.params.id : '/events';
        this.empty = true;

        if (!req.files || req.files.length < 1) {
            if (file) {
                this.init(file);
            }
        } else {
            this.init(req.files[0]);
            this.eventId = req.params.id ? req.params.id : false;
        }
    }

    init(file) {
        this.empty = false;
        this.filename = file.originalname;
        this.field = file.fieldname;
        this.mime = file.mimetype;
        this.buffer = file.buffer;
        this.size = file.size;
        this.getData();
        this.checkHeader();
        this.checkData();
    }

    get toDb() {
        return this.toDb();
    }

    set setEventId(id) {
        return this.setEventid(id);
    }

    setEventid(id) {
        this.landPageError = '/events/edit/' + id
        this.eventId = id;
    }

    toDb() {
        return {
            originalname : this.filename,
            mimetype : this.mime,
            buffer : this.buffer,
            size : this.size,
            eventId : this.eventId,
        }
    }

    get getResults() {
        return this.getResults();
    }

    getResults() {
        return this.results;
    }

    get notifyError() {
        return this.notifyError();
    }

    notifyError() {
        var error = new Error('Bad result file');
        error.type = 'form';
        error.landPage = this.landPageError;
        error.errors = {
            field: this.field,
            messages: this.errors,
        };
        return error;
    }

    checkData() {
        if (this.results.length < 2) {
            this.errors.push('Not enough datas found into the result file. Less than 2 lines.');
        }

        if (this.results.length > 0 && this.results[0].length < 7) {
            this.errors.push('Some mandatory columns are missing in your data. The file is probably wrong.');
        }
    }

    checkHeader() {
        for (var i = 0; i < this.header.length;  i++) {
            if (this.header[i].toLowerCase().replace(/\s/g,'').replace(/[^a-zA-Z ]/g, "") !== this.expectedColumns[i]) {
                this.errors.push('Excpected column name is : ' + this.expectedColumns[i] + ' but the file has : ' + this.header[i]);
            }
        }
    }

    getData() {
        var doc = xlsx.parse(this.buffer);
        if (doc.length > 0 && doc[0].data.length > 0) {
            this.header = doc[0].data[0];
            var data = doc[0].data.slice(1);
            for (var i = 0; i < data.length; i++) {
                this.results.push(data[i]);
            }
        }
    }
}

module.exports = {
    ProcessResults : ProcessResults
}