# Distinctiveness Intelligence Landing Page

## Whitepaper email flow

This site now uses a Netlify Function to email the whitepaper download link whenever someone completes the form.

### Setup steps

1. Ensure the project is deployed on Netlify with Forms enabled (already handled by the HTML form attributes).
2. Set the following environment variables in the Netlify dashboard (Site settings → Environment variables):
   - `RESEND_API_KEY`: API key from [Resend](https://resend.com/) or update the function to use another provider.
   - `WHITEPAPER_FROM_EMAIL`: The verified sender address (e.g. `Distinctiveness Intelligence <hello@yourdomain.com>`).
   - `WHITEPAPER_DOWNLOAD_URL` (optional): Overrides the default public link to the PDF asset.
3. Deploy the site. Netlify will pick up the `send-whitepaper` function and execute it on every form submission.

You can monitor submissions under **Netlify → Forms → whitepaper** and see function logs under **Netlify → Functions → send-whitepaper**.
