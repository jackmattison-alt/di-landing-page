# Distinctiveness Intelligence Landing Page

## Secure whitepaper flow

The site now gates downloads behind short-lived tokens issued via Netlify Functions. Visitors must submit the form; the client
posts the form data to Netlify (so submissions still appear in the dashboard) and then requests a token from
`/.netlify/functions/create-download-token`. The thank-you page exchanges the token with `/.netlify/functions/download-whitepaper`,
which streams the PDF from `netlify/functions/assets/the-human-machine-memory-gap.pdf`.

### Environment variables

Set these inside Netlify → Site settings → Environment variables:

- `WHITEPAPER_TOKEN_SECRET`: a long random string (used to sign download tokens).
- `WHITEPAPER_TOKEN_TTL` (optional): token lifetime in seconds (defaults to 900 = 15 minutes).

Email delivery is still available via the `send-whitepaper` submission-created function. To enable it, also set:

- `RESEND_API_KEY`: API key from Resend (or update the function to call another provider).
- `WHITEPAPER_FROM_EMAIL`: Verified sender address.
- `WHITEPAPER_DOWNLOAD_URL`: Public or signed URL that emails should point to (if unset the email function stays disabled).

### Operational notes

- Form submissions remain visible under **Netlify → Forms → whitepaper**.
- Download attempts route through `download-whitepaper`; check **Netlify → Functions → download-whitepaper** for logs.
- Replace `netlify/functions/assets/the-human-machine-memory-gap.pdf` with the production whitepaper when ready.
