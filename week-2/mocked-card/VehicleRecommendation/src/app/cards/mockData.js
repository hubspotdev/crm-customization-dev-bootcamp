// Everything the card shows comes from this file during the mockup stage.
// Display labels are already formatted here so the card only renders them.
// In the "first slice" step you replace one value at a time with real data
// and delete it from here. When this file is empty, the card is built.

export const MOCK_CUSTOMER = {
  name: "Jordan Rivera",
  email: "jordan.rivera@example.com",
  usualRentalLabel: "Midsize, $95/day (3 rentals)",
};

// Dates use the DateInput shape: month starts at 0 (9 = October).
export const MOCK_TRIP = {
  pickupDate: { year: 2026, month: 9, date: 20 },
  returnDate: { year: 2026, month: 9, date: 24 },
  label: "Oct 20 – 24 (4 days)",
};

export const MOCK_LOCATION = {
  name: "Grass Valley",
  label: "Grass Valley, CA (4.2 mi)",
};

export const MOCK_INSURANCE_PER_DAY = 15;

export const MOCK_TOP_PICK = {
  id: "v-101",
  vehicleName: "2022 Subaru Outback",
  dailyPrice: 89,
  priceLabel: "$89/day · $356 total",
  reasons: ["Matches usual class", "Under usual price", "Available now"],
};

export const MOCK_ALTERNATIVES = [
  { id: "v-102", vehicleName: "2023 Toyota Camry", dailyPrice: 112, priceLabel: "$112/day", totalLabel: "$448", note: "Upgrade" },
  { id: "v-103", vehicleName: "2021 Honda Civic", dailyPrice: 64, priceLabel: "$64/day", totalLabel: "$256", note: "Budget" },
  { id: "v-104", vehicleName: "2022 Ford Transit", dailyPrice: 140, priceLabel: "$140/day", totalLabel: "$560", note: "More seats" },
];

// What "Create rental" would write to a Rental Agreement record.
// Used when you jump straight to the Booked view from the state toggle.
export const MOCK_BOOKING = {
  agreementId: "RA-1042",
  vehicle: MOCK_TOP_PICK,
  pickupDate: MOCK_TRIP.pickupDate,
  returnDate: MOCK_TRIP.returnDate,
  insurance: true,
  notes: "",
};
