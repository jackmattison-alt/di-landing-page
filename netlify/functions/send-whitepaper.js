const fetch = (...args) => {
  if (typeof globalThis.fetch === 'function') {
    return globalThis.fetch(...args);
  }
  return Promise.reject(new Error('Fetch is not available in this environment.'));
};

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.WHITEPAPER_FROM_EMAIL;
const DOWNLOAD_URL = process.env.WHITEPAPER_DOWNLOAD_URL;

exports.handler = async (event) => {
  if (!RESEND_API_KEY || !FROM_EMAIL || !DOWNLOAD_URL) {
    console.error('Missing RESEND_API_KEY, WHITEPAPER_FROM_EMAIL, or WHITEPAPER_DOWNLOAD_URL environment variables');
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Email service not configured.' })
    };
  }

  const submission = JSON.parse(event.body);
  const payload = submission.payload || {};
  const formData = payload.data || {};
  const email = payload.email || formData.email || formData['email address'] || formData['Email address'];
  const name = formData['full-name'] || formData.name || 'there';

  if (!email) {
    console.error('No email found on submission payload');
    return { statusCode: 200, body: JSON.stringify({ message: 'Submission stored but no email sent.' }) };
  }

  const html = `
    <p>Hi ${name},</p>
    <p>Thanks for requesting <strong>The Human-Machine Memory Gap</strong>.</p>
    <p>You can download your copy using the secure link below:</p>
    <p><a href="${DOWNLOAD_URL}">Download the whitepaper</a></p>
    <p>— Distinctiveness Intelligence™</p>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: 'Your copy of The Human-Machine Memory Gap',
        html
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error', errorText);
      return { statusCode: 500, body: JSON.stringify({ message: 'Failed to send email.' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'Email sent.' }) };
  } catch (error) {
    console.error('Email send failed', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Unexpected error sending email.' }) };
  }
};
