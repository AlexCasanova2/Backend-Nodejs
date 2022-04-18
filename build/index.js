"use strict";
var mongoose = require('mongoose');
var app = require('./app');
const port = 3900;
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/plantex', { useNewUrlParser: true })
    .then(() => {
    console.log('Connection succesful!');
    app.listen(port, () => {
        console.log('Server create correctly on http://localhost:' + port);
    });
});
