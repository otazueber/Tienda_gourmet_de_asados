const express = require('express');
const mongoConnect = require('../db');
const router = require('./router');
const handlebars = require('express-handlebars');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');

const { dbUser, dbPass, dbHost, dbName } = require('../src/config/db.config');

const app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
    session({
        store: MongoStore.create({
            mongoUrl:
                `mongodb+srv://${dbUser}:${dbPass}@${dbHost}/sessions?retryWrites=true&w=majority`,
            mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
        }),
        secret: 'coderSecret',
        resave: false,
        saveUninitialized: false,
    })
);
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

mongoConnect();
router(app);


module.exports = app;