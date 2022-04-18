// lib/app.ts
var express = require('express');
var bodyParser = require('body-parser');

// Create a new express application instance
var app = express();

// Load article routes
var article_routes = require('./routes/article');

//Middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// CORS
app.use((req:any, res:any, next:any) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// Prefix to routes / Load routes
app.use('/api', article_routes);

// Export module
module.exports = app;