(function(React2, _2, moment2, uiExtensions2) {
  "use strict";
  function sortAndPaginateLocations(locations, sortBy, sortOrder, page, pageSize) {
    if (sortBy === "distance") {
      locations.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === "available_vehicles") {
      locations.sort((a, b) => b.number_of_available_vehicles - a.number_of_available_vehicles);
    } else if (sortBy === "vehicle_match") {
      locations.sort((a, b) => b.associations.p_vehicles_collection__vehicles_to_locations.total - a.associations.p_vehicles_collection__vehicles_to_locations.total);
    }
    if (sortOrder === "desc") {
      locations.reverse();
    }
    const start = (page - 1) * pageSize;
    const end = page * pageSize;
    return locations.slice(start, end);
  }
  function sortAndPaginateVehicles(vehicles, vehicleYearSort, vehiclePage, pageSize) {
    if (vehicleYearSort === "asc") {
      vehicles.sort((a, b) => a.properties.year - b.properties.year);
    } else if (vehicleYearSort === "desc") {
      vehicles.sort((a, b) => b.properties.year - a.properties.year);
    }
    const start = (vehiclePage - 1) * pageSize;
    const end = vehiclePage * pageSize;
    return vehicles.slice(start, end);
  }
  uiExtensions2.hubspot.extend(({ context, runServerlessFunction, actions }) => /* @__PURE__ */ React2.createElement(
    Extension,
    {
      context,
      runServerless: runServerlessFunction,
      sendAlert: actions.addAlert,
      fetchProperties: actions.fetchCrmObjectProperties
    }
  ));
  const Extension = ({ context, runServerless, sendAlert, fetchProperties }) => {
    const [locations, setLocations] = React2.useState([]);
    const [locationsOnPage, setLocationsOnPage] = React2.useState([]);
    const [vehicles, setVehicles] = React2.useState([]);
    const [vehiclesOnPage, setVehiclesOnPage] = React2.useState([]);
    const [selectedLocation, setSelectedLocation] = React2.useState({});
    const [selectedVehicle, setSelectedVehicle] = React2.useState({});
    const [steps, setSteps] = React2.useState([
      "Location",
      "Vehicle",
      "Confirm"
    ]);
    const [currentStep, setCurrentStep] = React2.useState(0);
    const [zipCode, setZipCode] = React2.useState(37064);
    const [miles, setMiles] = React2.useState(250);
    React2.useState(true);
    const [pickupDate, setPickupDate] = React2.useState(null);
    const [returnDate, setReturnDate] = React2.useState(null);
    const [vehicleClass, setVehicleClass] = React2.useState("");
    React2.useState(false);
    React2.useState("");
    const [distanceSort, setDistanceSort] = React2.useState("asc");
    const [vehicleSort, setVehicleSort] = React2.useState("");
    const [vehicleMatchSort, setVehicleMatchSort] = React2.useState("");
    const [vehicleYearSort, setVehicleYearSort] = React2.useState("desc");
    const [locationPage, setLocationPage] = React2.useState(1);
    const [locationCount, setLocationCount] = React2.useState(0);
    const [vehiclePage, setVehiclePage] = React2.useState(1);
    const [vehicleCount, setVehicleCount] = React2.useState(6);
    const [pageSize, setPageSize] = React2.useState(10);
    const [locationFetching, setLocationFetching] = React2.useState(false);
    const [vehicleFetching, setVehicleFetching] = React2.useState(false);
    const [geography, setGeography] = React2.useState({ lat: 35.89872340000001, lng: -86.96240859999999 });
    const [geoCodeFetching, setGeoCodeFetching] = React2.useState(false);
    const [insurance, setInsurance] = React2.useState(false);
    const [insuranceCost, setInsuranceCost] = React2.useState(0);
    const [days, setDays] = React2.useState(0);
    function geoCode() {
      sendAlert({ message: "Geocoding...", type: "info" });
      setGeoCodeFetching(true);
      runServerless({ name: "geoCode", parameters: { "zipCode": zipCode } }).then((resp) => {
        setGeography(resp.response);
        setGeoCodeFetching(false);
      });
    }
    function fetchLocations() {
      sendAlert({ message: "Fetching locations...", type: "info" });
      setLocationFetching(true);
      runServerless({ name: "getLocations", parameters: { "miles": miles, "geography": geography, "pickupDate": pickupDate, "returnDate": returnDate, "vehicleClass": vehicleClass } }).then((resp) => {
        setLocations(resp.response.results);
        setLocationCount(resp.response.total);
        setLocationFetching(false);
        setLocationPage(1);
      });
    }
    const debouncedFetchLocations = _2.debounce(fetchLocations, 500);
    const debounceGeoCode = _2.debounce(geoCode, 500);
    React2.useEffect(() => {
      debouncedFetchLocations();
    }, [miles, geography]);
    React2.useEffect(() => {
      if (zipCode.length === 5 && !geoCodeFetching) {
        debounceGeoCode();
      }
    }, [zipCode]);
    React2.useEffect(() => {
      let sort = {};
      if (distanceSort) {
        sort = { "name": "distance", "order": distanceSort };
      } else if (vehicleSort) {
        sort = { "name": "available_vehicles", "order": vehicleSort };
      } else if (vehicleMatchSort) {
        sort = { "name": "vehicle_match", "order": vehicleMatchSort };
      }
      if (locations.length > 0) {
        let newLocations = sortAndPaginateLocations(locations, sort.name, sort.order, locationPage, pageSize);
        setLocationsOnPage(newLocations);
      }
    }, [distanceSort, vehicleSort, vehicleMatchSort, locationPage, pageSize, locations]);
    React2.useEffect(() => {
      if (vehicles.length > 0) {
        let newVehicles = sortAndPaginateVehicles(vehicles, vehicleYearSort, vehiclePage, pageSize);
        setVehiclesOnPage(newVehicles);
      }
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
    React2.useEffect(() => {
      if (pickupDate && returnDate) {
        let days2 = moment2(returnDate.formattedDate).diff(moment2(pickupDate.formattedDate), "days");
        setDays(days2);
      }
    }, [pickupDate, returnDate]);
    function goToVehiclePage(vehicles2) {
      setVehicleFetching(true);
      runServerless({ name: "getVehicles", parameters: { "vehicles": vehicles2 } }).then((resp) => {
        setVehicles(resp.response.data.results);
        setVehicleCount(resp.response.data.results.length);
        setCurrentStep(1);
        setVehicleFetching(false);
      });
    }
    function goToBookingPage(vehicle) {
      setSelectedVehicle(vehicle);
      setCurrentStep(2);
    }
    return /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(
      uiExtensions2.Flex,
      {
        direction: "row",
        justify: "between"
      },
      /* @__PURE__ */ React2.createElement(
        uiExtensions2.StepIndicator,
        {
          currentStep,
          stepNames: steps,
          variant: "default",
          onClick: (step) => {
            if (step === 1) {
              if (selectedLocation && selectedLocation.id) {
                setCurrentStep(step);
              } else {
                sendAlert({ message: "Please select a location", type: "danger" });
              }
            } else {
              setCurrentStep(step);
            }
          }
        }
      )
    ), /* @__PURE__ */ React2.createElement(uiExtensions2.Divider, null), currentStep === 0 && /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(
      uiExtensions2.Flex,
      {
        direction: "row",
        justify: "start",
        wrap: "nowrap",
        gap: "extra-large",
        align: "start",
        alignSelf: "start"
      },
      /* @__PURE__ */ React2.createElement(
        uiExtensions2.Flex,
        {
          width: "auto"
        },
        /* @__PURE__ */ React2.createElement(
          uiExtensions2.Input,
          {
            label: "Zip Code",
            name: "zipCode",
            tooltip: "Please enter your zip code",
            placeholder: "12345",
            value: zipCode,
            required: true,
            onChange: (value) => {
              setZipCode(value);
            }
          }
        )
      ),
      /* @__PURE__ */ React2.createElement(
        uiExtensions2.Flex,
        {
          width: "auto"
        },
        /* @__PURE__ */ React2.createElement(
          uiExtensions2.NumberInput,
          {
            label: "Miles",
            name: "miles",
            min: 25,
            max: 300,
            tooltip: "Please enter the number of miles you are willing to travel",
            placeholder: "250",
            value: miles,
            required: true,
            onChange: (value) => {
              setMiles(value);
            }
          }
        )
      ),
      /* @__PURE__ */ React2.createElement(
        uiExtensions2.Flex,
        {
          width: "auto"
        },
        /* @__PURE__ */ React2.createElement(
          uiExtensions2.DateInput,
          {
            label: "Pickup Date",
            name: "pickupDate",
            value: pickupDate,
            max: returnDate,
            onChange: (value) => {
              setPickupDate(value);
            },
            format: "ll"
          }
        )
      ),
      /* @__PURE__ */ React2.createElement(
        uiExtensions2.Flex,
        {
          width: "auto"
        },
        /* @__PURE__ */ React2.createElement(
          uiExtensions2.DateInput,
          {
            label: "Return Date",
            name: "returnDate",
            value: returnDate,
            min: pickupDate,
            onChange: (value) => {
              setReturnDate(value);
            },
            format: "ll"
          }
        )
      ),
      /* @__PURE__ */ React2.createElement(
        uiExtensions2.Flex,
        {
          width: "max"
        },
        /* @__PURE__ */ React2.createElement(
          uiExtensions2.MultiSelect,
          {
            label: "Vehicle Class",
            name: "vehicleClass",
            variant: "transparent",
            options: [
              { label: "Touring", value: "Touring" },
              { label: "Sport", value: "Sport" },
              { label: "Base", value: "Base" },
              { label: "Economy", value: "Economy" },
              { label: "Compact", value: "Compact" },
              { label: "Midsize", value: "Midsize" },
              { label: "Standard", value: "Standard" },
              { label: "Fullsize", value: "Fullsize" },
              { label: "Premium", value: "Premium" },
              { label: "Luxury", value: "Luxury" },
              { label: "SUV", value: "SUV" },
              { label: "Van", value: "Van" },
              { label: "Truck", value: "Truck" },
              { label: "Convertible", value: "Convertible" },
              { label: "Coupe", value: "Coupe" }
            ],
            onChange: (value) => {
              setVehicleClass(value);
            }
          }
        )
      )
    ), /* @__PURE__ */ React2.createElement(uiExtensions2.Divider, null), /* @__PURE__ */ React2.createElement(
      uiExtensions2.Table,
      {
        width: "max",
        paginated: true,
        pageCount: locationCount / pageSize,
        onPageChange: (page) => {
          setLocationPage(page);
        },
        page: locationPage
      },
      /* @__PURE__ */ React2.createElement(uiExtensions2.TableHead, null, /* @__PURE__ */ React2.createElement(uiExtensions2.TableRow, null, /* @__PURE__ */ React2.createElement(uiExtensions2.TableHeader, { width: "min" }, "Address"), /* @__PURE__ */ React2.createElement(uiExtensions2.TableHeader, { width: "min" }, /* @__PURE__ */ React2.createElement(
        uiExtensions2.Link,
        {
          variant: "dark",
          onClick: () => setSort(distanceSort === "asc" ? "desc" : "asc", "distance")
        },
        "Distance"
      ), "  ", distanceSort === "" ? " " : distanceSort === "asc" ? " ↓" : " ↑"), /* @__PURE__ */ React2.createElement(uiExtensions2.TableHeader, { width: "min" }, /* @__PURE__ */ React2.createElement(
        uiExtensions2.Link,
        {
          variant: "dark",
          onClick: () => setSort(vehicleSort === "asc" ? "desc" : "asc", "vehicle")
        },
        "Availablity"
      ), vehicleSort === "" ? " " : vehicleSort === "asc" ? " ↓" : " ↑"), /* @__PURE__ */ React2.createElement(uiExtensions2.TableHeader, { width: "min" }, /* @__PURE__ */ React2.createElement(
        uiExtensions2.Link,
        {
          variant: "dark",
          onClick: () => setSort(vehicleMatchSort === "asc" ? "desc" : "asc", "vehicle_match")
        },
        "Vehicles that meet Filters"
      ), vehicleMatchSort === "" ? " " : vehicleMatchSort === "asc" ? " ↓" : " ↑"))),
      /* @__PURE__ */ React2.createElement(uiExtensions2.TableBody, null, locationFetching === false && locationsOnPage.map((location) => /* @__PURE__ */ React2.createElement(uiExtensions2.TableRow, null, /* @__PURE__ */ React2.createElement(uiExtensions2.TableCell, null, /* @__PURE__ */ React2.createElement(uiExtensions2.Text, null, location.full_address)), /* @__PURE__ */ React2.createElement(uiExtensions2.TableCell, null, /* @__PURE__ */ React2.createElement(uiExtensions2.Text, null, location.distance, " miles")), /* @__PURE__ */ React2.createElement(uiExtensions2.TableCell, null, /* @__PURE__ */ React2.createElement(uiExtensions2.Link, { onClick: () => {
        goToVehiclePage(location.associations.p_vehicles_collection__vehicles_to_locations.items.map((x) => x.hs_object_id));
        setSelectedLocation(location);
      } }, location.number_of_available_vehicles, " Vehicles Available")), /* @__PURE__ */ React2.createElement(uiExtensions2.TableCell, null, /* @__PURE__ */ React2.createElement(uiExtensions2.Link, { onClick: () => {
        goToVehiclePage(location.associations.p_vehicles_collection__vehicles_to_locations.items.map((x) => x.hs_object_id));
        setSelectedLocation(location);
      } }, location.associations.p_vehicles_collection__vehicles_to_locations.total, " Vehicles")))))
    )), currentStep === 1 && /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(
      uiExtensions2.Table,
      {
        width: "max",
        paginated: false
      },
      /* @__PURE__ */ React2.createElement(uiExtensions2.TableHead, null, /* @__PURE__ */ React2.createElement(uiExtensions2.TableRow, null, /* @__PURE__ */ React2.createElement(uiExtensions2.TableHeader, { width: "min" }, "Make"), /* @__PURE__ */ React2.createElement(uiExtensions2.TableHeader, { width: "min" }, "Model"), /* @__PURE__ */ React2.createElement(uiExtensions2.TableHeader, { width: "min" }, /* @__PURE__ */ React2.createElement(
        uiExtensions2.Link,
        {
          variant: "dark",
          onClick: () => {
            setVehicleYearSort(vehicleYearSort === "asc" ? "desc" : "asc");
          }
        },
        "Year"
      ), vehicleYearSort === "" ? " " : vehicleYearSort === "asc" ? " ↓" : " ↑"), /* @__PURE__ */ React2.createElement(uiExtensions2.TableHeader, { width: "min" }, "Book"))),
      /* @__PURE__ */ React2.createElement(uiExtensions2.TableBody, null, vehiclesOnPage.map((vehicle) => /* @__PURE__ */ React2.createElement(uiExtensions2.TableRow, null, /* @__PURE__ */ React2.createElement(uiExtensions2.TableCell, null, /* @__PURE__ */ React2.createElement(uiExtensions2.Text, null, vehicle.properties.make)), /* @__PURE__ */ React2.createElement(uiExtensions2.TableCell, null, /* @__PURE__ */ React2.createElement(uiExtensions2.Text, null, vehicle.properties.model)), /* @__PURE__ */ React2.createElement(uiExtensions2.TableCell, null, /* @__PURE__ */ React2.createElement(uiExtensions2.Text, null, vehicle.properties.year)), /* @__PURE__ */ React2.createElement(uiExtensions2.TableCell, null, /* @__PURE__ */ React2.createElement(uiExtensions2.Link, { onClick: () => {
        goToBookingPage(vehicle);
      } }, "Book now")))))
    )), currentStep === 2 && /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(uiExtensions2.DescriptionList, { direction: "row" }, /* @__PURE__ */ React2.createElement(uiExtensions2.DescriptionListItem, { label: "Pickup Location" }, /* @__PURE__ */ React2.createElement(uiExtensions2.Text, null, selectedLocation.full_address)), /* @__PURE__ */ React2.createElement(uiExtensions2.DescriptionListItem, null, /* @__PURE__ */ React2.createElement(
      uiExtensions2.Flex,
      {
        width: "auto"
      },
      /* @__PURE__ */ React2.createElement(
        uiExtensions2.DateInput,
        {
          label: "Pickup Date",
          name: "pickupDate",
          value: pickupDate,
          max: returnDate,
          onChange: (value) => {
            setPickupDate(value);
          },
          format: "ll"
        }
      )
    )), /* @__PURE__ */ React2.createElement(uiExtensions2.DescriptionListItem, null, /* @__PURE__ */ React2.createElement(
      uiExtensions2.Flex,
      {
        width: "auto"
      },
      /* @__PURE__ */ React2.createElement(
        uiExtensions2.DateInput,
        {
          label: "Return Date",
          name: "returnDate",
          value: returnDate,
          min: pickupDate,
          onChange: (value) => {
            setReturnDate(value);
          },
          format: "ll"
        }
      )
    )), /* @__PURE__ */ React2.createElement(uiExtensions2.DescriptionListItem, { label: "Vehicle" }, /* @__PURE__ */ React2.createElement(uiExtensions2.Text, null, selectedVehicle.properties.year, " ", selectedVehicle.properties.make, " ", selectedVehicle.properties.model)), /* @__PURE__ */ React2.createElement(uiExtensions2.DescriptionListItem, { label: "Insurance" }, /* @__PURE__ */ React2.createElement(
      uiExtensions2.Select,
      {
        name: "insurance",
        label: "",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false }
        ],
        onChange: (value) => {
          setInsurance(value);
        }
      }
    )), /* @__PURE__ */ React2.createElement(uiExtensions2.DescriptionListItem, { label: "Daily Rate" }, /* @__PURE__ */ React2.createElement(uiExtensions2.Text, null, "$ ", selectedVehicle.properties.daily_price)), /* @__PURE__ */ React2.createElement(uiExtensions2.DescriptionListItem, { label: "Days" }, /* @__PURE__ */ React2.createElement(uiExtensions2.Text, null, days)), /* @__PURE__ */ React2.createElement(uiExtensions2.DescriptionListItem, { label: "Total" }, /* @__PURE__ */ React2.createElement(uiExtensions2.Text, null, selectedVehicle.properties.daily_price * days + insuranceCost)))), /* @__PURE__ */ React2.createElement(uiExtensions2.Divider, null));
  };
})(React, _, moment, uiExtensions);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlUmVudGFsLmpzIiwic291cmNlcyI6WyIuLi9leHRlbnNpb25zL0NyZWF0ZVJlbnRhbC5qc3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudCc7XG5pbXBvcnQge1xuICBEaXZpZGVyLFxuICBCdXR0b24sXG4gIEZsZXgsXG4gIGh1YnNwb3QsXG4gIERhdGVJbnB1dCxcbiAgTnVtYmVySW5wdXQsXG4gIE11bHRpU2VsZWN0LFxuICBTZWxlY3QsXG4gIFRhYmxlLFxuICBUYWJsZUhlYWQsXG4gIFRhYmxlUm93LFxuICBUYWJsZUhlYWRlcixcbiAgVGFibGVCb2R5LFxuICBUYWJsZUNlbGwsXG4gIFRleHQsXG4gIElucHV0LFxuICBMb2FkaW5nU3Bpbm5lcixcbiAgU3RlcEluZGljYXRvcixcbiAgTGluayxcbiAgRGVzY3JpcHRpb25MaXN0LFxuICBEZXNjcmlwdGlvbkxpc3RJdGVtLFxuICBUb2dnbGVHcm91cFxufSBmcm9tIFwiQGh1YnNwb3QvdWktZXh0ZW5zaW9uc1wiO1xuXG5pbXBvcnQge1xuICBDcm1DYXJkQWN0aW9ucyxcbiAgQ3JtQWN0aW9uTGluayxcbiAgQ3JtQWN0aW9uQnV0dG9uXG59IGZyb20gJ0BodWJzcG90L3VpLWV4dGVuc2lvbnMvY3JtJztcblxuXG5mdW5jdGlvbiBzb3J0QW5kUGFnaW5hdGVMb2NhdGlvbnMobG9jYXRpb25zLCBzb3J0QnksIHNvcnRPcmRlciwgcGFnZSwgcGFnZVNpemUpIHtcblxuaWYgKHNvcnRCeSA9PT0gJ2Rpc3RhbmNlJykge1xuICBsb2NhdGlvbnMuc29ydCgoYSwgYikgPT4gYS5kaXN0YW5jZSAtIGIuZGlzdGFuY2UpO1xufSBlbHNlIGlmIChzb3J0QnkgPT09ICdhdmFpbGFibGVfdmVoaWNsZXMnKSB7XG4gIGxvY2F0aW9ucy5zb3J0KChhLCBiKSA9PiBiLm51bWJlcl9vZl9hdmFpbGFibGVfdmVoaWNsZXMgLSBhLm51bWJlcl9vZl9hdmFpbGFibGVfdmVoaWNsZXMpO1xufSBlbHNlIGlmIChzb3J0QnkgPT09ICd2ZWhpY2xlX21hdGNoJykge1xuICBsb2NhdGlvbnMuc29ydCgoYSwgYikgPT4gYi5hc3NvY2lhdGlvbnMucF92ZWhpY2xlc19jb2xsZWN0aW9uX192ZWhpY2xlc190b19sb2NhdGlvbnMudG90YWwgLSBhLmFzc29jaWF0aW9ucy5wX3ZlaGljbGVzX2NvbGxlY3Rpb25fX3ZlaGljbGVzX3RvX2xvY2F0aW9ucy50b3RhbCk7XG59XG5cbmlmIChzb3J0T3JkZXIgPT09ICdkZXNjJykge1xuICBsb2NhdGlvbnMucmV2ZXJzZSgpO1xufVxuXG5jb25zdCBzdGFydCA9IChwYWdlIC0gMSkgKiBwYWdlU2l6ZTtcbmNvbnN0IGVuZCA9IHBhZ2UgKiBwYWdlU2l6ZTtcbnJldHVybiBsb2NhdGlvbnMuc2xpY2Uoc3RhcnQsIGVuZCk7XG5cbn1cblxuZnVuY3Rpb24gc29ydEFuZFBhZ2luYXRlVmVoaWNsZXModmVoaWNsZXMsIHZlaGljbGVZZWFyU29ydCwgdmVoaWNsZVBhZ2UsIHBhZ2VTaXplKXtcbiAgaWYgKHZlaGljbGVZZWFyU29ydCA9PT0gJ2FzYycpIHtcbiAgICB2ZWhpY2xlcy5zb3J0KChhLCBiKSA9PiBhLnByb3BlcnRpZXMueWVhciAtIGIucHJvcGVydGllcy55ZWFyKTtcbiAgfSBlbHNlIGlmICh2ZWhpY2xlWWVhclNvcnQgPT09ICdkZXNjJykge1xuICAgIHZlaGljbGVzLnNvcnQoKGEsIGIpID0+IGIucHJvcGVydGllcy55ZWFyIC0gYS5wcm9wZXJ0aWVzLnllYXIpO1xuICB9XG5cbiAgY29uc3Qgc3RhcnQgPSAodmVoaWNsZVBhZ2UgLSAxKSAqIHBhZ2VTaXplO1xuICBjb25zdCBlbmQgPSB2ZWhpY2xlUGFnZSAqIHBhZ2VTaXplO1xuICByZXR1cm4gdmVoaWNsZXMuc2xpY2Uoc3RhcnQsIGVuZCk7XG59XG5cblxuLy8gRGVmaW5lIHRoZSBleHRlbnNpb24gdG8gYmUgcnVuIHdpdGhpbiB0aGUgSHVic3BvdCBDUk1cbmh1YnNwb3QuZXh0ZW5kKCh7IGNvbnRleHQsIHJ1blNlcnZlcmxlc3NGdW5jdGlvbiwgYWN0aW9ucyB9KSA9PiAoXG4gICAgPEV4dGVuc2lvblxuICAgICAgY29udGV4dD17Y29udGV4dH1cbiAgICAgIHJ1blNlcnZlcmxlc3M9e3J1blNlcnZlcmxlc3NGdW5jdGlvbn1cbiAgICAgIHNlbmRBbGVydD17YWN0aW9ucy5hZGRBbGVydH1cbiAgICAgIGZldGNoUHJvcGVydGllcz17YWN0aW9ucy5mZXRjaENybU9iamVjdFByb3BlcnRpZXN9XG4gICAgLz5cbiAgKSk7XG5cbiAgY29uc3QgRXh0ZW5zaW9uID0gKHsgY29udGV4dCwgcnVuU2VydmVybGVzcywgc2VuZEFsZXJ0LCBmZXRjaFByb3BlcnRpZXMgfSkgPT4ge1xuXG4gICAgY29uc3QgW2xvY2F0aW9ucywgc2V0TG9jYXRpb25zXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbbG9jYXRpb25zT25QYWdlLCBzZXRMb2NhdGlvbnNPblBhZ2VdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IFt2ZWhpY2xlcywgc2V0VmVoaWNsZXNdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IFt2ZWhpY2xlc09uUGFnZSwgc2V0VmVoaWNsZXNPblBhZ2VdID0gdXNlU3RhdGUoW10pO1xuXG4gICAgY29uc3QgW3NlbGVjdGVkTG9jYXRpb24sIHNldFNlbGVjdGVkTG9jYXRpb25dID0gdXNlU3RhdGUoe30pO1xuICAgIGNvbnN0IFtzZWxlY3RlZFZlaGljbGUsIHNldFNlbGVjdGVkVmVoaWNsZV0gPSB1c2VTdGF0ZSh7fSk7XG5cblxuICAgIGNvbnN0IFtzdGVwcywgc2V0U3RlcHNdID0gdXNlU3RhdGUoW1xuICAgICAgICBcIkxvY2F0aW9uXCIsXG4gICAgICAgIFwiVmVoaWNsZVwiLFxuICAgICAgICBcIkNvbmZpcm1cIlxuICAgIF0pO1xuXG4gICAgY29uc3QgW2N1cnJlbnRTdGVwLCBzZXRDdXJyZW50U3RlcF0gPSB1c2VTdGF0ZSgwKTtcbiAgICBjb25zdCBbemlwQ29kZSwgc2V0WmlwQ29kZV0gPSB1c2VTdGF0ZSgzNzA2NCk7XG4gICAgY29uc3QgW21pbGVzLCBzZXRNaWxlc10gPSB1c2VTdGF0ZSgyNTApO1xuXG4gICAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XG4gICAgY29uc3QgW3BpY2t1cERhdGUsIHNldFBpY2t1cERhdGVdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3JldHVybkRhdGUsIHNldFJldHVybkRhdGVdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3ZlaGljbGVDbGFzcywgc2V0VmVoaWNsZUNsYXNzXSA9IHVzZVN0YXRlKFwiXCIpO1xuXG4gICAgY29uc3QgW2lzVmFsaWQsIHNldElzVmFsaWRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFt2YWxpZGF0aW9uTWVzc2FnZSwgc2V0VmFsaWRhdGlvbk1lc3NhZ2VdID0gdXNlU3RhdGUoJycpO1xuXG4gICAgY29uc3QgW2Rpc3RhbmNlU29ydCwgc2V0RGlzdGFuY2VTb3J0XSA9IHVzZVN0YXRlKCdhc2MnKTsgLy9hc2MsIGRlc2MsICcnXG4gICAgY29uc3QgW3ZlaGljbGVTb3J0LCBzZXRWZWhpY2xlU29ydF0gPSB1c2VTdGF0ZSgnJyk7IC8vYXNjLCBkZXNjLCAnJ1xuICAgIGNvbnN0IFt2ZWhpY2xlTWF0Y2hTb3J0LCBzZXRWZWhpY2xlTWF0Y2hTb3J0XSA9IHVzZVN0YXRlKCcnKTsgLy9hc2MsIGRlc2MsICcnXG5cbiAgICBjb25zdCBbdmVoaWNsZVllYXJTb3J0LCBzZXRWZWhpY2xlWWVhclNvcnRdID0gdXNlU3RhdGUoJ2Rlc2MnKTsgLy9hc2MsIGRlc2MsICcnXG5cbiAgICBjb25zdCBbbG9jYXRpb25QYWdlLCBzZXRMb2NhdGlvblBhZ2VdID0gdXNlU3RhdGUoMSk7XG4gICAgY29uc3QgW2xvY2F0aW9uQ291bnQsIHNldExvY2F0aW9uQ291bnRdID0gdXNlU3RhdGUoMCk7XG4gICAgY29uc3QgW3ZlaGljbGVQYWdlLCBzZXRWZWhpY2xlUGFnZV0gPSB1c2VTdGF0ZSgxKTtcbiAgICBjb25zdCBbdmVoaWNsZUNvdW50LCBzZXRWZWhpY2xlQ291bnRdID0gdXNlU3RhdGUoNik7XG5cbiAgICBjb25zdCBbcGFnZVNpemUsIHNldFBhZ2VTaXplXSA9IHVzZVN0YXRlKDEwKTtcbiAgICBjb25zdCBbbG9jYXRpb25GZXRjaGluZywgc2V0TG9jYXRpb25GZXRjaGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW3ZlaGljbGVGZXRjaGluZywgc2V0VmVoaWNsZUZldGNoaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICAgIGNvbnN0IFtnZW9ncmFwaHksIHNldEdlb2dyYXBoeV0gPSB1c2VTdGF0ZSh7IGxhdDogMzUuODk4NzIzNDAwMDAwMDEsIGxuZzogLTg2Ljk2MjQwODU5OTk5OTk5IH0pO1xuICAgIGNvbnN0IFtnZW9Db2RlRmV0Y2hpbmcsIHNldEdlb0NvZGVGZXRjaGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgICBjb25zdCBbaW5zdXJhbmNlLCBzZXRJbnN1cmFuY2VdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtpbnN1cmFuY2VDb3N0LCBzZXRJbnN1cmFuY2VDb3N0XSA9IHVzZVN0YXRlKDApO1xuXG4gICAgY29uc3QgW2RheXMsIHNldERheXNdID0gdXNlU3RhdGUoMCk7XG5cbiAgICBmdW5jdGlvbiBnZW9Db2RlKCkge1xuICAgICAgc2VuZEFsZXJ0KHsgbWVzc2FnZTogXCJHZW9jb2RpbmcuLi5cIiwgdHlwZTogXCJpbmZvXCIgfSk7XG4gICAgICBzZXRHZW9Db2RlRmV0Y2hpbmcodHJ1ZSk7XG4gICAgICBydW5TZXJ2ZXJsZXNzKHsgbmFtZTogXCJnZW9Db2RlXCIsIHBhcmFtZXRlcnM6IHtcInppcENvZGVcIjogemlwQ29kZX0gfSkudGhlbigocmVzcCkgPT4ge1xuICAgICAgICBzZXRHZW9ncmFwaHkocmVzcC5yZXNwb25zZSk7XG4gICAgICAgIHNldEdlb0NvZGVGZXRjaGluZyhmYWxzZSk7XG4gICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZldGNoTG9jYXRpb25zKCkge1xuICAgICAgc2VuZEFsZXJ0KHsgbWVzc2FnZTogXCJGZXRjaGluZyBsb2NhdGlvbnMuLi5cIiwgdHlwZTogXCJpbmZvXCIgfSk7XG4gICAgICBzZXRMb2NhdGlvbkZldGNoaW5nKHRydWUpO1xuICAgICAgcnVuU2VydmVybGVzcyh7IG5hbWU6IFwiZ2V0TG9jYXRpb25zXCIsIHBhcmFtZXRlcnM6IHsgXCJtaWxlc1wiOiBtaWxlcywgXCJnZW9ncmFwaHlcIjogZ2VvZ3JhcGh5LCBcInBpY2t1cERhdGVcIjogcGlja3VwRGF0ZSwgXCJyZXR1cm5EYXRlXCI6IHJldHVybkRhdGUsIFwidmVoaWNsZUNsYXNzXCI6IHZlaGljbGVDbGFzc319KS50aGVuKChyZXNwKSA9PiB7XG4gICAgICAgIHNldExvY2F0aW9ucyhyZXNwLnJlc3BvbnNlLnJlc3VsdHMpO1xuICAgICAgICBzZXRMb2NhdGlvbkNvdW50KHJlc3AucmVzcG9uc2UudG90YWwpO1xuICAgICAgICBzZXRMb2NhdGlvbkZldGNoaW5nKGZhbHNlKTtcbiAgICAgICAgLy9yZXNldCB0aGUgdGFibGVcbiAgICAgICAgc2V0TG9jYXRpb25QYWdlKDEpO1xuICAgICAgfSlcblxuICAgIH1cblxuICAgIGNvbnN0IGRlYm91bmNlZEZldGNoTG9jYXRpb25zID0gXy5kZWJvdW5jZShmZXRjaExvY2F0aW9ucywgNTAwKTtcblxuICAgIGNvbnN0IGRlYm91bmNlR2VvQ29kZSA9IF8uZGVib3VuY2UoZ2VvQ29kZSwgNTAwKTtcblxuICAgIC8vcnVuIHRoZSBmZXRjaExvY2F0aW9ucywgd2hlbiB0aGUgZGlzdGFuY2VTb3J0IG9yIHZlaGljbGVTb3J0IGNoYW5nZXMgb3Igd2hlbiB0aGUgcGFnZSBjaGFuZ2VzXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgZGVib3VuY2VkRmV0Y2hMb2NhdGlvbnMoKTtcbiAgICB9LCBbbWlsZXMsIGdlb2dyYXBoeV0pO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgIGlmICh6aXBDb2RlLmxlbmd0aCA9PT0gNSAmJiAhZ2VvQ29kZUZldGNoaW5nKSB7XG4gICAgICAgIGRlYm91bmNlR2VvQ29kZSgpO1xuICAgICAgfVxuICAgIH0sIFt6aXBDb2RlXSk7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgbGV0IHNvcnQgPSB7fTtcbiAgICAgIGlmIChkaXN0YW5jZVNvcnQpIHtcbiAgICAgICAgc29ydCA9IHsgXCJuYW1lXCI6IFwiZGlzdGFuY2VcIiwgXCJvcmRlclwiOiBkaXN0YW5jZVNvcnQgfTtcbiAgICAgIH0gZWxzZSBpZiAodmVoaWNsZVNvcnQpIHtcbiAgICAgICAgc29ydCA9IHsgXCJuYW1lXCI6IFwiYXZhaWxhYmxlX3ZlaGljbGVzXCIsIFwib3JkZXJcIjogdmVoaWNsZVNvcnQgfTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHZlaGljbGVNYXRjaFNvcnQpIHtcbiAgICAgICAgc29ydCA9IHsgXCJuYW1lXCI6IFwidmVoaWNsZV9tYXRjaFwiLCBcIm9yZGVyXCI6IHZlaGljbGVNYXRjaFNvcnQgfTtcbiAgICAgIH1cblxuICAgICAgaWYgKGxvY2F0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxldCBuZXdMb2NhdGlvbnMgPSBzb3J0QW5kUGFnaW5hdGVMb2NhdGlvbnMobG9jYXRpb25zLCBzb3J0Lm5hbWUsIHNvcnQub3JkZXIsIGxvY2F0aW9uUGFnZSwgcGFnZVNpemUpXG4gICAgICAgIHNldExvY2F0aW9uc09uUGFnZShuZXdMb2NhdGlvbnMpO1xuICAgICAgfVxuICAgIH0sIFtkaXN0YW5jZVNvcnQsIHZlaGljbGVTb3J0LCB2ZWhpY2xlTWF0Y2hTb3J0LCBsb2NhdGlvblBhZ2UsIHBhZ2VTaXplLCBsb2NhdGlvbnNdKTtcblxuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgIGlmICh2ZWhpY2xlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxldCBuZXdWZWhpY2xlcyA9IHNvcnRBbmRQYWdpbmF0ZVZlaGljbGVzKHZlaGljbGVzLCB2ZWhpY2xlWWVhclNvcnQsIHZlaGljbGVQYWdlLCBwYWdlU2l6ZSlcbiAgICAgICAgc2V0VmVoaWNsZXNPblBhZ2UobmV3VmVoaWNsZXMpO1xuICAgICAgfVxuICAgIH0sIFt2ZWhpY2xlWWVhclNvcnQsIHZlaGljbGVQYWdlLCB2ZWhpY2xlc10pO1xuXG5cbiAgICBmdW5jdGlvbiBzZXRTb3J0KHNvcnQsIHR5cGUpIHtcbiAgICAgIGlmICh0eXBlID09PSAnZGlzdGFuY2UnKSB7XG4gICAgICAgIHNldERpc3RhbmNlU29ydChzb3J0KTtcbiAgICAgICAgc2V0VmVoaWNsZVNvcnQoJycpO1xuICAgICAgICBzZXRWZWhpY2xlTWF0Y2hTb3J0KCcnKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICd2ZWhpY2xlX21hdGNoJykge1xuICAgICAgICBzZXRWZWhpY2xlTWF0Y2hTb3J0KHNvcnQpO1xuICAgICAgICBzZXREaXN0YW5jZVNvcnQoJycpO1xuICAgICAgICBzZXRWZWhpY2xlU29ydCgnJyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc2V0VmVoaWNsZVNvcnQoc29ydCk7XG4gICAgICAgIHNldERpc3RhbmNlU29ydCgnJyk7XG4gICAgICAgIHNldFZlaGljbGVNYXRjaFNvcnQoJycpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICBpZiAocGlja3VwRGF0ZSAmJiByZXR1cm5EYXRlKSB7XG4gICAgICAgIGxldCBkYXlzID0gbW9tZW50KHJldHVybkRhdGUuZm9ybWF0dGVkRGF0ZSkuZGlmZihtb21lbnQocGlja3VwRGF0ZS5mb3JtYXR0ZWREYXRlKSwgJ2RheXMnKTtcbiAgICAgICAgc2V0RGF5cyhkYXlzKTtcbiAgICAgIH1cbiAgICB9LCBbcGlja3VwRGF0ZSwgcmV0dXJuRGF0ZV0pO1xuXG5cbiAgICBmdW5jdGlvbiBnb1RvVmVoaWNsZVBhZ2UodmVoaWNsZXMpIHtcbiAgICAgIHNldFZlaGljbGVGZXRjaGluZyh0cnVlKVxuICAgICAgcnVuU2VydmVybGVzcyh7IG5hbWU6IFwiZ2V0VmVoaWNsZXNcIiwgcGFyYW1ldGVyczogeyBcInZlaGljbGVzXCI6IHZlaGljbGVzfX0pLnRoZW4oKHJlc3ApID0+IHtcbiAgICAgICAgc2V0VmVoaWNsZXMocmVzcC5yZXNwb25zZS5kYXRhLnJlc3VsdHMpO1xuICAgICAgICBzZXRWZWhpY2xlQ291bnQocmVzcC5yZXNwb25zZS5kYXRhLnJlc3VsdHMubGVuZ3RoKTtcbiAgICAgICAgc2V0Q3VycmVudFN0ZXAoMSk7XG4gICAgICAgIHNldFZlaGljbGVGZXRjaGluZyhmYWxzZSk7XG4gICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdvVG9Cb29raW5nUGFnZSh2ZWhpY2xlKSB7XG4gICAgICBzZXRTZWxlY3RlZFZlaGljbGUodmVoaWNsZSk7XG4gICAgICBzZXRDdXJyZW50U3RlcCgyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8PlxuICAgICAgICAgIDxGbGV4XG4gICAgICAgICAgZGlyZWN0aW9uPXsncm93J31cbiAgICAgICAgICBqdXN0aWZ5PXsnYmV0d2Vlbid9XG4gICAgICAgICAgPlxuICAgICAgICAgIDxTdGVwSW5kaWNhdG9yXG4gICAgICAgICAgICBjdXJyZW50U3RlcD17Y3VycmVudFN0ZXB9XG4gICAgICAgICAgICBzdGVwTmFtZXM9e3N0ZXBzfVxuICAgICAgICAgICAgdmFyaWFudD17XCJkZWZhdWx0XCJ9XG4gICAgICAgICAgICBvbkNsaWNrPXsoc3RlcCkgPT4ge1xuICAgICAgICAgICAgICAvL21ha2Ugc3VyZSB0aGF0IHRoZSBzdGVwIGlzIHZhbGlkIGJlZm9yZSBhbGxvd2luZyB0aGUgdXNlciB0byBnbyB0byB0aGUgbmV4dCBzdGVwXG4gICAgICAgICAgICAgIGlmIChzdGVwID09PSAxKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkTG9jYXRpb24gJiYgc2VsZWN0ZWRMb2NhdGlvbi5pZCkge1xuICAgICAgICAgICAgICAgICAgc2V0Q3VycmVudFN0ZXAoc3RlcCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgc2VuZEFsZXJ0KHsgbWVzc2FnZTogXCJQbGVhc2Ugc2VsZWN0IGEgbG9jYXRpb25cIiwgdHlwZTogXCJkYW5nZXJcIiB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2V0Q3VycmVudFN0ZXAoc3RlcCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvRmxleD5cbiAgICAgICAgICA8RGl2aWRlciAvPlxuICAgICAgICAgIHtjdXJyZW50U3RlcCA9PT0gMCAmJiAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPEZsZXhcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb249eydyb3cnfVxuICAgICAgICAgICAgICAgIGp1c3RpZnk9eydzdGFydCd9XG4gICAgICAgICAgICAgICAgd3JhcD17J25vd3JhcCd9XG4gICAgICAgICAgICAgICAgZ2FwPXsnZXh0cmEtbGFyZ2UnfVxuICAgICAgICAgICAgICAgIGFsaWduPXsnc3RhcnQnfVxuICAgICAgICAgICAgICAgIGFsaWduU2VsZj17J3N0YXJ0J31cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8RmxleFxuICAgICAgICAgICAgICAgIHdpZHRoPXsnYXV0byd9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPElucHV0XG4gICAgICAgICAgICAgICAgICAgICAgbGFiZWw9XCJaaXAgQ29kZVwiXG4gICAgICAgICAgICAgICAgICAgICAgbmFtZT1cInppcENvZGVcIlxuICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXA9XCJQbGVhc2UgZW50ZXIgeW91ciB6aXAgY29kZVwiXG4gICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCIxMjM0NVwiXG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3ppcENvZGV9XG4gICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3ZhbHVlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFppcENvZGUodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgIH19XG5cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9GbGV4PlxuICAgICAgICAgICAgICA8RmxleFxuICAgICAgICAgICAgICAgIHdpZHRoPXsnYXV0byd9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPE51bWJlcklucHV0XG4gICAgICAgICAgICAgICAgICAgICAgbGFiZWw9XCJNaWxlc1wiXG4gICAgICAgICAgICAgICAgICAgICAgbmFtZT1cIm1pbGVzXCJcbiAgICAgICAgICAgICAgICAgICAgICBtaW49ezI1fVxuICAgICAgICAgICAgICAgICAgICAgIG1heD17MzAwfVxuICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXA9XCJQbGVhc2UgZW50ZXIgdGhlIG51bWJlciBvZiBtaWxlcyB5b3UgYXJlIHdpbGxpbmcgdG8gdHJhdmVsXCJcbiAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIjI1MFwiXG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e21pbGVzfVxuICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRNaWxlcyh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L0ZsZXg+XG4gICAgICAgICAgICAgICAgPEZsZXhcbiAgICAgICAgICAgICAgICAgIHdpZHRoPXsnYXV0byd9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICA8RGF0ZUlucHV0XG4gICAgICAgICAgICAgICAgICAgbGFiZWw9XCJQaWNrdXAgRGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgbmFtZT1cInBpY2t1cERhdGVcIlxuICAgICAgICAgICAgICAgICAgIHZhbHVlPXtwaWNrdXBEYXRlfVxuICAgICAgICAgICAgICAgICAgIG1heD17cmV0dXJuRGF0ZX1cbiAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICBzZXRQaWNrdXBEYXRlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgIGZvcm1hdD1cImxsXCJcbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgIDwvRmxleD5cbiAgICAgICAgICAgICAgICAgPEZsZXhcbiAgICAgICAgICAgICAgICAgICB3aWR0aD17J2F1dG8nfVxuICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8RGF0ZUlucHV0XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPVwiUmV0dXJuIERhdGVcIlxuICAgICAgICAgICAgICAgICAgICBuYW1lPVwicmV0dXJuRGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXtyZXR1cm5EYXRlfVxuICAgICAgICAgICAgICAgICAgICBtaW49e3BpY2t1cERhdGV9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBzZXRSZXR1cm5EYXRlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0PVwibGxcIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9GbGV4PlxuICAgICAgICAgICAgICAgICAgPEZsZXhcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg9eydtYXgnfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPE11bHRpU2VsZWN0XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPVwiVmVoaWNsZSBDbGFzc1wiXG4gICAgICAgICAgICAgICAgICAgIG5hbWU9XCJ2ZWhpY2xlQ2xhc3NcIlxuICAgICAgICAgICAgICAgICAgICB2YXJpYW50PVwidHJhbnNwYXJlbnRcIlxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zPXtbXG4gICAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogXCJUb3VyaW5nXCIsIHZhbHVlOiBcIlRvdXJpbmdcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6IFwiU3BvcnRcIiwgdmFsdWU6IFwiU3BvcnRcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6IFwiQmFzZVwiLCB2YWx1ZTogXCJCYXNlXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiBcIkVjb25vbXlcIiwgdmFsdWU6IFwiRWNvbm9teVwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogXCJDb21wYWN0XCIsIHZhbHVlOiBcIkNvbXBhY3RcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6IFwiTWlkc2l6ZVwiLCB2YWx1ZTogXCJNaWRzaXplXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiBcIlN0YW5kYXJkXCIsIHZhbHVlOiBcIlN0YW5kYXJkXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiBcIkZ1bGxzaXplXCIsIHZhbHVlOiBcIkZ1bGxzaXplXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiBcIlByZW1pdW1cIiwgdmFsdWU6IFwiUHJlbWl1bVwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogXCJMdXh1cnlcIiwgdmFsdWU6IFwiTHV4dXJ5XCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiBcIlNVVlwiLCB2YWx1ZTogXCJTVVZcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6IFwiVmFuXCIsIHZhbHVlOiBcIlZhblwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogXCJUcnVja1wiLCB2YWx1ZTogXCJUcnVja1wiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogXCJDb252ZXJ0aWJsZVwiLCB2YWx1ZTogXCJDb252ZXJ0aWJsZVwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogXCJDb3VwZVwiLCB2YWx1ZTogXCJDb3VwZVwiIH0sXG4gICAgICAgICAgICAgICAgICAgIF19XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBzZXRWZWhpY2xlQ2xhc3ModmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9GbGV4PlxuXG4gICAgICAgICAgICAgICAgICA8L0ZsZXg+XG5cbiAgICAgICAgICAgICAgICAgIDxEaXZpZGVyIC8+XG5cbiAgICAgICAgICAgICAgICAgIDxUYWJsZVxuICAgICAgICAgICAgICAgICAgICB3aWR0aD17J21heCd9XG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRlZD17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgcGFnZUNvdW50PXtsb2NhdGlvbkNvdW50IC8gcGFnZVNpemV9XG4gICAgICAgICAgICAgICAgICAgIG9uUGFnZUNoYW5nZT17KHBhZ2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBzZXRMb2NhdGlvblBhZ2UocGFnZSk7XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIHBhZ2U9e2xvY2F0aW9uUGFnZX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPFRhYmxlSGVhZD5cbiAgICAgICAgICAgICAgICAgICAgPFRhYmxlUm93PlxuICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUhlYWRlciB3aWR0aD17J21pbid9PkFkZHJlc3M8L1RhYmxlSGVhZGVyPlxuICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUhlYWRlciB3aWR0aD17J21pbid9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPExpbmsgdmFyaWFudD1cImRhcmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTb3J0KGRpc3RhbmNlU29ydCA9PT0gJ2FzYycgPyAnZGVzYycgOiAnYXNjJywgJ2Rpc3RhbmNlJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIERpc3RhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICA8L0xpbms+ICB7ZGlzdGFuY2VTb3J0ID09PSAnJyA/ICcgJyA6IGRpc3RhbmNlU29ydCA9PT0gJ2FzYycgPyAnIOKGkycgOiAnIOKGkSd9XG4gICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZUhlYWRlcj5cbiAgICAgICAgICAgICAgICAgICAgICA8VGFibGVIZWFkZXIgd2lkdGg9eydtaW4nfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxMaW5rIHZhcmlhbnQ9XCJkYXJrXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U29ydCh2ZWhpY2xlU29ydCA9PT0gJ2FzYycgPyAnZGVzYycgOiAnYXNjJywgJ3ZlaGljbGUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgQXZhaWxhYmxpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvTGluaz5cbiAgICAgICAgICAgICAgICAgICAgICAgICB7dmVoaWNsZVNvcnQgPT09ICcnID8gJyAnIDogdmVoaWNsZVNvcnQgPT09ICdhc2MnID8gJyDihpMnIDogJyDihpEnfVxuICAgICAgICAgICAgICAgICAgICAgIDwvVGFibGVIZWFkZXI+XG4gICAgICAgICAgICAgICAgICAgICAgPFRhYmxlSGVhZGVyIHdpZHRoPXsnbWluJ30gPlxuICAgICAgICAgICAgICAgICAgICAgIDxMaW5rIHZhcmlhbnQ9XCJkYXJrXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNvcnQodmVoaWNsZU1hdGNoU29ydCA9PT0gJ2FzYycgPyAnZGVzYycgOiAnYXNjJywgJ3ZlaGljbGVfbWF0Y2gnKX1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICBWZWhpY2xlcyB0aGF0IG1lZXQgRmlsdGVyc1xuICAgICAgICAgICAgICAgICAgICAgIDwvTGluaz5cbiAgICAgICAgICAgICAgICAgICAgICAge3ZlaGljbGVNYXRjaFNvcnQgPT09ICcnID8gJyAnIDogdmVoaWNsZU1hdGNoU29ydCA9PT0gJ2FzYycgPyAnIOKGkycgOiAnIOKGkSd9XG4gICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZUhlYWRlcj5cbiAgICAgICAgICAgICAgICAgICAgPC9UYWJsZVJvdz5cbiAgICAgICAgICAgICAgICAgICAgPC9UYWJsZUhlYWQ+XG4gICAgICAgICAgICAgICAgICAgIDxUYWJsZUJvZHk+XG5cbiAgICAgICAgICAgICAgICAgICAge2xvY2F0aW9uRmV0Y2hpbmcgPT09IGZhbHNlICYmIGxvY2F0aW9uc09uUGFnZS5tYXAoKGxvY2F0aW9uKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICA8VGFibGVSb3c+XG4gICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8VGV4dD57bG9jYXRpb24uZnVsbF9hZGRyZXNzfTwvVGV4dD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPFRleHQ+e2xvY2F0aW9uLmRpc3RhbmNlfSBtaWxlczwvVGV4dD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPExpbmsgb25DbGljaz17KCk9Pntnb1RvVmVoaWNsZVBhZ2UobG9jYXRpb24uYXNzb2NpYXRpb25zLnBfdmVoaWNsZXNfY29sbGVjdGlvbl9fdmVoaWNsZXNfdG9fbG9jYXRpb25zLml0ZW1zLm1hcCh4ID0+IHguaHNfb2JqZWN0X2lkKSk7IHNldFNlbGVjdGVkTG9jYXRpb24obG9jYXRpb24pfX0+e2xvY2F0aW9uLm51bWJlcl9vZl9hdmFpbGFibGVfdmVoaWNsZXN9IFZlaGljbGVzIEF2YWlsYWJsZTwvTGluaz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPExpbmsgb25DbGljaz17KCk9Pntnb1RvVmVoaWNsZVBhZ2UobG9jYXRpb24uYXNzb2NpYXRpb25zLnBfdmVoaWNsZXNfY29sbGVjdGlvbl9fdmVoaWNsZXNfdG9fbG9jYXRpb25zLml0ZW1zLm1hcCh4ID0+IHguaHNfb2JqZWN0X2lkKSk7IHNldFNlbGVjdGVkTG9jYXRpb24obG9jYXRpb24pfX0+e2xvY2F0aW9uLmFzc29jaWF0aW9ucy5wX3ZlaGljbGVzX2NvbGxlY3Rpb25fX3ZlaGljbGVzX3RvX2xvY2F0aW9ucy50b3RhbH0gVmVoaWNsZXM8L0xpbms+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlUm93PlxuICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgPC9UYWJsZUJvZHk+XG4gICAgICAgICAgICAgICAgICA8L1RhYmxlPlxuICAgICAgICAgIDwvPlxuICAgICAgICAgICl9XG4gICAgICAgICAge2N1cnJlbnRTdGVwID09PSAxICYmIChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxUYWJsZVxuICAgICAgICAgICAgICAgIHdpZHRoPXsnbWF4J31cbiAgICAgICAgICAgICAgICBwYWdpbmF0ZWQ9e2ZhbHNlfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFRhYmxlSGVhZD5cbiAgICAgICAgICAgICAgICA8VGFibGVSb3c+XG4gICAgICAgICAgICAgICAgICA8VGFibGVIZWFkZXIgd2lkdGg9eydtaW4nfT5NYWtlPC9UYWJsZUhlYWRlcj5cbiAgICAgICAgICAgICAgICAgIDxUYWJsZUhlYWRlciB3aWR0aD17J21pbid9PlxuICAgICAgICAgICAgICAgICAgICAgIE1vZGVsXG4gICAgICAgICAgICAgICAgICA8L1RhYmxlSGVhZGVyPlxuICAgICAgICAgICAgICAgICAgPFRhYmxlSGVhZGVyIHdpZHRoPXsnbWluJ30+XG4gICAgICAgICAgICAgICAgICAgIDxMaW5rIHZhcmlhbnQ9XCJkYXJrXCJcbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7c2V0VmVoaWNsZVllYXJTb3J0KHZlaGljbGVZZWFyU29ydCA9PT0gJ2FzYycgPyAnZGVzYycgOiAnYXNjJyl9fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgWWVhclxuICAgICAgICAgICAgICAgICAgICA8L0xpbms+XG4gICAgICAgICAgICAgICAgICAgICB7dmVoaWNsZVllYXJTb3J0ID09PSAnJyA/ICcgJyA6IHZlaGljbGVZZWFyU29ydCA9PT0gJ2FzYycgPyAnIOKGkycgOiAnIOKGkSd9XG4gICAgICAgICAgICAgICAgICA8L1RhYmxlSGVhZGVyPlxuICAgICAgICAgICAgICAgICAgPFRhYmxlSGVhZGVyIHdpZHRoPXsnbWluJ30gPlxuICAgICAgICAgICAgICAgICAgICBCb29rXG4gICAgICAgICAgICAgICAgICA8L1RhYmxlSGVhZGVyPlxuICAgICAgICAgICAgICAgIDwvVGFibGVSb3c+XG4gICAgICAgICAgICAgICAgPC9UYWJsZUhlYWQ+XG4gICAgICAgICAgICAgICAgPFRhYmxlQm9keT5cblxuICAgICAgICAgICAgICAgIHt2ZWhpY2xlc09uUGFnZS5tYXAoKHZlaGljbGUpID0+IChcbiAgICAgICAgICAgICAgICAgPFRhYmxlUm93PlxuICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgIDxUZXh0Pnt2ZWhpY2xlLnByb3BlcnRpZXMubWFrZX08L1RleHQ+XG4gICAgICAgICAgICAgICAgICAgIDwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgIDxUZXh0Pnt2ZWhpY2xlLnByb3BlcnRpZXMubW9kZWx9PC9UZXh0PlxuICAgICAgICAgICAgICAgICAgICA8L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICA8VGV4dD57dmVoaWNsZS5wcm9wZXJ0aWVzLnllYXJ9PC9UZXh0PlxuICAgICAgICAgICAgICAgICAgICA8L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICA8TGluayBvbkNsaWNrPXsoKT0+e2dvVG9Cb29raW5nUGFnZSh2ZWhpY2xlKX19PkJvb2sgbm93PC9MaW5rPlxuICAgICAgICAgICAgICAgICAgICA8L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgIDwvVGFibGVSb3c+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgPC9UYWJsZUJvZHk+XG4gICAgICAgICAgICAgIDwvVGFibGU+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApfVxuICAgICAgICAgIHtjdXJyZW50U3RlcCA9PT0gMiAmJiAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgPERlc2NyaXB0aW9uTGlzdCBkaXJlY3Rpb249XCJyb3dcIj5cbiAgICAgICAgICAgICAgPERlc2NyaXB0aW9uTGlzdEl0ZW0gbGFiZWw9XCJQaWNrdXAgTG9jYXRpb25cIj5cbiAgICAgICAgICAgICAgICA8VGV4dD57c2VsZWN0ZWRMb2NhdGlvbi5mdWxsX2FkZHJlc3N9PC9UZXh0PlxuICAgICAgICAgICAgICA8L0Rlc2NyaXB0aW9uTGlzdEl0ZW0+XG4gICAgICAgICAgICAgIDxEZXNjcmlwdGlvbkxpc3RJdGVtPlxuICAgICAgICAgICAgICA8RmxleFxuICAgICAgICAgICAgICAgIHdpZHRoPXsnYXV0byd9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgIDxEYXRlSW5wdXRcbiAgICAgICAgICAgICAgICAgbGFiZWw9XCJQaWNrdXAgRGF0ZVwiXG4gICAgICAgICAgICAgICAgIG5hbWU9XCJwaWNrdXBEYXRlXCJcbiAgICAgICAgICAgICAgICAgdmFsdWU9e3BpY2t1cERhdGV9XG4gICAgICAgICAgICAgICAgIG1heD17cmV0dXJuRGF0ZX1cbiAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgIHNldFBpY2t1cERhdGUodmFsdWUpO1xuICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICBmb3JtYXQ9XCJsbFwiXG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgIDwvRmxleD5cbiAgICAgICAgICAgICAgPC9EZXNjcmlwdGlvbkxpc3RJdGVtPlxuICAgICAgICAgICAgICA8RGVzY3JpcHRpb25MaXN0SXRlbT5cbiAgICAgICAgICAgICAgPEZsZXhcbiAgICAgICAgICAgICAgICB3aWR0aD17J2F1dG8nfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICA8RGF0ZUlucHV0XG4gICAgICAgICAgICAgICAgIGxhYmVsPVwiUmV0dXJuIERhdGVcIlxuICAgICAgICAgICAgICAgICBuYW1lPVwicmV0dXJuRGF0ZVwiXG4gICAgICAgICAgICAgICAgIHZhbHVlPXtyZXR1cm5EYXRlfVxuICAgICAgICAgICAgICAgICBtaW49e3BpY2t1cERhdGV9XG4gICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICBzZXRSZXR1cm5EYXRlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgZm9ybWF0PVwibGxcIlxuICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgPC9GbGV4PlxuICAgICAgICAgICAgICA8L0Rlc2NyaXB0aW9uTGlzdEl0ZW0+XG4gICAgICAgICAgICAgIDxEZXNjcmlwdGlvbkxpc3RJdGVtIGxhYmVsPVwiVmVoaWNsZVwiPlxuICAgICAgICAgICAgICAgIDxUZXh0PntzZWxlY3RlZFZlaGljbGUucHJvcGVydGllcy55ZWFyfSB7c2VsZWN0ZWRWZWhpY2xlLnByb3BlcnRpZXMubWFrZX0ge3NlbGVjdGVkVmVoaWNsZS5wcm9wZXJ0aWVzLm1vZGVsfTwvVGV4dD5cbiAgICAgICAgICAgICAgPC9EZXNjcmlwdGlvbkxpc3RJdGVtPlxuICAgICAgICAgICAgICA8RGVzY3JpcHRpb25MaXN0SXRlbSBsYWJlbD1cIkluc3VyYW5jZVwiPlxuICAgICAgICAgICAgICA8U2VsZWN0XG4gICAgICAgICAgICAgICAgICAgIG5hbWU9XCJpbnN1cmFuY2VcIlxuICAgICAgICAgICAgICAgICAgICBsYWJlbD1cIlwiXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM9e1tcbiAgICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiBcIlllc1wiLCB2YWx1ZTogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6IFwiTm9cIiwgdmFsdWU6IGZhbHNlIH0sXG4gICAgICAgICAgICAgICAgICAgIF19XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBzZXRJbnN1cmFuY2UodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L0Rlc2NyaXB0aW9uTGlzdEl0ZW0+XG4gICAgICAgICAgICAgIDxEZXNjcmlwdGlvbkxpc3RJdGVtIGxhYmVsPVwiRGFpbHkgUmF0ZVwiPlxuICAgICAgICAgICAgICAgIDxUZXh0PiQge3NlbGVjdGVkVmVoaWNsZS5wcm9wZXJ0aWVzLmRhaWx5X3ByaWNlfTwvVGV4dD5cbiAgICAgICAgICAgICAgPC9EZXNjcmlwdGlvbkxpc3RJdGVtPlxuICAgICAgICAgICAgICA8RGVzY3JpcHRpb25MaXN0SXRlbSBsYWJlbD1cIkRheXNcIj5cbiAgICAgICAgICAgICAgICA8VGV4dD57ZGF5c308L1RleHQ+XG4gICAgICAgICAgICAgIDwvRGVzY3JpcHRpb25MaXN0SXRlbT5cbiAgICAgICAgICAgICAgPERlc2NyaXB0aW9uTGlzdEl0ZW0gbGFiZWw9XCJUb3RhbFwiPlxuICAgICAgICAgICAgICAgIDxUZXh0Pnsoc2VsZWN0ZWRWZWhpY2xlLnByb3BlcnRpZXMuZGFpbHlfcHJpY2UgKiBkYXlzKSArIGluc3VyYW5jZUNvc3R9PC9UZXh0PlxuICAgICAgICAgICAgICA8L0Rlc2NyaXB0aW9uTGlzdEl0ZW0+XG4gICAgICAgICAgICA8L0Rlc2NyaXB0aW9uTGlzdD5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICl9XG4gICAgICAgICAgPERpdmlkZXIgLz5cbiAgICAgICAgPC8+XG4gICAgKTtcbn07XG4iXSwibmFtZXMiOlsiaHVic3BvdCIsIlJlYWN0IiwidXNlU3RhdGUiLCJfIiwidXNlRWZmZWN0IiwiZGF5cyIsIm1vbWVudCIsInZlaGljbGVzIiwiRmxleCIsIlN0ZXBJbmRpY2F0b3IiLCJEaXZpZGVyIiwiSW5wdXQiLCJOdW1iZXJJbnB1dCIsIkRhdGVJbnB1dCIsIk11bHRpU2VsZWN0IiwiVGFibGUiLCJUYWJsZUhlYWQiLCJUYWJsZVJvdyIsIlRhYmxlSGVhZGVyIiwiTGluayIsIlRhYmxlQm9keSIsIlRhYmxlQ2VsbCIsIlRleHQiLCJEZXNjcmlwdGlvbkxpc3QiLCJEZXNjcmlwdGlvbkxpc3RJdGVtIiwiU2VsZWN0Il0sIm1hcHBpbmdzIjoiOztBQW1DQSxXQUFTLHlCQUF5QixXQUFXLFFBQVEsV0FBVyxNQUFNLFVBQVU7QUFFaEYsUUFBSSxXQUFXLFlBQVk7QUFDekIsZ0JBQVUsS0FBSyxDQUFDLEdBQUcsTUFBTSxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQUEsSUFBQSxXQUN2QyxXQUFXLHNCQUFzQjtBQUMxQyxnQkFBVSxLQUFLLENBQUMsR0FBRyxNQUFNLEVBQUUsK0JBQStCLEVBQUUsNEJBQTRCO0FBQUEsSUFBQSxXQUMvRSxXQUFXLGlCQUFpQjtBQUMzQixnQkFBQSxLQUFLLENBQUMsR0FBRyxNQUFNLEVBQUUsYUFBYSw2Q0FBNkMsUUFBUSxFQUFFLGFBQWEsNkNBQTZDLEtBQUs7QUFBQSxJQUNoSztBQUVBLFFBQUksY0FBYyxRQUFRO0FBQ3hCLGdCQUFVLFFBQVE7QUFBQSxJQUNwQjtBQUVNLFVBQUEsU0FBUyxPQUFPLEtBQUs7QUFDM0IsVUFBTSxNQUFNLE9BQU87QUFDWixXQUFBLFVBQVUsTUFBTSxPQUFPLEdBQUc7QUFBQSxFQUVqQztBQUVBLFdBQVMsd0JBQXdCLFVBQVUsaUJBQWlCLGFBQWEsVUFB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
