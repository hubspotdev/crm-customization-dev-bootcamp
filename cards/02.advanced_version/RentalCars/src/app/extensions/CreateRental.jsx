import { useState, useEffect, useMemo } from "react";
import { debounce } from "lodash";
import {
  Alert,
  AutoGrid,
  Button,
  Divider,
  EmptyState,
  Flex,
  hubspot,
  DateInput,
  NumberInput,
  MultiSelect,
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
} from "@hubspot/ui-extensions";


// ── Constants ──────────────────────────────────────────────────────────
const STEPS = ["Location", "Vehicle", "Confirm"];
const PAGE_SIZE = 10;

// ── Reusable Components ───────────────────────────────────────────────
const SummaryRow = ({ label, value }) => (
  <Flex direction="row" justify="between">
    <Text variant="microcopy">{label}</Text>
    <Text variant="microcopy" format={{ fontWeight: "demibold" }}>
      {value || "-"}
    </Text>
  </Flex>
);

const SectionBreak = () => (
  <>
    <Divider />
    <Text variant="microcopy">{" "}</Text>
  </>
);

// ── Utilities ─────────────────────────────────────────────────────────
function diffDays(dateA, dateB) {
  return Math.round(
    (new Date(dateA).getTime() - new Date(dateB).getTime()) / (1000 * 60 * 60 * 24)
  );
}

function sortAndPaginateLocations(locations, sortBy, sortOrder, page, pageSize) {
  const sorted = [...locations];

  if (sortBy === "distance") {
    sorted.sort((a, b) => a.distance - b.distance);
  } else if (sortBy === "available_vehicles") {
    sorted.sort((a, b) => b.number_of_available_vehicles - a.number_of_available_vehicles);
  } else if (sortBy === "vehicle_match") {
    sorted.sort((a, b) => b.associations.all_vehicles.total - a.associations.all_vehicles.total);
  }

  if (sortOrder === "desc") {
    sorted.reverse();
  }

  const start = (page - 1) * pageSize;
  const end = page * pageSize;
  return sorted.slice(start, end);
}

function sortAndPaginateVehicles(vehicles, vehicleYearSort, vehiclePage, pageSize) {
  const sorted = [...vehicles];

  if (vehicleYearSort === "asc") {
    sorted.sort((a, b) => a.properties.year - b.properties.year);
  } else if (vehicleYearSort === "desc") {
    sorted.sort((a, b) => b.properties.year - a.properties.year);
  }

  const start = (vehiclePage - 1) * pageSize;
  const end = vehiclePage * pageSize;
  return sorted.slice(start, end);
}


hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <Extension
    context={context}
    runServerless={runServerlessFunction}
    sendAlert={actions.addAlert}
    fetchProperties={actions.fetchCrmObjectProperties}
    actions={actions}
  />
));

const Extension = ({ context, runServerless, sendAlert, fetchProperties, actions }) => {
  const [locations, setLocations] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [selectedLocation, setSelectedLocation] = useState({});
  const [selectedVehicle, setSelectedVehicle] = useState({});

  const [currentStep, setCurrentStep] = useState(0);
  const [zipCode, setZipCode] = useState(37064);
  const [miles, setMiles] = useState(30);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pickupDate, setPickupDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [vehicleClass, setVehicleClass] = useState("");

  const [distanceSort, setDistanceSort] = useState("asc");
  const [vehicleSort, setVehicleSort] = useState("");
  const [vehicleMatchSort, setVehicleMatchSort] = useState("");

  const [vehicleYearSort, setVehicleYearSort] = useState("desc");

  const [locationPage, setLocationPage] = useState(1);
  const [locationCount, setLocationCount] = useState(0);
  const [vehiclePage, setVehiclePage] = useState(1);

  const [locationFetching, setLocationFetching] = useState(false);

  const [geography, setGeography] = useState({ lat: 35.89872340000001, lng: -86.96240859999999 });
  const [geoCodeFetching, setGeoCodeFetching] = useState(false);

  const [insurance, setInsurance] = useState(false);
  const [insuranceCost, setInsuranceCost] = useState(0);

  const days = useMemo(() => {
    if (!pickupDate || !returnDate) return 0;
    return diffDays(returnDate.formattedDate, pickupDate.formattedDate);
  }, [pickupDate, returnDate]);

  function geoCode() {
    sendAlert({ message: "Geocoding...", type: "info" });
    setGeoCodeFetching(true);
    runServerless({ name: "geoCode", parameters: { zipCode } })
      .then((resp) => {
        setGeography(resp.response || geography);
        setGeoCodeFetching(false);
      })
      .catch((err) => {
        console.error("Geocode error:", err);
        sendAlert({ message: "Failed to geocode zip code.", type: "danger" });
        setGeoCodeFetching(false);
      });
  }

  function fetchLocations() {
    setLocationFetching(true);
    setError(null);
    runServerless({
      name: "getLocations",
      parameters: { miles, geography, pickupDate, returnDate, vehicleClass },
    })
      .then((resp) => {
        const results = resp.response?.results || [];
        setLocations(results);
        setLocationCount(resp.response?.total || results.length);
        setLocationFetching(false);
        setLoading(false);
        setLocationPage(1);
      })
      .catch((err) => {
        console.error("Fetch locations error:", err);
        setError("Failed to load locations. Please try again.");
        setLocationFetching(false);
        setLoading(false);
      });
  }

  const debouncedFetchLocations = debounce(fetchLocations, 500);
  const debouncedGeoCode = debounce(geoCode, 500);

  useEffect(() => {
    debouncedFetchLocations();
  }, [miles, geography]);

  useEffect(() => {
    if (String(zipCode).length === 5 && !geoCodeFetching) {
      debouncedGeoCode();
    }
  }, [zipCode]);

  const sortedLocationsOnPage = useMemo(() => {
    if (locations.length === 0) return [];
    let sortBy = "";
    let sortOrder = "";
    if (distanceSort) { sortBy = "distance"; sortOrder = distanceSort; }
    else if (vehicleSort) { sortBy = "available_vehicles"; sortOrder = vehicleSort; }
    else if (vehicleMatchSort) { sortBy = "vehicle_match"; sortOrder = vehicleMatchSort; }
    return sortAndPaginateLocations(locations, sortBy, sortOrder, locationPage, PAGE_SIZE);
  }, [distanceSort, vehicleSort, vehicleMatchSort, locationPage, locations]);

  const sortedVehiclesOnPage = useMemo(() => {
    if (vehicles.length === 0) return [];
    return sortAndPaginateVehicles(vehicles, vehicleYearSort, vehiclePage, PAGE_SIZE);
  }, [vehicleYearSort, vehiclePage, vehicles]);

  function setSort(sort, type) {
    if (type === "distance") {
      setDistanceSort(sort);
      setVehicleSort("");
      setVehicleMatchSort("");
    } else if (type === "vehicle_match") {
      setVehicleMatchSort(sort);
      setDistanceSort("");
      setVehicleSort("");
    } else {
      setVehicleSort(sort);
      setDistanceSort("");
      setVehicleMatchSort("");
    }
  }

  function goToVehiclePage(vehicleIds) {
    runServerless({ name: "getVehicles", parameters: { vehicles: vehicleIds } })
      .then((resp) => {
        const results = resp.response?.results || [];
        setVehicles(results);
        setCurrentStep(1);
      })
      .catch((err) => {
        console.error("Fetch vehicles error:", err);
        sendAlert({ message: "Failed to load vehicles.", type: "danger" });
      });
  }

  function goToBookingPage(vehicle) {
    setSelectedVehicle(vehicle);
    setCurrentStep(2);
  }

  if (loading) {
    return (
      <Flex align="center" justify="center">
        <LoadingSpinner size="sm" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="sm">
      <StepperBar
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        selectedLocation={selectedLocation}
        sendAlert={sendAlert}
      />
      <Divider />
      {error && (
        <Alert title="Error" variant="error">
          {error}
        </Alert>
      )}
      {currentStep === 0 && (
        <StepZeroForm
          distanceSort={distanceSort}
          goToVehiclePage={goToVehiclePage}
          locationCount={locationCount}
          locationFetching={locationFetching}
          locationsOnPage={sortedLocationsOnPage}
          locationPage={locationPage}
          miles={miles}
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
          vehiclesOnPage={sortedVehiclesOnPage}
          vehicleYearSort={vehicleYearSort}
        />
      )}
      {currentStep === 2 && (
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
          sendAlert={sendAlert}
        />
      )}
    </Flex>
  );
};

const StepperBar = ({
  currentStep,
  setCurrentStep,
  selectedLocation,
  sendAlert,
}) => (
  <Flex direction="row" justify="between">
    <StepIndicator
      currentStep={currentStep}
      stepNames={STEPS}

      onClick={(step) => {
        if (step === 1 && !(selectedLocation && selectedLocation.id)) {
          sendAlert({ message: "Please select a location", type: "danger" });
          return;
        }
        setCurrentStep(step);
      }}
    />
  </Flex>
);

const VEHICLE_CLASS_OPTIONS = [
  { label: "Standard", value: "Standard" },
  { label: "Compact", value: "Compact" },
  { label: "Convertible", value: "Convertible" },
  { label: "Coupe", value: "Coupe" },
  { label: "Fullsize", value: "Fullsize" },
  { label: "Midsize", value: "Midsize" },
  { label: "Premium", value: "Premium" },
  { label: "Truck", value: "Truck" },
  { label: "Van", value: "Van" },
];

const StepZeroForm = ({
  distanceSort,
  goToVehiclePage,
  locationCount,
  locationFetching,
  locationsOnPage,
  locationPage,
  miles,
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
  zipCode,
}) => (
  <Flex direction="column" gap="sm">
    <AutoGrid columnWidth={250} flexible={true} gap="small">
      <Input
        label="Zip Code"
        name="zipCode"
        tooltip="Please enter your zip code"
        placeholder="12345"
        value={zipCode}
        required={true}
        onChange={(value) => setZipCode(value)}
      />
      <NumberInput
        label="Miles Radius"
        name="miles"
        min={25}
        max={300}
        tooltip="Please enter the number of miles you are willing to travel"
        placeholder="250"
        value={miles}
        required={true}
        onChange={(value) => setMiles(value)}
      />
      <DateInput
        label="Pickup Date"
        name="pickupDate"
        value={pickupDate}
        max={returnDate}
        onChange={(value) => setPickupDate(value)}
        format="ll"
      />
      <DateInput
        label="Return Date"
        name="returnDate"
        value={returnDate}
        min={pickupDate}
        onChange={(value) => setReturnDate(value)}
        format="ll"
      />
      <MultiSelect
        label="Vehicle Class"
        name="vehicleClass"
        variant="transparent"
        options={VEHICLE_CLASS_OPTIONS}
        onChange={(value) => setVehicleClass(value)}
      />
    </AutoGrid>

    <SectionBreak />

    {locationFetching && (
      <Flex align="center" justify="center">
        <LoadingSpinner size="sm" />
      </Flex>
    )}

    {!locationFetching && locationsOnPage.length === 0 ? (
      <EmptyState title="No locations found">
        <Text>Try adjusting your zip code or increasing the mile radius.</Text>
      </EmptyState>
    ) : (
      <Table
        bordered={true}
        flush={true}
        paginated={true}
        pageCount={Math.ceil(locationCount / PAGE_SIZE)}
        onPageChange={(page) => setLocationPage(page)}
        page={locationPage}
      >
        <TableHead>
          <TableRow>
            <TableHeader width="auto">Address</TableHeader>
            <TableHeader
              width="min"
              sortDirection={distanceSort || "none"}
              onSortChange={(dir) => setSort(dir, "distance")}
            >
              Distance
            </TableHeader>
            <TableHeader
              width="min"
              sortDirection={vehicleSort || "none"}
              onSortChange={(dir) => setSort(dir, "vehicle")}
            >
              Availability
            </TableHeader>
            <TableHeader
              width="min"
              sortDirection={vehicleMatchSort || "none"}
              onSortChange={(dir) => setSort(dir, "vehicle_match")}
            >
              Matching Vehicles
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {locationsOnPage.map((location) => {
            const allVehicles = location.associations?.all_vehicles?.items || [];
            const filteredVehicles =
              vehicleClass.length === 0
                ? allVehicles
                : allVehicles.filter((v) => vehicleClass.includes(v.model?.label));

            return (
              <TableRow key={location.hs_object_id}>
                <TableCell width="auto">
                  <Text variant="microcopy">{location.full_address || "-"}</Text>
                </TableCell>
                <TableCell width="min">
                  <Text variant="microcopy" format={{ fontWeight: "demibold" }}>
                    {location.distance ? `${location.distance} mi` : "-"}
                  </Text>
                </TableCell>
                <TableCell width="min">
                  <Button
                    size="extra-small"
                    variant="secondary"
                    onClick={() => {
                      goToVehiclePage(allVehicles.map((x) => x.hs_object_id));
                      setSelectedLocation(location);
                    }}
                  >
                    {location.number_of_available_vehicles || 0} Available
                  </Button>
                </TableCell>
                <TableCell width="min">
                  <Button
                    size="extra-small"
                    variant="secondary"
                    onClick={() => {
                      goToVehiclePage(filteredVehicles.map((v) => v.hs_object_id));
                      setSelectedLocation(location);
                    }}
                  >
                    {filteredVehicles.length} Vehicles
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    )}
  </Flex>
);

const StepOneForm = ({
  goToBookingPage,
  setVehicleYearSort,
  vehiclesOnPage,
  vehicleYearSort,
}) => {
  if (vehiclesOnPage.length === 0) {
    return (
      <EmptyState title="No vehicles found">
        <Text>No vehicles are available at this location. Try a different location.</Text>
      </EmptyState>
    );
  }

  return (
    <Table bordered={true} flush={true}>
      <TableHead>
        <TableRow>
          <TableHeader width="auto">Make</TableHeader>
          <TableHeader width="auto">Model</TableHeader>
          <TableHeader
            width="min"
            sortDirection={vehicleYearSort || "none"}
            onSortChange={(dir) => setVehicleYearSort(dir)}
          >
            Year
          </TableHeader>
          <TableHeader width="min">Book</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {vehiclesOnPage.map((vehicle) => (
          <TableRow key={vehicle.id}>
            <TableCell width="auto">
              <Text variant="microcopy">{vehicle.properties.make || "-"}</Text>
            </TableCell>
            <TableCell width="auto">
              <Text variant="microcopy">{vehicle.properties.model || "-"}</Text>
            </TableCell>
            <TableCell width="min">
              <Text variant="microcopy" format={{ fontWeight: "demibold" }}>
                {vehicle.properties.year || "-"}
              </Text>
            </TableCell>
            <TableCell width="min">
              <Button
                size="extra-small"
                variant="primary"
                onClick={() => goToBookingPage(vehicle)}
              >
                Book
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
  setReturnDate,
  sendAlert,
}) => {
  const vehicleLabel = [
    selectedVehicle.properties?.year,
    selectedVehicle.properties?.make,
    selectedVehicle.properties?.model,
  ]
    .filter(Boolean)
    .join(" ") || "-";

  const dailyRate = Number(selectedVehicle.properties?.daily_price) || 0;
  const total = dailyRate * days + insuranceCost;

  return (
    <Flex direction="column" gap="sm">
      <AutoGrid columnWidth={250} flexible={true} gap="small">
        <Flex direction="column" gap="xs">
          <SummaryRow label="Pickup Location" value={selectedLocation.full_address} />
          <SummaryRow label="Vehicle" value={vehicleLabel} />
          <SummaryRow label="Insurance" value={insurance ? "Yes" : "No"} />
        </Flex>
        <Flex direction="column" gap="xs">
          <SummaryRow label="Daily Rate" value={dailyRate ? `$${dailyRate}` : "-"} />
          <SummaryRow label="Days" value={days > 0 ? String(days) : "-"} />
          <SummaryRow label="Total" value={total > 0 ? `$${total.toFixed(2)}` : "-"} />
        </Flex>
      </AutoGrid>

      <SectionBreak />

      <AutoGrid columnWidth={250} flexible={true} gap="small">
        <DateInput
          label="Pickup Date"
          name="confirmPickupDate"
          value={pickupDate}
          max={returnDate}
          onChange={(value) => setPickupDate(value)}
          format="ll"
        />
        <DateInput
          label="Return Date"
          name="confirmReturnDate"
          value={returnDate}
          min={pickupDate}
          onChange={(value) => setReturnDate(value)}
          format="ll"
        />
      </AutoGrid>

      <Flex direction="row" justify="end" gap="xs">
        <Button
          size="small"
          variant="primary"
          onClick={() => {
            sendAlert({ message: "Booking confirmed!", type: "success" });
          }}
        >
          Confirm Booking
        </Button>
      </Flex>
    </Flex>
  );
};
