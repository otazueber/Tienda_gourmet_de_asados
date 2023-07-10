const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  auth: {
    user: 'pruebacoder1976@gmail.com',
    pass: 'vpjbhpmzkfzlqzii',
  },
});

module.exports = transport;
