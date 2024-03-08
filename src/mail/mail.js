const mailer = require("nodemailer");
const welcome = require("./welcome_template");
const goodbye = require("./goodbye_template");

const getEmailData = (to, name, type) => {
  let data = null;

  switch (type) {
    case "welcome":
      data = {
        from: process.env.EMAIL,
        to,
        subject: `Hello ${name}`,
        html: welcome(),
      };
      break;

    case "goodbye":
      data = {
        from: process.env.EMAIL,
        to,
        subject: `Goodbye ${name}`,
        html: goodbye(),
      };
      break;

    default:
      data;
  }

  return data;
};

const sendMail = (to, name, type) => {
  const transporter = mailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mail = getEmailData(to, name, type);

  transporter.sendMail(mail, (error, response) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent successfully");
    }

    transporter.close();
  });
};

module.exports = sendMail;
