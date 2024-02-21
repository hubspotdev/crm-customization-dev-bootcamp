const axios = require("axios");

const usZips = require('us-zips')

exports.main = async (context, sendResponse) => {
  const { zipCode } = context.parameters;
  geoLocation = usZips[zipCode];
  //swap out latitude and longitude for lat and lng
  geoLocation.lat = geoLocation.latitude;
  geoLocation.lng = geoLocation.longitude;
  delete geoLocation.latitude;
  delete geoLocation.longitude;

  console.log(geoLocation);
  return geoLocation;
};
