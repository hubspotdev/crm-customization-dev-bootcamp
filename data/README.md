# Custom Objects, Properties, and Sample Data 

## Getting started
You need to have Postman setup and configured. If you aren't sure how to do that, [check out this video](https://www.youtube.com/watch?v=U67UTzT6Zn4).

## Step 1 Create the Custom Objects
Using the custom-object JSON files, make a **POST** request to:

```
POST https://api.hubapi.com/crm/v3/schemas
```

[API Docs: Custom Objects](https://developers.hubspot.com/docs/api/crm/crm-custom-objects)

Copy the contents of each JSON file into the **Body** of the request.

> **Important:** Create them in this order. Later steps depend on these objects existing first.

1. `1.custom-object-locations.json`
2. `1.custom-object-vehicles.json`
3. `1.custom-object-rental-agreement.json`

After each request succeeds, note the `objectTypeId` in the response (e.g. `2-12345678`). You will need these IDs for Step 2.

## Step 2 Import the Properties

Using the properties JSON files, make a **POST** request to:

```
POST https://api.hubapi.com/crm/v3/properties/{objectTypeId}/batch/create
```

[API Docs: Properties](https://developers.hubspot.com/docs/api/crm/properties)

Replace `{objectTypeId}` with the ID you got from Step 1 for each object. Copy the contents of the matching JSON file into the **Body** of the request.

1. `2.properties-locations.json` -> use the Locations `objectTypeId`
2. `2.properties-vehicles.json` -> use the Vehicles `objectTypeId`
3. `2.properties-rental-agreement.json` -> use the Rental Agreements `objectTypeId`

### A note about number formatting

Some number properties need to be set to **unformatted** in HubSpot, otherwise they display with comma separators (e.g. `06040` becomes `6,040`) which can break CRM cards and look wrong to users. The JSON files in this repo already have `"numberDisplayHint": "unformatted"` set where needed, but if you create properties manually, watch out for:

- **Postal Code** — zip codes like `06040` will display as `6,040` if formatted
- **Lat / Lng** — geographic coordinates should never have comma separators

If you already created the properties and need to fix this, go to **Settings > Properties**, find the property, and change the **Number Format** to **Unformatted**.

### Create the Custom Rollup
- *Name*: Number of Available Vehicles
- *Internal Name*: number_of_available_vehicles
- *Type*: Rollup
  - *Rollup Type*: Count
- *Number Format*: Formatted number
- *Association Record Type*: Vehicle
  - *Record Property*: Record ID
- *Additional Conditions*
  - *Property*: Available == Yes

![alt text](https://github.com/hubspotdev/crm-customization-dev-bootcamp/blob/main/data/number_of_available_vehicles.png?raw=true)

## Step 3 Create the Associations

Within your HubSpot CRM Sandbox account, create the following associations.

### Locations
* *One to Many* :: Vehicles.

### Vehicles
* *Many to One* :: Location.
* *Many to Many* :: Rental Agreements.

### Rental Agreements
* *Many to Many* :: Companies.
* *Many to Many* :: Contacts.
* *One to One* :: Deal.
* *Many to Many* :: Vehicles.

## Step 4 Import the Data

> **Important:** You must create the associations in Step 3 **before** importing data. Otherwise you won't be able to map relationships between vehicles and locations during the import.

Using HubSpot's [Import Feature](https://app.hubspot.com/l/import/), import your data in this order:

1. `3.crm-bootcamp-locations.csv`
2. `3.crm-bootcamp-vehicles.csv`

## Need help or have issues
If you have any issues or questions, message us on the Bootcamp Slack Channel.
