const axios = require("axios");

function searchLocations({ zipCode }) {
  const data = JSON.stringify({
    sorts: [],
    query: zipCode,
    properties: ["address_1", "city", "state", "postal_code", "lat", "lng", "number_of_available_vehicles", "hs_object_id"],
    limit: 100,
    after: 0
  });

  const config = {
    method: 'post',
    url: 'https://api.hubapi.com/crm/v3/objects/locations/search',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env['PRIVATE_APP_ACCESS_TOKEN'],
    },
    data: data
  };

  return axios.request(config);
}

exports.main = async (context) => {
  try {
    const { zipCode } = context.parameters;

    console.log(context.parameters);

    const response = await searchLocations({ zipCode });
    console.log(JSON.stringify(response.data));

    return { results: response.data.results, total: response.data.total };
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};
