const colors = require('colors');
var xlsx = require('node-xlsx');

class ProcessResults {

    constructor(req, res) {
        this.expectedColumns = ['rank', 'lastname', 'firstname', 'gender', 'pilotcode', 'country', 'licencen'];
        this.errors = [];
        this.warnings = [];
        this.landPageError = (req.params.id) ? '/events/edit/' + req.params.id : '/events';

        if (req.files.length < 1) {
            this.empty = true;
        } else {
            this.empty = false;

            this.file = req.files[0];
            this.filename = this.file.originalname;
            this.field = this.file.fieldname;
            this.mime = this.file.mimetype;
            this.buffer = this.file.buffer;
            this.size = this.file.size;
            this.header = [];
            this.results = [];
            this.getData();
            this.checkHeader();
            this.checkData();
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