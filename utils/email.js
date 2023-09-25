const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = '"Ruined Moon Studio" thanhoangdang@gmail.com';
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST_PRO,
        port: process.env.EMAIL_PORT_PRO,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER_PRO,
          pass: process.env.EMAIL_PASSWORD_PRO,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST_DEV,
      port: process.env.EMAIL_PORT_DEV,
      auth: {
        user: process.env.EMAIL_USER_DEV,
        pass: process.env.EMAIL_PASSWORD_DEV,
      },
    });
  }

  //Send actual email
  async send(template, subject) {
    //Render HTML based on pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    //Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    //Create transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Reset Your Password (valid for only 10 minutes)',
    );
  }
}

module.exports = Email;
