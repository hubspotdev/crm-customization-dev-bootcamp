# Week 5 Prompts

Copy these into Claude Code with the HubSpot Developer MCP connected. Run them from inside your project folder. One stage per prompt.

## 1. Decide: static or OAuth

```
Read src/app/app-hsmeta.json and everything in src/app/. Using the HubSpot Developer MCP docs, tell me: my current distribution and auth type, how many accounts I can install into today, and what I'd lose by switching to OAuth (list each serverless function by uid). Then ask me how many accounts this needs to run in before recommending anything. Don't change files.
```

## 2. Add config profiles

```
Add qa and prod config profiles to this project with `hs project profile add`. For qa use account <QA_ACCOUNT_ID>, for prod use <PROD_ACCOUNT_ID>. Find every value in my *-hsmeta.json files that should differ between environments (names, URLs, redirect URLs) and move it into a ${VARIABLE} defined in both profiles. Run hs project validate, then hs project upload -p qa, and tell me what changed.
```

## 3. Add a webhook

```
Using the HubSpot CLI and Developer MCP: add the webhooks feature to this project with hs project add. Check the webhooks schema with get-feature-config-schema first. Subscribe to object.creation and object.propertyChange (property: <property>) for <objectType> in crmObjects, with targetUrl set to ${WEBHOOK_URL} and maxConcurrentRequests 10. Add WEBHOOK_URL to every profile. Add the object's read scope to requiredScopes. Validate, upload with -p qa, and tell me exactly what to change in HubSpot to trigger each event.
```

## 4. Stand up OAuth

```
I need this app installable in more than one account. Using the HubSpot Developer MCP docs and https://github.com/HubSpot/oauth-quickstart-nodejs: switch app-hsmeta.json to auth type oauth, put redirectUrls behind a ${DOMAIN} profile variable, and set up the quickstart next to the project (in a separate folder) with token storage in Postgres (one row per portalId, with access token, refresh token, and expiry). Before you finish, list every scope in requiredScopes next to the scope string in the install URL so I can confirm they match, and list the redirect URL in both places. Tell me which serverless functions stop working and where their logic should move.
```

## 5. Add error telemetry

```
Add Sentry error reporting to the function <uid>. Install @sentry/node in src/app/functions, read the DSN from a secret named SENTRY_DSN (add it to secretKeys in the function's hsmeta), initialize lazily inside the handler, capture exceptions only (no info logs, tracesSampleRate 0), tag with context.portalId, and await Sentry.flush(2000) before returning. Keep the existing { statusCode, body } error shape. Tell me the hs secret add command to run, then upload.
```

## 6. Check for the Node CVE

```
Find every hsproject.json under this folder and list each project's platformVersion. Flag any on 2023.1, 2023.2, or 2025.1 (affected by CVE-2026-111497, Node 18/20). For each flagged project, list its functions and which ones make outbound HTTP calls, then list the secrets in their secretKeys so I can rotate them. Don't migrate anything yet.
```

## 7. Debug a webhook

Paste the webhook.site request or the Logs tab entry.

```
My webhook isn't doing what I expect. Here's webhooks-hsmeta.json, app-hsmeta.json, the profile I uploaded with, and what I saw:

<files and log>

Tell me which of these it is before changing anything: missing read scope, app not installed in that account, wrong profile uploaded, change not yet applied (cached up to 5 minutes), wrong subscriptionType or propertyName, or expected retry/duplicate behavior. Then fix only that.
```
