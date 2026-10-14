# Week 2 Prompts

Copy these into Claude Code (or your agent of choice) with the HubSpot Developer MCP connected. Run them from inside your project folder. `hs mcp setup` is per project.

Each prompt does **one** stage. Don't merge them.

## 1. Setup

```
Using the HubSpot CLI and Developer MCP: scaffold a private, static-auth app on platform 2026.09 named rental_project with one app card on contacts and one app function. Upload it, install it into my developer test account, and tell me the account ID you deployed to.
```

Then check: `platformVersion` is `2026.09`, `hs account info` shows a developer test account, and the app is installed (Distribution tab).

## 2. Problem brief

Paste your interview notes and what you saw while watching the user.

```
Here are my notes from interviewing and watching the user. Fill in problem-brief.md from them. Don't invent anything that isn't in my notes; if a row is missing information, write "UNKNOWN" and list the question I should ask the user.

<notes>
...
</notes>
```

## 3. Mockup

```
Using the problem brief in problem-brief.md, build a static mockup of the app card in src/app/cards/.

Rules:
- Use the hubspot-card-design skill: pick a card archetype, and use @hubspot/ui-extensions and hs-uix components only.
- Hardcoded sample data only, all of it in a separate mockData.js file. No serverless functions, no API calls, no CRM hooks.
- Show only what the brief says the user needs to make the decision. Leave out anything the user didn't look at.
- Buttons should call actions.addAlert to say what they would do.
- Run the skill's self-review checklist before you finish.

Then run hs project dev and tell me which record to open.
```

## 4. Iterate on the mockup

Use the user's own words.

```
I showed the mockup to the user. Their reactions:
- ...
Change the mockup to address these. Keep it static, and only edit the card and mockData.js.
```

## 5. Build plan

```
The user approved this mockup. Fill in build-plan.md: one row for every value in mockData.js with its real source in the CRM, the functions we need (uid, parameters, return shape), the scopes to add to app-hsmeta.json, what each button does, and the loading/empty/error states. Use our custom objects in data/ for property names. Don't write any code yet.
```

## 6. First slice

```
Do slice 1 from build-plan.md only: replace the mocked customer name with the contact's real firstname and lastname using useCrmProperties. Remove that value from mockData.js. Handle the loading state. Don't touch anything else.
```

---

## One-shot (for comparison)

This is the "before." It's what most people type first. The result is in [`one-shot/`](one-shot/).

```
Build me a HubSpot app card for our car rental company. It should go on the contact record and recommend which vehicle a sales rep should offer the customer. Use our custom objects (p_vehicles and p_locations) and serverless functions to get the data. Make it look good and production-ready.
```
