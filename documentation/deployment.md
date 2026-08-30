# Deployment

`npm run deploy` is the production deployment command for this website.

The command first prints production warnings, shows the current Netlify account status, and asks whether to switch Netlify users. If the user confirms the switch, it runs `netlify switch` before any checks, release work, build, or deployment.

After the account prompt, the command runs the deployment sequence in this order:

1. `npm run check`
2. `npm run release`, only when there are commits after the latest local Git tag
3. `npm run build`
4. `netlify deploy --prod --open`

Set `NETLIFY_DEPLOY_SWITCH=1` to force the Netlify user switch step without an interactive prompt. In non-interactive terminals, the prompt defaults to keeping the current Netlify user.
