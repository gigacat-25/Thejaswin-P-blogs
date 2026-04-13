import { google } from 'googleapis';
import nodemailer from 'nodemailer';

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const SENDER_EMAIL = process.env.ADMIN_EMAIL || 'newsletter@example.com';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
if (REFRESH_TOKEN) {
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (process.env.NODE_ENV === 'development' && !REFRESH_TOKEN) {
    console.log(`[Dev mode] Mock sending email to: ${to}`);
    console.log(`[Dev mode] Subject: ${subject}`);
    return { success: true, message: 'Simulated email sent' };
  }

  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: SENDER_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken?.token as string,
      },
    });

    const mailOptions = {
      from: `AI Blog Newsletter <${SENDER_EMAIL}>`,
      to,
      subject,
      html,
    };

    const result = await transport.sendMail(mailOptions);
    return { success: true, result };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: (error as Error).message };
  }
}
