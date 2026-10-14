// Everything the card shows comes from this file during the mockup stage.
// Display values (prices, labels, totals) are already formatted here so the
// card only renders them. In the "first slice" step you replace one value at
// a time with real data and delete it from here. When this file is empty,
// the card is built.

export const MOCK_CUSTOMER = {
  name: "Jordan Rivera",
  pastRentals: 3,
  usualClassLabel: "Midsize · $95/day",
};

export const MOCK_TRIP = {
  pickupDate: "Oct 20",
  returnDate: "Oct 24",
  days: 4,
  label: "Oct 20 – Oct 24 (4 days)",
};

export const MOCK_LOCATION = {
  address: "560 Penstock Drive, Grass Valley, CA 95945",
  distanceMiles: 4.2,
  label: "560 Penstock Drive, Grass Valley, CA 95945 (4.2 mi)",
};

export const MOCK_TOP_PICK = {
  id: "v-101",
  vehicleName: "2022 Subaru Outback",
  priceLabel: "$89/day",
  tripTotalLabel: "$356 for the trip",
  reasons: ["Matches usual class", "Under usual price", "Available now"],
};

export const MOCK_ALTERNATIVES = [
  { id: "v-102", vehicleName: "2023 Toyota Camry", priceLabel: "$112/day", note: "Upgrade" },
  { id: "v-103", vehicleName: "2021 Honda Civic", priceLabel: "$64/day", note: "Budget" },
  { id: "v-104", vehicleName: "2022 Ford Transit", priceLabel: "$140/day", note: "More seats" },
];
