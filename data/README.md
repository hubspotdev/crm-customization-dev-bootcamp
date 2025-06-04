# Custom Objects, Properties, and Sample Data 

## Getting started
You need to have Postman setup and configured. If you aren't sure how to do that, [check out this video](https://www.youtube.com/watch?v=U67UTzT6Zn4).

## Step 1 Create the Custom Objects
Utilizing the custom-object JSON files, and the `/crm-object-schemas/v3/schemas` [API Endpoint](https://developers.hubspot.com/docs/api/crm/crm-custom-objects).

Copy the data in the custom-object into the *BODY* of the **POST** request.

### Repeat for each Custom Object
1. Locations
2. Vehicles
3. Rental Agreement

## Step 2 Import the Properties

Utilizing the properties JSON files, and the `/crm/v3/properties/{objectType}/batch/create` [API Endpoint](https://developers.hubspot.com/docs/api/crm/properties).

Copy the data from the JSON files into the *BODY* of the **POST** request.

### Repeat for each Custom Object
1. Locations
2. Vehicles
3. Rental Agreement

### Create the Custom Rollup
1. Name: Number of Available Vehicles
2. Internal Name: number_of_available_vehicles
3. Type: Rollup
   4. Rollup Type: Count
5. Number format: Formatted number
6. Association Record Type: Vehicle
   7. Record Property: Record ID
8. Additional Conditions
   9. Property: Available == Yes

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

If you do not creation the associations between the objects, then you won't be able to map the vehicles and locations.  

Utilizing HubSpot's [Import Feature](https://app.hubspot.com/l/import/), and start importing your data.

Import order:
1. Locations
2. Vehicles

## Need help or have issues
If you have any issues or questions, just message our on the Bootcamp Slack Channel
