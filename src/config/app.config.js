require('dotenv').config({ path: '../.env'});

module.exports = {
    port: process.env.PORT,
    gitHubClientID: process.env.GITHUB_CLIENTID,
    gitHubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    jwtSecret: process.env.JWT_SECRET,
    tickets: process.env.TICKETS,
}