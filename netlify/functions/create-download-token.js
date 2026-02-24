const crypto = require('crypto');

const TOKEN_SECRET = process.env.WHITEPAPER_TOKEN_SECRET;
const TOKEN_TTL_SECONDS = parseInt(process.env.WHITEPAPER_TOKEN_TTL || '900', 10); // default 15 minutes

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  if (!TOKEN_SECRET) {
    console.error('WHITEPAPER_TOKEN_SECRET not set');
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Token service unavailable.' })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ message: 'Invalid JSON' }) };
  }

  const email = (payload.email || '').trim().toLowerCase();
  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ message: 'Missing email' }) };
  }

  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    sub: email,
    exp: now + TOKEN_TTL_SECONDS,
    iat: now,
    nonce: crypto.randomBytes(8).toString('hex')
  };

  const token = signToken(tokenPayload, TOKEN_SECRET);

  return {
    statusCode: 200,
    body: JSON.stringify({ token })
  };
};

function base64UrlEncode(buffer) {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function signToken(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(Buffer.from(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(Buffer.from(JSON.stringify(payload)));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = base64UrlEncode(
    crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest()
  );
  return `${data}.${signature}`;
}
