const axios = require('axios');


exports.main = async (context, sendResponse) => {

  let vehicleIds = context.parameters.vehicles;

  let data = JSON.stringify({
    "inputs": vehicleIds.map((id) => {
      return {
        "id": id
      }
    }),
    "properties": [
      "vin",
      "make",
      "model",
      "year",
      "daily_price"
    ]
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.hubapi.com/crm/v3/objects/vehicles/batch/read',
    headers: {
      'Authorization': 'Bearer ' + process.env['PRIVATE_APP_ACCESS_TOKEN'],
      'Content-Type': 'application/json'
    },
    data: data
  };

  return axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      return response.data
    })
    .catch((error) => {
      console.log(error);
      throw error;
    });
}
