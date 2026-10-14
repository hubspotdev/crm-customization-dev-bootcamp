# Cards

## Getting started
Both projects use platform version **2026.09**. After you install the HubSpot CLI (v8.16.0+):

```bash
cd 01.simple_version/RentalCars
hs account info        # make sure this is your developer test account
hs project upload
hs project open        # Distribution tab → install the app
hs project dev
```

The card won't show up in the card library until the app is installed. Card edits hot-reload during `hs project dev`; function edits need another `hs project upload`.

## Project layout (2026.09)

```
RentalCars/
├── hsproject.json                  platformVersion: 2026.09
└── src/app/
    ├── app-hsmeta.json             app config + scopes
    ├── cards/                      card .jsx files + *-hsmeta.json + package.json
    └── functions/                  serverless functions + *-hsmeta.json + package.json
```

Cards call functions by uid: `hubspot.serverless("getLocations", { parameters: { zipCode } })`.

## Simple Version
Perfect as a boilerplate for students to start with. Very bare bones but ready for you to take it to the next level.

## Advanced Version
[Carter](https://hubspot.dad) did an awesome job building out this advanced card. It includes the following features:
- Postal Code (zipcode) lookup
- Distance calcuation from zip code to Location custom object.
- Filter vehicle objects by location, availablility, and type of rental.

This card shows you some of the powerful features of UI extensions.
