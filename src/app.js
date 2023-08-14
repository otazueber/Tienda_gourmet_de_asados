const express = require('express');
const mongoConnect = require('../db');
const router = require('./router');
const handlebars = require('express-handlebars');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const initializePassport = require('./config/passport.config');
const errorHandler = require('./middlewares/errors');
const addLogger = require('./middlewares/logger');
const addAuthorizationHeader = require('./middlewares/authorizationHeader');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUiExpress = require('swagger-ui-express');
const { userToken } = require('./utils/jwt.utils');
const path = require('path');

const app = express();

const swaggerOption = {
    definition:{
        openapi:'3.0.1',
        info:{
            title: "Carrito de compras API",
            description: "API para administrar carritos de compras y productos"
        }
    },
    apis:[`${__dirname}/docs/**/*.yaml`]
}

const specs = swaggerJSDoc(swaggerOption);
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');
initializePassport();
app.use(passport.initialize());
app.use(addLogger);
app.use(addAuthorizationHeader);
app.use(userToken);
mongoConnect();
app.use(errorHandler);

router(app);
module.exports = app;