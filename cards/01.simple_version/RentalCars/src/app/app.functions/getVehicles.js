const axios = require('axios');

exports.main = async (context) => {
  const vehicleIds = context.parameters.vehicles;

  const data = JSON.stringify({
    inputs: vehicleIds.map((id) => ({ id })),
    properties: ["vin", "make", "model", "year", "daily_price"],
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.hubapi.com/crm/v3/objects/p_vehicles/batch/read',
    headers: {
      'Authorization': 'Bearer ' + process.env['PRIVATE_APP_ACCESS_TOKEN'],
      'Content-Type': 'application/json',
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error("Error fetching vehicles:", error.message);
    throw error;
  }
};
