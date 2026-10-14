# Build Plan

Fill this in once the user has approved the mockup. It turns "what the card shows" into "what we have to build," and it becomes the prompt for Week 3. Work through it one slice at a time.

## 1. Every value on the card

One row per value shown in the mockup. If it's in `mockData.js`, it goes here.

| Value on card | Real source (object.property / API) | How we get it (`useCrmProperties`, association, function) | Done |
| --- | --- | --- | --- |
| | | | [ ] |

## 2. Functions

| Function uid | What it does | Parameters | Returns | Scopes needed |
| --- | --- | --- | --- | --- |
| | | | | |

## 3. Scopes

Add these to `requiredScopes` in `src/app/app-hsmeta.json`:

- [ ] `crm.objects.contacts.read`
- [ ]

## 4. Actions

What happens when the user clicks something?

| Button / action | Result | Writes to CRM? |
| --- | --- | --- |
| | | |

## 5. States

- [ ] **Loading:** what shows while data loads?
- [ ] **Empty:** what if there's nothing to show (no past rentals, no available vehicles)?
- [ ] **Error:** what if a function fails? What can the user do about it?
- [ ] **Partial:** what if some data loads and some doesn't?

## 6. Slice order

The order you'll replace mocked values with real ones. Start with the one that has the least risk.

1. Contact name (`useCrmProperties`)
2.
3.

---

## Example: Vehicle Recommendation (first rows)

| Value on card | Real source | How we get it | Done |
| --- | --- | --- | --- |
| Customer name | contact.firstname, contact.lastname | `useCrmProperties` | [x] |
| Past rentals count | Rental Agreements associated with the contact | Function `getRentalHistory` | [ ] |
| Usual class / price | Most common vehicle `model` and avg `cost_per_day` across past agreements | Function `getRentalHistory` | [ ] |
| Nearest location | p_locations, by contact zip → lat/lng | Function `getNearestLocation` | [ ] |
| Top pick + alternatives | p_vehicles at that location where `available = true`, ranked against usual class/price | Function `getVehicleOptions` | [ ] |
| Trip total | `daily_price × days` | Computed in the card | [ ] |

| Button / action | Result | Writes to CRM? |
| --- | --- | --- |
| Offer this vehicle / Offer | Opens the booking panel for that vehicle | No |
| Create rental | Creates a Rental Agreement (`start_date`, `end_date`, `insurance`, `cost_per_day`, `total_days`) associated with the contact and vehicle; marks the vehicle unavailable | Yes, function `createRental` |
| Send confirmation | Emails the customer their booking | Yes (email / timeline). Decide: HubSpot email, or a note on the contact? |
| View agreement | Opens the new Rental Agreement record | No (`CrmActionLink`) |
