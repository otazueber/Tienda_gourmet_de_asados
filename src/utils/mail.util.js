const nodemailer = require('nodemailer');
const { mailUser, mailPass } = require('../config/app.config');

const transport = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  auth: {
    user: mailUser,
    pass: mailPass,
  },
});

module.exports = transport;
