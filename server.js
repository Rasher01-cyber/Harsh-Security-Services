const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// TODO: Replace these with your real email credentials or SMTP settings.
// For Gmail you should use an app password, not your normal password.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "YOUR_SERVICE_EMAIL@gmail.com",
    pass: "YOUR_APP_PASSWORD",
  },
});

app.post("/api/enquiry", async (req, res) => {
  const { name, phone, email, location, requirements } = req.body || {};

  if (!name || !phone || !requirements) {
    return res.status(400).json({ ok: false, message: "Missing required fields." });
  }

  const mailOptions = {
    from: "YOUR_SERVICE_EMAIL@gmail.com",
    to: "hrshscrtsrvcs@gmail.com",
    replyTo: email || undefined,
    subject: "Security Enquiry – Harsh Security Services",
    text: [
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email || "-"}`,
      `Location: ${location || "-"}`,
      "",
      "Requirements:",
      requirements,
    ].join("\n"),
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error sending enquiry email:", err);
    res.status(500).json({ ok: false, message: "Failed to send email." });
  }
});

app.listen(PORT, () => {
  console.log(`Enquiry server running on http://localhost:${PORT}`);
});

