import nodemailer from "nodemailer"

async function sendEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  return transporter.sendMail({
    from: `Your App <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
  });
}

export default sendEmail;