const usZips = require("us-zips");

exports.main = async (context, sendResponse) => {
  try {
    const { zipCode } = context.parameters;
    const entry = usZips[String(zipCode)];

    if (!entry) {
      console.error("Zip code not found:", zipCode);
      return { error: "Zip code not found" };
    }

    return { lat: entry.latitude, lng: entry.longitude };
  } catch (err) {
    console.error("geoCode error:", err);
    return { error: err.message };
  }
};
