const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TOKEN_SECRET = process.env.WHITEPAPER_TOKEN_SECRET;
const WHITEPAPER_PATH = path.join(__dirname, 'the-human-machine-memory-gap.pdf');

exports.handler = async (event) => {
  if (!TOKEN_SECRET) {
    return { statusCode: 500, body: 'Token validation not configured.' };
  }

  const token = event.queryStringParameters && event.queryStringParameters.token;
  if (!token) {
    return { statusCode: 401, body: 'Missing token.' };
  }

  let payload;
  try {
    payload = verifyToken(token, TOKEN_SECRET);
  } catch (error) {
    console.error('Token verification failed', error.message);
    return { statusCode: 401, body: 'Invalid or expired token.' };
  }

  if (!fs.existsSync(WHITEPAPER_PATH)) {
    console.error('Whitepaper file missing at', WHITEPAPER_PATH);
    return { statusCode: 500, body: 'Whitepaper unavailable.' };
  }

  const file = fs.readFileSync(WHITEPAPER_PATH);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="The-Human-Machine-Memory-Gap.pdf"',
      'Cache-Control': 'no-store'
    },
    isBase64Encoded: true,
    body: file.toString('base64')
  };
};

function verifyToken(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed token');
  }
  const [encodedHeader, encodedPayload, signature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = base64UrlEncode(
    crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest()
  );

  const signatureBuffer = base64UrlDecode(signature);
  const expectedBuffer = base64UrlDecode(expectedSignature);
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new Error('Signature mismatch');
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload).toString());
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('Token expired');
  }
  return payload;
}

function base64UrlEncode(buffer) {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let normalized = str.replace(/-/g, '+').replace(/_/g, '/');
  while (normalized.length % 4) {
    normalized += '=';
  }
  return Buffer.from(normalized, 'base64');
}
