const axios = require("axios");

// Factor the distance calculation into its own function.
function calculateDistance(a, b) {
  const earthRadiusMiles = 3958.8; // Average radius of the Earth in miles

  // Convert degrees to radians
  const lat1 = a.lat * (Math.PI/180);
  const lng1 = a.lng * (Math.PI/180);
  const lat2 = b.lat * (Math.PI/180);
  const lng2 = b.lng * (Math.PI/180);

  // Haversine formula
  const differenceLat = lat2 - lat1;
  const differenceLng = lng2 - lng1;
  const aHav = Math.pow(Math.sin(differenceLat / 2), 2) +
               Math.cos(lat1) * Math.cos(lat2) *
               Math.pow(Math.sin(differenceLng / 2), 2);
  const c = 2 * Math.atan2(Math.sqrt(aHav), Math.sqrt(1 - aHav));

  // Distance in miles
  const distance = earthRadiusMiles * c;
  return distance;
}

// Refactor the main sorting function for clarity.
function sortLocations(locations, originCoords, miles) {
  let sortedLocations = [...locations];

  // Adding distance to each location, and sort by chosen criteria.
  sortedLocations = sortedLocations.map(location => {
    const distance = calculateDistance({ lat: location.lat, lng: location.lng }, originCoords);
    return { ...location, distance: distance.toFixed(2) };
  });

  // Filter by distance
  sortedLocations = sortedLocations.filter(location => location.distance <= miles);

  // Sort by distance
  sortedLocations.sort((a, b) => a.distance - b.distance);

  return sortedLocations;
}

// Extract API calls into a separate function for readability.
function fetchLocations({ lat_min, lat_max, lng_min, lng_max, pickupDate, returnDate, vehicleClass }) {
  const data = JSON.stringify({
    operationName: "getLocations",
    query: `query getLocations($lat_min: Number, $lat_max: Number, $lng_min: Number, $lng_max: Number) {
      CRM {
        p_locations_collection(filter: {lat__gt: $lat_min, lat__lt: $lat_max, lng__gt: $lng_min, lng__lt: $lng_max}, limit: 500) {
          items {
            full_address
            postal_code
            lat
            lng
            number_of_available_vehicles
            hs_object_id
            associations {
              p_vehicles_collection__vehicles_to_locations {
                items {
                  hs_object_id
                }
                total
             }
            }
          }
          total
        }
      }
    }`,
    variables: {
      "lat_min":lat_min,
      "lat_max":lat_max,
      "lng_min":lng_min,
      "lng_max":lng_max,
      "pickupDate": pickupDate,
      "returnDate": returnDate,
      "vehicleClass": vehicleClass
    }
  });

  const config = {
    method: 'post',
    url: 'https://api.hubapi.com/collector/graphql',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+process.env['PRIVATE_APP_ACCESS_TOKEN'],
    },
    data: data,
    maxBodyLength: Infinity
  };

  return axios.request(config);
}

exports.main = async (context, sendResponse) => {
  try {

    const { miles, geography, pickupDate, returnDate, vehicleClass } = context.parameters;

    console.log(context.parameters)

    const geoLocation = geography

    const latBounds = miles / 69;
    const lngBounds = miles / 54.6;

    const lat_min = geoLocation.lat - latBounds;
    const lat_max = geoLocation.lat + latBounds;
    const lng_min = geoLocation.lng - lngBounds;
    const lng_max = geoLocation.lng + lngBounds;

    const response = await fetchLocations({ lat_min, lat_max, lng_min, lng_max, pickupDate, returnDate, vehicleClass });
    console.log(JSON.stringify(response.data))

    const sortedLocations = sortLocations(
      response.data.data.CRM.p_locations_collection.items,
      { lat: geoLocation.lat, lng: geoLocation.lng },
      miles
    );

    return { results: sortedLocations, total: response.data.data.CRM.p_locations_collection.total };
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};
