# Week 5: Going Public, Webhooks, OAuth, and Telemetry

For four weeks your card has lived in one account. It reads that account's CRM with a static token, and it calls functions that only that account can run. This week is about what changes when the app has to leave home: other accounts, real-time events, a token per install, and errors you can see after you've shipped.

**The point:** going public is mostly a config decision you make early, not code you write late. Pick the auth type and distribution with your eyes open, and know what each one takes away.

## What's in this folder

| Path | What it is |
| --- | --- |
| [`webhooks-kit/`](webhooks-kit/RentalWebhooks) | A runnable project with an app and contact webhooks sent to [webhook.site](https://webhook.site), with `qa` and `prod` config profiles. Fill in two account IDs and two URLs, then upload. |
| [`prompts.md`](prompts.md) | The Claude Code prompts for each step, ready to copy. |

## 1. Going public

### The path

```
private + static  ──▶  private + OAuth  ──▶  marketplace + OAuth (unlisted)  ──▶  listed on the App Marketplace
   1 account            10 allowlisted          25 installs                        unlimited
```

Two fields in `src/app/app-hsmeta.json` decide where you are:

| `distribution` | `auth.type` | Who can install | Limit |
| --- | --- | --- | --- |
| `private` | `static` | One account at a time (plus developer test accounts) | 1 standard account + up to 10 test accounts |
| `private` | `oauth` | Accounts you allowlist | 10, not counting test accounts |
| `marketplace` | `oauth` | Anyone with the install link, before listing | 25, not counting test accounts |
| `marketplace` | `oauth` | Anyone, after listing | Unlimited |

"Unlisted" isn't a setting. It's a `marketplace` app that hasn't been listed yet. Listing requirements and certification are Week 6.

### What you give up with OAuth

**Serverless functions only run in apps with `private` distribution and `static` auth.** Once you switch to OAuth, everything from Week 3 that lived in `src/app/functions/` has to move to a backend you host. The card then calls it with `hubspot.fetch()`, with that host listed in `permittedUrls.fetch`. Decide this before you build, not after.

If the app will only ever run in your own account, or one client's, stay on `private` + `static`. It has fewer moving parts.

### Migration

| You're on | How to get to 2026.09 |
| --- | --- |
| 2023.1, 2023.2, 2025.1 | `hs project migrate` |
| 2025.2 | Change `platformVersion` in `hsproject.json` to `2026.09`, then `hs project upload` |
| Legacy public app (not a project) | `hs app migrate` |
| Legacy private app (not a project) | Can't migrate. Start a new project. |

What migration doesn't do for you:

- `environment` values from an old `serverless.json` are not carried over. Re-add each one with `hs secret add`, and list it in `secretKeys` in the function's `*-hsmeta.json`.
- Legacy CRM cards should be converted to app cards first.
- After migration, anything defined in project files can only be edited locally, not in the app's settings in HubSpot.

Last year 2025.1 to 2025.2 meant starting over. That's no longer true.

### Dev vs prod: config profiles

Last week `hs account link` pointed a folder at one account. Config profiles take that further: one project, one profile per environment, each with its own account and its own values.

```
src/hsprofile.qa.json      { "accountId": 11111111, "variables": { "ENV": "QA",   "WEBHOOK_URL": "https://webhook.site/aaa" } }
src/hsprofile.prod.json    { "accountId": 22222222, "variables": { "ENV": "Prod", "WEBHOOK_URL": "https://webhook.site/bbb" } }
```

Any `*-hsmeta.json` can use those variables as `${NAME}`. The kit uses `${ENV}` in the app name and `${WEBHOOK_URL}` as the webhook target, so the QA install sends to one URL and prod sends to another.

```bash
hs project profile add qa        # creates src/hsprofile.qa.json and asks which account
hs project upload -p qa
hs project upload -p prod
hs project dev -p qa
```

Rules:

- Every profile has to define every variable any `*-hsmeta.json` uses, or the upload fails.
- Once a project has profiles, `upload` and `dev` need `-p`.
- Cards can read the same values at runtime as `context.variables.ENV`.

For a second account to test in, use a developer test account (`hs test-account create`) or a developer sandbox (`hs account use <sandbox>`).

### Feature flags

Feature flags are not a general on/off switch for your own features. HubSpot defines three, and you set them per account through the API:

| Flag | What it does |
| --- | --- |
| `hs-release-app-cards` | Roll out new app cards to specific accounts |
| `hs-hide-crm-cards` | Hide legacy CRM cards from accounts that have migrated |
| `hs-release-mcp-server` | Release your app's MCP server |

Each one is `ON` or `OFF`, set as an app-wide default and overridden per account (`PUT /feature-flags/2026-09/{appId}/flags/{flagName}/portals/{portalId}`). A listed app can gate a flag to at most 5 accounts. They're useful for "only our test accounts see the new card". For staging vs production values, use config profiles.

## Security notice: the Node.js serverless CVE

On October 21, 2026, Node.js released fixes for several vulnerabilities, one of them in Brotli decompression (**CVE-2026-111497**). If a function decompresses a malicious response from a server it calls, an attacker can run code. That code can read the function's secrets, its `PRIVATE_APP_ACCESS_TOKEN`, and the request data the function received.

Node 18 and 20 won't get a fix. Affected:

- Design Manager serverless functions (CMS)
- Developer projects on platform **2023.1, 2023.2, or 2025.1**

HubSpot has blocked new builds on those platform versions. Functions that are already deployed keep running until you upgrade. **Redeploying on the old version does not apply the fix.** Upgrade first, then redeploy.

| Your `platformVersion` | What to do |
| --- | --- |
| 2023.1, 2023.2, 2025.1 | `hs project migrate` to 2026.03 or later, then `hs project upload`. Functions move to Node 24. |
| 2025.2, 2026.03, 2026.09 | Nothing. The runtime gets security updates automatically. |
| Design Manager functions | Move them into a developer project. See HubSpot's [migration guide](https://developers.hubspot.com/docs/cms/reference/serverless-functions/migrate-design-manager-serverless-to-projects). |

Also, as a precaution: disable affected functions until they're migrated, and rotate every secret and token they use (`hs secret update`). Functions that call a URL built from user input are the most exposed.

Every project in this repo is on 2026.09.

## 2. Webhooks

A webhook is HubSpot calling *you* when something changes, instead of your card asking. Add one to any project:

```bash
hs project add          # pick "webhooks"
```

That creates `src/app/webhooks/webhooks-hsmeta.json`. There's no single top-level `webhooks.json` like legacy private apps had.

```json
{
  "uid": "rental_webhooks_subscriptions",
  "type": "webhooks",
  "config": {
    "settings": { "targetUrl": "${WEBHOOK_URL}", "maxConcurrentRequests": 10 },
    "subscriptions": {
      "crmObjects": [
        { "subscriptionType": "object.creation", "objectType": "contact", "active": true },
        { "subscriptionType": "object.propertyChange", "objectType": "contact", "propertyName": "zip", "active": true },
        { "subscriptionType": "object.deletion", "objectType": "contact", "active": true }
      ]
    }
  }
}
```

- `crmObjects` uses the generic event types: `object.creation`, `object.deletion`, `object.merge`, `object.restore`, `object.propertyChange`, `object.associationChange`.
- `legacyCrmObjects` takes the older `contact.propertyChange`-style names. Use it only if you're porting existing subscriptions.
- `hubEvents` covers conversations and privacy deletions.
- Each object type needs its read scope in `requiredScopes`. For contacts that's `crm.objects.contacts.read`.

### What arrives, and when

- Events come in **batches**: a POST holds an array of up to 100 events. It isn't instant. Subscription changes can take up to 5 minutes to take effect, so wait a bit before you start debugging.
- Respond within **5 seconds**. Slow responses and any 4xx or 5xx are retried up to 10 times over about 24 hours.
- Order isn't guaranteed and duplicates happen. Sort by `occurredAt`, and dedupe on `eventId`.
- On a real endpoint, check the `X-HubSpot-Signature-v3` header and reject timestamps older than 5 minutes. See [request validation](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/request-validation). webhook.site skips this step, which is fine for a demo and not for production.

You can see every delivery in the app's **Logs** tab under **Webhooks**.

## 3. OAuth vs static tokens

| | Static | OAuth |
| --- | --- | --- |
| Accounts | One | Many |
| Token | `PRIVATE_APP_ACCESS_TOKEN`, built in | One per install, which you store and refresh |
| Serverless functions | Yes | No. Host your own backend. |
| Scopes | `requiredScopes` only | `requiredScopes`, `optionalScopes`, `conditionallyRequiredScopes` |
| `redirectUrls` | Not allowed | At least one is required |

### Standing up OAuth

Start from HubSpot's [oauth-quickstart-nodejs](https://github.com/HubSpot/oauth-quickstart-nodejs). It handles the install redirect, the callback, and the code-for-token exchange. Add a database (we use Postgres) for the access and refresh tokens:

- Access tokens expire in **30 minutes** (`expires_in: 1800`).
- Refresh them with `POST https://api.hubapi.com/oauth/v3/token` and `grant_type=refresh_token`.
- Store one row per installed account (`portalId`).

It's good for learning the flow. It's not hardened for production.

### Where 90% of OAuth problems come from

1. **Scopes don't match.** Every scope in `requiredScopes` has to be in the install URL's `scope` parameter, exactly. If one is missing on either side, the install fails.
2. **Redirect URL doesn't match.** The URL in `redirectUrls` and the one your server sends have to be identical. It must be HTTPS, except for `http://localhost`. To fix one, edit `redirectUrls` and run `hs project upload`.

Check those two first, before anything else. Also, the user installing the app has to be a Super Admin or have permission for every scope requested.

Config profiles help here too. Put `"redirectUrls": ["https://${DOMAIN}/oauth-callback"]` in the app config, and give each profile its own `DOMAIN`.

### Secrets, again

- Secrets live in HubSpot. Nobody can read one back out.
- Everyone keeps their own `.env` for local values. It's in `.gitignore`. Never commit it. GitHub now auto-deactivates leaked HubSpot tokens it finds.
- Rotate with `hs secret update NAME`. The docs disagree on whether running functions pick up the new value without a redeploy. If the old value is still in use after a few minutes, `hs project upload`.

## 4. Telemetry

### Start with what's built in

- The app's **Logs** tab has **Serverless functions** and **Webhooks** views, with the detail for each run.
- From the CLI: `hs app logs --errors-only --tail`. Run `hs app logs --help` for the current flags.

### Then send errors somewhere you'll see them

Sentry and Honeycomb both work. Put the key in a secret, never in code:

```bash
cd src/app/functions && npm install @sentry/node
hs secret add SENTRY_DSN
```

```json
{ "uid": "getRentalHistory", "type": "app-function",
  "config": { "entrypoint": "/app/functions/getRentalHistory.js", "secretKeys": ["SENTRY_DSN"] } }
```

```js
const Sentry = require("@sentry/node");
let ready = false;

async function report(err, context) {
  if (!process.env.SENTRY_DSN) return;
  if (!ready) { Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0 }); ready = true; }
  Sentry.captureException(err, { tags: { portalId: context.portalId } });
  await Sentry.flush(2000);   // the function can stop as soon as it returns
}

exports.main = async (context) => {
  try {
    // ...
  } catch (err) {
    await report(err, context);
    return { statusCode: 500, body: { error: "Couldn't load rental history" } };
  }
};
```

- **Errors only, to start.** Info-level logging from a busy app can hit 30,000+ events a day and use up a free plan in a week.
- Keep `flush` short. It counts toward the 15-second limit.
- This only works in functions, which means `private` + `static` apps. For OAuth apps, put the same code in your own backend.
- Bonus: in Sentry, add an alert rule that posts new issues to a Slack channel. That gives the team one place to triage.

## The process

```
1. Decide      Private + static, private + OAuth, or marketplace. Write down why.
2. Profiles    Add qa and prod profiles. Move anything that differs per environment into variables.
3. Webhooks    hs project add → webhooks. Point it at webhook.site. Trigger an event, watch it land.
4. OAuth       Only if you need more than one account. Quickstart, scopes, redirect URL, token storage.
5. Telemetry   Errors to Sentry or Honeycomb, with the key as a secret. Then a Slack alert.
```

### 1. Run the webhooks kit

```bash
cd week-5/webhooks-kit/RentalWebhooks
```

1. Open [webhook.site](https://webhook.site) in two tabs. Copy each unique URL.
2. In `src/hsprofile.qa.json` and `src/hsprofile.prod.json`, replace `accountId` with an account from `hs account list`, and `WEBHOOK_URL` with one of the URLs. Use a test account for `qa`.
3. Upload and install:
   ```bash
   hs project upload -p qa
   hs project open          # Distribution tab → install
   ```
4. In that account, create a contact. Then change its **Postal code** (`zip`). Watch the webhook.site tab. Give it a minute.
5. Open the app's **Logs** tab → **Webhooks**, and find the same deliveries.
6. Change `WEBHOOK_URL` in the qa profile, upload again, and trigger another event. Note how long it takes to switch.

## Gotchas

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `Profile hsprofile.qa.json is missing an account id` | Placeholder `accountId` still `0` | Put a real account ID from `hs account list` |
| `The account … is defined in your profile … but is missing in your config file` | That account isn't authenticated locally | `hs account auth`, or pick an account from `hs account list` |
| Upload errors about a missing variable | One profile doesn't define a `${VAR}` that an hsmeta uses | Add it to every profile |
| `upload` or `dev` errors asking for a profile | The project has profiles | Add `-p qa` |
| Webhook never arrives | Missing read scope, app not installed, or the change hasn't taken effect yet | Add the scope, install, wait up to 5 minutes, check the Logs tab |
| Same event arrives twice | Retries, by design | Dedupe on `eventId` |
| Build fails after switching to OAuth | Functions need `private` + `static` | Move the functions to your own backend, call it with `hubspot.fetch()` |
| OAuth install fails | Scope list doesn't match the install URL | Make `requiredScopes` and the URL's `scope` identical |
| Redirect error after authorizing | `redirectUrls` doesn't match what the server sends | Make them identical, `hs project upload` |
| Builds blocked on an old project | Platform 2023.x or 2025.1 (Node CVE) | `hs project migrate`, then upload |
| Old secret value still in use | Rotation hasn't reached the function yet | Wait a few minutes, then `hs project upload` |

## Breakout

Pick one, based on where your app is going:

- **Staying private:** add `qa` and `prod` profiles to your Week 3 project. Move one hardcoded value (an API base URL, a label) into a variable. Upload both.
- **Going multi-account:** add a webhook to your project for the object your card shows. Point it at webhook.site and demo one event arriving.
- **Already shipping:** add Sentry to one function, errors only. Break the function on purpose and show the error in Sentry.

## Quiz

1. Your client wants the card in three of their production accounts. Static or OAuth? Private or marketplace?
2. You switch an app with three serverless functions from static to OAuth. What happens to the functions?
3. Name the two causes behind most OAuth install failures.
4. Where does a webhook subscription live in a 2026.09 project?
5. Your webhook fired twice for one contact change. Bug?
6. You want QA installs to post to a different URL than prod. Feature flag or config profile?
7. A project on platform 2025.1 won't build. What happened, and what's the fix?
8. Why should a new telemetry setup start with errors only?

<details>
<summary>Answers</summary>

1. OAuth, and private is enough. Static covers one standard account at a time. Private + OAuth allows up to 10 allowlisted accounts, so you don't need the marketplace.
2. They stop working. Functions need `private` + `static`. Move them to a backend you host and call it with `hubspot.fetch()`.
3. Scopes that don't match between `requiredScopes` and the install URL, and a redirect URL that doesn't match `redirectUrls`.
4. `src/app/webhooks/webhooks-hsmeta.json`, created by `hs project add`.
5. No. Webhooks retry, and duplicates are expected. Dedupe on `eventId`.
6. Config profile. Feature flags are three HubSpot-defined on/off switches, not your own values.
7. HubSpot blocked builds on 2023.x and 2025.1 because Node 18/20 won't get the CVE-2026-111497 fix. Run `hs project migrate` to 2026.03+, then upload.
8. Info-level logs can hit tens of thousands of events a day and burn the plan's budget before you find anything useful.
</details>
