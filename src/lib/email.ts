import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || 'tspanu@shfty.io';

export type EmailData = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  reply_to?: string;
}

export async function sendEmail(data: EmailData) {
  const { to, subject, html, text, from = fromEmail, reply_to } = data;
  
  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      replyTo: reply_to,
    });
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

export function generateWelcomeEmail(userData: { 
  name?: string;
  email: string;
}) {
  const name = userData.name || 'there';
  
  const subject = 'Welcome to shfty!';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
          }
          .container {
            padding: 20px;
            border: 1px solid #eee;
            border-radius: 5px;
          }
          .content {
            padding: 20px 0;
          }
          .footer {
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 12px;
            color: #777;
          }
          a {
            color: #007bff;
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <p>Hey ${name},</p>
            <p>How's everything going with shfty so far?</p>
            <p>Run into any issues or missing features? Have any questions? I would love to hear any feedback good or bad!</p>
            <p>Just reply back to me here or join our <a href="https://discord.gg/shfty">discord community here</a>.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} shfty. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
Hey ${name},

How's everything going with shfty so far?

Run into any issues or missing features? Have any questions? I would love to hear any feedback good or bad!

Just reply back to me here or join our discord community here: https://discord.gg/shfty

© ${new Date().getFullYear()} shfty. All rights reserved.
  `;
  
  return { subject, html, text };
}

export async function sendWelcomeEmail(userData: { name?: string; email: string }) {
  const { subject, html, text } = generateWelcomeEmail(userData);
  
  return sendEmail({
    to: userData.email,
    subject,
    html,
    text,
    reply_to: 'tspanu@shfty.io', // Personal email so users respond directly to you
  });
} 