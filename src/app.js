const express = require('express');
const mongoConnect = require('../db');
const router = require('./router');
const handlebars = require('express-handlebars');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const initializePassport = require('./config/passport.config');
const { dbUser, dbPass, dbHost } = require('../src/config/db.config');
const errorHandler = require('./middlewares/errors');
const addLogger = require('./middlewares/logger.middleware');

const app = express();
app.use(addLogger);
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
        secret: 'notVeganSecret',
        resave: false,
        saveUninitialized: false,
    })
);
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

mongoConnect();
router(app);

app.use(errorHandler);

module.exports = app;