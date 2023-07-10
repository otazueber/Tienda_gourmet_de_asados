const transport = require('../utils/mail.util')

class MailAdapter {
  static async send(mailInfo) {
    await transport.sendMail({
      from: mailInfo.from,
      to: mailInfo.to,
      subject: mailInfo.subject,
      html: mailInfo.html,
    });
  };
};

module.exports = MailAdapter
