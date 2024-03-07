import React, { useState, useEffect } from "react";
import _ from 'lodash';
import moment from 'moment';
import {
  Divider,
  Button,
  Flex,
  hubspot,
  DateInput,
  NumberInput,
  MultiSelect,
  Select,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Text,
  Input,
  LoadingSpinner,
  StepIndicator,
  Link,
  DescriptionList,
  DescriptionListItem,
  ToggleGroup
} from "@hubspot/ui-extensions";

import {
  CrmCardActions,
  CrmActionLink,
  CrmActionButton
} from '@hubspot/ui-extensions/crm';


function sortAndPaginateLocations(locations, sortBy, sortOrder, page, pageSize) {

  if (sortBy === 'distance') {
    locations.sort((a, b) => a.distance - b.distance);
  } else if (sortBy === 'available_vehicles') {
    locations.sort((a, b) => b.number_of_available_vehicles - a.number_of_available_vehicles);
  } else if (sortBy === 'vehicle_match') {
    locations.sort((a, b) => b.associations.all_vehicles.total - a.associations.all_vehicles.total);
  }

  if (sortOrder === 'desc') {
    locations.reverse();
  }

  const start = (page - 1) * pageSize;
  const end = page * pageSize;
  return locations.slice(start, end);

}

function sortAndPaginateVehicles(vehicles, vehicleYearSort, vehiclePage, pageSize) {
  if (vehicleYearSort === 'asc') {
    vehicles.sort((a, b) => a.properties.year - b.properties.year);
  } else if (vehicleYearSort === 'desc') {
    vehicles.sort((a, b) => b.properties.year - a.properties.year);
  }

  const start = (vehiclePage - 1) * pageSize;
  const end = vehiclePage * pageSize;
  return vehicles.slice(start, end);
}


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

  const [selectedLocation, setSelectedLocation] = useState({});
  const [selectedVehicle, setSelectedVehicle] = useState({});


  const [steps, setSteps] = useState([
    "Location",
    "Vehicle",
    "Confirm"
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [zipCode, setZipCode] = useState(37064);
  const [miles, setMiles] = useState(250);

  const [loading, setLoading] = useState(true);
  const [pickupDate, setPickupDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [vehicleClass, setVehicleClass] = useState("");

  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const [distanceSort, setDistanceSort] = useState('asc'); //asc, desc, ''
  const [vehicleSort, setVehicleSort] = useState(''); //asc, desc, ''
  const [vehicleMatchSort, setVehicleMatchSort] = useState(''); //asc, desc, ''

  const [vehicleYearSort, setVehicleYearSort] = useState('desc'); //asc, desc, ''

  const [locationPage, setLocationPage] = useState(1);
  const [locationCount, setLocationCount] = useState(0);
  const [vehiclePage, setVehiclePage] = useState(1);
  const [vehicleCount, setVehicleCount] = useState(6);

  const [pageSize, setPageSize] = useState(10);
  const [locationFetching, setLocationFetching] = useState(false);
  const [vehicleFetching, setVehicleFetching] = useState(false);

  const [geography, setGeography] = useState({ lat: 35.89872340000001, lng: -86.96240859999999 });
  const [geoCodeFetching, setGeoCodeFetching] = useState(false);

  const [insurance, setInsurance] = useState(false);
  const [insuranceCost, setInsuranceCost] = useState(0);

  const [days, setDays] = useState(0);

  function geoCode() {
    sendAlert({ message: "Geocoding...", type: "info" });
    setGeoCodeFetching(true);
    runServerless({ name: "geoCode", parameters: { "zipCode": zipCode } }).then((resp) => {
      setGeography(resp.response);
      setGeoCodeFetching(false);
    })
  }

  function fetchLocations() {
    sendAlert({ message: "Fetching locations...", type: "info" });
    setLocationFetching(true);
    runServerless({ name: "getLocations", parameters: { "miles": miles, "geography": geography, "pickupDate": pickupDate, "returnDate": returnDate, "vehicleClass": vehicleClass } }).then((resp) => {
      setLocations(resp.response.results);
      setLocationCount(resp.response.total);
      setLocationFetching(false);
      //reset the table
      setLocationPage(1);
    })

  }

  const debouncedFetchLocations = _.debounce(fetchLocations, 500);

  const debounceGeoCode = _.debounce(geoCode, 500);

  //run the fetchLocations, when the distanceSort or vehicleSort changes or when the page changes
  useEffect(() => {
    debouncedFetchLocations();
  }, [miles, geography]);

  useEffect(() => {
    if (zipCode.length === 5 && !geoCodeFetching) {
      debounceGeoCode();
    }
  }, [zipCode]);

  useEffect(() => {
    let sort = {};
    if (distanceSort) {
      sort = { "name": "distance", "order": distanceSort };
    } else if (vehicleSort) {
      sort = { "name": "available_vehicles", "order": vehicleSort };
    }
    else if (vehicleMatchSort) {
      sort = { "name": "vehicle_match", "order": vehicleMatchSort };
    }

    if (locations.length > 0) {
      let newLocations = sortAndPaginateLocations(locations, sort.name, sort.order, locationPage, pageSize)
      setLocationsOnPage(newLocations);
    }
  }, [distanceSort, vehicleSort, vehicleMatchSort, locationPage, pageSize, locations]);


  useEffect(() => {
    if (vehicles.length > 0) {
      let newVehicles = sortAndPaginateVehicles(vehicles, vehicleYearSort, vehiclePage, pageSize)
      setVehiclesOnPage(newVehicles);
    }
  }, [vehicleYearSort, vehiclePage, vehicles]);


  function setSort(sort, type) {
    if (type === 'distance') {
      setDistanceSort(sort);
      setVehicleSort('');
      setVehicleMatchSort('');
    }
    else if (type === 'vehicle_match') {
      setVehicleMatchSort(sort);
      setDistanceSort('');
      setVehicleSort('');
    }
    else {
      setVehicleSort(sort);
      setDistanceSort('');
      setVehicleMatchSort('');
    }
  }

  useEffect(() => {
    if (pickupDate && returnDate) {
      let days = moment(returnDate.formattedDate).diff(moment(pickupDate.formattedDate), 'days');
      setDays(days);
    }
  }, [pickupDate, returnDate]);


  function goToVehiclePage(vehicles) {
    setVehicleFetching(true)
    runServerless({ name: "getVehicles", parameters: { "vehicles": vehicles } }).then((resp) => {
      setVehicles(resp.response.results);
      setVehicleCount(resp.response.results.length);
      setCurrentStep(1);
      setVehicleFetching(false);
    })
  }

  function goToBookingPage(vehicle) {
    setSelectedVehicle(vehicle);
    setCurrentStep(2);
  }

  return (
    <>
      <StepperBar
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        selectedLocation={selectedLocation}
        sendAlert={sendAlert}
        steps={steps}
      />
      <Divider />
      {currentStep === 0 && (
        <StepZeroForm
          distanceSort={distanceSort}
          goToVehiclePage={goToVehiclePage}
          locationCount={locationCount}
          locationFetching={locationFetching}
          locationsOnPage={locationsOnPage}
          locationPage={locationPage}
          miles={miles}
          pageSize={pageSize}
          pickupDate={pickupDate}
          returnDate={returnDate}
          setMiles={setMiles}
          setLocationPage={setLocationPage}
          setPickupDate={setPickupDate}
          setReturnDate={setReturnDate}
          setSelectedLocation={setSelectedLocation}
          setSort={setSort}
          setVehicleClass={setVehicleClass}
          setZipCode={setZipCode}
          vehicleClass={vehicleClass}
          vehicleMatchSort={vehicleMatchSort}
          vehicleSort={vehicleSort}
          zipCode={zipCode}
        />
      )}
      {currentStep === 1 && (
        <StepOneForm
          goToBookingPage={goToBookingPage}
          setVehicleYearSort={setVehicleYearSort}
          vehiclesOnPage={vehiclesOnPage}
          vehicleYearSort={vehicleYearSort}
        />
      )}
      {
        currentStep === 2 && (
          <StepTwoForm
            days={days}
            insurance={insurance}
            insuranceCost={insuranceCost}
            pickupDate={pickupDate}
            returnDate={returnDate}
            selectedLocation={selectedLocation}
            selectedVehicle={selectedVehicle}
            setPickupDate={setPickupDate}
            setReturnDate={setReturnDate}
          />
        )
      }
      <Divider />
    </>
  );
};

const StepperBar = ({
  currentStep,
  setCurrentStep,
  selectedLocation,
  sendAlert,
  steps
}) => {
  return(
    <Flex
      direction={'row'}
      justify={'between'}
    >
      <StepIndicator
        currentStep={currentStep}
        stepNames={steps}
        variant={"default"}
        onClick={(step) => {
          //make sure that the step is valid before allowing the user to go to the next step
          if (step === 1) {
            if (selectedLocation && selectedLocation.id) {
              setCurrentStep(step);
            }
            else {
              sendAlert({ message: "Please select a location", type: "danger" });
            }
          }
          else {
            setCurrentStep(step);
          }
        }}
      />
    </Flex>
  );
};

const StepZeroForm = ({
  distanceSort,
  goToVehiclePage,
  locationCount,
  locationFetching,
  locationsOnPage,
  locationPage,
  miles,
  pageSize,
  pickupDate,
  returnDate,
  setMiles,
  setLocationPage,
  setPickupDate,
  setReturnDate,
  setSelectedLocation,
  setSort,
  setVehicleClass,
  setZipCode,
  vehicleClass,
  vehicleMatchSort,
  vehicleSort,
  zipCode
}) => {
  return (
    <>
      <Flex
        direction={'row'}
        justify={'start'}
        wrap={'nowrap'}
        gap={'extra-large'}
        align={'start'}
        alignSelf={'start'}
      >
        <Flex
          width={'auto'}
        >
          <Input
            label="Zip Code"
            name="zipCode"
            tooltip="Please enter your zip code"
            placeholder="12345"
            value={zipCode}
            required={true}
            onChange={value => {
              setZipCode(value);
            }}

          />
        </Flex>
        <Flex
          width={'auto'}
        >
          <NumberInput
            label="Miles Radius"
            name="miles"
            min={25}
            max={300}
            tooltip="Please enter the number of miles you are willing to travel"
            placeholder="250"
            value={miles}
            required={true}
            onChange={value => {
              setMiles(value);
            }}
          />
        </Flex>
        <Flex
          width={'auto'}
        >
          <DateInput
            label="Pickup Date"
            name="pickupDate"
            value={pickupDate}
            max={returnDate}
            onChange={(value) => {
              setPickupDate(value);
            }}
            format="ll"
          />
        </Flex>
        <Flex
          width={'auto'}
        >
          <DateInput
            label="Return Date"
            name="returnDate"
            value={returnDate}
            min={pickupDate}
            onChange={(value) => {
              setReturnDate(value);
            }}
            format="ll"
          />
        </Flex>
        <Flex
          width={'max'}
        >
          <MultiSelect
            label="Vehicle Class"
            name="vehicleClass"
            variant="transparent"
            options={[
              { label: "Touring", value: "Touring" },
              { label: "Sport", value: "Sport" },
              { label: "Base", value: "Base" },
            ]}
            onChange={(value) => {
              setVehicleClass(value);
            }}
          />
        </Flex>

      </Flex>

      <Divider />

      <Table
        width={'max'}
        paginated={true}
        pageCount={locationCount / pageSize}
        onPageChange={(page) => {
          setLocationPage(page);
        }}
        page={locationPage}
      >
        <TableHead>
          <TableRow>
            <TableHeader width={'min'}>Address</TableHeader>
            <TableHeader width={'min'}>
              <Link variant="dark"
                onClick={() => setSort(distanceSort === 'asc' ? 'desc' : 'asc', 'distance')}
              >
                Distance
              </Link>  {distanceSort === '' ? ' ' : distanceSort === 'asc' ? ' ↓' : ' ↑'}
            </TableHeader>
            <TableHeader width={'min'}>
              <Link variant="dark"
                onClick={() => setSort(vehicleSort === 'asc' ? 'desc' : 'asc', 'vehicle')}
              >
                Availablity
              </Link>
              {vehicleSort === '' ? ' ' : vehicleSort === 'asc' ? ' ↓' : ' ↑'}
            </TableHeader>
            <TableHeader width={'min'} >
              <Link variant="dark"
                onClick={() => setSort(vehicleMatchSort === 'asc' ? 'desc' : 'asc', 'vehicle_match')}
              >
                Vehicles that meet Filters
              </Link>
              {vehicleMatchSort === '' ? ' ' : vehicleMatchSort === 'asc' ? ' ↓' : ' ↑'}
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>

          {locationFetching === false && locationsOnPage.map((location) => (
            <TableRow>
              <TableCell>
                <Text>{location.full_address}</Text>
              </TableCell>
              <TableCell>
                <Text>{location.distance} miles</Text>
              </TableCell>
              <TableCell>
                <Link onClick={() => { goToVehiclePage(location.associations.all_vehicles.items.map(x => x.hs_object_id)); setSelectedLocation(location) }}>{location.number_of_available_vehicles} Vehicles Available</Link>
              </TableCell>
              <TableCell>
                <Link onClick={() => {
                  const vehicleClassArray = vehicleClass

                  const filteredVehicles = vehicleClassArray.length === 0
                    ? location.associations.all_vehicles.items
                    : location.associations.all_vehicles.items.filter(vehicle =>
                      vehicleClassArray.includes(vehicle.model.label)
                    );

                  const vehicleObjectIds = filteredVehicles.map(vehicle => vehicle.hs_object_id);

                  goToVehiclePage(vehicleObjectIds);

                  setSelectedLocation(location);
                }}>
                  {
                    location.associations.all_vehicles.items.filter(vehicle => {
                      if (vehicleClass.length === 0) {
                        return true; // If vehicleClass is empty, include all vehicles
                      }
                      const vehicleClassArray = vehicleClass;
                      return vehicleClassArray.includes(vehicle.model.label);
                    }).length
                  } Vehicles
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

const StepOneForm = ({
  goToBookingPage,
  setVehicleYearSort,
  vehiclesOnPage,
  vehicleYearSort
}) => {
  return(
    <>
      <Table
        width={'max'}
        paginated={false}
      >
        <TableHead>
          <TableRow>
            <TableHeader width={'min'}>Make</TableHeader>
            <TableHeader width={'min'}>
              Model
            </TableHeader>
            <TableHeader width={'min'}>
              <Link variant="dark"
                onClick={() => { setVehicleYearSort(vehicleYearSort === 'asc' ? 'desc' : 'asc') }}
              >
                Year
              </Link>
              {vehicleYearSort === '' ? ' ' : vehicleYearSort === 'asc' ? ' ↓' : ' ↑'}
            </TableHeader>
            <TableHeader width={'min'} >
              Book
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {vehiclesOnPage.map((vehicle) => (
            <TableRow>
              <TableCell>
                <Text>{vehicle.properties.make}</Text>
              </TableCell>
              <TableCell>
                <Text>{vehicle.properties.model}</Text>
              </TableCell>
              <TableCell>
                <Text>{vehicle.properties.year}</Text>
              </TableCell>
              <TableCell>
                <Link onClick={() => { goToBookingPage(vehicle) }}>Book now</Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

const StepTwoForm = ({
  days,
  insurance,
  insuranceCost,
  pickupDate,
  returnDate,
  selectedLocation,
  selectedVehicle,
  setPickupDate,
  setReturnDate
}) => {
  return(
    <Flex direction="column" gap="lg">
      {/* First Row for Location and Vehicle */}
      <Flex gap='lg' direction="row" wrap="nowrap">
        {/* Pickup Location */}
        <Flex direction="column" gap="sm">
          <Text format={{ fontWeight: 'bold' }}>Pickup Location:</Text>
          <Text>{selectedLocation.full_address}</Text>
        </Flex>
        {/* Vehicle Details */}
        <Flex direction="column" gap="sm">
          <Text format={{ fontWeight: 'bold' }}>Vehicle:</Text>
          <Text>
            {selectedVehicle.properties.year} {selectedVehicle.properties.make} {selectedVehicle.properties.model}
          </Text>
        </Flex>
      </Flex>

      {/* Second Row for Dates, Insurance, Rates, and Total */}
      <Flex gap='lg' direction="row" wrap="nowrap">
        {/* Pickup Date */}
        <Flex direction="column" gap="sm">
          <Text format={{ fontWeight: 'bold' }}>Pickup Date:</Text>
          <DateInput
            label=""
            name="pickupDate"
            value={pickupDate}
            max={returnDate}
            onChange={(value) => setPickupDate(value)}
            format="ll"
          />
        </Flex>
        {/* Return Date */}
        <Flex direction="column" gap="sm">
          <Text format={{ fontWeight: 'bold' }}>Return Date:</Text>
          <DateInput
            label=""
            name="returnDate"
            value={returnDate}
            min={pickupDate}
            onChange={(value) => setReturnDate(value)}
            format="ll"
          />
        </Flex>
      </Flex>
      <Flex gap='lg' direction="row" wrap="nowrap">
        {/* Insurance */}
        <Flex direction="column" gap="sm">
          <Text format={{ fontWeight: 'bold' }}>Insurance:</Text>
          <Text>{insurance ? 'Yes' : 'No'}</Text>
        </Flex>
        {/* Daily Rate */}
        <Flex direction="column" gap="sm">
          <Text format={{ fontWeight: 'bold' }}>Daily Rate:</Text>
          <Text>$ {selectedVehicle.properties.daily_price}</Text>
        </Flex>
        {/* Days */}
        <Flex direction="column" gap="sm">
          <Text format={{ fontWeight: 'bold' }}>Days:</Text>
          <Text>{days}</Text>
        </Flex>
        {/* Total */}
        <Flex direction="column" gap="sm">
          <Text format={{ fontWeight: 'bold' }}>Total:</Text>
          <Text>${(selectedVehicle.properties.daily_price * days) + insuranceCost}</Text>
        </Flex>
      </Flex>
    </Flex>
  );
};