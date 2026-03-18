import React, { useState } from "react";
import {
  Alert,
  Button,
  Divider,
  EmptyState,
  Flex,
  Input,
  LoadingSpinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  hubspot,
} from "@hubspot/ui-extensions";
import { CrmActionLink } from "@hubspot/ui-extensions/crm";

const ITEMS_PER_PAGE = 10;

// Define the extension to be run within the HubSpot CRM
hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <Extension
    context={context}
    runServerless={runServerlessFunction}
    sendAlert={actions.addAlert}
    fetchProperties={actions.fetchCrmObjectProperties}
    actions={actions}
  />
));

const Extension = ({
  context,
  runServerless,
  sendAlert,
  fetchProperties,
  actions,
}) => {
  const [locations, setLocations] = useState([]);
  const [locationCount, setLocationCount] = useState(0);
  const [locationFetching, setLocationFetching] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zipCode, setZipCode] = useState("");

  const numPages = Math.ceil(locationCount / ITEMS_PER_PAGE);

  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= numPages) {
      setCurrentPage(newPage);
    }
  };

  const locationsOnCurrentPage = locations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function fetchLocations() {
    sendAlert({ message: "Fetching locations...", type: "info" });
    setLocationFetching(true);
    setError(null);

    runServerless({ name: "getLocations", parameters: { zipCode } })
      .then((resp) => {
        setLocations(resp.response.results || []);
        setLocationCount(resp.response.total || 0);
        setCurrentPage(1);
      })
      .catch((err) => {
        console.error("Error fetching locations:", err);
        setError("Failed to fetch locations. Please try again.");
        setLocations([]);
        setLocationCount(0);
      })
      .finally(() => {
        setLocationFetching(false);
      });
  }

  return (
    <Flex direction="column" gap="sm">
      <Flex direction="row" justify="start" gap="sm" align="end">
        <Input
          name="zipCode"
          label="Zip Code"
          value={zipCode}
          onChange={(e) => setZipCode(e)}
        />
        <Button
          onClick={fetchLocations}
          variant="primary"
          size="sm"
          type="button"
        >
          Search!
        </Button>
      </Flex>
      <Divider />
      {error && (
        <Alert title="Error" variant="error">
          {error}
        </Alert>
      )}
      {locationFetching ? (
        <Flex align="center" justify="center">
          <LoadingSpinner size="sm" />
        </Flex>
      ) : locations.length === 0 ? (
        <EmptyState title="No locations found">
          <Text>
            Enter a zip code and click Search to find rental locations.
          </Text>
        </EmptyState>
      ) : (
        <Table
          bordered={true}
          flush={true}
          paginated={true}
          page={currentPage}
          pageCount={numPages}
          onPageChange={(newPage) => changePage(newPage)}
        >
          <TableHead>
            <TableRow>
              <TableHeader width="min">Zip</TableHeader>
              <TableHeader width="auto">Address</TableHeader>
              <TableHeader width="min">Available Vehicles</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {locationsOnCurrentPage.map((location) => (
              <TableRow key={location.id}>
                <TableCell width="min">
                  <CrmActionLink
                    actionType="PREVIEW_OBJECT"
                    actionContext={{
                      objectTypeId: "p_locations",
                      objectId: location.id,
                    }}
                  >
                    {location.properties.postal_code}
                  </CrmActionLink>
                </TableCell>
                <TableCell width="auto">
                  {[
                    location.properties.address_1,
                    location.properties.city,
                    location.properties.state,
                  ]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </TableCell>
                <TableCell width="min">
                  {location.properties.number_of_available_vehicles || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Flex>
  );
};
