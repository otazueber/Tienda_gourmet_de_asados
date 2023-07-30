const passport = require('passport');
const local = require('passport-local');
const GithubStrategy = require('passport-github2');
const { hashPassword, isValidPassword } = require('../utils/cryptPassword');
const { gitHubClientID, gitHubClientSecret } = require('./app.config');
const CustomError = require('../handler/errors/CustomError');
const generateUserErrorInfo = require('../handler/errors/info');
const EnumErrors = require('../handler/errors/enumErrors');
const DbUserManager = require('../dao/dbUserManager');

const LocalStrategy = local.Strategy;

const initializePassport = () => {
    passport.use('register', new LocalStrategy({ passReqToCallback: true, usernameField: 'email' }, async (req, username, password, done) => {
        try {
            const { first_name, last_name, email, age, password } = req.body;

            const user = await DbUserManager.findOne(email);
            if (user) {
                return done(null, false);
            };
            if (!first_name || !last_name || !email)
            {
                CustomError.createError({
                    name: "Error creando usuario",
                    cause: generateUserErrorInfo({first_name, last_name, email}),
                    message: "Error intentando crear un usuario",
                    code: EnumErrors.INVALID_TYPES_ERROR
                })
            }
            const newUserInfo = {
                first_name,
                last_name,
                email,
                age,
                password: hashPassword(password),
            };

            const newUser = await DbUserManager.createUser(newUserInfo);

            done(null, newUser);
        } catch (error) {
            req.logger.error(error.message);
            done(error);
        };
    }
    )
    );

    passport.use('login', new LocalStrategy({ passReqToCallback: true, usernameField: 'email' }, async (req, username, password, done) => {
        try {
            if ((username == 'adminCoder@coder.com') & (password == 'adminCod3r123')) {
                const user = {
                    id: "CODER",
                    first_name: 'admin',
                    last_name: 'Coder',
                    email: 'adminCoder@coder.com',
                    role: 'admin',
                    password
                };
                done(null, user);
            } else {
                const user = await DbUserManager.getUser(username);
                if (!user) {
                    req.logger.error('El usuario no existe');
                    return done(null, false);
                };
                if (!isValidPassword(password, user)) {
                    req.logger.error('El password no es correcto');
                    return done(null, false);
                };
                DbUserManager.setLastConnection(user.email);
                done(null, user);
            };
        } catch (error) {
            req.logger.error(error.message);
            done(error);
        };
    }
    )
    );

    passport.use('github', new GithubStrategy({ clientID: gitHubClientID, clientSecret: gitHubClientSecret, callbackURL: 'http://localhost:8080/auth/githubcallback' }, async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await DbUserManager.getUser(profile._json.email);
            if (!user) {
                const newUserInfo = {
                    first_name: profile._json.name,
                    last_name: '',
                    age: 18,
                    email: profile._json.email,
                    password: '',
                };
                const newUser = await DbUserManager.createUser(newUserInfo);
                DbUserManager.setLastConnection(newUser.email);
                return done(null, newUser);
            };
            DbUserManager.setLastConnection(user.email);
            done(null, user);
        } catch (error) {
            done(error);
        }
    }
    )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    })

    passport.deserializeUser(async (id, done) => {
        let user;
        if (id === "CODER")
        {
            user = {
                _id: "CODER",
                first_name: 'admin',
                last_name: 'Coder',
                email: 'adminCoder@coder.com',
                role: 'admin',
                password: 'adminCod3r123'
            };
        } 
        else
         {
            user = await DbUserManager.getUserById(id)
        }
        done(null, user);
    })
}

module.exports = initializePassport;
