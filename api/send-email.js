// api/send-email.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { emailStr, customerSubject, customerHtml } = req.body;

  if (!emailStr || !customerSubject || !customerHtml) {
    return res.status(400).json({ error: 'Missing required payload fields' });
  }

  // Configure Zoho SMTP Transporter for UK/EU region (.eu)
  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.eu', // Explicitly set to EU endpoint for UK accounts
    port: 465,
    secure: true, // SSL Connection
    auth: {
      user: process.env.ZOHO_EMAIL,       // Reads 'auto@westside-preorder.co.uk'
      pass: process.env.ZOHO_APP_PASSWORD, // Reads '9ggy7uq8rcmS'
    },
  });

  try {
    // Send email through Zoho SMTP
    await transporter.sendMail({
      from: `"West Side Tavern" <${process.env.ZOHO_EMAIL}>`,
      to: emailStr,
      subject: customerSubject,
      html: customerHtml,
    });

    console.log(`✅ Pre-order receipt successfully sent to ${emailStr}`);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('🚨 ZOHO SMTP ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
}