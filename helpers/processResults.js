const colors = require('colors');
const errors = require('./../helpers/errors');
var xlsx = require('node-xlsx');

class ProcessResults {

    // This class can either be instanciated directly by posting file result request req.files
    // or by passing an event model object including fileResults.
    constructor(req, file) {
        this.expectedColumns = ['rank', 'lastname', 'firstname', 'gender', 'country'];
        this.errors = [];
        this.warnings = [];
        this.header = [];
        this.nameOrder = [];
        this.columnOrder = [];
        this.results = [];
        this.landPageError = (req.params.id) ? '/events/edit/' + req.params.id : '/events';
        this.empty = true;

        if (file) {
            this.init(file);
        } else if(req.files.length > 0) {
            this.init(req.files[0]);
            this.eventId = req.params.id ? req.params.id : false;
        }
    }

    init(file) {
        if (file.originalname && file.buffer && file.mimetype && file.size) {
            this.filename = file.originalname;
            this.field = file.fieldname;
            this.mime = file.mimetype;
            this.buffer = file.buffer;
            this.size = file.size;
            this.getData();
            this.checkHeader();
            this.checkData();
            if (this.errors.length == 0) {
                this.empty = false;
            }
        }
    }

    get toDb() {
        return this.toDb();
    }

    set setEventId(id) {
        return this.setEventid(id);
    }

    setEventid(id) {
        this.landPageError = '/events/edit/' + id;
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

        if (this.results.length > 0 && this.results[0].length < this.expectedColumns.length) {
            this.errors.push('Some mandatory columns are missing in your data. The file is probably wrong.');
        }

        for (var i = 0; i < this.results.length; i++) {
               let data = this.results[i];
               let finalData = []
               for (var y = 0; y < this.columnOrder.length ; y++) {
                   finalData.push(data[this.columnOrder[y]]);
               }
               this.results[i] = finalData;
        }
    }

    checkHeader() {
        let tempArray = [];
        for (var i = 0; i < this.header.length;  i++) {
            let search = this.header[i].toLowerCase().replace(/\s/g, '').replace(/[^a-zA-Z ]/g, "");
            let index = this.expectedColumns.indexOf(search);
            if (index > -1) {
                this.columnOrder[index] = i;
            } else {
                tempArray.push(i);
            }
        }

        this.columnOrder = [].concat(this.columnOrder, tempArray);
        for (var i = 0; i < this.columnOrder.length; i++) {
            this.nameOrder.push(this.header[this.columnOrder[i]]);
        }
        for (var i = 0; i < this.expectedColumns.length; i++) {
            if (this.columnOrder.indexOf(i) < -1) {
                this.errors.push('Excpected column name : ' + this.expectedColumns[i] + 'was not found');
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