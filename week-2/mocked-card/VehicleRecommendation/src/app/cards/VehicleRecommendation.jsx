import React, { useState } from "react";
import {
  Alert,
  Button,
  DescriptionList,
  DescriptionListItem,
  Divider,
  EmptyState,
  ErrorState,
  Flex,
  Heading,
  LoadingSpinner,
  Spacer,
  StatusTag,
  Text,
  Tile,
  hubspot,
} from "@hubspot/ui-extensions";
import { DataTable } from "hs-uix/datatable";
import {
  MOCK_ALTERNATIVES,
  MOCK_CUSTOMER,
  MOCK_LOCATION,
  MOCK_TOP_PICK,
  MOCK_TRIP,
} from "./mockData";

// Week 2 mockup: no functions, no API calls. Every value comes from
// mockData.js so you can put this in front of a rep and change the design
// in minutes. Wire up real data one slice at a time once the design holds.

const VIEW_MODES = [
  { value: "loaded", label: "Loaded" },
  { value: "loading", label: "Loading" },
  { value: "error", label: "Error" },
  { value: "empty", label: "Empty" },
];

hubspot.extend(({ actions }) => (
  <Extension sendAlert={actions.addAlert} />
));

const Extension = ({ sendAlert }) => {
  const [viewMode, setViewMode] = useState("loaded");

  const offerVehicle = (vehicle) => {
    sendAlert({
      type: "info",
      message: `Mock only: would offer the ${vehicle.vehicleName} to ${MOCK_CUSTOMER.name}.`,
    });
  };

  const alternativeColumns = [
    { field: "vehicleName", label: "Vehicle", width: "auto" },
    { field: "priceLabel", label: "Price", width: "min", cellWidth: "min" },
    { field: "note", label: "Why", width: "min", cellWidth: "min" },
    {
      field: "id",
      label: "",
      width: "min",
      renderCell: (value, row) => (
        <Button variant="transparent" size="xs" onClick={() => offerVehicle(row)}>
          Offer
        </Button>
      ),
    },
  ];

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

    return (
      <Flex direction="column" gap="sm">
        <Tile>
          <Flex direction="column" gap="xs">
            <Text format={{ fontWeight: "demibold" }}>Recommended</Text>
            <Flex direction="row" justify="between" align="center" wrap="wrap" gap="sm">
              <Flex direction="column" gap="flush">
                <Text format={{ fontWeight: "bold" }}>{MOCK_TOP_PICK.vehicleName}</Text>
                <Text>
                  {MOCK_TOP_PICK.priceLabel} · {MOCK_TOP_PICK.tripTotalLabel}
                </Text>
              </Flex>
              <Button variant="primary" onClick={() => offerVehicle(MOCK_TOP_PICK)}>
                Offer this vehicle
              </Button>
            </Flex>
            <Flex direction="row" gap="xs" wrap="wrap">
              {MOCK_TOP_PICK.reasons.map((reason) => (
                <StatusTag key={reason} variant="success">
                  {reason}
                </StatusTag>
              ))}
            </Flex>
          </Flex>
        </Tile>

        <Text format={{ fontWeight: "demibold" }}>Other options at this location</Text>
        <DataTable
          data={MOCK_ALTERNATIVES}
          columns={alternativeColumns}
          showSearch={false}
          showRowCount={false}
          bordered={true}
          flush={true}
        />
      </Flex>
    );
  };

  return (
    <Flex direction="column" gap="sm">
      <Alert title="Mockup" variant="info">
        This card uses sample data. Nothing is connected yet.
      </Alert>

      <Heading>Offer for {MOCK_CUSTOMER.name}</Heading>

      <DescriptionList direction="row">
        <DescriptionListItem label="Past rentals">
          <Text>{MOCK_CUSTOMER.pastRentals}</Text>
        </DescriptionListItem>
        <DescriptionListItem label="Usual class">
          <Text>{MOCK_CUSTOMER.usualClassLabel}</Text>
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
      <Spacer size="small" />
      <Flex direction="row" gap="xs" justify="center">
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
      </Flex>
    </Flex>
  );
};
