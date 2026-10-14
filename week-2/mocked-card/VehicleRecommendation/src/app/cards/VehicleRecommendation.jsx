import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  DescriptionList,
  DescriptionListItem,
  Divider,
  EmptyState,
  ErrorState,
  Flex,
  Inline,
  LoadingSpinner,
  Panel,
  PanelBody,
  PanelFooter,
  StatusTag,
  Text,
  Tile,
  hubspot,
} from "@hubspot/ui-extensions";
import { DataTable } from "hs-uix/datatable";
import { FormBuilder } from "hs-uix/form";
import { formatCurrency, formatDate } from "hs-uix/utils";
import {
  MOCK_ALTERNATIVES,
  MOCK_BOOKING,
  MOCK_CUSTOMER,
  MOCK_INSURANCE_PER_DAY,
  MOCK_LOCATION,
  MOCK_TOP_PICK,
  MOCK_TRIP,
} from "./mockData";

// Week 2 mockup: no functions, no API calls. Every value comes from
// mockData.js so you can put this in front of a rep and change the design
// in minutes. Wire up real data one slice at a time once the design holds.
//
// Flow: Recommend → Offer (booking panel) → Create rental → Booked.

const VIEW_MODES = [
  { value: "recommend", label: "Recommend" },
  { value: "booked", label: "Booked" },
  { value: "loading", label: "Loading" },
  { value: "error", label: "Error" },
  { value: "empty", label: "Empty" },
];

const BOOKING_FIELDS = [
  { name: "pickupDate", type: "date", label: "Pickup date", required: true },
  { name: "returnDate", type: "date", label: "Return date", required: true },
  {
    name: "insurance",
    type: "toggle",
    label: "Add insurance",
    description: `${formatCurrency(MOCK_INSURANCE_PER_DAY)}/day`,
    colSpan: 2,
  },
  { name: "notes", type: "textarea", label: "Notes for the location", width: "full" },
];

const INITIAL_BOOKING_VALUES = {
  pickupDate: MOCK_TRIP.pickupDate,
  returnDate: MOCK_TRIP.returnDate,
  insurance: false,
  notes: "",
};

const toDate = (d) => (d ? new Date(d.year, d.month, d.date) : null);

const countDays = (pickup, dropoff) => {
  const start = toDate(pickup);
  const end = toDate(dropoff);
  if (!start || !end) return 0;
  return Math.max(Math.round((end - start) / 86400000), 0);
};

const priceBooking = ({ vehicle, pickupDate, returnDate, insurance }) => {
  const days = countDays(pickupDate, returnDate);
  const rental = vehicle.dailyPrice * days;
  const insuranceTotal = insurance ? MOCK_INSURANCE_PER_DAY * days : 0;
  return {
    days,
    rentalLabel: formatCurrency(rental),
    insuranceLabel: insurance ? formatCurrency(insuranceTotal) : "--",
    totalLabel: formatCurrency(rental + insuranceTotal),
    datesLabel: `${formatDate(toDate(pickupDate))} – ${formatDate(toDate(returnDate))}`,
  };
};

hubspot.extend(({ actions }) => (
  <Extension sendAlert={actions.addAlert} closeOverlay={actions.closeOverlay} />
));

const Extension = ({ sendAlert, closeOverlay }) => {
  const [viewMode, setViewMode] = useState("recommend");
  const [booking, setBooking] = useState(MOCK_BOOKING);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const createRental = (vehicle, values, panelId) => {
    setBooking({ ...MOCK_BOOKING, vehicle, ...values });
    setConfirmationSent(false);
    setViewMode("booked");
    closeOverlay(panelId);
    sendAlert({ type: "success", message: `Rental ${MOCK_BOOKING.agreementId} created for ${MOCK_CUSTOMER.name}.` });
  };

  const sendConfirmation = () => {
    setConfirmationSent(true);
    sendAlert({ type: "info", message: `Mock only: would email the confirmation to ${MOCK_CUSTOMER.email}.` });
  };

  const bookingPanel = (vehicle) => (
    <BookingPanel
      vehicle={vehicle}
      onCreate={createRental}
      closeOverlay={closeOverlay}
    />
  );

  const renderBody = () => {
    if (viewMode === "loading") {
      return (
        <Flex direction="row" justify="center">
          <LoadingSpinner label="Loading vehicles..." layout="centered" showLabel={true} />
        </Flex>
      );
    }

    if (viewMode === "error") {
      return (
        <ErrorState title="Trouble loading vehicles.">
          <Text>Please try again in a few moments.</Text>
        </ErrorState>
      );
    }

    if (viewMode === "empty") {
      return (
        <EmptyState title="No vehicles available" layout="vertical" reverseOrder={false}>
          <Text>No vehicles are available at this location for these dates.</Text>
        </EmptyState>
      );
    }

    if (viewMode === "booked") {
      return (
        <BookedView
          booking={booking}
          confirmationSent={confirmationSent}
          onSendConfirmation={sendConfirmation}
          onViewAgreement={() =>
            sendAlert({ type: "info", message: `Mock only: would open rental agreement ${booking.agreementId}.` })
          }
          onStartOver={() => setViewMode("recommend")}
        />
      );
    }

    return (
      <RecommendView
        bookingPanel={bookingPanel}
        alternatives={MOCK_ALTERNATIVES}
        topPick={MOCK_TOP_PICK}
      />
    );
  };

  return (
    <Flex direction="column" gap="sm">
      <DescriptionList direction="row">
        <DescriptionListItem label="Customer">
          <Text>{MOCK_CUSTOMER.name}</Text>
        </DescriptionListItem>
        <DescriptionListItem label="Usually rents">
          <Text>{MOCK_CUSTOMER.usualRentalLabel}</Text>
        </DescriptionListItem>
        <DescriptionListItem label="Trip">
          <Text>{MOCK_TRIP.label}</Text>
        </DescriptionListItem>
        <DescriptionListItem label="Nearest location">
          <Text>{MOCK_LOCATION.label}</Text>
        </DescriptionListItem>
      </DescriptionList>

      {renderBody()}

      <Divider />
      <Flex direction="row" justify="between" align="center" wrap="wrap" gap="sm">
        <Text variant="microcopy">Mockup: sample data, nothing is connected yet.</Text>
        <Inline gap="xs">
          {VIEW_MODES.map((mode) => (
            <Button
              key={mode.value}
              size="xs"
              variant={viewMode === mode.value ? "secondary" : "transparent"}
              onClick={() => setViewMode(mode.value)}
            >
              {mode.label}
            </Button>
          ))}
        </Inline>
      </Flex>
    </Flex>
  );
};

const RecommendView = ({ topPick, alternatives, bookingPanel }) => {
  const alternativeColumns = [
    { field: "vehicleName", label: "Vehicle", width: "auto" },
    { field: "priceLabel", label: "Daily", width: "min", cellWidth: "min" },
    { field: "totalLabel", label: "Trip total", width: "min", cellWidth: "min" },
    { field: "note", label: "Why", width: "min", cellWidth: "min" },
    {
      field: "id",
      label: "",
      width: "min",
      renderCell: (value, row) => (
        <Button variant="transparent" size="xs" overlay={bookingPanel(row)}>
          Offer
        </Button>
      ),
    },
  ];

  return (
    <Flex direction="column" gap="sm">
      <Tile>
        <Flex direction="row" align="center" gap="md">
          <Box flex={1}>
            <Flex direction="column" gap="xs">
              <Text variant="microcopy">Recommended</Text>
              <Text format={{ fontWeight: "demibold" }}>{topPick.vehicleName}</Text>
              <Text>{topPick.priceLabel}</Text>
              <Inline gap="sm">
                {topPick.reasons.map((reason) => (
                  <StatusTag key={reason} variant="success">
                    {reason}
                  </StatusTag>
                ))}
              </Inline>
            </Flex>
          </Box>
          <Box flex="none">
            <Button variant="primary" overlay={bookingPanel(topPick)}>
              Offer this vehicle
            </Button>
          </Box>
        </Flex>
      </Tile>

      <Text format={{ fontWeight: "demibold" }}>Other options at this location</Text>
      <DataTable
        data={alternatives}
        columns={alternativeColumns}
        showSearch={false}
        showRowCount={false}
        bordered={true}
        flush={true}
      />
    </Flex>
  );
};

// Opens when the rep offers a vehicle and the customer says yes.
// "Create rental" is what will write the Rental Agreement record in Week 3.
const BookingPanel = ({ vehicle, onCreate, closeOverlay }) => {
  const panelId = `book-${vehicle.id}`;
  const formRef = useRef();
  const [values, setValues] = useState(INITIAL_BOOKING_VALUES);
  const price = priceBooking({ vehicle, ...values });

  return (
    <Panel id={panelId} title="Book rental" width="medium" variant="modal">
      <PanelBody>
        <Flex direction="column" gap="md">
          <DescriptionList direction="row">
            <DescriptionListItem label="Customer">
              <Text>{MOCK_CUSTOMER.name}</Text>
            </DescriptionListItem>
            <DescriptionListItem label="Vehicle">
              <Text>{vehicle.vehicleName}</Text>
            </DescriptionListItem>
            <DescriptionListItem label="Pickup location">
              <Text>{MOCK_LOCATION.name}</Text>
            </DescriptionListItem>
          </DescriptionList>

          <FormBuilder
            ref={formRef}
            columns={2}
            fields={BOOKING_FIELDS}
            initialValues={INITIAL_BOOKING_VALUES}
            onChange={setValues}
            submitPosition="none"
            onSubmit={(submitted) => onCreate(vehicle, submitted, panelId)}
          />

          <Divider />

          <DescriptionList direction="row">
            <DescriptionListItem label={`Rental (${price.days} days)`}>
              <Text>{price.rentalLabel}</Text>
            </DescriptionListItem>
            <DescriptionListItem label="Insurance">
              <Text>{price.insuranceLabel}</Text>
            </DescriptionListItem>
            <DescriptionListItem label="Total">
              <Text format={{ fontWeight: "demibold" }}>{price.totalLabel}</Text>
            </DescriptionListItem>
          </DescriptionList>
        </Flex>
      </PanelBody>
      <PanelFooter>
        <Flex direction="column">
          <Flex direction="row" justify="between">
            <Button variant="secondary" onClick={() => closeOverlay(panelId)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => formRef.current?.submit()}>
              Create rental
            </Button>
          </Flex>
        </Flex>
      </PanelFooter>
    </Panel>
  );
};

const BookedView = ({ booking, confirmationSent, onSendConfirmation, onViewAgreement, onStartOver }) => {
  const price = priceBooking(booking);

  return (
    <Flex direction="column" gap="sm">
      <Tile>
        <Flex direction="row" align="center" gap="md">
          <Box flex={1}>
            <Flex direction="column" gap="xs">
              <Inline gap="sm" align="center">
                <StatusTag variant="success">Reserved</StatusTag>
                <Text variant="microcopy">Rental agreement {booking.agreementId}</Text>
              </Inline>
              <Text format={{ fontWeight: "demibold" }}>{booking.vehicle.vehicleName}</Text>
              <Text>
                {price.datesLabel} · {MOCK_LOCATION.name}
              </Text>
            </Flex>
          </Box>
          <Box flex="none">
            {confirmationSent ? (
              <StatusTag variant="info">Confirmation sent</StatusTag>
            ) : (
              <Button variant="primary" onClick={onSendConfirmation}>
                Send confirmation
              </Button>
            )}
          </Box>
        </Flex>
      </Tile>

      <DescriptionList direction="row">
        <DescriptionListItem label={`Rental (${price.days} days)`}>
          <Text>{price.rentalLabel}</Text>
        </DescriptionListItem>
        <DescriptionListItem label="Insurance">
          <Text>{price.insuranceLabel}</Text>
        </DescriptionListItem>
        <DescriptionListItem label="Total">
          <Text format={{ fontWeight: "demibold" }}>{price.totalLabel}</Text>
        </DescriptionListItem>
        <DescriptionListItem label="Notes">
          <Text>{booking.notes || "--"}</Text>
        </DescriptionListItem>
      </DescriptionList>

      <Flex direction="row" gap="sm">
        <Button variant="secondary" onClick={onViewAgreement}>
          View agreement
        </Button>
        <Button variant="transparent" onClick={onStartOver}>
          Start a new offer
        </Button>
      </Flex>
    </Flex>
  );
};
