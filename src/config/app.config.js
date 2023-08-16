require('dotenv').config({ path: '../.env'});

module.exports = {
    port: process.env.PORT,
    gitHubClientID: process.env.GITHUB_CLIENTID,
    gitHubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    jwtSecret: process.env.JWT_SECRET,
    tickets: process.env.TICKETS,
    environment: process.env.ENVIRONMENT,
    mailUser: process.env.MAIL_USER,
    mailPass: process.env.MAIL_PASS,
    stripeSK: process.env.STRIPE_SK,
    stripePK: process.env.STRIPE_PK
}