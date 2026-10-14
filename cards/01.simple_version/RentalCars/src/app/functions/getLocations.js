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
    url: 'https://api.hubapi.com/crm/v3/objects/p_locations/search',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env['PRIVATE_APP_ACCESS_TOKEN'],
    },
    data: data
  };

  return axios.request(config);
}

// Custom object type IDs (2-XXXXXXX) differ per portal, so look it up
// instead of hardcoding it. The card needs it for CrmActionLink.
function getLocationsSchema() {
  return axios.get('https://api.hubapi.com/crm/v3/schemas/p_locations', {
    headers: { 'Authorization': 'Bearer ' + process.env['PRIVATE_APP_ACCESS_TOKEN'] },
  });
}

exports.main = async (context) => {
  try {
    const { zipCode } = context.parameters;
    const [response, schema] = await Promise.all([
      searchLocations({ zipCode }),
      getLocationsSchema(),
    ]);

    return {
      results: response.data.results,
      total: response.data.total,
      objectTypeId: schema.data.objectTypeId,
    };
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};
