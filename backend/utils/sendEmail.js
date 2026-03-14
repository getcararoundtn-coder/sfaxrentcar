const { MailtrapClient } = require("mailtrap");

const sendEmail = async (options) => {
  const TOKEN = "a00f06b869be94bc5d54a004b20ec776";

  const client = new MailtrapClient({
    token: TOKEN,
  });

  const sender = {
    email: "hello@demomailtrap.co",
    name: "SfaxRentCar",
  };

  const recipients = [
    {
      email: options.email,
    }
  ];

  try {
    const response = await client.send({
      from: sender,
      to: recipients,
      subject: options.subject,
      html: options.html,
      category: "Password Reset",
    });
    console.log("✅ Email sent via Mailtrap:", response);
    return response;
  } catch (error) {
    console.error("❌ Mailtrap error:", error);
    throw error;
  }
};

module.exports = sendEmail;