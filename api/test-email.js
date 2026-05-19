/*
  GET /api/test-email
  Open this URL in your browser while on Vercel to diagnose email issues.
  Returns a JSON report showing exactly what's configured and what failed.
  DELETE THIS FILE before going live.
*/

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const report = {
    env: {
      GMAIL_USER:          process.env.GMAIL_USER         ? '✅ set' : '❌ MISSING',
      GMAIL_APP_PASSWORD:  process.env.GMAIL_APP_PASSWORD ? `✅ set (${process.env.GMAIL_APP_PASSWORD.length} chars)` : '❌ MISSING',
      OWNER_EMAIL:         process.env.OWNER_EMAIL        ? '✅ set' : '❌ MISSING',
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? '✅ set' : '⚠️ not set (signature check skipped)',
    },
    nodemailer_version: null,
    smtp_verify:        null,
    send_attempt:       null,
    error:              null,
  };

  try {
    const nm = await import('nodemailer');
    report.nodemailer_version = nm.default?.createTransport ? '✅ loaded OK' : '⚠️ loaded but createTransport missing';
  } catch (e) {
    report.nodemailer_version = `❌ FAILED TO LOAD: ${e.message}`;
    return res.status(200).json(report);
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    report.smtp_verify = '⏭️ skipped — credentials missing';
    return res.status(200).json(report);
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  });

  /* Step 1: verify SMTP connection */
  try {
    await transporter.verify();
    report.smtp_verify = '✅ SMTP connection OK';
  } catch (e) {
    report.smtp_verify = `❌ SMTP FAILED: ${e.message}`;
    report.error = e.message;
    return res.status(200).json(report);
  }

  /* Step 2: send a real test email */
  const ownerEmail = process.env.OWNER_EMAIL || gmailUser;
  try {
    const info = await transporter.sendMail({
      from:    `"FoodMedi.Co Test" <${gmailUser}>`,
      to:      ownerEmail,
      subject: '✅ FoodMedi.Co — Email test successful',
      html:    `<p style="font-family:sans-serif;">
                  This is a test email from your Vercel function.<br/><br/>
                  If you can read this, email sending is working correctly.<br/>
                  <strong>Sent:</strong> ${new Date().toISOString()}
                </p>`,
    });
    report.send_attempt = `✅ Email sent! Message ID: ${info.messageId}`;
  } catch (e) {
    report.send_attempt = `❌ SEND FAILED: ${e.message}`;
    report.error = e.message;
  }

  return res.status(200).json(report);
}
