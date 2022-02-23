class Errors {
    constructor(message, error) {
        this.error = new Error(message);
        this.error.type = error.type;
        this.error.landPage = error.landPage;

    }
}

module.exports = {
    Errors : Errors,
}