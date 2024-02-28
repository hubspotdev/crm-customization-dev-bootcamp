import {
  Button,
  DateInput,
  DescriptionList,
  DescriptionListItem,
  Divider,
  Flex,
  Input,
  Link,
  LoadingSpinner,
  MultiSelect,
  NumberInput,
  Select,
  StepIndicator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  ToggleGroup,
  hubspot
} from "@hubspot/ui-extensions";
import _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from "react";

import {
  CrmActionButton,
  CrmActionLink,
  CrmCardActions
} from '@hubspot/ui-extensions/crm';


const ITEMS_PER_PAGE = 10;

// Define the extension to be run within the Hubspot CRM
hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <Extension
    context={context}
    runServerless={runServerlessFunction}
    sendAlert={actions.addAlert}
    fetchProperties={actions.fetchCrmObjectProperties}
  />
));

const Extension = ({ context, runServerless, sendAlert, fetchProperties }) => {

  const [locations, setLocations] = useState([]);
  const [locationsOnPage, setLocationsOnPage] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesOnPage, setVehiclesOnPage] = useState([]);

  const [locationCount, setLocationCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [locationFetching, setLocationFetching] = useState(false);

  const [locationPage, setLocationPage] = useState(1);

  const [zipCode, setZipCode] = useState("");


  const [currentPage, setCurrentPage] = useState(1); // For controlling current page
  const [numPages, setNumPages] = useState(0); // For storing the total number of pages

  // Function to change the current page
  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= numPages) {
      setCurrentPage(newPage);
    }
  };

  // Whenever the locationCount or locations change, reset the paging
  useEffect(() => {
    setNumPages(Math.ceil(locationCount / ITEMS_PER_PAGE));
    setCurrentPage(1);
  }, [locationCount, locations]);

  // Calculate the slice of locations for the current page
  const locationsOnCurrentPage = locations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );



  function fetchLocations() {
    sendAlert({ message: "Fetching locations...", type: "info" });
    setLocationFetching(true);
    runServerless({ name: "getLocations", parameters: { "zipCode": zipCode } }).then((resp) => {
      setLocations(resp.response.results);
      setLocationCount(resp.response.total);
      setLocationFetching(false);
      //reset the table
      setLocationPage(1);
    })

  }

  const debouncedFetchLocations = _.debounce(fetchLocations, 500);


  return (
    <>
      <Flex direction="column" gap="sm">
        <Flex direction="row" justify="start" gap="sm" align="end">
          <Input
            name="zipCode"
            label="Zip Code"
            value={zipCode}
            onChange={(e) => setZipCode(e)}
          />
          <Button
            onClick={() => {
              fetchLocations();
            }}
            variant="primary"
            size="md"
            type="button"
          >
            Search!
          </Button>
        </Flex>
        <Divider />
        <Text>
          {locationFetching && <LoadingSpinner />}
        </Text>
      </Flex>
      <Table
        bordered={true}
        paginated={true}
        pageCount={numPages}
        onPageChange={(newPage) => changePage(newPage)}
      >
        <TableHead>
          <TableRow>
            <TableHeader>Zip</TableHeader>
            <TableHeader>Address</TableHeader>
            <TableHeader>Available Vehicles</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {locationsOnCurrentPage.map((location, index) => {
            return (
              <TableRow>
                <TableCell>
                  <CrmActionLink
                    actionType="PREVIEW_OBJECT"
                    actionContext={{
                      objectTypeId: "2-19860301",
                      objectId: location.id
                    }}
                    variant="secondary"
                  >
                    {location.properties.postal_code}
                  </CrmActionLink>
                </TableCell>
                <TableCell>{location.properties.address_1 + " " + location.properties.city + ", " + location.properties.state}</TableCell>
                <TableCell>{location.properties.number_of_available_vehicles}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};
