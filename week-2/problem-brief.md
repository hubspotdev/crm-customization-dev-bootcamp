# Problem Brief

Fill this in **before** you design or build anything. Interview the user, then watch them do the task without the card.

## Template

| Field | Answer |
| --- | --- |
| User | |
| Where they are (record / surface) | |
| Decision or job | |
| Data they need, and where it lives today | |
| What they do today without the card | |
| What success looks like | |

**Observed while watching** (tab switches, copy/paste, hesitations, mental math):

-

---

## Example: rental sales rep

| Field | Answer |
| --- | --- |
| User | Rental sales rep handling inbound calls |
| Where they are (record / surface) | Contact record, Rental tab, usually while on the phone |
| Decision or job | Which vehicle to offer this customer for their trip, and from which location |
| Data they need, and where it lives today | Customer's past rentals (Rental Agreement records), which vehicle class they usually book, the nearest location (Locations object), which vehicles are available there and their daily price (Vehicles object) |
| What they do today without the card | Opens past rental agreements one by one to see what the customer booked before, looks up the nearest location in a separate tab, filters the Vehicles list by location and availability, works out the trip total by hand |
| What success looks like | Makes an offer in under a minute, the vehicle is actually available at the nearest location, and the price is close to what the customer usually pays |

**Observed while watching:**

- Opened 3 rental agreements to find the customer's usual class, then went back to the contact
- Copied the customer's zip code into a maps tab to find the nearest location
- Filtered Vehicles by location, then by "Available = Yes", then sorted by price
- Did `daily price × days` in their head and got it wrong once
- Never looked at odometer, VIN or vehicle year. They don't matter for the offer.

**What this tells us the card needs:** usual class and price from past rentals, the nearest location, available vehicles there ranked against the usual class and price, a trip total, and one clear "offer this" action. No VIN, no odometer.
