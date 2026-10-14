# One-Shot Card (the "before")

Claude Code built [`VehicleRecommender/`](VehicleRecommender) from this single prompt. It had no problem brief, no user interview, and no mockup:

```
Build me a HubSpot app card for our car rental company. It should go on the contact record and recommend which vehicle a sales rep should offer the customer. Use our custom objects (p_vehicles and p_locations) and serverless functions to get the data. Make it look good and production-ready.
```

It's checked in **exactly as generated**. Don't fix it. It's here to compare against [`../mocked-card`](../mocked-card/VehicleRecommendation).

## What happened when we uploaded it

`hs project validate` passed. `hs project upload` failed:

```
The extension has an invalid value of RIGHT_SIDEBAR in the `location` property.
This currently only accepts these values; [crm.record.tab, crm.record.sidebar, crm.preview, helpdesk.sidebar].
```

The AI made up a config value that looked plausible. Validation doesn't catch everything; only a real upload does. (The fix is one line: `"location": "crm.record.sidebar"`. Try it live.)

## What it built

About 380 lines: one card and one ~200-line function. The function pages through up to 500 vehicles, searches locations, reads associations, and scores every vehicle on type match, budget, location and condition (mileage and year). The rep picks a budget and vehicle class, and the card shows the top 3.

## Compare it with the mockup

| | One-shot | Designed first |
| --- | --- | --- |
| Who it assumed the user was | A rep who knows the customer's budget and preferred class | A rep on a call who **doesn't** know those yet and has to dig through past rentals for them |
| Where it lives | Sidebar (invented value) | Record tab, with room for a comparison |
| What it asks the rep to enter | Budget + vehicle class | Nothing. Usual class and price come from rental history. |
| Data it uses that the rep ignores | Odometer, model year | — |
| Data it leaves out | Past rentals, trip total, nearest location | All shown |
| Code to throw away if the design changes | The scoring function and most of the card | `mockData.js` |

The one-shot card isn't bad code. It answers a question nobody asked. In the [problem brief](../problem-brief.md), watching the rep showed that the hard part is figuring out what the customer usually rents. The one-shot card makes the rep supply that answer themselves.
