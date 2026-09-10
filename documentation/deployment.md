# Deployment

`npm run deploy` creates a Netlify deploy preview for this website. It is the default deployment command because deploy previews do not spend production deploy credits on Netlify's current credit-based pricing.

The command first shows the current Netlify account status and asks whether to switch Netlify users. If the user confirms the switch, it runs `netlify switch` before any checks, build, or preview deployment.

After the account prompt, `npm run deploy` runs the preview deployment sequence in this order:

1. `npm run check`
2. `npm run build`
3. `netlify deploy --open`

## Production deployment

`npm run deploy:production` is the production deployment command for this website. A production deploy publishes to the live website, and Netlify currently charges 15 credits for each production deploy. On the Free plan, 10 production deploys use 50% of the monthly 300-credit allowance.

The production command prints the credit warning, shows the current Netlify account status, asks whether to switch Netlify users, runs checks, releases when local commits exist after the latest local Git tag, builds, and then requires the exact confirmation text `spend 15 credits` before running `netlify deploy --prod --open`.

Set `NETLIFY_DEPLOY_SWITCH=1` to force the Netlify user switch step without an interactive prompt. In non-interactive terminals, the prompt defaults to keeping the current Netlify user.
