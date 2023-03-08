// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require('nodemailer');

const { EMAIL_USERNAME } = process.env;
const { EMAIL_PASSWORD } = process.env;
const { EMAIL_HOST } = process.env;
const { EMAIL_PORT } = process.env;

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PASSWORD,
    },
    secure: false,
    logger: true,
    tls: {
      rejectUnauthorized: true,
    },
  });
  // 2) Define email options
  const mailOptions = {
    from: 'Jan Melicherik <jan.melicherik@email.cz>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3) Send email with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
