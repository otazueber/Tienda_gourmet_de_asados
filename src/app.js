const express = require('express');
const mongoConnect = require('../db');
const router = require('./router');
const handlebars = require('express-handlebars');

const app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

mongoConnect();
router(app);


module.exports = app;